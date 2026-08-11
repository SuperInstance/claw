# Spreadsheet Moment - Cloudflare Deployment Script (Windows PowerShell)
# MIT License - Copyright (c) 2026 SuperInstance Research Team

param(
    [Parameter(Position=0)]
    [ValidateSet('development', 'production', 'test')]
    [string]$Environment = "production"
)

$ErrorActionPreference = "Stop"

# Configuration
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $ScriptDir)
$WorkerName = "spreadsheet-moment"

Write-Host "========================================" -ForegroundColor Green
Write-Host "Spreadsheet Moment - Cloudflare Deployment" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Change to project root
Set-Location $ProjectRoot

# Check if wrangler is installed
Write-Host "Checking for wrangler CLI..." -ForegroundColor Yellow
try {
    $null = wrangler --version
} catch {
    Write-Host "Error: wrangler CLI is not installed" -ForegroundColor Red
    Write-Host "Please install it with: npm install -g wrangler"
    exit 1
}

# Check if user is authenticated
Write-Host "Checking authentication..." -ForegroundColor Yellow
try {
    wrangler whoami | Out-Null
} catch {
    Write-Host "Not authenticated. Please login:" -ForegroundColor Red
    wrangler login
}

# Function to create D1 database
function Create-D1Database {
    param(
        [string]$DbName,
        [string]$Env
    )

    Write-Host "Creating D1 database: $DbName" -ForegroundColor Yellow

    if ($Env -eq "development") {
        $DbName = "$DbName-dev"
    } elseif ($Env -eq "production") {
        $DbName = "$DbName-prod"
    }

    # Check if database already exists
    $databases = wrangler d1 list | ConvertFrom-Json
    if ($databases.name -contains $DbName) {
        Write-Host "Database $DbName already exists" -ForegroundColor Green
    } else {
        wrangler d1 create $DbName
        Write-Host "Created database $DbName" -ForegroundColor Green
    }
}

# Function to run D1 migrations
function Invoke-D1Migrations {
    param(
        [string]$DbName,
        [string]$Env
    )

    Write-Host "Running migrations for $DbName" -ForegroundColor Yellow

    if ($Env -eq "development") {
        $DbName = "$DbName-dev"
    } elseif ($Env -eq "production") {
        $DbName = "$DbName-prod"
    }

    # Execute schema
    wrangler d1 execute $DbName --file="./deployment/cloudflare/d1/schema.sql" --env=$Env

    Write-Host "Migrations completed" -ForegroundColor Green
}

# Function to create R2 buckets
function New-R2Buckets {
    Write-Host "Creating R2 buckets..." -ForegroundColor Yellow

    $buckets = @("spreadsheet-moment-assets", "spreadsheet-moment-uploads")

    foreach ($bucket in $buckets) {
        $bucketList = wrangler r2 bucket list | ConvertFrom-Json
        if ($bucketList.name -contains $bucket) {
            Write-Host "Bucket $bucket already exists" -ForegroundColor Green
        } else {
            wrangler r2 bucket create $bucket
            Write-Host "Created bucket $bucket" -ForegroundColor Green
        }
    }
}

# Function to create KV namespaces
function New-KVNamespaces {
    Write-Host "Creating KV namespaces..." -ForegroundColor Yellow

    $namespaces = @("CACHE", "SESSIONS")

    foreach ($ns in $namespaces) {
        # Check if namespace ID is set in wrangler.toml
        $wranglerConfig = Get-Content "./deployment/cloudflare/wrangler.toml" -Raw
        if ($wranglerConfig -match "${ns}_id = `"""`) {
            Write-Host "Creating namespace $ns" -ForegroundColor Yellow
            $result = wrangler kv:namespace create $ns --env=$Environment | ConvertFrom-Json
            $nsId = $result.id
            Write-Host "Created namespace $ns with ID: $nsId" -ForegroundColor Green
            Write-Host "Please update wrangler.toml with the namespace ID"
        } else {
            Write-Host "Namespace $ns already configured" -ForegroundColor Green
        }
    }
}

# Function to set secrets
function Set-Secrets {
    Write-Host "Setting secrets..." -ForegroundColor Yellow
    Write-Host "Please enter the following secrets:"

    $jwtSecret = Read-Host "JWT Secret"
    $jwtSecret | wrangler secret put JWT_SECRET --env=$Environment

    $dbUrl = Read-Host "Database URL (optional, press Enter to skip)"
    if ($dbUrl) {
        $dbUrl | wrangler secret put DATABASE_URL --env=$Environment
    }

    $smtpPassword = Read-Host "SMTP Password (optional, press Enter to skip)"
    if ($smtpPassword) {
        $smtpPassword | wrangler secret put SMTP_PASSWORD --env=$Environment
    }

    $stripeKey = Read-Host "Stripe Secret Key (optional, press Enter to skip)"
    if ($stripeKey) {
        $stripeKey | wrangler secret put STRIPE_SECRET_KEY --env=$Environment
    }

    Write-Host "Secrets configured" -ForegroundColor Green
}

# Main deployment flow
function Main {
    Write-Host "Environment: $Environment" -ForegroundColor Yellow
    Write-Host ""

    # Step 1: Create resources
    Write-Host "Step 1: Creating Cloudflare resources" -ForegroundColor Green
    Create-D1Database "spreadsheet-moment-db" $Environment
    Invoke-D1Migrations "spreadsheet-moment-db" $Environment
    New-R2Buckets
    New-KVNamespaces
    Write-Host ""

    # Step 2: Configure secrets
    Write-Host "Step 2: Configuring secrets" -ForegroundColor Green
    $configure = Read-Host "Do you want to configure secrets now? (y/n)"
    if ($configure -eq 'y' -or $configure -eq 'Y') {
        Set-Secrets
    }
    Write-Host ""

    # Step 3: Build worker
    Write-Host "Step 3: Building Worker" -ForegroundColor Green
    try {
        npm run build:worker
    } catch {
        Write-Host "Warning: Build script not found, skipping" -ForegroundColor Yellow
    }
    Write-Host ""

    # Step 4: Deploy worker
    Write-Host "Step 4: Deploying Worker" -ForegroundColor Green
    wrangler deploy deployment/cloudflare/wrangler.toml --env=$Environment
    Write-Host ""

    # Step 5: Configure R2 CORS
    Write-Host "Step 5: Configuring R2 CORS" -ForegroundColor Green
    wrangler r2 bucket cors put spreadsheet-moment-assets --config=./deployment/cloudflare/r2/cors.json
    wrangler r2 bucket cors put spreadsheet-moment-uploads --config=./deployment/cloudflare/r2/cors.json
    Write-Host ""

    # Step 6: Configure R2 lifecycle
    Write-Host "Step 6: Configuring R2 lifecycle rules" -ForegroundColor Green
    wrangler r2 bucket lifecycle put spreadsheet-moment-uploads --file=./deployment/cloudflare/r2/lifecycle.json
    Write-Host ""

    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Deployment completed successfully!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Worker URL: https://spreadsheet-moment.$Environment.workers.dev"
    Write-Host "GraphQL API: https://spreadsheet-moment.$Environment.workers.dev/graphql"
    Write-Host ""
    Write-Host "Next steps:"
    Write-Host "1. Update your DNS records to point to the Worker"
    Write-Host "2. Configure custom domain in Cloudflare dashboard"
    Write-Host "3. Monitor Worker logs: wrangler tail --env=$Environment"
    Write-Host "4. Test the deployment: npm run test:cloudflare"
}

# Run main function
Main
