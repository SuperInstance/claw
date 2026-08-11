# Script Troubleshooting Guide

Common issues and solutions for Spreadsheet Moment automation scripts.

## Table of Contents

- [General Issues](#general-issues)
- [Build Issues](#build-issues)
- [Deployment Issues](#deployment-issues)
- [Test Issues](#test-issues)
- [Monitoring Issues](#monitoring-issues)
- [Platform-Specific Issues](#platform-specific-issues)

## General Issues

### Scripts Not Executable

**Problem:**
```bash
bash: ./build/build.sh: Permission denied
```

**Solution:**
```bash
# Make scripts executable
chmod +x build/*.sh deploy/*.sh tests/*.sh monitoring/*.sh dev/*.sh utils/*.sh

# Or run with bash explicitly
bash build/build.sh
```

### Environment Variables Not Set

**Problem:**
```
Error: CLOUDFLARE_ACCOUNT_ID not set
```

**Solution:**
```bash
# Set environment variable
export CLOUDFLARE_ACCOUNT_ID=your_account_id

# Or add to ~/.bashrc or ~/.zshrc
echo 'export CLOUDFLARE_ACCOUNT_ID=your_account_id' >> ~/.bashrc

# Or use .env file
echo 'CLOUDFLARE_ACCOUNT_ID=your_account_id' > .env.local
```

### Node.js Version Too Old

**Problem:**
```
Error: Node.js version must be 18 or higher
```

**Solution:**
```bash
# Check current version
node -v

# Install nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install latest Node.js
nvm install 18
nvm use 18
```

### Missing Dependencies

**Problem:**
```
Error: Cannot find module 'next'
```

**Solution:**
```bash
# Install dependencies
./utils/install.sh

# Or manually
npm install
```

## Build Issues

### Build Fails - Type Errors

**Problem:**
```bash
Type check failed
```

**Solution:**
```bash
# Run type check to see errors
npm run type-check

# Fix type errors manually or use:
# Allow any types temporarily (not recommended)

# Re-run build
./build/build.sh
```

### Build Fails - Out of Memory

**Problem:**
```
JavaScript heap out of memory
```

**Solution:**
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Then build
./build/build.sh
```

### Build Takes Too Long

**Problem:**
Build is very slow

**Solution:**
```bash
# Use development build
./build/build-dev.sh

# Enable parallel builds
PARALLEL_BUILD=true ./build/build.sh

# Skip tests during build
SKIP_TESTS=true ./build/build.sh

# Use npm cache
npm ci --prefer-offline
```

### Build Artifacts Not Found

**Problem:**
```
Error: dist/ directory not found
```

**Solution:**
```bash
# Verify build completed
ls -la dist/

# Rebuild
./build/build-prod.sh

# Check build logs
cat logs/build_*.log
```

## Deployment Issues

### Cloudflare Deployment Fails

**Problem:**
```
Error: Wrangler not found
```

**Solution:**
```bash
# Install Wrangler CLI
npm install -g wrangler

# Authenticate
wrangler login

# Retry deployment
./deploy/deploy-cloudflare.sh
```

### Kubernetes Deployment Fails

**Problem:**
```
Error: Cannot connect to Kubernetes cluster
```

**Solution:**
```bash
# Check cluster connection
kubectl cluster-info

# Check current context
kubectl config current-context

# Set correct context
kubectl config use-context your-context

# Verify namespace
kubectl get namespace spreadsheet-moment

# Create namespace if needed
kubectl create namespace spreadsheet-moment
```

### Docker Image Build Fails

**Problem:**
```
Error: Docker build failed
```

**Solution:**
```bash
# Check Docker is running
docker ps

# Build with no cache
docker build --no-cache -t spreadsheet-moment .

# Check Dockerfile syntax
docker build --check -f Dockerfile .

# View build logs
docker build --progress=plain -t spreadsheet-moment .
```

### Rollback Fails

**Problem:**
```
Error: No previous deployment found
```

**Solution:**
```bash
# List deployment history
kubectl rollout history deployment/spreadsheet-moment -n spreadsheet-moment

# Check available revisions
kubectl get replicaset -n spreadsheet-moment

# Manually set revision
kubectl rollout undo deployment/spreadsheet-moment --to-revision=2 -n spreadsheet-moment
```

## Test Issues

### Tests Time Out

**Problem:**
```
Error: Test timeout exceeded
```

**Solution:**
```bash
# Increase test timeout
# In jest.config.js:
# testTimeout: 30000

# Run tests with longer timeout
npm test -- --testTimeout=30000

# Or skip slow tests
npm test -- --testPathIgnorePatterns=slow
```

### E2E Tests Fail - Browser Not Found

**Problem:**
```
Error: Playwright browsers not installed
```

**Solution:**
```bash
# Install Playwright browsers
npx playwright install --with-deps

# Retry E2E tests
./tests/test-e2e.sh
```

### Integration Tests Fail - Services Not Running

**Problem:**
```
Error: Cannot connect to database
```

**Solution:**
```bash
# Start test dependencies
docker-compose -f docker-compose.test.yml up -d

# Wait for services to be ready
sleep 10

# Retry tests
./tests/test-integration.sh

# Cleanup after tests
docker-compose -f docker-compose.test.yml down
```

### Coverage Report Missing

**Problem:**
```
Error: Coverage report not found
```

**Solution:**
```bash
# Regenerate coverage
./tests/test-coverage.sh

# Check coverage directory
ls -la coverage/

# Manually generate coverage
npx jest --coverage
```

### Security Scan Finds Vulnerabilities

**Problem:**
```
Error: npm audit found vulnerabilities
```

**Solution:**
```bash
# View vulnerabilities
npm audit

# Auto-fix if possible
npm audit fix

# Manual fix
npm audit fix --force

# Update dependencies
./utils/update.sh

# Or use npm overrides for false positives
```

## Monitoring Issues

### Health Check Fails

**Problem:**
```
Error: Health check failed (HTTP 503)
```

**Solution:**
```bash
# Check if application is running
ps aux | grep node

# Check application logs
tail -f logs/*.log

# Verify health endpoint
curl http://localhost:3000/api/health

# Restart application if needed
./dev/dev.sh
```

### Backup Fails - Database Connection

**Problem:**
```
Error: Cannot connect to database
```

**Solution:**
```bash
# Verify database connection
psql -h localhost -U user -d database

# Check DATABASE_URL
cat .env.local | grep DATABASE_URL

# Test database connection
./monitoring/health-check.sh
```

### Metrics Collection Fails

**Problem:**
```
Error: Metrics endpoint not available
```

**Solution:**
```bash
# Verify metrics endpoint is configured
cat .env.local | grep METRICS

# Check if metrics are enabled in application
# (application-specific)

# Manually collect system metrics
df -h
free -m
uptime
```

### Log Analysis Shows No Logs

**Problem:**
```
Error: No log files found
```

**Solution:**
```bash
# Verify log directory exists
ls -la logs/

# Check log rotation settings
# (application-specific)

# Generate some activity
curl http://localhost:3000

# Re-analyze
./monitoring/log-analyze.sh
```

## Platform-Specific Issues

### Windows - Git Bash Issues

**Problem:**
Scripts fail on Windows with Git Bash

**Solution:**
```bash
# Use PowerShell instead
.\build\build.ps1

# Or use WSL (Windows Subsystem for Linux)
wsl ./build/build.sh

# Or convert line endings
git config core.autocrlf false
git rm --cached -r .
git reset --hard
```

### macOS - Permission Issues

**Problem:**
```
Error: Permission denied
```

**Solution:**
```bash
# Grant execute permissions
chmod +x build/*.sh deploy/*.sh tests/*.sh monitoring/*.sh dev/*.sh utils/*.sh

# Or use bash explicitly
bash build/build.sh
```

### Linux - Missing Dependencies

**Problem:**
```
Error: Command not found
```

**Solution:**
```bash
# Update package manager
sudo apt update  # Debian/Ubuntu
sudo yum update  # CentOS/RHEL

# Install required tools
sudo apt install -y curl git nodejs npm docker.io

# Verify installation
node -v
npm -v
docker --version
```

## Getting Help

If you can't resolve your issue:

1. **Check logs:**
   ```bash
   cat logs/*.log
   ```

2. **Enable verbose output:**
   ```bash
   VERBOSE=true ./script-name.sh
   ```

3. **Run validation:**
   ```bash
   ./utils/validate.sh
   ```

4. **Check documentation:**
   - `scripts/README.md` - Main documentation
   - `scripts/USAGE.md` - Usage examples

5. **Open an issue:**
   - Include error message
   - Include log files (sanitized)
   - Include system information
   - Include steps to reproduce
