#!/bin/bash
# Spreadsheet Moment - Accessibility Tests
# Runs accessibility tests with axe-core

set -euo pipefail

# Color codes
readonly GREEN='\033[0;32m'
readonly BLUE='\033[0;34m'
readonly YELLOW='\033[1;33m'
readonly RED='\033[0;31m'
readonly NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}Running Accessibility Tests${NC}"
echo ""

cd "$PROJECT_ROOT"

# Check for axe-core or Playwright axe integration
if ! grep -q '"@axe-core/playwright"' package.json && ! grep -q '"jest-axe"' package.json; then
    echo -e "${YELLOW}Accessibility testing tools not found.${NC}"
    echo "Install with:"
    echo "  npm install --save-dev @axe-core/playwright"
    echo "  # or"
    echo "  npm install --save-dev jest-axe"
    exit 0
fi

# Build the application first
echo -e "${YELLOW}Building application...${NC}"
npm run build

# Start development server in background
echo -e "${YELLOW}Starting development server...${NC}"
npx next start &
SERVER_PID=$!

# Wait for server to start
sleep 10

# Trap to kill server on exit
trap "kill $SERVER_PID 2>/dev/null || true" EXIT

# Run accessibility tests
if grep -q '"@axe-core/playwright"' package.json; then
    echo -e "${YELLOW}Running Playwright axe tests...${NC}"

    if npm run test:a11y 2>/dev/null || npx playwright test --config=playwright-a11y.config.js; then
        echo -e "${GREEN}Accessibility tests passed!${NC}"
        exit 0
    else
        echo -e "${RED}Accessibility tests failed!${NC}"
        exit 1
    fi
elif grep -q '"jest-axe"' package.json; then
    echo -e "${YELLOW}Running Jest axe tests...${NC}"

    if npm run test:a11y 2>/dev/null || npx jest --testPathPattern=a11y; then
        echo -e "${GREEN}Accessibility tests passed!${NC}"
        exit 0
    else
        echo -e "${RED}Accessibility tests failed!${NC}"
        exit 1
    fi
fi
