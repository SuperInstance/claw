# Desktop Application Deployment Guide

## Prerequisites for Deployment

### Required Tools

1. **Node.js 18+** with npm 9+
2. **Rust 1.70+** with Cargo
3. **Platform-specific tools**:
   - Windows: Visual Studio Build Tools
   - macOS: Xcode Command Line Tools
   - Linux: webkit2gtk development headers

### Code Signing Certificates

#### Windows
- Purchase code signing certificate from DigiCert, Sectigo, or similar
- Install certificate in Windows Certificate Store
- Export certificate thumbprint

#### macOS
- Join Apple Developer Program ($99/year)
- Create Developer ID Application certificate
- Set up notarization credentials

## Development Build

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run tauri:dev
```

### Development Build (No Optimizations)

```bash
npm run tauri:build -- --debug
```

Output: `src-tauri/target/debug/`

## Production Build

### Quick Build (Current Platform)

```bash
npm run tauri:build
```

### Platform-Specific Builds

#### Windows

```bash
# x86_64 (64-bit)
npm run build:windows

# Output: src-tauri/target/x86_64-pc-windows-msvc/release/bundle/
```

#### macOS

```bash
# Intel Macs
npm run build:macos

# Apple Silicon
npm run build:macos:arm

# Universal (both architectures)
npm run build:macos && npm run build:macos:arm
# Then use lipo to create universal binary
```

#### Linux

```bash
# Ubuntu/Debian
npm run build:linux

# Output: src-tauri/target/x86_64-unknown-linux-gnu/release/bundle/
```

## Code Signing

### Windows Code Signing

1. Set environment variable:
```powershell
$env:SPREADSHEET_MOMENT_CERT_THUMBPRINT = "YOUR_CERT_THUMBPRINT"
```

2. Sign executable:
```bash
npm run sign:windows
```

3. Verify signature:
```powershell
signtool verify /pa "Spreadsheet Moment.exe"
```

### macOS Code Signing

1. Set environment variable:
```bash
export SPREADSHEET_MOMENT_SIGNING_IDENTITY="Developer ID Application: Your Name (TEAM_ID)"
```

2. Sign application:
```bash
npm run sign:macos
```

3. Verify signature:
```bash
codesign --verify --verbose "Spreadsheet Moment.app"
```

### macOS Notarization

1. Set environment variables:
```bash
export APPLE_ID="your-apple-id@example.com"
export APPLE_APP_SPECIFIC_PASSWORD="your-app-specific-password"
export APPLE_TEAM_ID="your-team-id"
```

2. Notarize application:
```bash
npm run notarize:macos
```

3. Staple ticket:
```bash
xcrun stapler staple "Spreadsheet Moment.app"
```

## Automated Builds (CI/CD)

### GitHub Actions

The project includes GitHub Actions workflows for automated builds:

1. **`.github/workflows/build.yml`**: Builds for all platforms
2. **`.github/workflows/notarize-macos.yml`**: Notarizes macOS builds

#### Required Secrets

Set these in GitHub repository settings:

```
APPLE_CERTIFICATES_P12
APPLE_CERTIFICATES_PASSWORD
APPLE_SIGNING_IDENTITY
APPLE_ID
APPLE_APP_SPECIFIC_PASSWORD
APPLE_TEAM_ID
SPREADSHEET_MOMENT_CERT_THUMBPRINT (Windows)
```

#### Triggering Builds

- On push to `main` or `develop`
- On tag push (`v*`)
- Manual workflow dispatch

### Release Process

1. Update version in `package.json`
2. Commit changes
3. Create and push tag:
```bash
git tag v1.0.0
git push origin v1.0.0
```

4. GitHub Actions will:
   - Build for all platforms
   - Sign executables
   - Notarize macOS builds
   - Create GitHub Release
   - Upload artifacts

## Distribution

### Manual Distribution

1. **Build** application for target platform
2. **Sign** with appropriate certificates
3. **Test** installation and functionality
4. **Distribute** via chosen channel

### Distribution Channels

#### Direct Download

Host installers on:
- GitHub Releases
- Website (https://superinstance.ai/spreadsheet-moment)
- CDN for faster downloads

#### Package Managers

**Windows (Chocolatey)**:
```powershell
choco pack spreadsheet-moment.nuspec
choco push spreadsheet-moment.1.0.0.nupkg
```

**macOS (Homebrew)**:
```bash
brew create --set-name spreadsheet-moment --set-version 1.0.0 ./Spreadsheet Moment.dmg
brew audit spreadsheet-moment.rb
brew publish spreadsheet-moment.rb
```

**Linux (Snap)**:
```bash
snapcraft
snapcraft upload spreadsheet-moment_1.0.0_amd64.snap
```

#### Microsoft Store

1. Create developer account
2. Submit app for certification
3. Upload packages
4. Pass store certification

#### Mac App Store

1. Create developer account
2. Prepare app for sandbox
3. Submit for review
4. Pass App Store review

## Auto-Update Configuration

### Update Server

Host update manifests and packages:

```
https://updates.superinstance.ai/spreadsheet-moment/
├── latest.json
├── v1.0.0/
│   ├── windows-x86_64-setup.exe
│   ├── macos-x86_64.dmg
│   └── linux-amd64.deb
└── v1.0.1/
    └── ...
