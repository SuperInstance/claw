#!/bin/bash
# Build Script for macOS - Spreadsheet Moment Desktop
# This script builds the desktop application for macOS

set -e

echo "========================================"
echo "Spreadsheet Moment - macOS Build"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed"
    exit 1
fi

# Check if Rust is installed
if ! command -v cargo &> /dev/null; then
    echo "ERROR: Rust is not installed"
    echo "Please install Rust from https://rustup.rs/"
    exit 1
fi

# Check for xcodebuild
if ! command -v xcodebuild &> /dev/null; then
    echo "ERROR: Xcode command line tools are not installed"
    echo "Run: xcode-select --install"
    exit 1
fi

echo "Installing dependencies..."
npm install

echo ""
echo "Building for macOS (x86_64)..."
npm run tauri:build -- --target x86_64-apple-darwin

echo ""
echo "========================================"
echo "Build completed successfully!"
echo "Output: src-tauri/target/x86_64-apple-darwin/release/bundle/"
echo "========================================"
