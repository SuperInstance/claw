# Spreadsheet Moment Monitoring Stack - Quick Start Script (Windows)
# This script sets up and starts the complete monitoring infrastructure

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Spreadsheet Moment Monitoring Stack Setup" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is installed
try {
    $dockerVersion = docker --version
    Write-Host "✓ Docker is installed: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: Docker is not installed" -ForegroundColor Red
    Write-Host "Please install Docker Desktop from https://www.docker.com/products/docker-desktop"
    exit 1
}

# Check if Docker Compose is installed
try {
    $composeVersion = docker-compose --version
    Write-Host "✓ Docker Compose is installed: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: Docker Compose is not installed" -ForegroundColor Red
    Write-Host "Please install Docker Compose from https://docs.docker.com/compose/install/"
    exit 1
}

Write-Host ""

# Create necessary directories
Write-Host "Creating directory structure..."
$directories = @(
    "prometheus-data",
    "grafana-data",
    "alertmanager-data",
    "loki-data"
)

foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
}
Write-Host "✓ Directories created" -ForegroundColor Green
Write-Host ""

# Navigate to docker directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location "$scriptPath\docker"

# Stop any existing containers
Write-Host "Stopping any existing containers..."
docker-compose down 2>$null
Write-Host "✓ Old containers stopped" -ForegroundColor Green
Write-Host ""

# Pull latest images
Write-Host "Pulling latest Docker images..."
docker-compose pull
Write-Host "✓ Docker images pulled" -ForegroundColor Green
Write-Host ""

# Start the monitoring stack
Write-Host "Starting monitoring stack..."
docker-compose up -d
Write-Host "✓ Monitoring stack started" -ForegroundColor Green
Write-Host ""

# Wait for services to be ready
Write-Host "Waiting for services to be ready..."
Start-Sleep -Seconds 10

# Check service health
Write-Host "Checking service health..."
$services = @{
    "prometheus" = 9090
    "grafana" = 3000
    "alertmanager" = 9093
    "loki" = 3100
}

foreach ($service in $services.GetEnumerator()) {
    $name = $service.Key
    $port = $service.Value
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$port" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        Write-Host "✓ $name is running" -ForegroundColor Green
    } catch {
        Write-Host "⚠ $name may not be fully ready yet" -ForegroundColor Yellow
    }
}

Write-Host ""

# Display access information
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Monitoring Stack is Ready!" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Access Points:"
Write-Host "  Grafana:        http://localhost:3000"
Write-Host "  (Default credentials: admin / changeme)"
Write-Host ""
Write-Host "  Prometheus:     http://localhost:9090"
Write-Host "  Alertmanager:   http://localhost:9093"
Write-Host "  Loki:           http://localhost:3100"
Write-Host "  cAdvisor:       http://localhost:8080"
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:"
Write-Host "  1. Login to Grafana and change the default password"
Write-Host "  2. Import the provided dashboards"
Write-Host "  3. Configure Alertmanager notifications"
Write-Host "  4. Set up your application metrics"
Write-Host ""
Write-Host "For more information, see README.md"
Write-Host ""
Write-Host "To stop the monitoring stack:"
Write-Host "  cd docker; docker-compose down"
Write-Host ""
