#!/bin/bash
# Spreadsheet Moment - Clean Build Artifacts
# Removes build artifacts and temporary files

set -euo pipefail

# Color codes
readonly GREEN='\033[0;32m'
readonly BLUE='\033[0;34m'
readonly YELLOW='\033[1;33m'
readonly RED='\033[0;31m'
readonly NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}Cleaning Build Artifacts${NC}"
echo ""

cd "$PROJECT_ROOT"

# Directories to clean
CLEAN_DIRS=(
    "node_modules/.cache"
    ".next"
    "dist"
    "build"
    "out"
    ".turbo"
    "coverage"
    ".nyc_output"
)

echo -e "${YELLOW}Removing build artifacts...${NC}"
for dir in "${CLEAN_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo -e "  ${RED}✗${NC} Removing: $dir"
        rm -rf "$dir"
    fi
done

# Temporary files
TEMP_PATTERNS=(
    "*.tmp"
    "*.temp"
    "*.log"
    ".DS_Store"
    "Thumbs.db"
)

echo ""
echo -e "${YELLOW}Removing temporary files...${NC}"
for pattern in "${TEMP_PATTERNS[@]}"; do
    find . -type f -name "$pattern" -not -path "./node_modules/*" -delete 2>/dev/null && echo -e "  ${GREEN}✓${NC} Removed: $pattern"
done

# Clean tsconfig.tsbuildinfo
echo ""
echo -e "${YELLOW}Cleaning TypeScript build info...${NC}"
find . -name "tsconfig.tsbuildinfo" -not -path "./node_modules/*" -delete 2>/dev/null && echo -e "  ${GREEN}✓${NC} Removed tsconfig files"

echo ""
echo -e "${GREEN}Clean completed!${NC}"
