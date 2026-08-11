#!/bin/bash
# Spreadsheet Moment - Database Backup
# Creates database backups

set -euo pipefail

# Color codes
readonly GREEN='\033[0;32m'
readonly BLUE='\033[0;34m'
readonly YELLOW='\033[1;33m'
readonly RED='\033[0;31m'
readonly NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="${PROJECT_ROOT}/backups"
mkdir -p "$BACKUP_DIR"

# Configuration
BACKUP_NAME="${BACKUP_NAME:-spreadsheet-moment-$(date +%Y%m%d_%H%M%S)}"
DB_TYPE="${DB_TYPE:-}"  # postgresql, mysql, mongodb, sqlite
RETENTION_DAYS="${RETENTION_DAYS:-7}"

echo -e "${BLUE}Creating Database Backup${NC}"
echo ""

# Detect database type if not specified
if [ -z "$DB_TYPE" ]; then
    if [ -f ".env.local" ]; then
        source .env.local

        if [[ "${DATABASE_URL:-}" == *"postgresql"* ]] || [[ "${DATABASE_URL:-}" == *"postgres"* ]]; then
            DB_TYPE="postgresql"
        elif [[ "${DATABASE_URL:-}" == *"mysql"* ]]; then
            DB_TYPE="mysql"
        elif [[ "${DATABASE_URL:-}" == *"mongodb"* ]]; then
            DB_TYPE="mongodb"
        elif [ -f "*.db" ] || [ -f "*.sqlite" ]; then
            DB_TYPE="sqlite"
        fi
    fi
fi

if [ -z "$DB_TYPE" ]; then
    echo -e "${RED}Could not detect database type${NC}"
    echo "Set DB_TYPE environment variable (postgresql, mysql, mongodb, sqlite)"
    exit 1
fi

# Create backup based on database type
case "$DB_TYPE" in
    postgresql)
        echo -e "${YELLOW}Creating PostgreSQL backup...${NC}"

        if ! command -v pg_dump &> /dev/null; then
            echo -e "${RED}pg_dump not found!${NC}"
            exit 1
        fi

        # Extract connection details from DATABASE_URL
        DB_HOST=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:]*\):.*/\1/p')
        DB_PORT=$(echo "$DATABASE_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
        DB_NAME=$(echo "$DATABASE_URL" | sed -n 's/.*\/\([^?]*\).*/\1/p')

        BACKUP_FILE="${BACKUP_DIR}/${BACKUP_NAME}.sql.gz"

        pg_dump -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" | gzip > "$BACKUP_FILE"

        if [ $? -eq 0 ]; then
            BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
            echo -e "${GREEN}✓${NC} PostgreSQL backup created ($BACKUP_SIZE)"
        else
            echo -e "${RED}✗${NC} PostgreSQL backup failed"
            exit 1
        fi
        ;;

    mysql)
        echo -e "${YELLOW}Creating MySQL backup...${NC}"

        if ! command -v mysqldump &> /dev/null; then
            echo -e "${RED}mysqldump not found!${NC}"
            exit 1
        fi

        BACKUP_FILE="${BACKUP_DIR}/${BACKUP_NAME}.sql.gz"

        # Parse connection details
        mysqldump --all-databases | gzip > "$BACKUP_FILE"

        if [ $? -eq 0 ]; then
            BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
            echo -e "${GREEN}✓${NC} MySQL backup created ($BACKUP_SIZE)"
        else
            echo -e "${RED}✗${NC} MySQL backup failed"
            exit 1
        fi
        ;;

    mongodb)
        echo -e "${YELLOW}Creating MongoDB backup...${NC}"

        if ! command -v mongodump &> /dev/null; then
            echo -e "${RED}mongodump not found!${NC}"
            exit 1
        fi

        BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"

        mongodump --out="$BACKUP_PATH"

        if [ $? -eq 0 ]; then
            # Create archive
            tar -czf "${BACKUP_PATH}.tar.gz" -C "$BACKUP_PATH" .
            rm -rf "$BACKUP_PATH"

            BACKUP_SIZE=$(du -h "${BACKUP_PATH}.tar.gz" | cut -f1)
            echo -e "${GREEN}✓${NC} MongoDB backup created ($BACKUP_SIZE)"
        else
            echo -e "${RED}✗${NC} MongoDB backup failed"
            exit 1
        fi
        ;;

    sqlite)
        echo -e "${YELLOW}Creating SQLite backup...${NC}"

        # Find SQLite databases
        DB_FILES=$(find "$PROJECT_ROOT" -type f \( -name "*.db" -o -name "*.sqlite" -o -name "*.sqlite3" \) 2>/dev/null)

        if [ -z "$DB_FILES" ]; then
            echo -e "${YELLOW}No SQLite databases found${NC}"
            exit 0
        fi

        while IFS= read -r db_file; do
            DB_NAME=$(basename "$db_file")
            BACKUP_FILE="${BACKUP_DIR}/${BACKUP_NAME}-${DB_NAME}.gz"

            cp "$db_file" "$BACKUP_FILE.temp"
            gzip -f "$BACKUP_FILE.temp"
            mv "${BACKUP_FILE.temp}.gz" "$BACKUP_FILE"

            BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
            echo -e "${GREEN}✓${NC} Backed up $DB_NAME ($BACKUP_SIZE)"
        done <<< "$DB_FILES"
        ;;

    *)
        echo -e "${RED}Unknown database type: $DB_TYPE${NC}"
        exit 1
        ;;
esac

# Cleanup old backups
echo ""
echo -e "${YELLOW}Cleaning up old backups (older than $RETENTION_DAYS days)...${NC}"
find "$BACKUP_DIR" -type f -mtime +$RETENTION_DAYS -delete

# Display backup info
echo ""
echo -e "${BLUE}Backup Information:${NC}"
echo "  Type: $DB_TYPE"
echo "  Location: $BACKUP_DIR"
echo "  Retention: $RETENTION_DAYS days"
echo ""

# List recent backups
echo -e "${BLUE}Recent Backups:${NC}"
ls -lth "$BACKUP_DIR" | head -10

echo ""
echo -e "${GREEN}Backup completed successfully!${NC}"
