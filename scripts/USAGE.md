# Script Usage Examples

Practical examples for using Spreadsheet Moment automation scripts.

## Development Workflow

### Initial Setup

```bash
# First time setup
./dev/dev-setup.sh

# This will:
# - Check system requirements
# - Install dependencies
# - Create environment files
# - Setup git hooks
# - Create necessary directories
```

### Daily Development

```bash
# Start development server
./dev/dev.sh
# Opens at http://localhost:3000

# Run tests in watch mode (in separate terminal)
./dev/dev-watch.sh

# Format code before commit
./utils/format.sh

# Run linters
./utils/lint.sh
```

### Debugging

```bash
# Start with debug mode
./dev/dev-debug.sh

# Then attach debugger to localhost:9229
# Or use Chrome DevTools: chrome://inspect
```

## Build Workflow

### Development Build

```bash
# Fast build for development
./build/build-dev.sh

# Or with custom options
BUILD_TYPE=development ./build/build.sh
```

### Production Build

```bash
# Full production build with all checks
./build/build-prod.sh

# Or with options
./build/build.sh --type production --clean --verbose

# Windows PowerShell
.\build\build.ps1 -Type production -Clean -Verbose
```

### Desktop Applications

```bash
# Build Electron and Tauri apps
./build/build-desktop.sh

# Or build everything
./build/build-all.sh
```

## Testing Workflow

### Run All Tests

```bash
# Complete test suite
./tests/test-all.sh

# With coverage
COVERAGE=true ./tests/test-all.sh
```

### Specific Test Types

```bash
# Unit tests only
./tests/test-unit.sh

# Integration tests
./tests/test-integration.sh

# E2E tests
./tests/test-e2e.sh

# Load tests
./tests/test-load.sh

# Security scan
./tests/test-security.sh

# Accessibility tests
./tests/test-a11y.sh
```

### Generate Coverage Report

```bash
./tests/test-coverage.sh

# Report will be at: coverage/lcov-report/index.html
# Should open automatically in browser
```

## Deployment Workflow

### Cloudflare Pages

```bash
# Setup
export CLOUDFLARE_ACCOUNT_ID=your_account_id

# Deploy to preview (default)
./deploy/deploy-cloudflare.sh

# Deploy to production
PREVIEW_DEPLOYMENTS=false ./deploy/deploy-cloudflare.sh
```

### Kubernetes

```bash
# Deploy to Kubernetes cluster
export NAMESPACE=spreadsheet-moment
export IMAGE_TAG=v1.0.0

./deploy/deploy-kubernetes.sh

# Check deployment
kubectl get pods -n spreadsheet-moment
kubectl logs -n spreadsheet-moment deployment/spreadsheet-moment
```

### Desktop Release

```bash
# Create release
export VERSION=v1.0.0
export GITHUB_REPO=yourusername/spreadsheet-moment

./deploy/deploy-desktop.sh
```

### Deploy to All Targets

```bash
# Deploy to everything at once
./deploy/deploy-all.sh

# Will prompt for confirmation
# Deploys to: Cloudflare, Kubernetes, Desktop releases
```

### Rollback

```bash
# Rollback Cloudflare to previous version
./deploy/rollback.sh cloudflare

# Rollback Kubernetes to specific version
./deploy/rollback.sh kubernetes v1.2.3
```

## Monitoring & Maintenance

### Health Checks

```bash
# Check application health
export HEALTH_URL=http://localhost:3000/api/health
./monitoring/health-check.sh

# Custom retry settings
export RETRIES=5
export RETRY_DELAY=3
./monitoring/health-check.sh
```

### Metrics Collection

```bash
# Collect metrics
./monitoring/metrics-collect.sh

# Metrics saved to: metrics/metrics-YYYYMMDD_HHMMSS.json

# Send to external services
export PROMETHEUS_URL=http://prometheus:9090
export DATADOG_API_KEY=your_api_key
./monitoring/metrics-collect.sh
```

### Database Backups

```bash
# PostgreSQL backup
export DB_TYPE=postgresql
./monitoring/backup.sh

# MySQL backup
export DB_TYPE=mysql
./monitoring/backup.sh

# SQLite backup
export DB_TYPE=sqlite
./monitoring/backup.sh

# Custom retention
export RETENTION_DAYS=30
./monitoring/backup.sh
```

### Cleanup

