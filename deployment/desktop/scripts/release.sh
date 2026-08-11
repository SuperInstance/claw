#!/bin/bash
# Release Script - Spreadsheet Moment Desktop
# This script creates release packages for all platforms

set -e

echo "========================================"
echo "Spreadsheet Moment - Release Build"
echo "========================================"
echo ""

# Get version from package.json
VERSION=$(node -p "require('./package.json').version")
echo "Building version: $VERSION"
echo ""

# Clean previous builds
echo "Cleaning previous builds..."
rm -rf src-tauri/target/release/bundle

# Detect platform
case "$(uname -s)" in
    Darwin*)
        echo "Building for macOS..."
        npm run tauri:build -- --target x86_64-apple-darwin
        npm run tauri:build -- --target aarch64-apple-darwin
        ;;
    Linux*)
        echo "Building for Linux..."
        npm run tauri:build
        ;;
    MINGW*|MSYS*|CYGWIN*)
        echo "Building for Windows..."
        npm run tauri:build
        ;;
    *)
        echo "Unknown platform: $(uname -s)"
        exit 1
        ;;
esac

echo ""
echo "========================================"
echo "Release build completed!"
echo "Version: $VERSION"
echo "Output: src-tauri/target/release/bundle/"
echo "========================================"
