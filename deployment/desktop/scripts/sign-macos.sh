#!/bin/bash
# Code Signing Script for macOS
# This script signs the macOS application

set -e

APP_PATH="src-tauri/target/x86_64-apple-darwin/release/bundle/macos/Spreadsheet Moment.app"
IDENTITY="Developer ID Application: SuperInstance"

# Check if identity is set
if [ -z "$SPREADSHEET_MOMENT_SIGNING_IDENTITY" ]; then
    echo "ERROR: Signing identity not set"
    echo "Please set SPREADSHEET_MOMENT_SIGNING_IDENTITY environment variable"
    exit 1
fi

echo "========================================"
echo "Signing macOS Application"
echo "========================================"
echo ""

# Sign the application
codesign --force --deep --sign "$SPREADSHEET_MOMENT_SIGNING_IDENTITY" "$APP_PATH"

# Verify signature
codesign --verify --verbose "$APP_PATH"

echo ""
echo "========================================"
echo "Successfully signed application!"
echo "========================================"
