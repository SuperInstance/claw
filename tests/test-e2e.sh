#!/bin/bash
# Spreadsheet Moment - E2E Tests
# Runs end-to-end tests with Playwright

set -euo pipefail

# Color codes
readonly GREEN='\033[0;32m'
readonly BLUE='\033[0;34m'
readonly YELLOW='\033[1;33m'
readonly RED='\033[0;31m'
readonly NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}Running E2E Tests${NC}"
echo ""

cd "$PROJECT_ROOT"

# Check for Playwright
if ! grep -q '"@playwright/test"' package.json; then
    echo -e "${YELLOW}Playwright not configured. Skipping E2E tests.${NC}"
    exit 0
fi

# Ensure Playwright browsers are installed
echo -e "${YELLOW}Ensuring Playwright browsers are installed...${NC}"
npx playwright install --with-deps

# Build the application first
echo -e "${YELLOW}Building application for E2E tests...${NC}"
npm run build

# Start development server in background
echo -e "${YELLOW}Starting development server...${NC}"
npx next start &
SERVER_PID=$!

# Wait for server to start
sleep 10

# Trap to kill server on exit
trap "kill $SERVER_PID 2>/dev/null || true" EXIT

# Run E2E tests
TEST_CMD="npm run test:e2e"

if [ "${HEADLESS:-true}" = true ]; then
    TEST_CMD="$TEST_CMD -- --headed=false"
else
    TEST_CMD="$TEST_CMD -- --headed=true"
fi

if eval "$TEST_CMD"; then
    echo -e "${GREEN}E2E tests passed!${NC}"
    exit 0
else
    echo -e "${RED}E2E tests failed!${NC}"

    # Show screenshots/videos if they exist
    if [ -d "playwright-report" ]; then
        echo -e "${YELLOW}Test artifacts available in playwright-report/${NC}"
    fi

    exit 1
fi
