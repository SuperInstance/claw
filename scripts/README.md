# Spreadsheet Moment - Automation Scripts

Complete automation and integration scripts for Spreadsheet Moment platform deployment and operations.

## Overview

This collection of scripts provides comprehensive automation for development, testing, deployment, and operations workflows. All scripts support cross-platform execution (Unix/Linux/macOS and Windows PowerShell).

## Directory Structure

```
scripts/
├── build/          # Build and compilation scripts
├── deploy/         # Deployment scripts for various platforms
├── tests/          # Test execution scripts
├── monitoring/     # Monitoring and maintenance scripts
├── dev/            # Development workflow scripts
├── utils/          # Utility and helper scripts
└── examples/       # Usage examples and templates
```

## Quick Start

```bash
# Make scripts executable (Unix/Linux/macOS)
chmod +x build/*.sh deploy/*.sh tests/*.sh monitoring/*.sh dev/*.sh utils/*.sh

# Initial setup
./dev/dev-setup.sh

# Start development server
./dev/dev.sh

# Run tests
./tests/test-all.sh

# Build for production
./build/build-prod.sh

# Deploy
./deploy/deploy-cloudflare.sh  # Cloudflare Pages
./deploy/deploy-kubernetes.sh  # Kubernetes
```

## Script Categories

### Build Scripts (`build/`)

| Script | Purpose |
|--------|---------|
| `build.sh` | Complete build pipeline with all checks |
| `build.ps1` | Windows PowerShell build pipeline |
| `build-dev.sh` | Fast development build |
| `build-prod.sh` | Optimized production build |
| `build-desktop.sh` | Desktop application builds (Electron/Tauri) |
| `build-all.sh` | Build all targets (web, desktop, mobile) |

**Usage:**
```bash
./build/build.sh [options]
  -t, --type TYPE         Build type (development|production)
  -c, --clean             Clean build artifacts
  -p, --parallel          Enable parallel builds
  -v, --verbose           Verbose output
```

### Deployment Scripts (`deploy/`)

| Script | Purpose |
|--------|---------|
| `deploy-cloudflare.sh` | Deploy to Cloudflare Pages/Workers |
| `deploy-kubernetes.sh` | Deploy to Kubernetes cluster |
| `deploy-desktop.sh` | Create desktop application releases |
| `deploy-all.sh` | Deploy to all configured targets |
| `rollback.sh` | Rollback to previous version |

**Usage:**
```bash
# Cloudflare deployment
export CLOUDFLARE_ACCOUNT_ID=your_account_id
./deploy/deploy-cloudflare.sh

# Kubernetes deployment
export NAMESPACE=spreadsheet-moment
./deploy/deploy-kubernetes.sh

# Rollback
./deploy/rollback.sh cloudflare
./deploy/rollback.sh kubernetes v1.2.3
```

### Test Scripts (`tests/`)

| Script | Purpose |
|--------|---------|
| `test-all.sh` | Run complete test suite |
| `test-unit.sh` | Unit tests only (Jest) |
| `test-integration.sh` | Integration tests |
| `test-e2e.sh` | End-to-end tests (Playwright) |
| `test-coverage.sh` | Generate coverage report |
| `test-load.sh` | Run load tests (k6/Artillery) |
| `test-security.sh` | Security audits and scans |
| `test-a11y.sh` | Accessibility tests (axe-core) |

**Usage:**
```bash
# Run all tests
./tests/test-all.sh

# Specific test types
./tests/test-unit.sh
./tests/test-integration.sh
./tests/test-e2e.sh

# Generate coverage
./tests/test-coverage.sh

# Security scan
./tests/test-security.sh
```

### Monitoring Scripts (`monitoring/`)

| Script | Purpose |
|--------|---------|
| `health-check.sh` | Check application health endpoints |
| `metrics-collect.sh` | Collect application and system metrics |
| `backup.sh` | Create database backups |
| `cleanup.sh` | Clean up temporary files and old resources |
| `log-analyze.sh` | Analyze application logs for issues |

