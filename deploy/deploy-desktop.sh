#!/bin/bash
# Spreadsheet Moment - Desktop Application Release
# Creates and publishes desktop application releases

set -euo pipefail

# Color codes
readonly GREEN='\033[0;32m'
readonly BLUE='\033[0;34m'
readonly YELLOW='\033[1;33m'
readonly RED='\033[0;31m'
readonly NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Configuration
VERSION="${VERSION:-$(git describe --tags --always 2>/dev/null || echo 'v0.0.1')}"
GITHUB_REPO="${GITHUB_REPO:-}"
RELEASE_NOTES="${RELEASE_NOTES:-}"

echo -e "${BLUE}Creating Desktop Application Release${NC}"
echo ""

cd "$PROJECT_ROOT"

# Build desktop apps
echo -e "${YELLOW}Building desktop applications...${NC}"
if ! bash build/build-desktop.sh; then
    echo -e "${RED}Desktop build failed!${NC}"
    exit 1
fi

# Find built applications
DIST_DIR="${PROJECT_ROOT}/dist"
RELEASE_DIR="${DIST_DIR}/release-${VERSION}"
mkdir -p "$RELEASE_DIR"

# Gather release artifacts
echo -e "${YELLOW}Gathering release artifacts...${NC}"

# Electron apps
find "$DIST_DIR/electron" -type f \( -name "*.dmg" -o -name "*.exe" -o -name "*.AppImage" -o -name "*.deb" -o -name "*.rpm" \) -exec cp {} "$RELEASE_DIR/" \;

# Tauri apps
find "$DIST_DIR/tauri" -type f \( -name "*.dmg" -o -name "*.exe" -o -name "*.AppImage" \) -exec cp {} "$RELEASE_DIR/" \;

# Generate checksums
echo -e "${YELLOW}Generating checksums...${NC}"
cd "$RELEASE_DIR"
if command -v shasum &> /dev/null; then
    find . -type f -exec shasum -a 256 {} \; > checksums.txt
elif command -v sha256sum &> /dev/null; then
    find . -type f -exec sha256sum {} \; > checksums.txt
fi

# Create release if GitHub repo is set
if [ -n "$GITHUB_REPO" ] && command -v gh &> /dev/null; then
    echo -e "${YELLOW}Creating GitHub release...${NC}"

    # Create release notes if not provided
    if [ -z "$RELEASE_NOTES" ]; then
        RELEASE_NOTES="Release $VERSION

Built on: $(date)
Commit: $(git rev-parse --short HEAD)
"
    fi

    # Create release
    gh release create "$VERSION" \
        --title "Spreadsheet Moment $VERSION" \
        --notes "$RELEASE_NOTES" \
        "$RELEASE_DIR"/*

    echo -e "${GREEN}GitHub release created!${NC}"
fi

# Display release contents
echo ""
echo -e "${BLUE}Release Contents:${NC}"
ls -lh "$RELEASE_DIR"

echo ""
echo -e "${GREEN}Desktop release complete!${NC}"
echo "Release location: $RELEASE_DIR"
