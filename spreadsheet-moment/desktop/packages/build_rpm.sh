#!/bin/bash
# Build RPM Package for Spreadsheet Moment
# ==========================================

set -e

VERSION="0.1.0"
PACKAGE_NAME="spreadsheet-moment"
ARCH="x86_64"
BUILD_DIR="build/rpmbuild"
SPEC_FILE="${BUILD_DIR}/SPECS/${PACKAGE_NAME}.spec"

echo "Building RPM package for ${PACKAGE_NAME} ${VERSION}..."

# Clean previous builds
rm -rf "${BUILD_DIR}"
mkdir -p "${BUILD_DIR}"/{SPECS,SOURCES,BUILD,RPMS,SRPMS}

# Create spec file
cat > "${SPEC_FILE}" << EOF
Name:           ${PACKAGE_NAME}
Version:        ${VERSION}
Release:        1%{?dist}
Summary:        Next-generation spreadsheet with AI-powered collaboration
License:        MIT
URL:            https://spreadsheet-moment.superinstance.ai
Source0:        %{name}-%{version}.tar.gz

BuildRequires:  gcc-c++ cmake
Requires:       libgtk-3-0 libnotify4 libnsl3

%description
Spreadsheet Moment is a revolutionary spreadsheet application that combines
tensor-based computation, natural language processing, and real-time
collaboration.

%prep
%setup -q

%build
cargo build --release

%install
rm -rf %{buildroot}
mkdir -p %{buildroot}/opt/%{name}
cp -r target/release/* %{buildroot}/opt/%{name}/

mkdir -p %{buildroot}/usr/share/applications
cat > %{buildroot}/usr/share/applications/%{name}.desktop << 'DESKTOP_EOF'
[Desktop Entry]
Name=Spreadsheet Moment
Comment=AI-powered spreadsheet application
Exec=/opt/spreadsheet-moment/spreadsheet-moment
Icon=spreadsheet-moment
Type=Application
Categories=Office;Spreadsheet;
DESKTOP_EOF

mkdir -p %{buildroot}/usr/share/icons/hicolor/256x256/apps
install -m 644 assets/icon.png %{buildroot}/usr/share/icons/hicolor/256x256/apps/spreadsheet-moment.png

%files
/opt/%{name}
/usr/share/applications/%{name}.desktop
/usr/share/icons/hicolor/256x256/apps/%{name}.png

%changelog
* $(date +'%a %b %d %Y') SuperInstance <team@superinstance.ai> - ${VERSION}-1
- Initial package release
EOF

# Build source tarball
echo "Creating source tarball..."
cd ../..
tar -czf "${BUILD_DIR}/SOURCES/${PACKAGE_NAME}-${VERSION}.tar.gz" \
    --exclude=target \
    --exclude=.git \
    --exclude=build \
    desktop/

# Build RPM
echo "Building RPM package..."
cd "${BUILD_DIR}"
rpmbuild -ba "${SPEC_FILE}" \
    --define "_topdir $(pwd)" \
    --target=${ARCH}

# Copy built package to dist
mkdir -p ../../../dist
cp "RPMS/${ARCH}/${PACKAGE_NAME}-${VERSION}-1.${ARCH}.rpm" ../../../dist/

echo "RPM package built successfully!"
echo "Output: dist/${PACKAGE_NAME}-${VERSION}-1.${ARCH}.rpm"
