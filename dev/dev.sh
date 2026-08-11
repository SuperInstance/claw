#!/bin/bash
# Spreadsheet Moment - Development Server
# Starts development server with hot reload

set -euo pipefail

# Color codes
readonly GREEN='\033[0;32m'
readonly BLUE='\033[0;34m'
readonly YELLOW='\033[1;33m'
readonly NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Configuration
PORT="${PORT:-3000}"
HOST="${HOST:-localhost}"

echo -e "${BLUE}Starting Development Server${NC}"
echo ""

cd "$PROJECT_ROOT"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Dependencies not found. Installing...${NC}"
    npm install
fi

# Display server info
echo -e "${GREEN}Development server will be available at:${NC}"
echo -e "  ${BLUE}http://${HOST}:${PORT}${NC}"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start development server
export NODE_ENV=development
npm run dev -- --port "$PORT" --hostname "$HOST"
