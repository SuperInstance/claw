#!/bin/bash
# Example Development Workflow
# Demonstrates typical development workflow using automation scripts

set -euo pipefail

# Color codes for output
readonly GREEN='\033[0;32m'
readonly BLUE='\033[0;34m'
readonly YELLOW='\033[1;33m'
readonly NC='\033[0m'

echo -e "${BLUE}Spreadsheet Moment - Development Workflow Example${NC}"
echo ""

# =================================================================
# Morning Setup
# =================================================================

echo -e "${BOLD}[1] Morning Setup${NC}"
echo "----------------------------"

# Pull latest changes
echo -e "${YELLOW}→${NC} Pulling latest changes..."
git pull origin main

# Check for updates
echo -e "${YELLOW}→${NC} Checking for dependency updates..."
./utils/update.sh

# Start development server
echo -e "${YELLOW}→${NC} Starting development server..."
./dev/dev.sh &
DEV_PID=$!

echo ""

# =================================================================
# Feature Development
# =================================================================

echo -e "${BOLD}[2] Feature Development${NC}"
echo "----------------------------"

# Create feature branch
echo -e "${YELLOW}→${NC} Creating feature branch..."
git checkout -b feature/new-feature

# Make changes...
echo -e "${YELLOW}→${NC} Making code changes..."
# (Edit files here)

# Format code
echo -e "${YELLOW}→${NC} Formatting code..."
./utils/format.sh

# Run linters
echo -e "${YELLOW}→${NC} Running linters..."
./utils/lint.sh

# Run tests in watch mode
echo -e "${YELLOW}→${NC} Running tests in watch mode..."
./dev/dev-watch.sh &
TEST_PID=$!

echo ""

# =================================================================
# Pre-Commit
# =================================================================

echo -e "${BOLD}[3] Pre-Commit Checks${NC}"
echo "----------------------------"

# Kill background processes
kill $DEV_PID $TEST_PID 2>/dev/null || true

# Run complete test suite
echo -e "${YELLOW}→${NC} Running complete test suite..."
./tests/test-all.sh

# Generate coverage
echo -e "${YELLOW}→${NC} Generating coverage report..."
./tests/test-coverage.sh

# Security scan
echo -e "${YELLOW}→${NC} Running security scan..."
./tests/test-security.sh

# Validate configuration
echo -e "${YELLOW}→${NC} Validating configuration..."
./utils/validate.sh

echo ""

# =================================================================
# Commit Changes
# =================================================================

echo -e "${BOLD}[4] Commit Changes${NC}"
echo "----------------------------"

# Stage changes
echo -e "${YELLOW}→${NC} Staging changes..."
git add .

# Commit
echo -e "${YELLOW}→${NC} Committing changes..."
git commit -m "feat: add new feature"

# Push
echo -e "${YELLOW}→${NC} Pushing to remote..."
git push origin feature/new-feature

echo ""

# =================================================================
# Pre-Merge
# =================================================================

echo -e "${BOLD}[5] Pre-Merge Validation${NC}"
echo "----------------------------"

# Merge to develop
echo -e "${YELLOW}→${NC} Merging to develop..."
git checkout develop
git merge feature/new-feature

# Run E2E tests
echo -e "${YELLOW}→${NC} Running E2E tests..."
./tests/test-e2e.sh

# Build production bundle
echo -e "${YELLOW}→${NC} Building production bundle..."
./build/build-prod.sh

echo ""

# =================================================================
# Deployment
# =================================================================

echo -e "${BOLD}[6] Deployment${NC}"
echo "----------------------------"

# Deploy to staging
echo -e "${YELLOW}→${NC} Deploying to staging..."
export ENVIRONMENT=staging
./deploy/deploy-cloudflare.sh

# Health check
echo -e "${YELLOW}→${NC} Running health check..."
export HEALTH_URL=https://staging.spreadsheet-moment.pages.dev/api/health
./monitoring/health-check.sh

echo ""

# =================================================================
# Post-Deployment
# =================================================================

echo -e "${BOLD}[7] Post-Deployment${NC}"
echo "----------------------------"

# Collect metrics
echo -e "${YELLOW}→${NC} Collecting metrics..."
./monitoring/metrics-collect.sh

# Analyze logs
echo -e "${YELLOW}→${NC} Analyzing logs..."
./monitoring/log-analyze.sh

# Create backup
echo -e "${YELLOW}→${NC} Creating database backup..."
export DB_TYPE=postgresql
./monitoring/backup.sh

echo ""

# =================================================================
# Cleanup
# =================================================================

echo -e "${BOLD}[8] Cleanup${NC}"
echo "----------------------------"

# Clean old backups
echo -e "${YELLOW}→${NC} Cleaning old resources..."
export RETENTION_DAYS=30
./monitoring/cleanup.sh

# Clean build artifacts
echo -e "${YELLOW}→${NC} Cleaning build artifacts..."
./dev/dev-clean.sh

echo ""

echo -e "${GREEN}Workflow example completed!${NC}"
echo ""
echo "This example demonstrates a typical development workflow."
echo "Adapt these steps to your specific needs."
