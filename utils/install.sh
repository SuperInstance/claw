#!/bin/bash
# Spreadsheet Moment - Install Dependencies
# Installs and manages project dependencies

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
INSTALL_TYPE="${INSTALL_TYPE:-production}"  # production, development, all
FROZEN_LOCKFILE="${FROZEN_LOCKFILE:-true}"  # use ci vs install

echo -e "${BLUE}Installing Dependencies${NC}"
echo ""

cd "$PROJECT_ROOT"

# Check npm availability
if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm not found!${NC}"
    echo "Install Node.js from https://nodejs.org/"
    exit 1
fi

# Display install info
echo "Install type: $INSTALL_TYPE"
echo "Frozen lockfile: $FROZEN_LOCKFILE"
echo ""

# Run install based on type
case "$INSTALL_TYPE" in
    production)
        echo -e "${YELLOW}Installing production dependencies...${NC}"
        if [ "$FROZEN_LOCKFILE" = true ]; then
            npm ci --production
        else
            npm install --production
        fi
        ;;

    development)
        echo -e "${YELLOW}Installing development dependencies...${NC}"
        if [ "$FROZEN_LOCKFILE" = true ]; then
            npm ci
        else
            npm install
        fi
        ;;

    all)
        echo -e "${YELLOW}Installing all dependencies...${NC}"
        if [ "$FROZEN_LOCKFILE" = true ]; then
            npm ci
        else
            npm install
        fi
        ;;

    *)
        echo -e "${RED}Unknown install type: $INSTALL_TYPE${NC}"
        echo "Valid types: production, development, all"
        exit 1
        ;;
esac

# Install Playwright browsers if installed
if [ -d "node_modules/@playwright/test" ]; then
    echo ""
    echo -e "${YELLOW}Installing Playwright browsers...${NC}"
    npx playwright install --with-deps
fi

echo ""
echo -e "${GREEN}Dependencies installed successfully!${NC}"
