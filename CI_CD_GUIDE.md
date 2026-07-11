# CI/CD Guide - Claw

## Overview

This guide covers the CI/CD pipelines for the claw repository, including testing across multiple platforms, Docker builds, and automated releases.

## Workflows

### CI Workflow (`.github/workflows/ci.yml`)

**Triggers:**
- Push to `main` branch
- Pull requests
- Manual workflow dispatch

**Key Features:**

1. **Smart Caching**: Docs-only detection to skip heavy jobs
2. **Scope Detection**: Run only relevant tests based on changes
3. **Parallel Execution**: Multiple test shards across platforms
4. **Platform Testing**: Linux, macOS, Windows, Android, iOS
5. **Security Scanning**: Automated vulnerability detection

### Docker Release Workflow (`.github/workflows/docker-release.yml`)

**Triggers:**
- Push to `main` branch
- Git tags matching `v*`
- Manual workflow dispatch

**Features:**

1. **Multi-Platform Builds**: AMD64 and ARM64
2. **Variants**: Default and slim images
3. **Manifest Creation**: Multi-platform manifests
4. **Environment Protection**: Gated deployment approval

## Local Development

### Running Tests

```bash
# Run all tests
pnpm test

# Run specific test shard
OPENCLAW_TEST_SHARDS=2 OPENCLAW_TEST_SHARD_INDEX=0 pnpm test

# Run with specific workers
OPENCLAW_TEST_WORKERS=4 pnpm test

# Increase memory for tests
OPENCLAW_TEST_MAX_OLD_SPACE_SIZE_MB=6144 pnpm test
```

### Building

```bash
# Build dist
pnpm build

# Build A2UI bundle
pnpm canvas:a2ui:bundle

# Build for production
pnpm build:production
```

### Linting and Formatting

```bash
# Run all checks
pnpm check

# Types, lint, and format
pnpm check

# Type check only
pnpm type-check

# Lint only
pnpm lint

# Format only
pnpm format

# Lint UI for unsafe window.open
pnpm lint:ui:no-raw-window-open
```

### Platform-Specific Testing

#### Windows

```bash
# Run Windows tests
pnpm test

# Configure for Windows
OPENCLAW_TEST_WORKERS=1
OPENCLAW_TEST_SHARDS=6
OPENCLAW_TEST_SHARD_INDEX=0
```

#### macOS

```bash
# Run TypeScript tests
pnpm test

# Run Swift tests
cd apps/macos
swift test

# Run Swift lint
swiftlint --config .swiftlint.yml
swiftformat --lint apps/macos/Sources --config .swiftformat
```

#### Android

```bash
# Run Android tests
cd apps/android
./gradlew --no-daemon :app:testDebugUnitTest

# Build Android
./gradlew --no-daemon :app:assembleDebug
```

## CI/CD Features

### 1. Smart Change Detection

The CI automatically detects what changed and runs only relevant tests:

```yaml
# Detect docs-only changes
- name: Detect docs-only changes
  id: check
  uses: ./.github/actions/detect-docs-changes

# Detect changed scopes
- name: Detect changed scopes
  id: scope
  run: node scripts/ci-changed-scope.mjs --base "$BASE" --head HEAD
```

### 2. Artifact Caching

```yaml
# Build dist once and share
- name: Build dist
  run: pnpm build

- name: Upload dist artifact
  uses: actions/upload-artifact@v7
  with:
    name: dist-build
    path: dist/
    retention-days: 1
```

### 3. Test Sharding

```yaml
strategy:
  matrix:
    include:
      - shard_index: 1
        shard_count: 2
      - shard_index: 2
        shard_count: 2
```

### 4. Environment Variables

```bash
# Test resources
OPENCLAW_TEST_WORKERS=2
OPENCLAW_TEST_MAX_OLD_SPACE_SIZE_MB=6144
OPENCLAW_TEST_SHARDS=2
OPENCLAW_TEST_SHARD_INDEX=0
```

## Docker Builds

### Building Locally

```bash
# Build default image
docker build -t claw:latest .

# Build slim variant
docker build --build-arg OPENCLAW_VARIANT=slim -t claw:slim .

# Build for specific platform
docker build --platform linux/amd64 -t claw:amd64 .
docker build --platform linux/arm64 -t claw:arm64 .
```

### Multi-Platform Builds

```bash
# Use buildx for multi-platform builds
docker buildx create --use
docker buildx build --platform linux/amd64,linux/arm64 -t claw:latest .
```

