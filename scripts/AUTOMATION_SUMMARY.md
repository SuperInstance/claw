# Automation Scripts - Complete Summary

Comprehensive automation and integration scripts for Spreadsheet Moment platform deployment and operations.

## Quick Reference

```bash
# Make all scripts executable (one-time setup)
chmod +x build/*.sh deploy/*.sh tests/*.sh monitoring/*.sh dev/*.sh utils/*.sh

# Initial development setup
./dev/dev-setup.sh

# Daily development
./dev/dev.sh                    # Start development server
./dev/dev-watch.sh              # Watch mode for tests
./utils/format.sh               # Format code
./utils/lint.sh                 # Run linters

# Testing
./tests/test-all.sh             # Complete test suite
./tests/test-coverage.sh        # Coverage report
./tests/test-security.sh        # Security scan

# Building
./build/build-prod.sh           # Production build
./build/build-all.sh            # Build all targets

# Deployment
./deploy/deploy-cloudflare.sh   # Deploy to Cloudflare
./deploy/deploy-kubernetes.sh   # Deploy to Kubernetes
./deploy/rollback.sh cloudflare # Rollback deployment

# Monitoring
./monitoring/health-check.sh    # Check application health
./monitoring/backup.sh          # Database backup
./monitoring/log-analyze.sh     # Analyze logs
```

## Script Inventory

### Build Scripts (6 scripts)
- `build/build.sh` - Complete build pipeline (Unix/Linux/macOS)
- `build/build.ps1` - Complete build pipeline (Windows PowerShell)
- `build/build-dev.sh` - Fast development build
- `build/build-prod.sh` - Optimized production build
- `build/build-desktop.sh` - Desktop application builds
- `build/build-all.sh` - Build all targets

### Deployment Scripts (5 scripts)
- `deploy/deploy-cloudflare.sh` - Cloudflare Pages/Workers deployment
- `deploy/deploy-kubernetes.sh` - Kubernetes cluster deployment
- `deploy/deploy-desktop.sh` - Desktop application release
- `deploy/deploy-all.sh` - Deploy to all targets
- `deploy/rollback.sh` - Rollback to previous version

### Test Scripts (8 scripts)
- `tests/test-all.sh` - Run complete test suite
- `tests/test-unit.sh` - Unit tests only
- `tests/test-integration.sh` - Integration tests
- `tests/test-e2e.sh` - End-to-end tests
- `tests/test-coverage.sh` - Coverage report
- `tests/test-load.sh` - Load tests
- `tests/test-security.sh` - Security scans
- `tests/test-a11y.sh` - Accessibility tests

### Monitoring Scripts (5 scripts)
- `monitoring/health-check.sh` - Health check endpoint
- `monitoring/metrics-collect.sh` - Collect metrics
- `monitoring/backup.sh` - Database backup
- `monitoring/cleanup.sh` - Resource cleanup
- `monitoring/log-analyze.sh` - Log analysis

### Development Scripts (5 scripts)
- `dev/dev.sh` - Start development server
- `dev/dev-watch.sh` - Watch mode
- `dev/dev-debug.sh` - Debug mode
- `dev/dev-clean.sh` - Clean build artifacts
- `dev/dev-setup.sh` - Initial setup

### Utility Scripts (5 scripts)
- `utils/install.sh` - Install dependencies
- `utils/update.sh` - Update dependencies
- `utils/lint.sh` - Run linters
- `utils/format.sh` - Format code
- `utils/validate.sh` - Validate configuration

**Total: 34 production-ready automation scripts**

## Key Features

### Cross-Platform Support
- Unix/Linux/macOS: `.sh` scripts with bash
- Windows: `.ps1` scripts with PowerShell
- Consistent behavior across platforms

### Comprehensive Error Handling
- Exit codes for CI/CD integration
- Detailed error messages
- Graceful degradation
- Rollback on failure

### Colored Output
- Color-coded log levels
- Progress indicators
- Status symbols (✓ ✗ ⊘)
- Easy readability

### Logging
- Automatic log file creation
- Timestamped logs in `logs/` directory
- Detailed execution history
- Easy troubleshooting

### Configuration
- Environment variable support
- Configuration file validation
- Sensible defaults
- Override capabilities

### Automation Features
- Dependency checking
- Parallel execution support
- Cleanup on exit
- Resource optimization

## Common Use Cases