```

### Update Manifest Format

`latest.json`:
```json
{
  "version": "1.0.1",
  "notes": "Bug fixes and improvements",
  "pub_date": "2024-03-14T00:00:00Z",
  "platforms": {
    "windows-x86_64": {
      "signature": "dW50cnVzdGVk...",
      "url": "https://updates.superinstance.ai/spreadsheet-moment/v1.0.1/windows-x86_64-setup.exe"
    },
    "darwin-x86_64": {
      "signature": "dW50cnVzdGVk...",
      "url": "https://updates.superinstance.ai/spreadsheet-moment/v1.0.1/macos-x86_64.dmg"
    },
    "linux-x86_64": {
      "signature": "dW50cnVzdGVk...",
      "url": "https://updates.superinstance.ai/spreadsheet-moment/v1.0.1/linux-amd64.deb"
    }
  }
}
```

## Monitoring and Analytics

### Telemetry

Optionally collect:
- Version information
- Platform information
- Error reports
- Usage statistics

### Crash Reporting

Integrate crash reporting:
- Sentry (Rust + JavaScript)
- Bugsnag
- Rollbar

## Rollback Plan

If critical issues are found:

1. **Revert** to previous version
2. **Disable** auto-update for affected version
3. **Notify** users of known issues
4. **Release** hotfix

## Security Considerations

### Supply Chain Security

- **Verify** all dependencies
- **Pin** dependency versions
- **Audit** dependencies regularly
- **Use** SLSA provenance

### Vulnerability Scanning

```bash
# Scan Node.js dependencies
npm audit

# Scan Rust dependencies
cargo audit

# Scan Docker images (if using)
trivy image spreadsheet-moment:latest
```

### Best Practices

- Keep dependencies updated
- Follow principle of least privilege
- Implement secure update mechanism
- Test updates thoroughly before release

## Troubleshooting

### Build Failures

**Windows**:
- Check Visual Studio Build Tools installation
- Verify Rust toolchain
- Check PATH environment variable

**macOS**:
- Install Xcode Command Line Tools
- Accept Xcode license
- Check code signing certificate

**Linux**:
- Install webkit2gtk dependencies
- Check library versions
- Verify GTK 3 development headers

### Signing Failures

**Windows**:
- Verify certificate thumbprint
- Check certificate validity
- Ensure timestamp server is accessible

**macOS**:
- Verify developer certificate
- Check Apple Developer account status
- Ensure correct Team ID

### Notarization Failures

- Verify Apple ID credentials
- Check app-specific password
- Ensure Team ID is correct
- Check app bundle for issues

## Support

For deployment issues:
- Documentation: https://docs.superinstance.ai
- GitHub Issues: https://github.com/SuperInstance/polln/issues
- Discord: https://discord.gg/superinstance
- Email: support@superinstance.ai
