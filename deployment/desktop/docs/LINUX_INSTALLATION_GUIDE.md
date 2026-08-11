# Linux Installation Guide - Spreadsheet Moment Desktop

## System Requirements

### Minimum Requirements
- **Operating System**: Ubuntu 20.04 LTS, Fedora 33, or equivalent
- **Processor**: Intel Core i3 or AMD equivalent
- **Memory**: 4 GB RAM
- **Storage**: 100 MB available space
- **Graphics**: OpenGL 3.0 or higher
- **Network**: Internet connection for updates

### Recommended Requirements
- **Operating System**: Ubuntu 22.04 LTS, Fedora 38, or equivalent
- **Processor**: Intel Core i5 or AMD Ryzen 5
- **Memory**: 8 GB RAM
- **Storage**: 500 MB available space
- **Graphics**: OpenGL 4.0 or higher
- **Network**: Broadband internet connection

### Supported Distributions

#### Ubuntu/Debian
- Ubuntu 20.04, 22.04, 24.04 LTS
- Debian 11, 12
- Linux Mint 20, 21
- Pop!_OS 20.04, 22.04
- Elementary OS 6, 7

#### Fedora/RHEL
- Fedora 37, 38, 39
- RHEL 8, 9
- CentOS Stream 8, 9
- Rocky Linux 8, 9

#### Arch Linux
- Arch Linux (rolling)
- Manjaro Linux
- EndeavourOS

#### Other
- openSUSE Leap 15.5+
- Solus Linux
- Any distribution with webkit2gtk 4.0+

## Installation Methods

### Method 1: DEB Package (Ubuntu/Debian)

#### Download
```bash
# Download DEB package
wget https://github.com/SuperInstance/polln/releases/download/v1.0.0/spreadsheet-moment_1.0.0_amd64.deb

# Or using curl
curl -L -o spreadsheet-moment_1.0.0_amd64.deb https://github.com/SuperInstance/polln/releases/download/v1.0.0/spreadsheet-moment_1.0.0_amd64.deb
```

#### Install
```bash
# Install DEB package
sudo dpkg -i spreadsheet-moment_1.0.0_amd64.deb

# Fix any missing dependencies
sudo apt-get install -f
```

#### Launch
```bash
# From command line
spreadsheet-moment

# Or from desktop menu
Applications → Spreadsheet Moment
```

### Method 2: RPM Package (Fedora/RHEL)

#### Download
```bash
# Download RPM package
wget https://github.com/SuperInstance/polln/releases/download/v1.0.0/spreadsheet-moment-1.0.0-1.x86_64.rpm
```

#### Install
```bash
# Install RPM package
sudo dnf install spreadsheet-moment-1.0.0-1.x86_64.rpm

# Or using yum
sudo yum install spreadsheet-moment-1.0.0-1.x86_64.rpm

# Or using zypper (openSUSE)
sudo zypper install spreadsheet-moment-1.0.0-1.x86_64.rpm
```

#### Launch
```bash
# From command line
spreadsheet-moment

# Or from desktop menu
Applications → Spreadsheet Moment
```

### Method 3: AppImage (Universal Linux)

#### Download
```bash
# Download AppImage
wget https://github.com/SuperInstance/polln/releases/download/v1.0.0/Spreadsheet.Moment-1.0.0.amd64.AppImage
```

#### Install
```bash
# Make executable
chmod +x Spreadsheet.Moment-1.0.0.amd64.AppImage

# Move to applications directory
sudo mv Spreadsheet.Moment-1.0.0.amd64.AppImage /opt/spreadsheet-moment.AppImage

# Create symlink
sudo ln -sf /opt/spreadsheet-moment.AppImage /usr/local/bin/spreadsheet-moment
```

#### Launch
```bash
# From command line
/opt/spreadsheet-moment.AppImage

# Or using symlink
spreadsheet-moment
```

#### Create Desktop Entry
```bash
# Create .desktop file
cat > ~/.local/share/applications/spreadsheet-moment.desktop << EOF
[Desktop Entry]
Name=Spreadsheet Moment
Comment=AI-powered distributed spreadsheet platform
Exec=/opt/spreadsheet-moment.AppImage
Icon=spreadsheet-moment
Type=Application
Categories=Office;Finance;Spreadsheet;
EOF

# Update desktop database
update-desktop-database ~/.local/share/applications/
```

### Method 4: Snap Package

```bash
# Install from Snap Store
sudo snap install spreadsheet-moment

# Or download .snap file
wget https://github.com/SuperInstance/polln/releases/download/v1.0.0/spreadsheet-moment_1.0.0_amd64.snap

# Install .snap file
sudo snap install spreadsheet-moment_1.0.0_amd64.snap --dangerous
```

