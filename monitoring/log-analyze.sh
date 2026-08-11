#!/bin/bash
# Spreadsheet Moment - Log Analysis
# Analyzes application logs for issues

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
LOG_DIR="${PROJECT_ROOT}/logs"

# Configuration
ANALYSIS_REPORT="${PROJECT_ROOT}/reports/log-analysis-$(date +%Y%m%d_%H%M%S).txt"
LOG_PATTERNS="${LOG_PATTERNS:-*.log}"
TIME_RANGE="${TIME_RANGE:-24h}"  # 24h, 7d, 30d

mkdir -p "$(dirname "$ANALYSIS_REPORT")"

echo -e "${BLUE}Analyzing Logs${NC}"
echo ""

# Header
{
    echo "Spreadsheet Moment - Log Analysis Report"
    echo "Generated: $(date)"
    echo "Time Range: $TIME_RANGE"
    echo "==========================================="
    echo ""
} | tee "$ANALYSIS_REPORT"

# Find log files
if [ ! -d "$LOG_DIR" ]; then
    echo -e "${YELLOW}Log directory not found: $LOG_DIR${NC}"
    exit 0
fi

LOG_FILES=$(find "$LOG_DIR" -type f -name "$LOG_PATTERNS" -mtime -1 2>/dev/null)

if [ -z "$LOG_FILES" ]; then
    echo -e "${YELLOW}No log files found for analysis${NC}"
    exit 0
fi

echo -e "${YELLOW}Analyzing $(echo "$LOG_FILES" | wc -l) log file(s)...${NC}"
echo ""

# 1. Error analysis
echo -e "${BOLD}[1/6]${NC} Analyzing errors..."
{
    echo "## Error Analysis"
    echo "-----------------"
} | tee -a "$ANALYSIS_REPORT"

ERROR_COUNT=0
while IFS= read -r log_file; do
    ERRORS=$(grep -i "error\|exception\|fatal" "$log_file" 2>/dev/null | wc -l)
    if [ $ERRORS -gt 0 ]; then
        echo "  $(basename "$log_file"): $ERRORS errors" | tee -a "$ANALYSIS_REPORT"
        ERROR_COUNT=$((ERROR_COUNT + ERRORS))
    fi
done <<< "$LOG_FILES"

if [ $ERROR_COUNT -eq 0 ]; then
    echo -e "${GREEN}✓${NC} No errors found"
    echo "  No errors found" | tee -a "$ANALYSIS_REPORT"
else
    echo -e "${RED}✗${NC} Found $ERRORS error(s)"
fi
echo "" | tee -a "$ANALYSIS_REPORT"

# 2. Warning analysis
echo -e "${BOLD}[2/6]${NC} Analyzing warnings..."
{
    echo "## Warning Analysis"
    echo "-------------------"
} | tee -a "$ANALYSIS_REPORT"

WARNING_COUNT=0
while IFS= read -r log_file; do
    WARNINGS=$(grep -i "warning\|warn" "$log_file" 2>/dev/null | wc -l)
    if [ $WARNINGS -gt 0 ]; then
        echo "  $(basename "$log_file"): $WARNINGS warnings" | tee -a "$ANALYSIS_REPORT"
        WARNING_COUNT=$((WARNING_COUNT + WARNINGS))
    fi
done <<< "$LOG_FILES"

if [ $WARNING_COUNT -eq 0 ]; then
    echo -e "${GREEN}✓${NC} No warnings found"
    echo "  No warnings found" | tee -a "$ANALYSIS_REPORT"
else
    echo -e "${YELLOW}⚠${NC} Found $WARNING_COUNT warning(s)"
fi
echo "" | tee -a "$ANALYSIS_REPORT"

# 3. HTTP error codes
echo -e "${BOLD}[3/6]${NC} Analyzing HTTP status codes..."
{
    echo "## HTTP Status Codes"
    echo "-------------------"
} | tee -a "$ANALYSIS_REPORT"

