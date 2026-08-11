#!/bin/bash
# Spreadsheet Moment - Resource Cleanup
# Cleans up temporary files, logs, and old resources

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
DRY_RUN="${DRY_RUN:-false}"
KEEP_LOGS_DAYS="${KEEP_LOGS_DAYS:-30}"
KEEP_BACKUPS_DAYS="${KEEP_BACKUPS_DAYS:-7}"

echo -e "${BLUE}Resource Cleanup${NC}"
echo ""

# Track cleanup stats
TOTAL_SIZE=0
FILES_REMOVED=0

# Function to clean directory
clean_directory() {
    local dir=$1
    local pattern=$2
    local days=$3
    local name=$4

    echo -e "${YELLOW}Cleaning $name...${NC}"

    if [ ! -d "$dir" ]; then
        echo -e "${YELLOW}⊘${NC} Directory not found: $dir"
        return
    fi

    if [ "$DRY_RUN" = true ]; then
        echo "Would clean: $dir (older than $days days)"
        return
    fi

    # Find and remove old files
    while IFS= read -r file; do
        if [ -f "$file" ]; then
            SIZE=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo 0)
            TOTAL_SIZE=$((TOTAL_SIZE + SIZE))
            FILES_REMOVED=$((FILES_REMOVED + 1))
            rm -f "$file"
            echo -e "  Removed: $(basename "$file")"
        fi
    done < <(find "$dir" -type f -name "$pattern" -mtime +$days 2>/dev/null)
}

# 1. Clean log files
echo -e "${BOLD}[1/6]${NC} Cleaning logs..."
clean_directory "$PROJECT_ROOT/logs" "*.log" "$KEEP_LOGS_DAYS" "Log files"

# 2. Clean backup files
echo -e "${BOLD}[2/6]${NC} Cleaning backups..."
clean_directory "$PROJECT_ROOT/backups" "*" "$KEEP_BACKUPS_DAYS" "Backup files"

# 3. Clean build artifacts
echo -e "${BOLD}[3/6]${NC} Cleaning build artifacts..."
BUILD_DIRS=("dist" "build" ".next" "out" ".cache")
for dir in "${BUILD_DIRS[@]}"; do
    if [ -d "$PROJECT_ROOT/$dir" ]; then
        echo -e "${YELLOW}Removing: $dir${NC}"
        if [ "$DRY_RUN" = false ]; then
            SIZE=$(du -sk "$PROJECT_ROOT/$dir" | cut -f1)
            TOTAL_SIZE=$((TOTAL_SIZE + SIZE * 1024))
            rm -rf "$PROJECT_ROOT/$dir"
        fi
    fi
done

# 4. Clean node_modules cache (optional)
echo -e "${BOLD}[4/6]${NC} Cleaning node_modules cache..."
if [ -d "$PROJECT_ROOT/node_modules/.cache" ]; then
    echo -e "${YELLOW}Removing node_modules/.cache${NC}"
    if [ "$DRY_RUN" = false ]; then
        rm -rf "$PROJECT_ROOT/node_modules/.cache"
    fi
fi

# 5. Clean test coverage reports
echo -e "${BOLD}[5/6]${NC} Cleaning test coverage..."
if [ -d "$PROJECT_ROOT/coverage" ]; then
    echo -e "${YELLOW}Removing coverage directory${NC}"
    if [ "$DRY_RUN" = false ]; then
        rm -rf "$PROJECT_ROOT/coverage"
    fi
fi

# 6. Clean temporary files
echo -e "${BOLD}[6/6]${NC} Cleaning temporary files..."
TEMP_PATTERNS=("*.tmp" "*.temp" "*.swp" "*~" ".DS_Store" "Thumbs.db")
for pattern in "${TEMP_PATTERNS[@]}"; do
    while IFS= read -r file; do
        if [ -f "$file" ]; then
            echo -e "  Removing: $(basename "$file")"
            if [ "$DRY_RUN" = false ]; then
                rm -f "$file"
            fi
        fi
    done < <(find "$PROJECT_ROOT" -type f -name "$pattern" 2>/dev/null)
done

# Display summary
echo ""
echo -e "${BOLD}╔═══════════════════════════════════════╗${NC}"
echo -e "${BOLD}║         Cleanup Summary              ║${NC}"
echo -e "${BOLD}╚═══════════════════════════════════════╝${NC}"
echo ""
echo "Files removed: $FILES_REMOVED"
echo "Space freed: $(numfmt --to=iec $TOTAL_SIZE 2>/dev/null || echo $((TOTAL_SIZE / 1024 / 1024))M)"

if [ "$DRY_RUN" = true ]; then
    echo ""
    echo -e "${YELLOW}This was a dry run. No files were actually removed.${NC}"
    echo "Run with DRY_RUN=false to perform actual cleanup."
else
    echo ""
    echo -e "${GREEN}Cleanup completed!${NC}"
fi