### Method 5: AUR Package (Arch Linux)

```bash
# Using yay (recommended)
yay -S spreadsheet-moment

# Using paru
paru -S spreadsheet-moment

# Manual installation from AUR
git clone https://aur.archlinux.org/spreadsheet-moment.git
cd spreadsheet-moment
makepkg -si
```

### Method 6: Flatpak

```bash
# Install Flatpak (if not already installed)
sudo flatpak remote-add --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo

# Install Spreadsheet Moment
flatpak install flathub ai.superinstance.SpreadsheetMoment

# Launch
flatpak run ai.superinstance.SpreadsheetMoment
```

## Dependencies

### System Libraries

#### Ubuntu/Debian
```bash
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
```

#### Fedora/RHEL
```bash
sudo dnf install -y \
    webkit2gtk3-devel \
    gcc \
    gcc-c++ \
    make \
    curl \
    wget \
    openssl-devel \
    gtk3-devel \
    libappindicator-gtk3-devel \
    librsvg2-devel
```

#### Arch Linux
```bash
sudo pacman -S --needed \
    webkit2gtk \
    base-devel \
    curl \
    wget \
    openssl \
    gtk3 \
    libappindicator-gtk3 \
    librsvg
```

## Installation Verification

### Check Installation
```bash
# Check if installed
which spreadsheet-moment

# Check version
spreadsheet-moment --version

# Check package details (Debian/Ubuntu)
dpkg -I spreadsheet-moment

# Check package details (Fedora)
rpm -qi spreadsheet-moment
```

### Test Launch
```bash
# Launch application
spreadsheet-moment

# Should launch in < 3 seconds
# Main dashboard should be visible
```

### Check Dependencies
```bash
# Check missing libraries (AppImage)
ldd /opt/spreadsheet-moment.AppImage

# Check package dependencies (DEB)
dpkg -I spreadsheet-moment_1.0.0_amd64.deb | grep Depends

# Check package dependencies (RPM)
rpm -qR spreadsheet-moment-1.0.0-1.x86_64.rpm
```

## File Associations

The application automatically associates itself with:
- `.csv` - Comma-separated values files
- `.xlsx` - Excel spreadsheet files
- `.xlsm` - Excel macro-enabled files

### Update File Associations

#### Ubuntu/Debian
```bash
# Update mime database
update-mime-database ~/.local/share/mime

# Update desktop database
update-desktop-database ~/.local/share/applications
```

#### Fedora/RHEL
```bash
# Update mime database
update-mime-database ~/.local/share/mime

# Update desktop database
update-desktop-database ~/.local/share/applications
```

### Set Default Application
```bash
# Using GUI
# Right-click file → Properties → Open With → Select Spreadsheet Moment → Set as default

# Using command line
xdg-mime default spreadsheet-moment.desktop text/csv
```

## Updates

### Automatic Updates
1. Application checks for updates on launch
2. Notification will appear when update is available
3. Click "Update Now" to install
4. Application will restart with new version

### Manual Updates

#### DEB Package
```bash
# Download new version
wget https://github.com/SuperInstance/polln/releases/download/v1.0.1/spreadsheet-moment_1.0.1_amd64.deb

# Install (will upgrade existing version)
sudo dpkg -i spreadsheet-moment_1.0.1_amd64.deb
```

#### RPM Package
```bash
# Download new version
wget https://github.com/SuperInstance/polln/releases/download/v1.0.1/spreadsheet-moment-1.0.1-1.x86_64.rpm

# Upgrade
sudo dnf upgrade spreadsheet-moment-1.0.1-1.x86_64.rpm
```

#### AppImage
```bash
# Download new version
wget https://github.com/SuperInstance/polln/releases/download/v1.0.1/Spreadsheet.Moment-1.0.1.amd64.AppImage

# Make executable
chmod +x Spreadsheet.Moment-1.0.1.amd64.AppImage

# Replace old version
sudo mv Spreadsheet.Moment-1.0.1.amd64.AppImage /opt/spreadsheet-moment.AppImage
```

#### Snap Package
```bash
# Update automatically
sudo snap refresh spreadsheet-moment

# Or manually check for updates
sudo snap refresh --list
```

## Uninstallation

### DEB Package
```bash
# Uninstall package
sudo apt-get remove spreadsheet-moment

# Remove configuration files
sudo apt-get purge spreadsheet-moment

# Remove dependencies
sudo apt-get autoremove
```

