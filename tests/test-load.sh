#!/bin/bash
# Spreadsheet Moment - Load Tests
# Runs load tests with k6 or Artillery

set -euo pipefail

# Color codes
readonly GREEN='\033[0;32m'
readonly BLUE='\033[0;34m'
readonly YELLOW='\033[1;33m'
readonly RED='\033[0;31m'
readonly NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}Running Load Tests${NC}"
echo ""

cd "$PROJECT_ROOT"

# Determine load test tool
LOAD_TEST_TOOL=""
if command -v k6 &> /dev/null; then
    LOAD_TEST_TOOL="k6"
elif grep -q '"artillery"' package.json; then
    LOAD_TEST_TOOL="artillery"
fi

if [ -z "$LOAD_TEST_TOOL" ]; then
    echo -e "${YELLOW}No load testing tool found. Install k6 or artillery.${NC}"
    echo "  k6: https://k6.io/"
    echo "  artillery: npm install -g artillery"
    exit 0
fi

# Check for load test scenarios
SCENARIO_DIR="${PROJECT_ROOT}/tests/load"
if [ ! -d "$SCENARIO_DIR" ]; then
    echo -e "${YELLOW}Load test scenarios not found. Skipping.${NC}"
    exit 0
fi

# Run load tests
case "$LOAD_TEST_TOOL" in
    k6)
        echo -e "${YELLOW}Running k6 load tests...${NC}"

        for scenario in "$SCENARIO_DIR"/*.js; do
            if [ -f "$scenario" ]; then
                echo "Running: $scenario"
                k6 run "$scenario" || true
            fi
        done
        ;;

    artillery)
        echo -e "${YELLOW}Running Artillery load tests...${NC}"

        for scenario in "$SCENARIO_DIR"/*.yml; do
            if [ -f "$scenario" ]; then
                echo "Running: $scenario"
                npx artillery run "$scenario" || true
            fi
        done
        ;;
esac

echo -e "${GREEN}Load tests completed!${NC}"
echo "Review the output above for performance metrics."

exit 0
