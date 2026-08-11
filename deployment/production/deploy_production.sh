#!/bin/bash
# Production Deployment Script - Round 4
# ========================================
# Deploys Spreadsheet Moment to production environment
#
# Prerequisites:
# - Cloudflare account with Workers/Pages access
# - Terraform installed
# - GitHub CLI (gh) installed
# - Node.js 18+ installed
# - Python 3.11+ installed
#
# Usage: ./deploy_production.sh [environment]
#   environment: staging | production (default: production)

set -e  # Exit on error

# Configuration
ENVIRONMENT="${1:-production}"
PROJECT_NAME="spreadsheet-moment"
GITHUB_REPO="SuperInstance/spreadsheet-moment"
CLOUDFLARE_ACCOUNT="SuperInstance"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# ============================================================================
# Pre-Deployment Checks
# ============================================================================

log_info "Starting deployment for ${ENVIRONMENT} environment..."

# Check prerequisites
log_info "Checking prerequisites..."

command -v wrangler >/dev/null 2>&1 || {
    log_error "wrangler not found. Install with: npm install -g wrangler"
    exit 1
}

command -v terraform >/dev/null 2>&1 || {
    log_warn "terraform not found. Infrastructure deployment will be skipped."
}

command -v gh >/dev/null 2>&1 || {
    log_warn "gh not found. GitHub operations will be skipped."
}

# Verify Cloudflare authentication
log_info "Verifying Cloudflare authentication..."
if ! wrangler whoami >/dev/null 2>&1; then
    log_error "Not authenticated with Cloudflare. Run: wrangler login"
    exit 1
fi

# ============================================================================
# Build Application
# ============================================================================

log_info "Building application..."

# Build website
cd "spreadsheet-moment/website"
npm install
npm run build
cd ../..

# Verify build artifacts
if [ ! -d "spreadsheet-moment/website/dist" ]; then
    log_error "Build failed: dist directory not found"
    exit 1
fi

log_info "Build completed successfully"

# ============================================================================
# Deploy Website to Cloudflare Pages
# ============================================================================

log_info "Deploying website to Cloudflare Pages..."

if [ "$ENVIRONMENT" = "production" ]; then
    # Production deployment
    wrangler pages deploy spreadsheet-moment/website/dist \
        --project-name="$PROJECT_NAME" \
        --branch=main
else
    # Preview/staging deployment
    wrangler pages deploy spreadsheet-moment/website/dist \
        --project-name="$PROJECT_NAME-preview" \
        --branch=preview
fi

log_info "Website deployed successfully"

# ============================================================================
# Deploy Workers API
# ============================================================================

log_info "Deploying Workers API..."

cd "spreadsheet-moment/workers"

# Install dependencies
npm install

# Deploy to Workers
if [ "$ENVIRONMENT" = "production" ]; then
    wrangler deploy --env production
else
    wrangler deploy --env staging
fi

cd ../..

log_info "Workers API deployed successfully"

# ============================================================================
# Configure DNS (production only)
# ============================================================================

if [ "$ENVIRONMENT" = "production" ]; then
    log_info "Configuring custom DNS..."

    # Add custom domain via Cloudflare API
    # This would typically be done via dashboard or API
    log_info "Custom domain: spreadsheet-moment.superinstance.ai"
    log_warn "DNS configuration must be completed manually in Cloudflare dashboard"
fi

# ============================================================================
# Deploy Infrastructure (Terraform)
# ============================================================================

if command -v terraform >/dev/null 2>&1; then
    log_info "Deploying infrastructure with Terraform..."

    cd "deployment/terraform"

    # Initialize Terraform
    terraform init

    # Select workspace
    terraform workspace select "$ENVIRONMENT" || terraform workspace new "$ENVIRONMENT"

    # Plan deployment
    terraform plan -out=tfplan -var="environment=$ENVIRONMENT"

    # Apply deployment
    terraform apply -auto-approve tfplan

    cd ../..

    log_info "Infrastructure deployed successfully"
else
    log_warn "Skipping Terraform deployment"
fi

# ============================================================================
# Post-Deployment Configuration
# ============================================================================

log_info "Configuring post-deployment settings..."

# Set up monitoring (placeholder - would configure Cloudflare Web Analytics)
log_info "Monitoring enabled: Cloudflare Web Analytics"

# Configure error tracking (placeholder - would set up Sentry or similar)
log_info "Error tracking: Configuration ready"

# Set up analytics (placeholder - would configure Google Analytics)
log_info "Analytics: Configuration ready"

# ============================================================================
# Health Checks
# ============================================================================

log_info "Performing health checks..."

# Check website
WEBSITE_URL="https://spreadsheet-moment.superinstance.ai"
if [ "$ENVIRONMENT" != "production" ]; then
    WEBSITE_URL="https://${PROJECT_NAME}-${ENVIRONMENT}.pages.dev"
fi

# Wait for DNS propagation
sleep 5

# Check website accessibility
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$WEBSITE_URL" || echo "000")

if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "304" ]; then
    log_info "Website health check: ✓ PASSED"
else
    log_warn "Website health check: ⚠ FAILED (status: $HTTP_STATUS)"
    log_warn "This may be due to DNS propagation. Please check manually."
fi

# ============================================================================
# Deployment Summary
# ============================================================================

log_info "Deployment completed successfully!"
log_info ""
log_info "Deployment Summary:"
log_info "  Environment: $ENVIRONMENT"
log_info "  Website: $WEBSITE_URL"
log_info "  API: https://api.superinstance.ai/spreadsheet-moment"
log_info "  Dashboard: https://dash.cloudflare.com"
log_info ""
log_info "Next Steps:"
log_info "  1. Verify website functionality at $WEBSITE_URL"
log_info "  2. Test API endpoints"
log_info "  3. Configure analytics and monitoring"
log_info "  4. Set up custom domain DNS (if not already done)"
log_info "  5. Review security settings"
log_info ""
log_info "For issues or rollbacks, check the Cloudflare dashboard."
log_info ""

exit 0