### RPM Package
```bash
# Uninstall package
sudo dnf remove spreadsheet-moment

# Or using yum
sudo yum remove spreadsheet-moment
```

### AppImage
```bash
# Remove AppImage
sudo rm /opt/spreadsheet-moment.AppImage

# Remove symlink
sudo rm /usr/local/bin/spreadsheet-moment

# Remove desktop entry
rm ~/.local/share/applications/spreadsheet-moment.desktop
```

### Snap Package
```bash
# Remove snap
sudo snap remove spreadsheet-moment

# Remove configuration
rm -rf ~/snap/spreadsheet-moment
```

### Flatpak
```bash
# Uninstall
flatpak uninstall ai.superinstance.SpreadsheetMoment

# Remove data
flatpak uninstall --delete-data ai.superinstance.SpreadsheetMoment
```

### Complete Data Removal
```bash
# Remove application data
rm -rf ~/.config/ai.superinstance.spreadsheet-moment

# Remove cache
rm -rf ~/.cache/ai.superinstance.spreadsheet-moment

# Remove documents (optional)
rm -rf ~/Documents/SpreadsheetMoment
```

## Troubleshooting

### Installation Issues

**Problem**: Package won't install
**Solution**:
```bash
# Update package lists
sudo apt-get update  # Ubuntu/Debian
sudo dnf check-update  # Fedora

# Fix broken packages
sudo apt-get --fix-broken install  # Ubuntu/Debian
sudo dnf repair  # Fedora

# Clean package cache
sudo apt-get clean && sudo apt-get autoclean  # Ubuntu/Debian
sudo dnf clean all  # Fedora
```

**Problem**: Missing dependencies
**Solution**:
```bash
# Auto-fix dependencies
sudo apt-get install -f  # Ubuntu/Debian

# Install missing libraries
sudo dnf builddep spreadsheet-moment  # Fedora
```

**Problem**: AppImage won't run
**Solution**:
```bash
# Make executable
chmod +x Spreadsheet.Moment-*.AppImage

# Extract and run directly
./Spreadsheet.Moment-*.AppImage --appimage-extract
./squashfs-root/AppRun

# Check FUSE installation
# Ubuntu/Debian
sudo apt-get install libfuse2

# Fedora
sudo dnf install fuse
```

### Application Issues

**Problem**: Application won't launch
**Solution**:
```bash
# Launch from terminal to see errors
spreadsheet-moment

# Check if process is running
ps aux | grep spreadsheet-moment

# Kill existing process
killall spreadsheet-moment

# Restart application
spreadsheet-moment
```

**Problem**: Application crashes on launch
**Solution**:
```bash
# Check crash logs
journalctl -xe | grep spreadsheet-moment

# Run with debug output
spreadsheet-moment --debug

# Check system logs
tail -f ~/.config/ai.superinstance.spreadsheet-moment/logs/*.log
```

**Problem**: Slow performance
**Solution**:
```bash
# Check resource usage
top -p $(pgrep spreadsheet-moment)

# Check disk usage
df -h

# Free up disk space
sudo apt-get clean  # Ubuntu/Debian
sudo dnf clean all  # Fedora

# Restart application
killall spreadsheet-moment && spreadsheet-moment
```

### Display Issues

**Problem**: Application looks blurry
**Solution**:
```bash
# Enable HiDPI scaling
gsettings set org.gnome.desktop.interface scaling-factor 2

# Or use environment variable
GDK_SCALE=2 spreadsheet-moment
```

**Problem**: Dark mode issues
**Solution**:
```bash
# Force dark theme
GTK_THEME=Adwaita:dark spreadsheet-moment

# Or enable system dark mode
gsettings set org.gnome.desktop.interface gtk-theme 'Adwaita-dark'
```

**Problem**: Font rendering issues
**Solution**:
```bash
# Install font packages
sudo apt-get install fonts-liberation fonts-noto-color-emoji  # Ubuntu/Debian
sudo dnf install liberation-fonts noto-color-emoji-fonts  # Fedora
```

### Integration Issues

**Problem**: File associations not working
**Solution**:
```bash
# Update mime database
update-mime-database ~/.local/share/mime

# Update desktop database
update-desktop-database ~/.local/share/applications

# Rebuild icon cache
gtk-update-icon-cache ~/.local/share/icons/
```

**Problem**: Not appearing in application menu
**Solution**:
```bash
# Verify desktop file
desktop-file-validate ~/.local/share/applications/spreadsheet-moment.desktop

# Reinstall desktop file
desktop-file-install ~/.local/share/applications/spreadsheet-moment.desktop
```