while IFS= read -r log_file; do
    # 4xx errors
    HTTP_4XX=$(grep -o "HTTP [45][0-9][0-9]" "$log_file" 2>/dev/null | grep "HTTP 4" | wc -l)
    # 5xx errors
    HTTP_5XX=$(grep -o "HTTP [45][0-9][0-9]" "$log_file" 2>/dev/null | grep "HTTP 5" | wc -l)

    if [ $HTTP_4XX -gt 0 ] || [ $HTTP_5XX -gt 0 ]; then
        echo "  $(basename "$log_file"):" | tee -a "$ANALYSIS_REPORT"
        echo "    4xx errors: $HTTP_4XX" | tee -a "$ANALYSIS_REPORT"
        echo "    5xx errors: $HTTP_5XX" | tee -a "$ANALYSIS_REPORT"
    fi
done <<< "$LOG_FILES"
echo "" | tee -a "$ANALYSIS_REPORT"

# 4. Recent errors (last 10)
echo -e "${BOLD}[4/6]${NC} Finding recent errors..."
{
    echo "## Recent Errors (Last 10)"
    echo "-------------------------"
} | tee -a "$ANALYSIS_REPORT"

while IFS= read -r log_file; do
    RECENT_ERRORS=$(grep -i "error\|exception\|fatal" "$log_file" 2>/dev/null | tail -10)
    if [ -n "$RECENT_ERRORS" ]; then
        echo "From: $(basename "$log_file")" | tee -a "$ANALYSIS_REPORT"
        echo "$RECENT_ERRORS" | tee -a "$ANALYSIS_REPORT"
        echo "" | tee -a "$ANALYSIS_REPORT"
    fi
done <<< "$LOG_FILES"

# 5. Performance issues
echo -e "${BOLD}[5/6]${NC} Analyzing performance..."
{
    echo "## Performance Issues"
    echo "--------------------"
} | tee -a "$ANALYSIS_REPORT"

# Slow requests (> 3s)
SLOW_REQUESTS=$(grep -i "took\|duration\|latency" $LOG_FILES 2>/dev/null | grep -E "[3-9][0-9]{3,}ms|took [3-9]\.[0-9]s" | wc -l)
if [ $SLOW_REQUESTS -gt 0 ]; then
    echo "  Slow requests detected: $SLOW_REQUESTS" | tee -a "$ANALYSIS_REPORT"
    echo -e "${YELLOW}⚠${NC} Found $SLOW_REQUESTS slow request(s)"
else
    echo "  No performance issues detected" | tee -a "$ANALYSIS_REPORT"
    echo -e "${GREEN}✓${NC} No performance issues"
fi
echo "" | tee -a "$ANALYSIS_REPORT"

# 6. Log statistics
echo -e "${BOLD}[6/6]${NC} Log statistics..."
{
    echo "## Log Statistics"
    echo "----------------"
} | tee -a "$ANALYSIS_REPORT"

TOTAL_LINES=0
TOTAL_SIZE=0
while IFS= read -r log_file; do
    LINES=$(wc -l < "$log_file" 2>/dev/null || echo 0)
    SIZE=$(stat -f%z "$log_file" 2>/dev/null || stat -c%s "$log_file" 2>/dev/null || echo 0)
    TOTAL_LINES=$((TOTAL_LINES + LINES))
    TOTAL_SIZE=$((TOTAL_SIZE + SIZE))
    echo "  $(basename "$log_file"): $LINES lines, $(numfmt --to=iec $SIZE 2>/dev/null || echo $((SIZE/1024))K)" | tee -a "$ANALYSIS_REPORT"
done <<< "$LOG_FILES"

echo "" | tee -a "$ANALYSIS_REPORT"
echo "  Total: $TOTAL_LINES lines, $(numfmt --to=iec $TOTAL_SIZE 2>/dev/null || echo $((TOTAL_SIZE/1024/1024))M)" | tee -a "$ANALYSIS_REPORT"

# Summary
echo ""
echo -e "${BOLD}╔═══════════════════════════════════════╗${NC}"
echo -e "${BOLD}║         Analysis Summary             ║${NC}"
echo -e "${BOLD}╚═══════════════════════════════════════╝${NC}"
echo ""
echo "Errors: $ERROR_COUNT"
echo "Warnings: $WARNING_COUNT"
echo "Slow Requests: $SLOW_REQUESTS"
echo ""
echo "Full report: $ANALYSIS_REPORT"

# Exit with error code if issues found
if [ $ERROR_COUNT -gt 0 ]; then
    exit 1
else
    echo -e "${GREEN}Log analysis complete!${NC}"
    exit 0
fi
