#!/bin/bash
# Spreadsheet Moment - Run Linters
# Runs all configured linters

set -euo pipefail

# Color codes
readonly GREEN='\033[0;32m'
readonly BLUE='\033[0;34m'
readonly YELLOW='\033[1;33m'
readonly RED='\033[0;31m'
readonly NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Configuration
FIX="${FIX:-false}"
STAGED="${STAGED:-false}"

echo -e "${BLUE}Running Linters${NC}"
echo ""

cd "$PROJECT_ROOT"

LINTERS_PASSED=0
LINTERS_FAILED=0

# Function to run linter
run_linter() {
    local name=$1
    local command=$2
    local required=${3:-true}

    echo -e "${BOLD}[${name}]${NC}"

    if eval "$command"; then
        echo -e "${GREEN}✓${NC} ${name} passed"
        ((LINTERS_PASSED++)) || true
    else
        echo -e "${RED}✗${NC} ${name} failed"
        ((LINTERS_FAILED++)) || true
        if [ "$required" = true ]; then
            return 1
        fi
    fi
    echo ""
}

# ESLint
if grep -q '"eslint"' package.json; then
    ESLINT_CMD="npm run lint"
    if [ "$FIX" = true ]; then
        ESLINT_CMD="$ESLINT_CMD -- --fix"
    fi
    if [ "$STAGED" = true ]; then
        ESLINT_CMD="$ESLINT_CMD -- $(git diff --name-only --cached '*.js' '*.jsx' '*.ts' '*.tsx' 2>/dev/null | tr '\n' ' ')"
    fi
    run_linter "ESLint" "$ESLINT_CMD" true
fi

# Prettier
if grep -q '"prettier"' package.json; then
    PRETTIER_CMD="npx prettier --check '**/*.{js,jsx,ts,tsx,json,css,scss,md}'"
    if [ "$FIX" = true ]; then
        PRETTIER_CMD="npx prettier --write '**/*.{js,jsx,ts,tsx,json,css,scss,md}'"
    fi
    run_linter "Prettier" "$PRETTIER_CMD" false
fi

# Stylelint
if grep -q '"stylelint"' package.json; then
    STYLELINT_CMD="npm run lint:style"
    if [ "$FIX" = true ]; then
        STYLELINT_CMD="$STYLELINT_CMD -- --fix"
    fi
    run_linter "Stylelint" "$STYLELINT_CMD" false
fi

# TypeScript type checking
if [ -f "tsconfig.json" ]; then
    run_linter "TypeScript" "npm run type-check" true
fi

# Summary
echo -e "${BOLD}╔═══════════════════════════════════════╗${NC}"
echo -e "${BOLD}║         Lint Summary                  ║${NC}"
echo -e "${BOLD}╚═══════════════════════════════════════╝${NC}"
echo ""
echo "Passed: $LINTERS_PASSED"
echo "Failed: $LINTERS_FAILED"
echo ""

if [ $LINTERS_FAILED -eq 0 ]; then
    echo -e "${GREEN}All linters passed!${NC}"
    exit 0
else
    echo -e "${RED}Some linters failed!${NC}"
    if [ "$FIX" = true ]; then
        echo "Run 'git diff' to see fixes"
    fi
    exit 1
fi
