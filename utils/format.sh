#!/bin/bash
# Spreadsheet Moment - Code Formatting
# Formats code with Prettier and other formatters

set -euo pipefail

# Color codes
readonly GREEN='\033[0;32m'
readonly BLUE='\033[0;34m'
readonly YELLOW='\033[1;33m'
readonly NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Configuration
CHECK="${CHECK:-false}"  # check instead of format
STAGED="${STAGED:-false}"

echo -e "${BLUE}Formatting Code${NC}"
echo ""

cd "$PROJECT_ROOT"

FILES_COUNT=0

# Prettier
if grep -q '"prettier"' package.json; then
    echo -e "${YELLOW}Running Prettier...${NC}"

    if [ "$CHECK" = true ]; then
        # Check if files are formatted
        if npx prettier --check '**/*.{js,jsx,ts,tsx,json,css,scss,md,yml,yaml}' 2>/dev/null; then
            echo -e "${GREEN}✓${NC} All files are formatted"
        else
            echo -e "${YELLOW}⚠${NC} Some files need formatting"
            echo "Run without CHECK=true to format them"
            exit 1
        fi
    else
        # Format files
        if [ "$STAGED" = true ]; then
            # Format staged files only
            FILES=$(git diff --name-only --cached '*.js' '*.jsx' '*.ts' '*.tsx' '*.json' '*.css' '*.scss' '*.md' '*.yml' '*.yaml' 2>/dev/null)
            if [ -n "$FILES" ]; then
                echo "$FILES" | xargs npx prettier --write
                FILES_COUNT=$(echo "$FILES" | wc -l)
            fi
        else
            # Format all files
            npx prettier --write '**/*.{js,jsx,ts,tsx,json,css,scss,md,yml,yaml}'
            FILES_COUNT=$(find . -type f \( -name '*.js' -o -name '*.jsx' -o -name '*.ts' -o -name '*.tsx' -o -name '*.json' -o -name '*.css' -o -name '*.scss' -o -name '*.md' -o -name '*.yml' -o -name '*.yaml' \) ! -path '*/node_modules/*' ! -path '*/.next/*' | wc -l)
        fi

        echo -e "${GREEN}✓${NC} Formatted $FILES_COUNT file(s)"
    fi
fi

# ESLint fix
if grep -q '"eslint"' package.json && [ "$CHECK" = false ]; then
    echo -e "${YELLOW}Running ESLint fix...${NC}"
    npx eslint --fix '**/*.{js,jsx,ts,tsx}' 2>/dev/null || true
    echo -e "${GREEN}✓${NC} ESLint fixes applied"
fi

# Stylelint fix
if grep -q '"stylelint"' package.json && [ "$CHECK" = false ]; then
    echo -e "${YELLOW}Running Stylelint fix...${NC}"
    npx stylelint --fix '**/*.{css,scss}' 2>/dev/null || true
    echo -e "${GREEN}✓${NC} Stylelint fixes applied"
fi

echo ""
if [ "$CHECK" = false ]; then
    echo -e "${GREEN}Code formatted successfully!${NC}"

    # Show what changed
    if ! git diff --quiet; then
        echo ""
        echo "Files changed:"
        git diff --name-only
    fi
else
    echo -e "${GREEN}Code format check complete!${NC}"
fi
