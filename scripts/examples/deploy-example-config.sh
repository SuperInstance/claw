# Example Deployment Configuration
# Source this file to set up deployment environment

# =================================================================
# Cloudflare Pages Configuration
# =================================================================

export CLOUDFLARE_ACCOUNT_ID="your_account_id_here"
export CLOUDFLARE_API_TOKEN="your_api_token_here"
export CLOUDFLARE_PROJECT_NAME="spreadsheet-moment"
export PREVIEW_DEPLOYMENTS=true

# =================================================================
# Kubernetes Configuration
# =================================================================

export KUBECONFIG="${KUBECONFIG:-$HOME/.kube/config}"
export NAMESPACE="spreadsheet-moment"
export HELM_RELEASE="spreadsheet-moment"
export HELM_CHART="./deployment/helm/chart"

# Container Registry
export REGISTRY="ghcr.io"
export IMAGE_NAME="spreadsheet-moment"
export IMAGE_TAG="${IMAGE_TAG:-latest}"

# =================================================================
# Database Configuration
# =================================================================

export DB_TYPE="postgresql"  # postgresql, mysql, mongodb, sqlite
export DATABASE_URL="postgresql://user:password@localhost:5432/spreadsheet_moment"

# Backup Configuration
export BACKUP_DIR="./backups"
export RETENTION_DAYS=7

# =================================================================
# Application Configuration
# =================================================================

export NODE_ENV="production"
export PORT=3000
export HOST="0.0.0.0"

# =================================================================
# Monitoring Configuration
# =================================================================

export HEALTH_URL="http://localhost:3000/api/health"
export METRICS_URL="http://localhost:3000/api/metrics"

# Prometheus (optional)
export PROMETHEUS_URL=""

# Datadog (optional)
export DATADOG_API_KEY=""

# =================================================================
# Logging Configuration
# =================================================================

export LOG_LEVEL="info"  # debug, info, warn, error
export LOG_DIR="./logs"

# =================================================================
# Build Configuration
# =================================================================

export BUILD_TYPE="production"
export CLEAN_BUILD=false
export PARALLEL_BUILD=true
export VERBOSE=false

# =================================================================
# Test Configuration
# =================================================================

export COVERAGE=true
export WATCH=false
export HEADLESS=true

# =================================================================
# CI/CD Configuration
# =================================================================

export CI=true
export CI_COMMIT_SHA="${CI_COMMIT_SHA:-$(git rev-parse HEAD)}"
export CI_COMMIT_REF_SLUG="${CI_COMMIT_REF_SLUG:-$(git rev-parse --abbrev-ref HEAD)}"

# =================================================================
# Feature Flags
# =================================================================

export FEATURE_ANALYTICS=true
export FEATURE_CACHE=true
export FEATURE_RATE_LIMITING=true

# =================================================================
# Security Configuration
# =================================================================

export CORS_ORIGIN="https://spreadsheet-moment.pages.dev"
export RATE_LIMIT_MAX=100
export RATE_LIMIT_WINDOW=900000  # 15 minutes

# =================================================================
# Third-Party Services (Optional)
# =================================================================

# Google Analytics
export NEXT_PUBLIC_GA_ID=""

# Sentry (Error tracking)
export SENTRY_DSN=""
export SENTRY_ENVIRONMENT="production"

# Auth providers
export NEXT_PUBLIC_AUTH_GOOGLE_ID=""
export NEXT_PUBLIC_AUTH_GITHUB_ID=""
