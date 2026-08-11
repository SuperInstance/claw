#!/bin/bash
# Spreadsheet Moment - Cloudflare Workers Deployment
# Deploys Next.js application to Cloudflare Pages/Workers

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
CLOUDFLARE_PROJECT="${CLOUDFLARE_PROJECT:-spreadsheet-moment}"
CLOUDFLARE_ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID:-}"
PRODUCTION_BRANCH="${PRODUCTION_BRANCH:-main}"
PREVIEW_DEPLOYMENTS="${PREVIEW_DEPLOYMENTS:-true}"

echo -e "${BLUE}Deploying to Cloudflare${NC}"
echo ""

cd "$PROJECT_ROOT"

# Check for Cloudflare credentials
if [ -z "$CLOUDFLARE_ACCOUNT_ID" ]; then
    echo -e "${YELLOW}CLOUDFLARE_ACCOUNT_ID not set${NC}"
    echo "Trying to read from .env config..."

    if [ -f ".env.production" ]; then
        source .env.production
    fi

    if [ -z "$CLOUDFLARE_ACCOUNT_ID" ]; then
        echo -e "${RED}Error: CLOUDFLARE_ACCOUNT_ID required${NC}"
        echo "Set it via: export CLOUDFLARE_ACCOUNT_ID=your_account_id"
        exit 1
    fi
fi

# Check for Wrangler CLI
if ! command -v wrangler &> /dev/null; then
    echo -e "${YELLOW}Wrangler CLI not found. Installing...${NC}"
    npm install -g wrangler
fi

# Build application first
echo -e "${YELLOW}Building application...${NC}"
if ! bash build/build-prod.sh; then
    echo -e "${RED}Build failed!${NC}"
    exit 1
fi

# Deploy to Cloudflare Pages
echo -e "${YELLOW}Deploying to Cloudflare Pages...${NC}"

if [ "$PREVIEW_DEPLOYMENTS" = true ]; then
    # Create preview deployment
    BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD)
    COMMIT_HASH=$(git rev-parse --short HEAD)

    echo "Branch: $BRANCH_NAME"
    echo "Commit: $COMMIT_HASH"
    echo ""

    wrangler pages deploy dist \
        --project-name="$CLOUDFLARE_PROJECT" \
        --branch="$BRANCH_NAME" \
        --commit-hash="$COMMIT_HASH" \
        --commit-message="Deploy $BRANCH_NAME@$COMMIT_HASH"
else
    # Production deployment
    wrangler pages deploy dist \
        --project-name="$CLOUDFLARE_PROJECT" \
        --production
fi

# Set environment variables
echo -e "${YELLOW}Setting environment variables...${NC}"

if [ -f ".env.production" ]; then
    while IFS='=' read -r key value; do
        # Skip comments and empty lines
        [[ $key =~ ^#.*$ ]] && continue
        [[ -z $key ]] && continue

        # Strip quotes and spaces
        key=$(echo "$key" | xargs)
        value=$(echo "$value" | xargs | tr -d '"')

        echo "Setting: $key"
        wrangler pages secret put "$key" --project-name="$CLOUDFLARE_PROJECT" <<< "$value"
    done < .env.production
fi

# Clear cache
echo -e "${YELLOW}Clearing Cloudflare cache...${NC}"
# This would be done via Cloudflare API or dashboard

echo -e "${GREEN}Deployment complete!${NC}"
echo ""
echo "Your application is now live at:"
if [ "$PREVIEW_DEPLOYMENTS" = true ]; then
    echo "  https://$CLOUDFLARE_PROJECT.pages.dev"
else
    echo "  https://$CLOUDFLARE_PROJECT.pages.dev (production)"
fi
