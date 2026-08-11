#!/bin/bash
# Spreadsheet Moment - Configuration Validation
# Validates configuration files and environment

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

echo -e "${BOLD}╔═══════════════════════════════════════╗${NC}"
echo -e "${BOLD}║     Configuration Validation         ║${NC}"
echo -e "${BOLD}╚═══════════════════════════════════════╝${NC}"
echo ""

# Track validation results
VALIDATIONS_PASSED=0
VALIDATIONS_FAILED=0

# Function to validate file
validate_file() {
    local name=$1
    local file=$2
    local required=${3:-true}
    local check_cmd=${4:-"test -f"}

    echo -e "${BOLD}[${name}]${NC}"

    if [ ! -f "$file" ]; then
        if [ "$required" = true ]; then
            echo -e "  ${RED}✗${NC} Required file not found: $file"
            ((VALIDATIONS_FAILED++)) || true
            return 1
        else
            echo -e "  ${YELLOW}⊘${NC} Optional file not found: $file"
            return 0
        fi
    fi

    # Run custom validation check
    if [ -n "$check_cmd" ] && [ "$check_cmd" != "test -f" ]; then
        if eval "$check_cmd \"$file\""; then
            echo -e "  ${GREEN}✓${NC} Valid: $file"
            ((VALIDATIONS_PASSED++)) || true
        else
            echo -e "  ${RED}✗${NC} Invalid: $file"
            ((VALIDATIONS_FAILED++)) || true
            return 1
        fi
    else
        echo -e "  ${GREEN}✓${NC} Found: $file"
        ((VALIDATIONS_PASSED++)) || true
    fi

    echo ""
}

# 1. Package files
echo -e "${BOLD}Package Files${NC}"
validate_file "package.json" "package.json" true "jq empty 2>/dev/null"
validate_file "package-lock.json" "package-lock.json" true "jq empty 2>/dev/null"
validate_file "yarn.lock" "yarn.lock" false ""

# 2. Configuration files
echo -e "${BOLD}Configuration Files${NC}"
validate_file "TypeScript Config" "tsconfig.json" false "jq -e .compilerOptions 2>/dev/null"
validate_file "Next.js Config" "next.config.js" false "test -f"
validate_file "ESLint Config" ".eslintrc.js" false "test -f"
validate_file "Prettier Config" ".prettierrc" false "test -f"
validate_file "Gitignore" ".gitignore" false "test -f"

# 3. Environment files
echo -e "${BOLD}Environment Files${NC}"
validate_file ".env.example" ".env.example" false "test -f"

# Check .env.local (should exist for local development)
if [ ! -f ".env.local" ]; then
    echo -e "  ${YELLOW}⚠${NC} .env.local not found (recommended for local development)"
    echo "    Run: ./dev/dev-setup.sh to create it"
else
    echo -e "  ${GREEN}✓${NC} Found: .env.local"

    # Validate environment variables
    if [ -f ".env.example" ]; then
        echo ""
        echo -e "${YELLOW}Checking required environment variables...${NC}"

        # Extract variable names from .env.example
        while IFS='=' read -r var_name _; do
            # Skip comments and empty lines
            [[ $var_name =~ ^#.*$ ]] && continue
            [[ -z $var_name ]] && continue

            var_name=$(echo "$var_name" | xargs)

            # Check if variable is set in .env.local
            if grep -q "^${var_name}=" .env.local; then
                echo -e "  ${GREEN}✓${NC} $var_name is set"
            else
                echo -e "  ${YELLOW}⊘${NC} $var_name is not set (optional)"
            fi
        done < .env.example
    fi
fi
echo ""

# 4. Build artifacts
echo -e "${BOLD}Build Artifacts${NC}"

# Check for clean build state
if [ -d ".next" ] || [ -d "dist" ]; then
    echo -e "  ${YELLOW}⚠${NC} Build artifacts exist. Consider running: ./dev/dev-clean.sh"
else
    echo -e "  ${GREEN}✓${NC} Clean build state"
fi
echo ""

# 5. Dependencies
echo -e "${BOLD}Dependencies${NC}"

if [ -d "node_modules" ]; then
    echo -e "  ${GREEN}✓${NC} node_modules exists"

    # Check for critical dependencies
    CRITICAL_DEPS=("next" "react" "react-dom")
    for dep in "${CRITICAL_DEPS[@]}"; do
        if [ -d "node_modules/$dep" ]; then
            echo -e "    ${GREEN}✓${NC} $dep installed"
        else
            echo -e "    ${RED}✗${NC} $dep missing"
            ((VALIDATIONS_FAILED++)) || true
        fi
    done
else
    echo -e "  ${YELLOW}⊘${NC} node_modules not found. Run: ./utils/install.sh"
fi
echo ""

# 6. Scripts
echo -e "${BOLD}Scripts${NC}"

# Make scripts executable
SCRIPT_DIRS=("build" "deploy" "tests" "monitoring" "dev" "utils")
for dir in "${SCRIPT_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        SCRIPT_COUNT=$(find "$dir" -type f -name "*.sh" 2>/dev/null | wc -l)
        if [ $SCRIPT_COUNT -gt 0 ]; then
            find "$dir" -type f -name "*.sh" -exec chmod +x {} \; 2>/dev/null
            echo -e "  ${GREEN}✓${NC} $dir/: $SCRIPT_COUNT scripts (executable)"
        fi
    fi
done
echo ""

# Summary
echo -e "${BOLD}╔═══════════════════════════════════════╗${NC}"
echo -e "${BOLD}║         Validation Summary            ║${NC}"
echo -e "${BOLD}╚═══════════════════════════════════════╝${NC}"
echo ""
echo "Validations Passed: $VALIDATIONS_PASSED"
echo "Validations Failed: $VALIDATIONS_FAILED"
echo ""

if [ $VALIDATIONS_FAILED -eq 0 ]; then
    echo -e "${GREEN}All validations passed!${NC}"
    echo "Your project is properly configured."
    exit 0
else
    echo -e "${RED}Some validations failed!${NC}"
    echo "Please fix the issues above."
    exit 1
fi
