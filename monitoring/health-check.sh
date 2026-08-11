#!/bin/bash
# Spreadsheet Moment - Health Check
# Monitors application health endpoints

set -euo pipefail

# Color codes
readonly GREEN='\033[0;32m'
readonly BLUE='\033[0;34m'
readonly YELLOW='\033[1;33m'
readonly RED='\033[0;31m'
readonly NC='\033[0m'

# Configuration
HEALTH_URL="${HEALTH_URL:-http://localhost:3000/api/health}"
TIMEOUT="${TIMEOUT:-10}"
RETRIES="${RETRIES:-3}"
RETRY_DELAY="${RETRY_DELAY:-2}"

echo -e "${BLUE}Health Check${NC}"
echo "Target: $HEALTH_URL"
echo ""

# Function to check health endpoint
check_health() {
    local attempt=$1

    echo -e "${YELLOW}Attempt $attempt of $RETRIES...${NC}"

    if command -v curl &> /dev/null; then
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time "$TIMEOUT" "$HEALTH_URL" 2>/dev/null || echo "000")

        if [ "$HTTP_CODE" = "200" ]; then
            # Get full health response
            RESPONSE=$(curl -s --max-time "$TIMEOUT" "$HEALTH_URL" 2>/dev/null || echo "{}")

            echo -e "${GREEN}✓${NC} Health check passed (HTTP $HTTP_CODE)"
            echo ""
            echo "Response:"
            echo "$RESPONSE" | jq -r '.' 2>/dev/null || echo "$RESPONSE"
            return 0
        else
            echo -e "${RED}✗${NC} Health check failed (HTTP $HTTP_CODE)"
            return 1
        fi
    else
        echo -e "${RED}✗${NC} curl not found"
        return 1
    fi
}

# Retry logic
for ((i=1; i<=RETRIES; i++)); do
    if check_health "$i"; then
        echo ""
        echo -e "${GREEN}Application is healthy!${NC}"
        exit 0
    fi

    if [ $i -lt $RETRIES ]; then
        echo -e "${YELLOW}Retrying in ${RETRY_DELAY}s...${NC}"
        sleep "$RETRY_DELAY"
    fi
done

echo ""
echo -e "${RED}Health check failed after $RETRIES attempts${NC}"
exit 1