## Advanced Configuration

### Command Line Options

```bash
# Open specific file
spreadsheet-moment ~/Documents/file.csv

# Open with debug mode
spreadsheet-moment --debug

# Open with custom config
spreadsheet-moment --config ~/custom-config.json

# Open with custom data directory
spreadsheet-moment --data-dir ~/SpreadsheetData

# Show version
spreadsheet-moment --version

# Show help
spreadsheet-moment --help
```

### Environment Variables

```bash
# Force dark theme
GTK_THEME=Adwaita:dark spreadsheet-moment

# Enable HiDPI scaling
GDK_SCALE=2 spreadsheet-moment

# Enable debug logging
RUST_LOG=debug spreadsheet-moment

# Set custom cache directory
SPREADSHEET_MOMENT_CACHE_DIR=/tmp/cache spreadsheet-moment
```

### Custom Installation Locations

```bash
# Install to custom directory
sudo dpkg -i spreadsheet-moment_1.0.0_amd64.deb --instdir=/opt/spreadsheet-moment

# Or create symlink
sudo ln -sf /usr/bin/spreadsheet-moment /usr/local/bin/sm
```

## Performance Optimization

### Reduce Memory Usage
1. Close unused documents
2. Limit recent documents history
3. Disable animations in settings
4. Restart application periodically

### Improve Performance
```bash
# Use performance governor
sudo cpupower frequency-set -g performance

# Increase swap space (if needed)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### Monitor Performance
```bash
# Check memory usage
ps aux | grep spreadsheet-moment

# Monitor CPU usage
top -p $(pgrep spreadsheet-moment)

# Check disk I/O
iotop -p $(pgrep spreadsheet-moment)

# Profile application
perf record -g $(pgrep spreadsheet-moment)
perf report
```

## Keyboard Shortcuts

### Application Shortcuts
- `Ctrl + N`: New document
- `Ctrl + O`: Open document
- `Ctrl + S`: Save document
- `Ctrl + W`: Close document
- `Ctrl + Q`: Quit application
- `Ctrl + ,`: Open settings

### Linux System Shortcuts
- `Alt + Tab`: Switch applications
- `Alt + F4`: Close window
- `Super + Arrow`: Maximize/minimize
- `Ctrl + Alt + Esc`: Force quit

## Security & Permissions

### Sandbox (Flatpak)
- Isolated from host system
- Limited filesystem access
- Network access for updates
- No access to sensitive files

### Permissions
- **File System**: User-selected files only
- **Network**: For updates only
- **Notifications**: System notifications
- **Settings**: User preferences

### Security Tips
```bash
# Verify package signature
gpg --verify spreadsheet-moment_1.0.0_amd64.deb.sig

# Check package integrity
sha256sum spreadsheet-moment_1.0.0_amd64.deb

# Run with firejail (sandbox)
firejail spreadsheet-moment
```

## Getting Help

### Documentation
- **Website**: https://docs.superinstance.ai
- **Wiki**: https://github.com/SuperInstance/polln/wiki
- **Man Page**: `man spreadsheet-moment`

### Community
- **Discord**: https://discord.gg/superinstance
- **Reddit**: r/SuperInstance
- **Twitter**: @SuperInstanceAI

### Support
- **Email**: support@superinstance.ai
- **Issues**: https://github.com/SuperInstance/polln/issues
- **FAQ**: https://superinstance.ai/faq

### Debug Information
```bash
# Generate debug report
spreadsheet-moment --debug > debug-report.txt 2>&1

# Collect system information
uname -a > system-info.txt
lsb_release -a >> system-info.txt
dpkg -l > packages.txt

# Send to support
email -s "Spreadsheet Moment Issue" support@superinstance.ai < debug-report.txt
```

## Next Steps

After successful installation:
1. Read the [User Guide](https://docs.superinstance.ai/user-guide)
2. Watch the [Video Tutorial](https://www.youtube.com/watch?v=example)
3. Join the [Community Discord](https://discord.gg/superinstance)
4. Explore [Sample Spreadsheets](https://github.com/SuperInstance/polln/tree/main/examples)

## Beta Testing

Join our beta program:
1. Join [Discord](https://discord.gg/superinstance)
2. Sign up for beta in #beta-testing
3. Get early access to new features
4. Provide feedback and bug reports

---

**Version**: 1.0.0
**Last Updated**: 2025-03-15
**Platform**: Linux (All major distributions)

**Supported Formats**: DEB, RPM, AppImage, Snap, Flatpak, AUR

---

**Need Help?** Contact us at support@superinstance.ai
