#!/bin/bash
# Spreadsheet Moment - Metrics Collection
# Collects application metrics

set -euo pipefail

# Color codes
readonly GREEN='\033[0;32m'
readonly BLUE='\033[0;34m'
readonly YELLOW='\033[1;33m'
readonly NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
METRICS_DIR="${PROJECT_ROOT}/metrics"
mkdir -p "$METRICS_DIR"

# Configuration
METRICS_FILE="${METRICS_DIR}/metrics-$(date +%Y%m%d_%H%M%S).json"
PROMETHEUS_URL="${PROMETHEUS_URL:-}"
DATADOG_API_KEY="${DATADOG_API_KEY:-}"

echo -e "${BLUE}Collecting Metrics${NC}"
echo ""

# Initialize metrics object
METRICS='{"timestamp":"'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'","metrics":{}'

# 1. System metrics
echo -e "${YELLOW}[1/5] Collecting system metrics...${NC}"
if command -v free &> /dev/null; then
    MEMORY_INFO=$(free -b | awk '/^Mem:/ {print "total="$2";used="$3";available="$7}')
    METRICS=$(echo "$METRICS" | jq --arg mem "$MEMORY_INFO" '.metrics.memory = $mem')
fi

if command -v uptime &> /dev/null; then
    UPTIME=$(uptime -p 2>/dev/null || uptime)
    METRICS=$(echo "$METRICS" | jq --arg up "$UPTIME" '.metrics.uptime = $up')
fi

# 2. Application metrics
echo -e "${YELLOW}[2/5] Collecting application metrics...${NC}"
APP_METRICS_URL="${APP_METRICS_URL:-http://localhost:3000/api/metrics}"

if curl -s --max-time 5 "$APP_METRICS_URL" > /tmp/app_metrics.json 2>/dev/null; then
    APP_METRICS=$(cat /tmp/app_metrics.json)
    METRICS=$(echo "$METRICS" | jq --argjson app "$APP_METRICS" '.metrics.application = $app')
    echo -e "${GREEN}✓${NC} Application metrics collected"
else
    echo -e "${YELLOW}⊘${NC} Application metrics unavailable"
fi

# 3. Docker metrics (if running in Docker)
echo -e "${YELLOW}[3/5] Collecting Docker metrics...${NC}"
if command -v docker &> /dev/null; then
    CONTAINER_COUNT=$(docker ps -q | wc -l)
    METRICS=$(echo "$METRICS" | jq --argjson count "$CONTAINER_COUNT" '.metrics.docker.containers = $count')
    echo -e "${GREEN}✓${NC} Docker metrics collected ($CONTAINER_COUNT containers)"
else
    echo -e "${YELLOW}⊘${NC} Docker not available"
fi

# 4. Build/deployment metrics
echo -e "${YELLOW}[4/5] Collecting build metrics...${NC}"
if [ -f "$PROJECT_ROOT/dist/artifacts/build-info.json" ]; then
    BUILD_INFO=$(cat "$PROJECT_ROOT/dist/artifacts/build-info.json")
    METRICS=$(echo "$METRICS" | jq --argjson build "$BUILD_INFO" '.metrics.build = $build')
    echo -e "${GREEN}✓${NC} Build metrics collected"
else
    echo -e "${YELLOW}⊘${NC} Build info not found"
fi

# 5. Git metrics
echo -e "${YELLOW}[5/5] Collecting Git metrics...${NC}"
if [ -d "$PROJECT_ROOT/.git" ]; then
    cd "$PROJECT_ROOT"
    GIT_COMMITS_TODAY=$(git log --since="today" --oneline | wc -l)
    GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    GIT_COMMIT=$(git rev-parse --short HEAD)

    METRICS=$(echo "$METRICS" | jq --argjson commits "$GIT_COMMITS_TODAY" --arg branch "$GIT_BRANCH" --arg commit "$GIT_COMMIT" \
        '.metrics.git = {commits_today: $commits, branch: $branch, commit: $commit}')
    echo -e "${GREEN}✓${NC} Git metrics collected"
fi

# Save metrics
echo "$METRICS" | jq '.' > "$METRICS_FILE"

# Display summary
echo ""
echo -e "${BLUE}Metrics Summary:${NC}"
echo "$METRICS" | jq -r '.metrics | to_entries[] | "  \(.key): \(.value)"'

echo ""
echo -e "${GREEN}Metrics saved to: $METRICS_FILE${NC}"

# Send to external services if configured
if [ -n "$PROMETHEUS_URL" ]; then
    echo -e "${YELLOW}Sending metrics to Prometheus...${NC}"
    # Implementation depends on Prometheus setup
fi

if [ -n "$DATADOG_API_KEY" ]; then
    echo -e "${YELLOW}Sending metrics to Datadog...${NC}"
    # Implementation depends on Datadog setup
fi

exit 0
