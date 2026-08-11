#!/bin/bash
# Spreadsheet Moment - Run All Tests
# Executes complete test suite

set -euo pipefail

# Color codes
readonly GREEN='\033[0;32m'
readonly BLUE='\033[0;34m'
readonly YELLOW='\033[1;33m'
readonly RED='\033[0;31m'
readonly BOLD='\033[1m'
readonly NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
COVERAGE_DIR="${PROJECT_ROOT}/coverage"

# Configuration
COVERAGE="${COVERAGE:-true}"
WATCH="${WATCH:-false}"
VERBOSE="${VERBOSE:-false}"

echo -e "${BOLD}╔═══════════════════════════════════════╗${NC}"
echo -e "${BOLD}║    Spreadsheet Moment - Test Suite   ║${NC}"
echo -e "${BOLD}╚═══════════════════════════════════════╝${NC}"
echo ""

# Test counter
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Run test suite
run_test_suite() {
    local name=$1
    local script=$2
    local required=${3:-true}

    echo -e "${BOLD}[${name}]${NC}"
    ((TESTS_RUN++)) || true

    if [ ! -f "$script" ]; then
        echo -e "${YELLOW}⊘${NC} Test script not found: $script"
        if [ "$required" = true ]; then
            ((TESTS_FAILED++)) || true
            return 1
        fi
        return 0
    fi

    if bash "$script"; then
        echo -e "${GREEN}✓${NC} ${name} tests passed"
        ((TESTS_PASSED++)) || true
    else
        echo -e "${RED}✗${NC} ${name} tests failed"
        ((TESTS_FAILED++)) || true
        if [ "$required" = true ]; then
            return 1
        fi
    fi
    echo ""
}

# Clean coverage directory
if [ "$COVERAGE" = true ]; then
    rm -rf "$COVERAGE_DIR"
    mkdir -p "$COVERAGE_DIR"
fi

# Run test suites
run_test_suite "Unit" "${SCRIPT_DIR}/test-unit.sh" true
run_test_suite "Integration" "${SCRIPT_DIR}/test-integration.sh" true
run_test_suite "E2E" "${SCRIPT_DIR}/test-e2e.sh" false
run_test_suite "Coverage" "${SCRIPT_DIR}/test-coverage.sh" false
run_test_suite "Load" "${SCRIPT_DIR}/test-load.sh" false
run_test_suite "Security" "${SCRIPT_DIR}/test-security.sh" false
run_test_suite "Accessibility" "${SCRIPT_DIR}/test-a11y.sh" false

# Generate coverage report
if [ "$COVERAGE" = true ] && [ -d "$COVERAGE_DIR" ]; then
    echo -e "${BOLD}[Coverage Report]${NC}"
    if [ -f "$COVERAGE_DIR/lcov-report/index.html" ]; then
        echo -e "${GREEN}Coverage report generated:${NC}"
        echo "  file://$COVERAGE_DIR/lcov-report/index.html"
    fi
    echo ""
fi

# Summary
echo -e "${BOLD}╔═══════════════════════════════════════╗${NC}"
echo -e "${BOLD}║           Test Summary                ║${NC}"
echo -e "${BOLD}╚═══════════════════════════════════════╝${NC}"
echo ""
echo -e "Tests Run:    ${TESTS_RUN}"
echo -e "${GREEN}Tests Passed: ${TESTS_PASSED}${NC}"
if [ $TESTS_FAILED -gt 0 ]; then
    echo -e "${RED}Tests Failed: ${TESTS_FAILED}${NC}"
fi
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed!${NC}"
    exit 1
fi
