#!/bin/bash
# Build All Desktop Packages for Spreadsheet Moment
# ===================================================
#
# This script builds all Linux package formats for distribution.
#
# Supported packages:
# - Debian (.deb)
# - Red Hat (.rpm)
# - AppImage (.AppImage)
# - Flatpak (.flatpak)
#
# Usage: ./build_all.sh [package_type]
#   package_type: deb | rpm | appimage | flatpak | all (default: all)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD_TYPE="${1:-all}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_step "Checking prerequisites..."

    # Check for required tools
    local missing_tools=()

    command -v cargo >/dev/null 2>&1 || missing_tools+=("cargo (Rust)")
    command -v node >/dev/null 2>&1 || missing_tools+=("node (Node.js)")

    if [[ "$BUILD_TYPE" == "all" || "$BUILD_TYPE" == "deb" ]]; then
        command -v dpkg-deb >/dev/null 2>&1 || missing_tools+=("dpkg-deb")
    fi

    if [[ "$BUILD_TYPE" == "all" || "$BUILD_TYPE" == "rpm" ]]; then
        command -v rpmbuild >/dev/null 2>&1 || missing_tools+=("rpmbuild")
    fi

    if [[ "$BUILD_TYPE" == "all" || "$BUILD_TYPE" == "flatpak" ]]; then
        command -v flatpak >/dev/null 2>&1 || missing_tools+=("flatpak")
    fi

    if [ ${#missing_tools[@]} -gt 0 ]; then
        log_error "Missing required tools:"
        for tool in "${missing_tools[@]}"; do
            echo "  - $tool"
        done
        log_error "Please install missing tools before proceeding."
        exit 1
    fi

    log_info "All prerequisites satisfied"
}

# Build Tauri application
build_application() {
    log_step "Building Tauri application..."

    cd "${SCRIPT_DIR}/../.."

    # Install dependencies
    log_info "Installing frontend dependencies..."
    cd src && npm install && cd ..

    # Build Tauri app
    log_info "Building Tauri binary..."
    npm run tauri build

    # Verify build output
    if [ ! -f "src-tauri/target/release/spreadsheet-moment" ]; then
        log_error "Build failed - binary not found"
        exit 1
    fi

    log_info "Application built successfully"
    cd "${SCRIPT_DIR}"
}

# Build Debian package
build_deb() {
    log_step "Building Debian package (.deb)..."

    bash "${SCRIPT_DIR}/build_deb.sh"

    if [ -f "${SCRIPT_DIR}/../../dist/spreadsheet-moment_0.1.0_amd64.deb" ]; then
        log_info "✓ Debian package built successfully"
    else
        log_error "✗ Debian package build failed"
        return 1
    fi
}

# Build RPM package
build_rpm() {
    log_step "Building RPM package (.rpm)..."

    bash "${SCRIPT_DIR}/build_rpm.sh"

    if [ -f "${SCRIPT_DIR}/../../dist/spreadsheet-moment-0.1.0-1.x86_64.rpm" ]; then
        log_info "✓ RPM package built successfully"
    else
        log_error "✗ RPM package build failed"
        return 1
    fi
}

# Build AppImage
build_appimage() {
    log_step "Building AppImage (.AppImage)..."

    bash "${SCRIPT_DIR}/build_appimage.sh"

    if [ -f "${SCRIPT_DIR}/../../dist/SpreadsheetMoment-0.1.0-x86_64.AppImage" ]; then
        log_info "✓ AppImage built successfully"
    else
        log_error "✗ AppImage build failed"
        return 1
    fi
}

# Build Flatpak
build_flatpak() {
    log_step "Building Flatpak (.flatpak)..."

    bash "${SCRIPT_DIR}/build_flatpak.sh"

    if [ -f "${SCRIPT_DIR}/../../dist/ai.superinstance.SpreadsheetMoment-0.1.0-x86_64.flatpak" ]; then
        log_info "✓ Flatpak built successfully"
    else
        log_error "✗ Flatpak build failed"
        return 1
    fi
}

# Generate checksums
generate_checksums() {
    log_step "Generating package checksums..."

    cd "${SCRIPT_DIR}/../../dist"

    # Generate SHA256 checksums
    sha256sum spreadsheet-moment*.deb spreadsheet-moment*.rpm SpreadsheetMoment*.AppImage *.flatpak 2>/dev/null > SHA256SUMS || true

    log_info "✓ Checksums generated: SHA256SUMS"
    cd "${SCRIPT_DIR}"
}

# Create installation instructions
create_install_instructions() {
    log_step "Creating installation instructions..."

    cat > "${SCRIPT_DIR}/../../dist/INSTALL.md" << 'EOF'
# Spreadsheet Moment - Desktop Application

## Installation Instructions

### Debian/Ubuntu (.deb)

```bash
# Install package
sudo dpkg -i spreadsheet-moment_0.1.0_amd64.deb

# Install dependencies if needed
sudo apt-get install -f -y

# Run application
spreadsheet-moment
```

### Fedora/RHEL/CentOS (.rpm)

```bash
# Install package
sudo dnf install spreadsheet-moment-0.1.0-1.x86_64.rpm

# Or on older systems:
sudo yum install spreadsheet-moment-0.1.0-1.x86_64.rpm

# Run application
spreadsheet-moment
```

### AppImage (Universal Linux)

```bash
# Make executable
chmod +x SpreadsheetMoment-0.1.0-x86_64.AppImage

# Run application
./SpreadsheetMoment-0.1.0-x86_64.AppImage

# Optional: Install to system
sudo mv SpreadsheetMoment-0.1.0-x86_64.AppImage /usr/local/bin/spreadsheet-moment
```

### Flatpak (Universal Linux)

```bash
# Install Flatpak
flatpak install SpreadsheetMoment-0.1.0-x86_64.flatpak

# Run application
flatpak run ai.superinstance.SpreadsheetMoment
```

## Verification

Verify package integrity:
```bash
sha256sum -c SHA256SUMS
```

## Uninstall

### Debian/Ubuntu:
```bash
sudo apt remove spreadsheet-moment
```

### Fedora/RHEL/CentOS:
```bash
sudo dnf remove spreadsheet-moment
```

### Flatpak:
```bash
flatpak uninstall ai.superinstance.SpreadsheetMoment
```

### AppImage:
```bash
sudo rm /usr/local/bin/spreadsheet-moment  # If installed to system
```

## Troubleshooting

**Application won't start:**
- Ensure all dependencies are installed
- Check system logs: `journalctl -xe`
- Run with verbose mode: `spreadsheet-moment --verbose`

**Missing dependencies:**
- Debian/Ubuntu: `sudo apt-get install -f`
- Fedora: `sudo dnf install build-essential`

**Permission issues:**
- Ensure executable bit is set: `chmod +x spreadsheet-moment`
- Check file ownership: `ls -l $(which spreadsheet-moment)`

## Support

For issues and support:
- GitHub: https://github.com/SuperInstance/spreadsheet-moment
- Email: support@superinstance.ai
EOF

    log_info "✓ Installation instructions created"
}

# Main build process
main() {
    echo ""
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║   Spreadsheet Moment - Desktop Package Builder           ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo ""

    # Create dist directory
    mkdir -p "${SCRIPT_DIR}/../../dist"

    # Check prerequisites
    check_prerequisites

    # Build application
    build_application

    # Build requested packages
    case "$BUILD_TYPE" in
        deb)
            build_deb
            ;;
        rpm)
            build_rpm
            ;;
        appimage)
            build_appimage
            ;;
        flatpak)
            build_flatpak
            ;;
        all)
            log_info "Building all package formats..."
            echo ""

            build_deb
            build_rpm
            build_appimage
            build_flatpak

            echo ""
            log_info "All packages built successfully!"
            ;;
        *)
            log_error "Unknown package type: $BUILD_TYPE"
            echo "Valid types: deb, rpm, appimage, flatpak, all"
            exit 1
            ;;
    esac

    # Generate checksums and instructions
    generate_checksums
    create_install_instructions

    # Summary
    echo ""
    echo "══════════════════════════════════════════════════════════"
    echo "BUILD SUMMARY"
    echo "══════════════════════════════════════════════════════════"
    echo ""
    echo "Output directory: $(cd "${SCRIPT_DIR}/../../dist" && pwd)"
    echo ""

    # List built packages
    echo "Built packages:"
    ls -lh "${SCRIPT_DIR}/../../dist/" | grep -E '\.(deb|rpm|AppImage|flatpak)$' || true

    echo ""
    echo "Installation instructions: dist/INSTALL.md"
    echo "Checksums: dist/SHA256SUMS"
    echo ""
    echo "══════════════════════════════════════════════════════════"
}

# Run main function
main "$@"