**Usage:**
```bash
# Health check
export HEALTH_URL=http://localhost:3000/api/health
./monitoring/health-check.sh

# Collect metrics
./monitoring/metrics-collect.sh

# Database backup
export DB_TYPE=postgresql  # or mysql, mongodb, sqlite
./monitoring/backup.sh

# Cleanup resources
export RETENTION_DAYS=30
./monitoring/cleanup.sh

# Analyze logs
./monitoring/log-analyze.sh
```

### Development Scripts (`dev/`)

| Script | Purpose |
|--------|---------|
| `dev.sh` | Start development server |
| `dev-watch.sh` | Run tests in watch mode |
| `dev-debug.sh` | Start with debugging enabled |
| `dev-clean.sh` | Clean build artifacts |
| `dev-setup.sh` | Initial development environment setup |

**Usage:**
```bash
# Start development server
./dev/dev.sh

# Watch mode for tests
./dev/dev-watch.sh

# Debug mode
export DEBUG_PORT=9229
./dev/dev-debug.sh

# Clean artifacts
./dev/dev-clean.sh

# Initial setup
./dev/dev-setup.sh
```

### Utility Scripts (`utils/`)

| Script | Purpose |
|--------|---------|
| `install.sh` | Install project dependencies |
| `update.sh` | Update dependencies safely |
| `lint.sh` | Run all linters |
| `format.sh` | Format code with Prettier |
| `validate.sh` | Validate configuration files |

**Usage:**
```bash
# Install dependencies
./utils/install.sh

# Update dependencies
./utils/update.sh

# Run linters
./utils/lint.sh
FIX=true ./utils/lint.sh  # Auto-fix issues

# Format code
./utils/format.sh
CHECK=true ./utils/format.sh  # Check only

# Validate configuration
./utils/validate.sh
```

## Configuration

### Environment Variables

Most scripts can be configured via environment variables:

```bash
# Build configuration
export BUILD_TYPE=production
export CLEAN_BUILD=true
export PARALLEL_BUILD=true

# Deployment configuration
export CLOUDFLARE_ACCOUNT_ID=your_account_id
export NAMESPACE=spreadsheet-moment
export REGISTRY=ghcr.io
export IMAGE_NAME=spreadsheet-moment

# Test configuration
export COVERAGE=true
export WATCH=false
export VERBOSE=false

# Monitoring configuration
export HEALTH_URL=http://localhost:3000/api/health
export RETENTION_DAYS=7
```

### Configuration Files

- `.env.local` - Local environment variables
- `.env.production` - Production environment variables
- `scripts/examples/` - Example configurations

## Windows Support

All scripts have PowerShell equivalents with `.ps1` extension:

```powershell
# Windows PowerShell
.\build\build.ps1 -Type production -Clean
.\deploy\deploy-cloudflare.ps1
.\tests\test-all.ps1
```

## Error Handling

All scripts include:
- Comprehensive error handling
- Colored output for readability
- Progress indicators
- Detailed logging to `logs/` directory
- Exit codes for CI/CD integration

## Logging

Logs are stored in the `logs/` directory:
- `build_*.log` - Build logs
- `deploy_*.log` - Deployment logs
- `test_*.log` - Test logs
- `monitoring_*.log` - Monitoring logs

## CI/CD Integration

All scripts return appropriate exit codes:
- `0` - Success
- `1` - Failure

**GitHub Actions Example:**
```yaml
- name: Run tests
  run: ./tests/test-all.sh

- name: Build
  run: ./build/build-prod.sh

- name: Deploy
  run: ./deploy/deploy-cloudflare.sh
  env:
    CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

## Troubleshooting

See `scripts/TROUBLESHOOTING.md` for common issues and solutions.

## Contributing

When adding new scripts:
1. Follow existing naming conventions
2. Include both `.sh` and `.ps1` versions for cross-platform support
3. Add comprehensive error handling
4. Include usage documentation
5. Add examples to `scripts/examples/`

## License

MIT License - see LICENSE file for details.
