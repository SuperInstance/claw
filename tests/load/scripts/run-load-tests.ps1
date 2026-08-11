# Spreadsheet Moment Load Test Runner (Windows PowerShell)
# Executes all load test scenarios and generates reports

param(
    [Parameter(Position=0)]
    [ValidateSet('baseline', 'rampup', 'sustained', 'spike', 'stress', 'websocket', 'all')]
    [string]$TestType = 'all'
)

# Configuration
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$LoadTestDir = Split-Path -Parent $ScriptDir
$DataDir = Join-Path $LoadTestDir 'data'
$ReportDir = Join-Path $LoadTestDir 'reports'
$K6Dir = Join-Path $LoadTestDir 'k6'
$ArtilleryDir = Join-Path $LoadTestDir 'artillery'

$BaseUrl = if ($env:BASE_URL) { $env:BASE_URL } else { 'http://localhost:4000' }
$ApiKey = if ($env:API_KEY) { $env:API_KEY } else { 'test-api-key' }

# Create directories
New-Item -ItemType Directory -Force -Path $DataDir | Out-Null
New-Item -ItemType Directory -Force -Path $ReportDir | Out-Null

# Functions
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Log-Info {
    Write-ColorOutput Cyan "[INFO] $args"
}

function Log-Success {
    Write-ColorOutput Green "[SUCCESS] $args"
}

function Log-Warning {
    Write-ColorOutput Yellow "[WARNING] $args"
}

function Log-Error {
    Write-ColorOutput Red "[ERROR] $args"
}

function Print-Header {
    Write-Output ""
    Write-Output "================================"
    Write-Output $args[0]
    Write-Output "================================"
    Write-Output ""
}

# Check prerequisites
function Test-Prerequisites {
    Print-Header "Checking Prerequisites"

    # Check k6
    try {
        $k6Version = k6 version 2>&1 | Select-String -Pattern "k6 v\K[0-9.]+" | ForEach-Object { $_.Matches.Value }
        if ($k6Version) {
            Log-Success "k6 is installed (version: $k6Version)"
        } else {
            Log-Success "k6 is installed"
        }
    } catch {
        Log-Error "k6 is not installed. Install from: https://k6.io/"
        exit 1
    }

    # Check artillery
    try {
        $null = artillery --version 2>&1
        Log-Success "artillery is installed"
    } catch {
        Log-Warning "artillery is not installed. WebSocket tests will be skipped."
    }

    # Check docker
    try {
        $null = docker --version 2>&1
        Log-Success "docker is installed"
    } catch {
        Log-Warning "docker is not installed. Monitoring stack will not be available."
    }

    # Check application
    try {
        $response = Invoke-WebRequest -Uri "$BaseUrl/health" -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Log-Success "Application is accessible at $BaseUrl"
        }
    } catch {
        Log-Error "Application is not accessible at $BaseUrl"
        Log-Info "Start the application first or set BASE_URL environment variable"
        exit 1
    }
}

# Generate test data
function Initialize-TestData {
    Print-Header "Generating Test Data"

    $usersFile = Join-Path $DataDir 'test-users.json'
    $spreadsheetsFile = Join-Path $DataDir 'test-spreadsheets.json'

    if (-not (Test-Path $usersFile)) {
        Log-Info "Generating test users..."
        node (Join-Path $ScriptDir 'generate-users.js')
    } else {
        Log-Info "Test users already exist, skipping generation"
    }

    if (-not (Test-Path $spreadsheetsFile)) {
        Log-Info "Generating test spreadsheets..."
        node (Join-Path $ScriptDir 'generate-spreadsheets.js')
    } else {
        Log-Info "Test spreadsheets already exist, skipping generation"
    }
}

# Start monitoring infrastructure
function Start-Monitoring {
    Print-Header "Starting Monitoring Infrastructure"

    Set-Location $LoadTestDir

    try {
        $dockerStatus = docker-compose ps -q | Measure-Object | Select-Object -ExpandProperty Count
        if ($dockerStatus -gt 0) {
            Log-Info "Monitoring infrastructure already running"
        } else {
            Log-Info "Starting Prometheus and Grafana..."
            docker-compose up -d prometheus grafana

            Log-Info "Waiting for services to be ready..."
            Start-Sleep -Seconds 10

            Log-Success "Monitoring infrastructure started"
            Log-Info "Grafana: http://localhost:3000 (admin/admin)"
            Log-Info "Prometheus: http://localhost:9090"
        }
    } catch {
        Log-Warning "Could not start monitoring infrastructure: $_"
    }
}

