#!/bin/bash
# Spreadsheet Moment - Unit Tests
# Runs unit tests with Jest

set -euo pipefail

# Color codes
readonly GREEN='\033[0;32m'
readonly BLUE='\033[0;34m'
readonly YELLOW='\033[1;33m'
readonly RED='\033[0;31m'
readonly NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}Running Unit Tests${NC}"
echo ""

cd "$PROJECT_ROOT"

# Check for Jest
if ! grep -q '"jest"' package.json; then
    echo -e "${YELLOW}Jest not configured. Skipping unit tests.${NC}"
    exit 0
fi

# Run Jest unit tests
TEST_CMD="npm run test:unit -- --passWithNoTests"

# Add coverage if requested
if [ "${COVERAGE:-false}" = true ]; then
    TEST_CMD="$TEST_CMD --coverage"
fi

# Add verbose if requested
if [ "${VERBOSE:-false}" = true ]; then
    TEST_CMD="$TEST_CMD --verbose"
fi

# Add watch if requested
if [ "${WATCH:-false}" = true ]; then
    TEST_CMD="$TEST_CMD --watch"
fi

if eval "$TEST_CMD"; then
    echo -e "${GREEN}Unit tests passed!${NC}"
    exit 0
else
    echo -e "${RED}Unit tests failed!${NC}"
    exit 1
fi
