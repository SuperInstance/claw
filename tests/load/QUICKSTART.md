#!/bin/bash

# Quick Start Script for Spreadsheet Moment Load Testing Suite

set -e

echo "================================"
echo "Spreadsheet Moment Load Testing"
echo "Quick Start Setup"
echo "================================"
echo ""

# Check if k6 is installed
if ! command -v k6 &> /dev/null; then
    echo "❌ k6 is not installed"
    echo ""
    echo "Install k6:"
    echo "  macOS:   brew install k6"
    echo "  Windows: choco install k6"
    echo "  Linux:   curl https://github.com/grafana/k6/releases/download/v0.47.0/k6-v0.47.0-linux-amd64.tar.gz -L | tar xvz"
    echo ""
    exit 1
fi

echo "✅ k6 is installed"

# Check if artillery is installed
if ! command -v artillery &> /dev/null; then
    echo "⚠️  artillery is not installed (optional, for WebSocket tests)"
    echo "   Install with: npm install -g artillery"
else
    echo "✅ artillery is installed"
fi

# Check if docker is running
if ! docker info &> /dev/null; then
    echo "⚠️  Docker is not running (optional, for monitoring)"
    echo "   Start Docker for Prometheus/Grafana monitoring"
else
    echo "✅ Docker is running"
fi

echo ""
echo "================================"
echo "Setup Steps"
echo "================================"
echo ""

# Step 1: Update package.json
echo "1️⃣  Updating package.json with load test scripts..."
node tests/load/scripts/update-package-json.js

# Step 2: Install dependencies
echo ""
echo "2️⃣  Installing dependencies..."
npm install

# Step 3: Generate test data
echo ""
echo "3️⃣  Generating test data..."
node tests/load/scripts/generate-users.js
node tests/load/scripts/generate-spreadsheets.js

# Step 4: Start monitoring
echo ""
echo "4️⃣  Starting monitoring infrastructure (Prometheus/Grafana)..."
cd tests/load
docker-compose up -d prometheus grafana 2>/dev/null || echo "   (Skipped - Docker not available)"
cd ../..

echo ""
echo "================================"
echo "Setup Complete!"
echo "================================"
echo ""
echo "Quick Start Commands:"
echo ""
echo "  Run baseline test:"
echo "    npm run test:load:baseline"
echo ""
echo "  Run all load tests:"
echo "    npm run test:load"
echo ""
echo "  Generate test data:"
echo "    npm run test:load:generate"
echo ""
echo "  Start monitoring:"
echo "    npm run test:load:monitoring"
echo ""
echo "  View Grafana dashboard:"
echo "    open http://localhost:3000 (admin/admin)"
echo ""
echo "For more information, see:"
echo "  - tests/load/README.md"
echo "  - tests/load/IMPLEMENTATION_GUIDE.md"
echo ""