```bash
# Clean old resources
export RETENTION_DAYS=7
./monitoring/cleanup.sh

# Dry run to see what would be cleaned
DRY_RUN=true ./monitoring/cleanup.sh

# Clean specific resources
KEEP_LOGS_DAYS=30 KEEP_BACKUPS_DAYS=7 ./monitoring/cleanup.sh
```

### Log Analysis

```bash
# Analyze recent logs
./monitoring/log-analyze.sh

# Custom time range
export TIME_RANGE=7d  # 24h, 7d, 30d
./monitoring/log-analyze.sh

# Specific log patterns
export LOG_PATTERNS="*.log"
./monitoring/log-analyze.sh
```

## Code Quality

### Linting

```bash
# Run all linters
./utils/lint.sh

# Auto-fix issues
FIX=true ./utils/lint.sh

# Lint staged files only
STAGED=true ./utils/lint.sh
```

### Formatting

```bash
# Format all code
./utils/format.sh

# Check formatting without making changes
CHECK=true ./utils/format.sh

# Format staged files only
STAGED=true ./utils/format.sh
```

### Validation

```bash
# Validate configuration
./utils/validate.sh

# This checks:
# - Package files
# - Configuration files
# - Environment files
# - Dependencies
# - Build state
```

## CI/CD Integration

### GitHub Actions

```yaml
name: CI/CD Pipeline

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: ./utils/install.sh
      - name: Run linters
        run: ./utils/lint.sh
      - name: Run tests
        run: ./tests/test-all.sh

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - name: Build production
        run: ./build/build-prod.sh

  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Cloudflare
        run: ./deploy/deploy-cloudflare.sh
        env:
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

### GitLab CI

```yaml
stages:
  - test
  - build
  - deploy

test:
  stage: test
  script:
    - ./utils/install.sh
    - ./tests/test-all.sh

build:
  stage: build
  script:
    - ./build/build-prod.sh

deploy:
  stage: deploy
  only:
    - main
  script:
    - ./deploy/deploy-kubernetes.sh
```

## Common Scenarios

### Pre-Commit Checklist

```bash
# Run before committing
./utils/lint.sh && ./tests/test-all.sh && ./utils/format.sh
```

### Pre-Deploy Checklist

```bash
# Complete validation
./utils/validate.sh
./tests/test-all.sh
./build/build-prod.sh
./tests/test-e2e.sh
./tests/test-security.sh
```

### Emergency Rollback

```bash
# Quick rollback
./deploy/rollback.sh cloudflare

# Then investigate
./monitoring/log-analyze.sh
./monitoring/health-check.sh
```

### Performance Investigation

```bash
# Run load tests
./tests/test-load.sh

# Collect metrics
./monitoring/metrics-collect.sh

# Analyze logs
./monitoring/log-analyze.sh
```

### Security Audit

```bash
# Complete security scan
./tests/test-security.sh

# Update dependencies
./utils/update.sh

# Re-scan
./tests/test-security.sh
```

## Environment-Specific Usage

### Local Development

```bash
./dev/dev-setup.sh
./dev/dev.sh
```

### Staging Environment

```bash
export BUILD_TYPE=production
export ENVIRONMENT=staging

./build/build.sh
./deploy/deploy-kubernetes.sh
```

### Production Environment

```bash
export BUILD_TYPE=production
export ENVIRONMENT=production

# Run all quality checks
./utils/validate.sh
./tests/test-all.sh
./tests/test-security.sh

# Build and deploy
./build/build.sh
./deploy/deploy-all.sh

# Monitor deployment
./monitoring/health-check.sh
./monitoring/metrics-collect.sh
```

## Tips & Tricks

### Speed Up Development

```bash
# Use development build (faster)
./build/build-dev.sh

# Skip tests during development
SKIP_TESTS=true ./build/build.sh

# Parallel builds
PARALLEL_BUILD=true ./build/build.sh
```

### Debug Build Issues

```bash
# Enable verbose output
VERBOSE=true ./build/build.sh

# Check build logs
cat logs/build_*.log
```

### Automate Backups

```bash
# Add to crontab
0 2 * * * /path/to/project/monitoring/backup.sh
```

### Monitor Continuously

```bash
# Watch health status
watch -n 60 './monitoring/health-check.sh'
```

## Troubleshooting

See `scripts/TROUBLESHOOTING.md` for detailed troubleshooting guides.
