#!/bin/bash
# Spreadsheet Moment - Coverage Report
# Generates code coverage report

set -euo pipefail

# Color codes
readonly GREEN='\033[0;32m'
readonly BLUE='\033[0;34m'
readonly YELLOW='\033[1;33m'
readonly RED='\033[0;31m'
readonly NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
COVERAGE_DIR="${PROJECT_ROOT}/coverage"

echo -e "${BLUE}Generating Coverage Report${NC}"
echo ""

cd "$PROJECT_ROOT"

# Clean previous coverage
rm -rf "$COVERAGE_DIR"

# Run tests with coverage
if grep -q '"jest"' package.json; then
    echo -e "${YELLOW}Running Jest with coverage...${NC}"
    npx jest --coverage --coverageProviders=vlc
elif grep -q '"vitest"' package.json; then
    echo -e "${YELLOW}Running Vitest with coverage...${NC}"
    npx vitest run --coverage
else
    echo -e "${YELLOW}No test runner with coverage found. Skipping.${NC}"
    exit 0
fi

# Display coverage summary
echo ""
echo -e "${BLUE}Coverage Summary:${NC}"

if [ -f "$COVERAGE_DIR/coverage-summary.json" ]; then
    # Parse and display coverage
    TOTAL_PCT=$(node -e "
        const data = require('$COVERAGE_DIR/coverage-summary.json');
        const total = data.total;
        console.log(\`Statements: \${total.lines.pct}%\`);
        console.log(\`Branches: \${total.branches.pct}%\`);
        console.log(\`Functions: \${total.functions.pct}%\`);
        console.log(\`Lines: \${total.lines.pct}%\`);
    ")
    echo "$TOTAL_PCT"
fi

# Open coverage report
if [ -f "$COVERAGE_DIR/lcov-report/index.html" ]; then
    echo ""
    echo -e "${GREEN}Coverage report generated!${NC}"
    echo "View at: file://$COVERAGE_DIR/lcov-report/index.html"

    # Try to open in browser
    if command -v open &> /dev/null; then
        open "$COVERAGE_DIR/lcov-report/index.html"
    elif command -v xdg-open &> /dev/null; then
        xdg-open "$COVERAGE_DIR/lcov-report/index.html"
    fi
fi

exit 0
