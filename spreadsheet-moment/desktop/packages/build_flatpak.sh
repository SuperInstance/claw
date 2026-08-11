#!/bin/bash
# Build Flatpak for Spreadsheet Moment
# ======================================

set -e

VERSION="0.1.0"
APP_ID="ai.superinstance.SpreadsheetMoment"
BUILD_DIR="build/flatpak"
OUTPUT_DIR="dist"

echo "Building Flatpak for ${APP_ID} ${VERSION}..."

# Clean previous builds
rm -rf "${BUILD_DIR}"
mkdir -p "${BUILD_DIR}"

# Create Flatpak manifest
cat > "${BUILD_DIR}/${APP_ID}.json" << EOF
{
    "app-id": "${APP_ID}",
    "runtime": "org.freedesktop.Platform",
    "runtime-version": "23.08",
    "sdk": "org.freedesktop.Sdk",
    "command": "spreadsheet-moment",
    "finish-args": [
        "--share=ipc",
        "--socket=x11",
        "--socket=fallback-x11",
        "--share=network",
        "--device=dri",
        "--filesystem=home:rw",
        "--talk-name=org.freedesktop.Notifications"
    ],
    "modules": [
        {
            "name": "spreadsheet-moment",
            "buildsystem": "simple",
            "build-commands": [
                "install -Dm755 spreadsheet-moment /app/bin/spreadsheet-moment",
                "install -Dm644 assets/icon.png /app/share/icons/hicolor/256x256/apps/${APP_ID}.png",
                "install -Dm644 ${APP_ID}.desktop /app/share/applications/${APP_ID}.desktop"
            ],
            "sources": [
                {
                    "type": "dir",
                    "path": "../../"
                }
            ]
        }
    ]
}
EOF

# Create desktop file
cat > "${BUILD_DIR}/${APP_ID}.desktop" << EOF
[Desktop Entry]
Name=Spreadsheet Moment
Comment=Next-generation spreadsheet with AI-powered collaboration
Exec=spreadsheet-moment
Icon=${APP_ID}
Type=Application
Categories=Office;Spreadsheet;
Terminal=false
StartupNotify=true
EOF

# Install Flatpak if not present
if ! command -v flatpak >/dev/null 2>&1; then
    echo "Flatpak not found. Installing..."
    sudo apt install -y flatpak flatpak-builder
    flatpak remote-add --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo
fi

# Build Flatpak
echo "Building Flatpak package..."
cd "${BUILD_DIR}"
flatpak-builder --force-clean --repo=repo build-dir "${APP_ID}.json"

# Create bundle
flatpak build-bundle repo "../${OUTPUT_DIR}/${APP_ID}-${VERSION}-x86_64.flatpak" "${APP_ID}"

echo "Flatpak built successfully!"
echo "Output: ${OUTPUT_DIR}/${APP_ID}-${VERSION}-x86_64.flatpak"
echo ""
echo "To install:"
echo "  flatpak install ${OUTPUT_DIR}/${APP_ID}-${VERSION}-x86_64.flatpak"
echo ""
echo "To run:"
echo "  flatpak run ${APP_ID}"
