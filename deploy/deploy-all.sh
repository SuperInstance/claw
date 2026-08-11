#!/bin/bash
# Spreadsheet Moment - Deploy to All Targets
# Deploys to all configured platforms

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

echo -e "${BOLD}╔═══════════════════════════════════════╗${NC}"
echo -e "${BOLD}║  Spreadsheet Moment - Deploy All    ║${NC}"
echo -e "${BOLD}╚═══════════════════════════════════════╝${NC}"
echo ""

# Track deployment status
declare -A DEPLOYMENT_STATUS

# Function to deploy to target
deploy_target() {
    local name=$1
    local script=$2
    local optional=${3:-false}

    echo -e "${BOLD}[${name}]${NC}"
    if [ -f "$script" ]; then
        echo -e "${YELLOW}Deploying to ${name}...${NC}"
        if bash "$script"; then
            DEPLOYMENT_STATUS[$name]="SUCCESS"
            echo -e "${GREEN}✓${NC} ${name} deployment successful"
        else
            DEPLOYMENT_STATUS[$name]="FAILED"
            if [ "$optional" = false ]; then
                echo -e "${RED}✗${NC} ${name} deployment failed (aborting)"
                return 1
            else
                echo -e "${YELLOW}✗${NC} ${name} deployment failed (continuing)"
            fi
        fi
    else
        DEPLOYMENT_STATUS[$name]="SKIPPED"
        echo -e "${YELLOW}⊘${NC} ${name} not configured"
    fi
    echo ""
}

# Check if we should deploy
read -p "This will deploy to all configured platforms. Continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 0
fi

# Deploy to Cloudflare Pages
deploy_target "Cloudflare Pages" "${SCRIPT_DIR}/deploy-cloudflare.sh" true

# Deploy to Kubernetes
deploy_target "Kubernetes" "${SCRIPT_DIR}/deploy-kubernetes.sh" true

# Deploy desktop releases
deploy_target "Desktop Applications" "${SCRIPT_DIR}/deploy-desktop.sh" true

# Summary
echo -e "${BOLD}╔═══════════════════════════════════════╗${NC}"
echo -e "${BOLD}║       Deployment Summary              ║${NC}"
echo -e "${BOLD}╚═══════════════════════════════════════╝${NC}"
echo ""

for target in "${!DEPLOYMENT_STATUS[@]}"; do
    status="${DEPLOYMENT_STATUS[$target]}"
    case "$status" in
        SUCCESS)
            echo -e "${GREEN}✓${NC} $target: $status"
            ;;
        FAILED)
            echo -e "${RED}✗${NC} $target: $status"
            ;;
        SKIPPED)
            echo -e "${YELLOW}⊘${NC} $target: $status"
            ;;
    esac
done

echo ""

# Check if any required deployments failed
if [[ "${DEPLOYMENT_STATUS[@]}" =~ "FAILED" ]]; then
    echo -e "${RED}Some deployments failed!${NC}"
    exit 1
else
    echo -e "${GREEN}All deployments completed!${NC}"
fi