# Run k6 tests
function Invoke-K6Test {
    param(
        [string]$Name,
        [string]$TestFile
    )

    $timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
    $reportFile = Join-Path $ReportDir "${Name}-${timestamp}.json"

    Print-Header "Running $Name Test"

    Log-Info "Test file: $TestFile"
    Log-Info "Report: $reportFile"

    $env:K6_WEB_DASHBOARD = 'true'
    $env:K6_WEB_DASHBOARD_EXPORT = Join-Path $ReportDir "${Name}-${timestamp}.html"
    $env:BASE_URL = $BaseUrl
    $env:API_KEY = $ApiKey

    try {
        k6 run `
            --out json="$reportFile" `
            --summary-export="$ReportDir/${Name}-${timestamp}-summary.json" `
            $TestFile

        if ($LASTEXITCODE -eq 0) {
            Log-Success "$Name test completed successfully"
            return $true
        } else {
            Log-Error "$Name test failed"
            return $false
        }
    } catch {
        Log-Error "$Name test failed: $_"
        return $false
    } finally {
        Remove-Item Env:\K6_WEB_DASHBOARD -ErrorAction SilentlyContinue
        Remove-Item Env:\K6_WEB_DASHBOARD_EXPORT -ErrorAction SilentlyContinue
    }
}

# Run artillery tests
function Invoke-ArtilleryTest {
    param(
        [string]$Name,
        [string]$TestFile
    )

    $timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
    $reportFile = Join-Path $ReportDir "${Name}-${timestamp}.json"

    Print-Header "Running $Name WebSocket Test"

    try {
        $null = artillery --version 2>&1
    } catch {
        Log-Warning "artillery not installed, skipping WebSocket tests"
        return $true
    }

    Log-Info "Test file: $TestFile"
    Log-Info "Report: $reportFile"

    try {
        artillery run $TestFile --output $reportFile

        if ($LASTEXITCODE -eq 0) {
            Log-Success "$Name test completed successfully"

            # Generate HTML report
            artillery report $reportFile --output "$ReportDir/${Name}-${timestamp}.html"
            return $true
        } else {
            Log-Error "$Name test failed"
            return $false
        }
    } catch {
        Log-Error "$Name test failed: $_"
        return $false
    }
}

# Generate summary report
function New-SummaryReport {
    Print-Header "Generating Summary Report"

    $timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
    $summaryFile = Join-Path $ReportDir "summary-${timestamp}.md"

    @"
# Load Test Summary Report

**Date:** $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
**Target:** $BaseUrl

## Test Results

"@ | Out-File -FilePath $summaryFile -Encoding UTF8

    # Add results
    Get-ChildItem -Path $ReportDir -Filter '*-summary.json' | ForEach-Object {
        $testName = $_.Name -replace '-\d{8}_\d{6}-summary\.json$', ''
        $content = Get-Content $_.RawBasePath -Raw | ConvertFrom-Json

        @"
### $testName

**Metrics:**
- Requests: $($content.metrics.http_reqs.values.count)
- Response Time (p95): $([math]::Round($content.metrics.http_req_duration.values.'p(95)', 2))ms
- Response Time (p99): $([math]::Round($content.metrics.http_req_duration.values.'p(99)', 2))ms
- Error Rate: $([math]::Round($content.metrics.http_req_failed.values.rate * 100, 2))%

"@ | Add-Content -Path $summaryFile
    }

    Log-Success "Summary report generated: $summaryFile"
}

# Main execution
function Main {
    Print-Header "Spreadsheet Moment Load Testing Suite"

    switch ($TestType) {
        'baseline' {
            Test-Prerequisites
            Initialize-TestData
            Invoke-K6Test -Name 'baseline' -TestFile (Join-Path $K6Dir 'baseline-test.js')
        }
        'rampup' {
            Test-Prerequisites
            Initialize-TestData
            Invoke-K6Test -Name 'rampup' -TestFile (Join-Path $K6Dir 'rampup-test.js')
        }
        'sustained' {
            Test-Prerequisites
            Initialize-TestData
            Invoke-K6Test -Name 'sustained' -TestFile (Join-Path $K6Dir 'sustained-test.js')
        }
        'spike' {
            Test-Prerequisites
            Initialize-TestData
            Invoke-K6Test -Name 'spike' -TestFile (Join-Path $K6Dir 'spike-test.js')
        }
        'stress' {
            Test-Prerequisites
            Initialize-TestData
            Invoke-K6Test -Name 'stress' -TestFile (Join-Path $K6Dir 'stress-test.js')
        }
        'websocket' {
            Test-Prerequisites
            Initialize-TestData
            Invoke-ArtilleryTest -Name 'websocket-baseline' -TestFile (Join-Path $ArtilleryDir 'websocket-baseline.yml')
            Invoke-ArtilleryTest -Name 'websocket-stress' -TestFile (Join-Path $ArtilleryDir 'websocket-stress.yml')
        }
        'all' {
            Test-Prerequisites
            Initialize-TestData
            Start-Monitoring

            Log-Info "Running all load tests..."

            Invoke-K6Test -Name 'baseline' -TestFile (Join-Path $K6Dir 'baseline-test.js')
            Invoke-K6Test -Name 'rampup' -TestFile (Join-Path $K6Dir 'rampup-test.js')
            Invoke-K6Test -Name 'sustained' -TestFile (Join-Path $K6Dir 'sustained-test.js')
            Invoke-K6Test -Name 'spike' -TestFile (Join-Path $K6Dir 'spike-test.js')
            Invoke-K6Test -Name 'stress' -TestFile (Join-Path $K6Dir 'stress-test.js')
            Invoke-ArtilleryTest -Name 'websocket-baseline' -TestFile (Join-Path $ArtilleryDir 'websocket-baseline.yml')
            Invoke-ArtilleryTest -Name 'websocket-stress' -TestFile (Join-Path $ArtilleryDir 'websocket-stress.yml')

            New-SummaryReport

            Print-Header "All Tests Completed"
            Log-Info "Reports available in: $ReportDir"
            Log-Info "Grafana dashboard: http://localhost:3000"
        }
    }
}

# Run main function
Main
