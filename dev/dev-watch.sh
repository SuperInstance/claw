#!/bin/bash
# Spreadsheet Moment - Watch Mode
# Runs tests in watch mode

set -euo pipefail

# Color codes
readonly GREEN='\033[0;32m'
readonly BLUE='\033[0;34m'
readonly YELLOW='\033[1;33m'
readonly NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}Starting Test Watch Mode${NC}"
echo ""

cd "$PROJECT_ROOT"

# Check for test configuration
if grep -q '"jest"' package.json; then
    echo -e "${GREEN}Running Jest in watch mode...${NC}"
    npm run test:unit -- --watch --watchAll=false
elif grep -q '"vitest"' package.json; then
    echo -e "${GREEN}Running Vitest in watch mode...${NC}"
    npx vitest watch
else
    echo -e "${YELLOW}No test runner found. Install Jest or Vitest.${NC}"
    exit 1
fi
