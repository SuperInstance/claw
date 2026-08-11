#!/bin/bash
# Spreadsheet Moment - Rollback Deployment
# Rolls back to previous deployment

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
TARGET="${1:-cloudflare}"
VERSION="${2:-}"

echo -e "${BLUE}Rolling Back Deployment${NC}"
echo ""

usage() {
    echo "Usage: $0 <target> [version]"
    echo ""
    echo "Targets:"
    echo "  cloudflare    Rollback Cloudflare Pages deployment"
    echo "  kubernetes    Rollback Kubernetes deployment"
    echo ""
    echo "Examples:"
    echo "  $0 cloudflare              # Rollback Cloudflare to previous version"
    echo "  $0 kubernetes v1.2.3       # Rollback Kubernetes to specific version"
    exit 1
}

# Validate target
if [ -z "$TARGET" ]; then
    usage
fi

case "$TARGET" in
    cloudflare)
        echo -e "${YELLOW}Rolling back Cloudflare Pages...${NC}"

        if ! command -v wrangler &> /dev/null; then
            echo -e "${RED}Wrangler CLI not found!${NC}"
            exit 1
        fi

        # List recent deployments
        echo "Recent deployments:"
        wrangler pages deployment list --project-name=spreadsheet-moment

        echo ""
        if [ -z "$VERSION" ]; then
            read -p "Enter deployment ID to rollback to: " DEPLOY_ID
            VERSION="$DEPLOY_ID"
        fi

        # Rollback to specific deployment
        wrangler pages deployment rollback --project-name=spreadsheet-moment "$VERSION"

        echo -e "${GREEN}Cloudflare rollback complete!${NC}"
        ;;

    kubernetes)
        echo -e "${YELLOW}Rolling back Kubernetes deployment...${NC}"

        if ! command -v kubectl &> /dev/null; then
            echo -e "${RED}kubectl not found!${NC}"
            exit 1
        fi

        NAMESPACE="${NAMESPACE:-spreadsheet-moment}"
        DEPLOYMENT="${DEPLOYMENT:-spreadsheet-moment}"

        # Check if version specified
        if [ -n "$VERSION" ]; then
            # Rollback to specific version
            kubectl rollout undo deployment/"$DEPLOYMENT" -n "$NAMESPACE" --to-revision="$VERSION"
        else
            # Rollback to previous version
            kubectl rollout undo deployment/"$DEPLOYMENT" -n "$NAMESPACE"
        fi

        # Wait for rollout
        kubectl rollout status deployment/"$DEPLOYMENT" -n "$NAMESPACE"

        echo -e "${GREEN}Kubernetes rollback complete!${NC}"
        ;;

    *)
        echo -e "${RED}Unknown target: $TARGET${NC}"
        usage
        ;;
esac

echo ""
echo -e "${GREEN}Rollback successful!${NC}"
