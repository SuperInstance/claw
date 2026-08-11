#!/bin/bash
# Spreadsheet Moment - Update Dependencies
# Updates project dependencies safely

set -euo pipefail

# Color codes
readonly GREEN='\033[0;32m'
readonly BLUE='\033[0;34m'
readonly YELLOW='\033[1;33m'
readonly RED='\033[0;31m'
readonly NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}Updating Dependencies${NC}"
echo ""

cd "$PROJECT_ROOT"

# Check for npm-check-updates
if ! command -v ncu &> /dev/null; then
    echo -e "${YELLOW}Installing npm-check-updates...${NC}"
    npm install -g npm-check-updates
fi

# Display current versions
echo -e "${BOLD}[1/4]${NC} Current dependencies:"
npm list --depth=0 2>/dev/null | grep -v "spreadsheet-moment" || true

echo ""
echo -e "${BOLD}[2/4]${NC} Checking for updates..."

# Check for updates
ncu --json > /tmp/ncu-output.json 2>/dev/null || true

# Show outdated packages
OUTDATED=$(npm outdated 2>/dev/null || true)
if [ -n "$OUTDATED" ]; then
    echo "$OUTDATED"
else
    echo -e "${GREEN}All packages are up to date!${NC}"
    exit 0
fi

# Ask for confirmation
echo ""
read -p "Update all dependencies? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Update cancelled."
    exit 0
fi

# Update package.json
echo ""
echo -e "${BOLD}[3/4]${NC} Updating package.json..."
ncu -u

# Install new versions
echo ""
echo -e "${BOLD}[4/4]${NC} Installing updated dependencies..."
npm install

# Run tests to verify
echo ""
echo -e "${BOLD}[Verification]${NC}"
echo -e "${YELLOW}Running tests to verify updates...${NC}"

if npm run test:ci 2>/dev/null; then
    echo -e "${GREEN}✓${NC} All tests passed"
else
    echo -e "${RED}✗${NC} Tests failed! You may need to fix breaking changes."
    echo "Run 'git diff package.json' to see what changed."
    echo "You can revert with: git checkout package.json package-lock.json && npm install"
    exit 1
fi

echo ""
echo -e "${GREEN}Dependencies updated successfully!${NC}"
echo ""
echo "Review the changes:"
echo "  git diff package.json"
