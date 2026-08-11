#!/bin/bash

# Spreadsheet Moment Monitoring Stack - Quick Start Script
# This script sets up and starts the complete monitoring infrastructure

set -e

echo "=========================================="
echo "Spreadsheet Moment Monitoring Stack Setup"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    echo "Please install Docker from https://www.docker.com/get-started"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Error: Docker Compose is not installed${NC}"
    echo "Please install Docker Compose from https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}✓ Docker and Docker Compose are installed${NC}"
echo ""

# Create necessary directories
echo "Creating directory structure..."
mkdir -p prometheus-data
mkdir -p grafana-data
mkdir -p alertmanager-data
mkdir -p loki-data
echo -e "${GREEN}✓ Directories created${NC}"
echo ""

# Check if ports are available
echo "Checking port availability..."
ports=(3000 9090 9093 3100 8080 9100)
for port in "${ports[@]}"; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠ Warning: Port $port is already in use${NC}"
    fi
done
echo ""

# Navigate to docker directory
cd "$(dirname "$0")/docker"

# Stop any existing containers
echo "Stopping any existing containers..."
docker-compose down 2>/dev/null || true
echo -e "${GREEN}✓ Old containers stopped${NC}"
echo ""

# Pull latest images
echo "Pulling latest Docker images..."
docker-compose pull
echo -e "${GREEN}✓ Docker images pulled${NC}"
echo ""

# Start the monitoring stack
echo "Starting monitoring stack..."
docker-compose up -d
echo -e "${GREEN}✓ Monitoring stack started${NC}"
echo ""

# Wait for services to be ready
echo "Waiting for services to be ready..."
sleep 10

# Check service health
echo "Checking service health..."
services=("prometheus:9090" "grafana:3000" "alertmanager:9093" "loki:3100")
for service in "${services[@]}"; do
    name="${service%:*}"
    port="${service#*:}"
    if curl -s "http://localhost:$port" > /dev/null; then
        echo -e "${GREEN}✓ $name is running${NC}"
    else
        echo -e "${YELLOW}⚠ $name may not be fully ready yet${NC}"
    fi
done
echo ""

# Display access information
echo "=========================================="
echo "Monitoring Stack is Ready!"
echo "=========================================="
echo ""
echo "Access Points:"
echo "  Grafana:        http://localhost:3000"
echo "  (Default credentials: admin / changeme)"
echo ""
echo "  Prometheus:     http://localhost:9090"
echo "  Alertmanager:   http://localhost:9093"
echo "  Loki:           http://localhost:3100"
echo "  cAdvisor:       http://localhost:8080"
echo ""
echo "=========================================="
echo ""
echo "Next Steps:"
echo "  1. Login to Grafana and change the default password"
echo "  2. Import the provided dashboards"
echo "  3. Configure Alertmanager notifications"
echo "  4. Set up your application metrics"
echo ""
echo "For more information, see README.md"
echo ""
echo "To stop the monitoring stack:"
echo "  cd docker && docker-compose down"
echo ""
