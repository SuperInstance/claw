#!/bin/bash
# Build Debian Package for Spreadsheet Moment
# ==============================================

set -e

VERSION="0.1.0"
PACKAGE_NAME="spreadsheet-moment"
ARCH="amd64"
BUILD_DIR="build/deb"
OUTPUT_DIR="dist"

echo "Building Debian package for ${PACKAGE_NAME} ${VERSION}..."

# Clean previous builds
rm -rf "${BUILD_DIR}"
mkdir -p "${BUILD_DIR}"

# Create Debian package structure
mkdir -p "${BUILD_DIR}/${PACKAGE_NAME}_${VERSION}/${ARCH}"
cd "${BUILD_DIR}/${PACKAGE_NAME}_${VERSION}/${ARCH}"

# Create directory structure
mkdir -p opt/spreadsheet-moment
mkdir -p usr/share/applications
mkdir -p usr/share/icons/hicolor/256x256/apps
mkdir -p DEBIAN

# Copy application files
cp -r ../../../../../target/release/bundle/deb/*/data/opt/* opt/
cp -r ../../../../../target/release/bundle/deb/*/data/usr/* usr/ 2>/dev/null || true

# Create post-install script
cat > DEBIAN/postinst <<'EOF'
#!/bin/bash
set -e

# Update desktop database
if command -v update-desktop-database >/dev/null 2>&1; then
    update-desktop-database -q /usr/share/applications || true
fi

# Update icon cache
if command -v gtk-update-icon-cache >/dev/null 2>&1; then
    gtk-update-icon-cache -q -t -f /usr/share/icons/hicolor || true
fi

exit 0
EOF

# Create pre-remove script
cat > DEBIAN/prerm <<'EOF'
#!/bin/bash
set -e

exit 0
EOF

# Create post-remove script
cat > DEBIAN/postrm <<'EOF'
#!/bin/bash
set -e

# Update desktop database
if command -v update-desktop-database >/dev/null 2>&1; then
    update-desktop-database -q /usr/share/applications || true
fi

exit 0
EOF

chmod +x DEBIAN/postinst DEBIAN/prerm DEBIAN/postrm

# Calculate installed size
INSTALLED_SIZE=$(du -sk opt | awk '{print $1}')
echo "Installed-Size: ${INSTALLED_SIZE}" >> DEBIAN/control

# Build the package
cd ../../..
dpkg-deb --build "${PACKAGE_NAME}_${VERSION}/${ARCH}" "${OUTPUT_DIR}/"

echo "Debian package built successfully!"
echo "Output: ${OUTPUT_DIR}/${PACKAGE_NAME}_${VERSION}_${ARCH}.deb"
