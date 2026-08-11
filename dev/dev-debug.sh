#!/bin/bash
# Spreadsheet Moment - Debug Mode
# Starts application with debugging enabled

set -euo pipefail

# Color codes
readonly GREEN='\033[0;32m'
readonly BLUE='\033[0;34m'
readonly YELLOW='\033[1;33m'
readonly NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Configuration
DEBUG_PORT="${DEBUG_PORT:-9229}"
APP_PORT="${APP_PORT:-3000}"

echo -e "${BLUE}Starting Debug Mode${NC}"
echo ""

cd "$PROJECT_ROOT"

# Display debug info
echo -e "${GREEN}Debugging enabled:${NC}"
echo -e "  Inspector: ${BLUE}chrome://inspect${NC}"
echo -e "  App URL: ${BLUE}http://localhost:${APP_PORT}${NC}"
echo -e "  Debug Port: ${BLUE}${DEBUG_PORT}${NC}"
echo ""
echo "Attach your debugger to localhost:${DEBUG_PORT}"
echo ""

# Start with debugging
export NODE_ENV=development
export NODE_OPTIONS="--inspect=0.0.0.0:${DEBUG_PORT}"
npm run dev