### Development Workflow
```bash
# Setup
./dev/dev-setup.sh

# Work
./dev/dev.sh                    # Start server
./dev/dev-watch.sh              # Watch tests
./utils/format.sh               # Format code

# Validate
./utils/lint.sh                 # Lint
./tests/test-all.sh             # Test
./utils/validate.sh             # Validate
```

### CI/CD Pipeline
```bash
# Test
./tests/test-all.sh
./tests/test-security.sh

# Build
./build/build-prod.sh

# Deploy
./deploy/deploy-cloudflare.sh

# Monitor
./monitoring/health-check.sh
./monitoring/metrics-collect.sh
```

### Deployment
```bash
# Prepare
./utils/validate.sh
./tests/test-all.sh
./build/build-prod.sh

# Deploy
./deploy/deploy-cloudflare.sh   # or
./deploy/deploy-kubernetes.sh

# Verify
./monitoring/health-check.sh
./monitoring/log-analyze.sh
```

### Maintenance
```bash
# Health
./monitoring/health-check.sh

# Backup
export DB_TYPE=postgresql
./monitoring/backup.sh

# Cleanup
export RETENTION_DAYS=30
./monitoring/cleanup.sh

# Analysis
./monitoring/log-analyze.sh
./monitoring/metrics-collect.sh
```

## Environment Variables

### Build Configuration
```bash
BUILD_TYPE=production          # Build type
CLEAN_BUILD=true               # Clean before build
PARALLEL_BUILD=true            # Parallel builds
VERBOSE=false                  # Verbose output
```

### Deployment Configuration
```bash
CLOUDFLARE_ACCOUNT_ID=xxx      # Cloudflare account
NAMESPACE=spreadsheet-moment   # Kubernetes namespace
REGISTRY=ghcr.io              # Container registry
IMAGE_NAME=spreadsheet-moment  # Image name
IMAGE_TAG=v1.0.0              # Image tag
```

### Test Configuration
```bash
COVERAGE=true                  # Generate coverage
WATCH=false                    # Watch mode
HEADLESS=true                  # Headless E2E tests
VERBOSE=false                  # Verbose test output
```

### Monitoring Configuration
```bash
HEALTH_URL=http://localhost:3000/api/health
RETENTION_DAYS=7               # Backup retention
LOG_PATTERNS=*.log             # Log patterns
```

## Documentation Files

- `scripts/README.md` - Complete script reference
- `scripts/USAGE.md` - Usage examples and workflows
- `scripts/TROUBLESHOOTING.md` - Common issues and solutions
- `scripts/examples/` - Example configurations and workflows

## Integration Examples

### GitHub Actions
See `scripts/examples/ci-github-actions.yml` for complete CI/CD pipeline.

### GitLab CI
```yaml
test:
  script: ./tests/test-all.sh

build:
  script: ./build/build-prod.sh

deploy:
  script: ./deploy/deploy-kubernetes.sh
```

### Docker
```dockerfile
COPY build/build-prod.sh /scripts/
RUN chmod +x /scripts/build-prod.sh
RUN /scripts/build-prod.sh
```

### Kubernetes
```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: backup
spec:
  template:
    spec:
      containers:
      - name: backup
        command: ["/scripts/monitoring/backup.sh"]
```

## Best Practices

1. **Always validate** before deploying:
   ```bash
   ./utils/validate.sh
   ```

2. **Run tests** before committing:
   ```bash
   ./utils/lint.sh && ./tests/test-all.sh
   ```

3. **Create backups** before major changes:
   ```bash
   ./monitoring/backup.sh
   ```

4. **Monitor health** after deployments:
   ```bash
   ./monitoring/health-check.sh
   ```

5. **Keep scripts updated** with dependencies:
   ```bash
   ./utils/update.sh
   ```

## Troubleshooting

1. **Script not executable**: `chmod +x script-name.sh`
2. **Missing dependencies**: `./utils/install.sh`
3. **Build fails**: Check `logs/build_*.log`
4. **Deployment fails**: Check `logs/deploy_*.log`
5. **Tests fail**: Check `logs/test_*.log`

See `scripts/TROUBLESHOOTING.md` for detailed solutions.

## Support

For issues or questions:
1. Check `scripts/TROUBLESHOOTING.md`
2. Review `scripts/USAGE.md` for examples
3. Check log files in `logs/` directory
4. Enable verbose mode: `VERBOSE=true ./script.sh`

## License

MIT License - Part of Spreadsheet Moment project
