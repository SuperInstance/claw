#!/bin/bash
# Build AppImage for Spreadsheet Moment
# ========================================

set -e

VERSION="0.1.0"
APP_NAME="SpreadsheetMoment"
APP_FILENAME="${APP_NAME}-${VERSION}-x86_64.AppImage"
BUILD_DIR="build/appimage"
OUTPUT_DIR="dist"

echo "Building AppImage for ${APP_NAME} ${VERSION}..."

# Clean previous builds
rm -rf "${BUILD_DIR}"
mkdir -p "${BUILD_DIR}"

# Download AppImage runtime
APPIMAGETOOL_URL="https://github.com/AppImage/AppImageKit/releases/download/continuous/appimagetool-x86_64.AppImage"
APPIMAGETOOL="${BUILD_DIR}/appimagetool"

if [ ! -f "${APPIMAGETOOL}" ]; then
    echo "Downloading appimagetool..."
    wget -q "${APPIMAGETOOL_URL}" -O "${APPIMAGETOOL}"
    chmod +x "${APPIMAGETOOL}"
fi

# Create AppDir structure
APPDIR="${BUILD_DIR}/${APP_NAME}.AppDir"
mkdir -p "${APPDIR}"/{usr/bin,usr/lib,usr/share/applications,usr/share/icons}

# Build and copy application
echo "Building application..."
cd ../..
cargo build --release

# Copy binary
cp target/release/spreadsheet-moment "${APPDIR}/usr/bin/"
chmod +x "${APPDIR}/usr/bin/spreadsheet-moment"

# Copy dependencies
echo "Bundling dependencies..."
cp /usr/lib/x86_64-linux-gnu/libgtk-3.so.0 "${APPDIR}/usr/lib/" 2>/dev/null || true
cp /usr/lib/x86_64-linux-gnu/libglib-2.0.so.0 "${APPDIR}/usr/lib/" 2>/dev/null || true
cp /usr/lib/x86_64-linux-gnu/libgobject-2.0.so.0 "${APPDIR}/usr/lib/" 2>/dev/null || true
cp /usr/lib/x86_64-linux-gnu/libgio-2.0.so.0 "${APPDIR}/usr/lib/" 2>/dev/null || true

# Create desktop file
cat > "${APPDIR}/${APP_NAME}.desktop" << EOF
[Desktop Entry]
Name=Spreadsheet Moment
Comment=Next-generation spreadsheet with AI-powered collaboration
Exec=spreadsheet-moment
Icon=spreadsheet-moment
Type=Application
Categories=Office;Spreadsheet;
Terminal=false
EOF

# Copy icon
mkdir -p "${APPDIR}/usr/share/icons/hicolor/256x256/apps"
cp assets/icon.png "${APPDIR}/usr/share/icons/hicolor/256x256/apps/spreadsheet-moment.png" 2>/dev/null || true
ln -s usr/share/icons/hicolor/256x256/apps/spreadsheet-moment.png "${APPDIR}/.DirIcon"

# Create AppRun script
cat > "${APPDIR}/AppRun" << 'EOF'
#!/bin/bash
SELF=$(readlink -f "$0")
HERE=${SELF%/*}
export LD_LIBRARY_PATH=${HERE}/usr/lib:${LD_LIBRARY_PATH}
exec ${HERE}/usr/bin/spreadsheet-moment "$@"
EOF
chmod +x "${APPDIR}/AppRun"

# Build AppImage
echo "Creating AppImage..."
cd "${BUILD_DIR}"
"${APPIMAGETOOL}" "${APPDIR}" "${APP_FILENAME}"

# Move to dist
mkdir -p ../../"${OUTPUT_DIR}"
mv "${APP_FILENAME}" ../../"${OUTPUT_DIR}/"

echo "AppImage built successfully!"
echo "Output: ${OUTPUT_DIR}/${APP_FILENAME}"
