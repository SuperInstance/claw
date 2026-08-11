#!/bin/bash
# Build Script for Linux - Spreadsheet Moment Desktop
# This script builds the desktop application for Linux

set -e

echo "========================================"
echo "Spreadsheet Moment - Linux Build"
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

# Install system dependencies
echo "Installing system dependencies..."
sudo apt-get update
sudo apt-get install -y \
    libwebkit2gtk-4.0-dev \
    build-essential \
    curl \
    wget \
    file \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev

echo "Installing dependencies..."
npm install

echo ""
echo "Building for Linux (x86_64)..."
npm run tauri:build

echo ""
echo "========================================"
echo "Build completed successfully!"
echo "Output: src-tauri/target/release/bundle/"
echo "========================================"