### Docker Variants

**Default Image:**
- Full Node.js runtime
- All dependencies
- Production-ready

**Slim Image:**
- Minimal Node.js runtime
- Production dependencies only
- Smaller size

## Security

### Automated Security Scanning

```bash
# Run pre-commit hooks
pre-commit run --all-files

# Detect private keys
pre-commit run --all-files detect-private-key

# Audit npm packages
pnpm audit --audit-level=moderate

# Audit GitHub workflows
pre-commit run zizmor --files .github/workflows/*.yml
```

### GitHub CodeQL

```yaml
- name: Run CodeQL Analysis
  uses: github/codeql-action/analyze@v3
  with:
    languages: javascript, typescript
```

### Dependency Audit

```bash
# Audit production dependencies
pre-commit run --all-files pnpm-audit-prod

# Check for outdated dependencies
pnpm outdated
```

## Release Process

### Docker Release

1. Tag commit: `git tag v2026.3.13`
2. Push tag: `git push origin v2026.3.13`
3. CI/CD automatically:
   - Builds AMD64 and ARM64 images
   - Creates multi-platform manifests
   - Pushes to GitHub Container Registry

### Manual Backfill

1. Go to Actions tab
2. Select "Docker Release" workflow
3. Click "Run workflow"
4. Enter existing tag to backfill
5. Requires environment approval

## Performance

### Startup Memory

```bash
# Check CLI startup memory
pnpm test:startup:memory
```

### Build Performance

```bash
# Build dist
pnpm build

# Check build size
du -sh dist/

# Analyze bundle
pnpm analyze
```

## Troubleshooting

### Common Issues

**Issue**: Tests fail with out of memory
```bash
# Increase memory
OPENCLAW_TEST_MAX_OLD_SPACE_SIZE_MB=6144 pnpm test

# Reduce workers
OPENCLAW_TEST_WORKERS=1 pnpm test
```

**Issue**: Windows Defender slows down tests
```bash
# Add exclusions (best-effort)
Add-MpPreference -ExclusionPath "$env:GITHUB_WORKSPACE"
Add-MpPreference -ExclusionProcess "node.exe"
```

**Issue**: Swift build fails on macOS
```bash
# Retry build (up to 3 attempts)
for attempt in 1 2 3; do
  if swift build --package-path apps/macos --configuration release; then
    exit 0
  fi
  sleep $((attempt * 20))
done
```

**Issue**: Android SDK setup fails
```bash
# Install Android SDK manually
yes | sdkmanager --licenses
sdkmanager --install \
  "platform-tools" \
  "platforms;android-36" \
  "build-tools;36.0.0"
```

### CI Failures

1. Check job logs for specific error
2. Check if docs-only detection failed
3. Check scope detection
4. Verify environment variables
5. Check for flaky tests

### Debugging CI

```bash
# Enable debug logging
# Add secret: ACTIONS_STEP_DEBUG=true

# Run CI locally
act push

# Run specific job
act push -j test
```

## Platform Support

### Tested Platforms

**Tier 1 (Primary):**
- Ubuntu 24.04 (Linux x86_64)
- macOS 15 (Apple Silicon)
- Windows Server 2025 (x86_64)

**Tier 2 (Secondary):**
- Android 12+
- iOS 15+

### Runtimes

**Node.js:**
- 24.x (primary)
- 22.x (compatibility)

**Bun:**
- Latest (compatibility testing)

## Performance Targets

- CI runtime: < 30 minutes
- Test time: < 20 minutes
- Build time: < 10 minutes
- Docker build: < 15 minutes
- Startup memory: < 500MB

## Best Practices

### 1. Pre-Commit Checks

```bash
# Run pre-commit hooks
pre-commit run --all-files

# Format code
pnpm format

# Lint code
pnpm lint

# Type check
pnpm type-check
```

### 2. Pre-Push Checks

```bash
# Run all tests
pnpm test

# Build dist
pnpm build

# Check release
pnpm release:check
```

### 3. Test Organization

```
tests/
├── unit/         # Unit tests
├── integration/  # Integration tests
├── e2e/         # E2E tests
└── browser/     # Browser tests
```

## Further Reading

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Buildx Documentation](https://docs.docker.com/buildx/working-with-buildx/)
- [Playwright Documentation](https://playwright.dev)
- [Swift Testing Documentation](https://developer.apple.com/documentation/testing)
