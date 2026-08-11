#!/bin/bash
# Spreadsheet Moment - Integration Tests
# Runs integration tests

set -euo pipefail

# Color codes
readonly GREEN='\033[0;32m'
readonly BLUE='\033[0;34m'
readonly YELLOW='\033[1;33m'
readonly RED='\033[0;31m'
readonly NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}Running Integration Tests${NC}"
echo ""

cd "$PROJECT_ROOT"

# Check for integration test configuration
if [ ! -d "tests/integration" ]; then
    echo -e "${YELLOW}Integration tests not configured. Skipping.${NC}"
    exit 0
fi

# Start test dependencies if needed
if [ -f "docker-compose.test.yml" ]; then
    echo -e "${YELLOW}Starting test dependencies...${NC}"
    docker-compose -f docker-compose.test.yml up -d

    # Wait for services to be ready
    sleep 5
fi

# Run integration tests
if [ -f "package.json" ] && grep -q '"test:integration"' package.json; then
    TEST_CMD="npm run test:integration"
elif [ -f "tests/integration/jest.config.js" ]; then
    TEST_CMD="npx jest --config=tests/integration/jest.config.js"
else
    echo -e "${YELLOW}No integration test runner found. Skipping.${NC}"
    exit 0
fi

if eval "$TEST_CMD"; then
    echo -e "${GREEN}Integration tests passed!${NC}"

    # Cleanup test dependencies
    if [ -f "docker-compose.test.yml" ]; then
        echo -e "${YELLOW}Cleaning up test dependencies...${NC}"
        docker-compose -f docker-compose.test.yml down
    fi

    exit 0
else
    echo -e "${RED}Integration tests failed!${NC}"

    # Keep test dependencies running for debugging
    if [ -f "docker-compose.test.yml" ]; then
        echo -e "${YELLOW}Test dependencies left running for debugging.${NC}"
        echo "Stop them with: docker-compose -f docker-compose.test.yml down"
    fi

    exit 1
fi
