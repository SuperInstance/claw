# macOS Installation Guide - Spreadsheet Moment Desktop

## System Requirements

### Minimum Requirements
- **Operating System**: macOS 10.13 High Sierra or later
- **Processor**: Intel Core i3 or Apple M1
- **Memory**: 4 GB RAM
- **Storage**: 100 MB available space
- **Network**: Internet connection for updates

### Recommended Requirements
- **Operating System**: macOS 14 Sonoma or later
- **Processor**: Intel Core i5 or Apple M1/M2/M3
- **Memory**: 8 GB RAM
- **Storage**: 500 MB available space
- **Network**: Broadband internet connection

### Architecture Support
- **Intel Macs**: Download `x86_64` version
- **Apple Silicon Macs**: Download `aarch64` version
- **Universal Binary**: Coming soon

## Installation Methods

### Method 1: DMG Installer (Recommended)

#### Step 1: Download
1. Visit the official website: https://superinstance.ai/spreadsheet-moment
2. Click "Download for macOS"
3. Select your architecture:
   - **Intel Macs**: `Spreadsheet-Moment-1.0.0-x86_64.dmg`
   - **Apple Silicon**: `Spreadsheet-Moment-1.0.0-arm64.dmg`
4. Save to your Downloads folder

#### Step 2: Verify Download (Recommended)
```bash
# Calculate checksum
shasum -a 256 ~/Downloads/Spreadsheet-Moment-*.dmg

# Compare with published checksum on website
```

#### Step 3: Install
1. Double-click the DMG file to mount it
2. A window will appear with the application icon
3. Drag "Spreadsheet Moment" to the "Applications" folder
4. Wait for copy to complete (~5 seconds)
5. Eject the DMG (drag to trash or right-click → Eject)

#### Step 4: First Launch
1. Open Applications folder
2. Double-click "Spreadsheet Moment"
3. If Gatekeeper warning appears:
   - **First time**: Right-click → Open → Open
   - **Or**: Go to System Preferences → Security & Privacy → "Open Anyway"
4. Application will launch and check for updates

### Method 2: Homebrew Cask (Recommended for Developers)

```bash
# Install Homebrew (if not already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Spreadsheet Moment
brew install --cask spreadsheet-moment

# Launch
open -a "Spreadsheet Moment"
```

### Method 3: Mac App Store (Coming Soon)

1. Open App Store
2. Search for "Spreadsheet Moment"
3. Click "Get" or "Download"
4. Launch from Launchpad or Applications

## Installation Verification

### Check Installation
1. Open Applications folder in Finder
2. Find "Spreadsheet Moment"
3. Right-click → Get Info
4. Verify version: 1.0.0 or higher

### Test Launch
1. Double-click application icon
2. Application should launch in < 3 seconds
3. Should appear in Menu Bar and Dock
4. Main dashboard should be visible

## File Associations

The application automatically associates itself with:
- `.csv` - Comma-separated values files
- `.xlsx` - Excel spreadsheet files
- `.xlsm` - Excel macro-enabled files

### Open Files from Finder
1. Right-click any supported file
2. Select "Open With" → "Spreadsheet Moment"
3. Or double-click (if set as default)

### Set as Default Application
1. Right-click any supported file
2. Select "Get Info"
3. Expand "Open with:"
4. Select "Spreadsheet Moment"
5. Click "Change All..."
6. Confirm the change

## Updates

### Automatic Updates (Recommended)
1. Application checks for updates on launch
2. Notification will appear when update is available
3. Click "Update Now" to install
4. Application will restart with new version

### Manual Updates
1. Download latest DMG from website
2. Open DMG and drag to Applications folder
3. Click "Replace" when prompted
4. Your documents and settings will be preserved

### Update from Terminal
```bash
# Using Homebrew
brew upgrade --cask spreadsheet-moment

# Check current version
brew info --cask spreadsheet-moment
```

## Uninstallation

### Standard Uninstall
1. Quit the application (right-click Dock icon → Quit)
2. Open Applications folder
3. Drag "Spreadsheet Moment" to Trash
4. Empty Trash

### Complete Uninstall (Remove All Data)
```bash
# Remove application
rm -rf /Applications/Spreadsheet\ Moment.app

# Remove application data
rm -rf ~/Library/Application\ Support/ai.superinstance.spreadsheet-moment

# Remove preferences
rm -rf ~/Library/Preferences/ai.superinstance.spreadsheet-moment.plist

# Remove cache
rm -rf ~/Library/Caches/ai.superinstance.spreadsheet-moment

# Remove application support files
rm -rf ~/Library/Application\ Support/Spreadsheet\ Moment
```

### Remove from Dock
1. Right-click application icon in Dock
2. Select "Options" → "Remove from Dock"

## Troubleshooting

### Installation Issues

**Problem**: DMG won't open
**Solution**:
1. Verify download completed fully
2. Check SHA256 checksum
3. Re-download the DMG file
4. Try using a different browser

**Problem**: "Application is damaged and can't be opened"
**Solution**:
1. This means the app is from an unidentified developer
2. Right-click app → Open → Open
3. Or: System Preferences → Security & Privacy → "Open Anyway"
4. Or: Install from Homebrew for signed version

**Problem**: "The application cannot be opened for an unexpected reason"
**Solution**:
1. Update macOS to latest version
2. Check macOS compatibility (10.13+)
3. Try the other architecture version
4. Contact support for assistance

### Application Issues

**Problem**: Application won't launch
**Solution**:
1. Check Activity Monitor for running processes
2. Force quit if necessary: Option + Command + Esc
3. Restart the application
4. Restart your Mac
5. Check Console.app for crash logs

**Problem**: Application crashes on launch
**Solution**:
1. Update macOS to latest version
2. Delete application data and relaunch
3. Check Console.app for error messages
4. Run in safe mode and try again
5. Contact support with crash logs

**Problem**: Slow performance
**Solution**:
1. Close other applications
2. Check Activity Monitor for resource usage
3. Free up disk space (at least 10 GB)
4. Restart your Mac
5. Check for macOS updates

### Gatekeeper Issues

**Problem**: Can't bypass Gatekeeper
**Solution**:
```bash
# Disable Gatekeeper temporarily (not recommended)
sudo spctl --master-disable

# Install the application

# Re-enable Gatekeeper
sudo spctl --master-enable

# Or: Allow specific app
sudo xattr -rd com.apple.quarantine /Applications/Spreadsheet\ Moment.app
```

**Problem**: App quarantine won't clear
**Solution**:
```bash
# Remove quarantine attribute
sudo xattr -cr /Applications/Spreadsheet\ Moment.app

# Re-sign the app (if you have developer tools)
codesign --force --deep --sign - /Applications/Spreadsheet\ Moment.app
```

### Update Issues

**Problem**: Updates won't download
**Solution**:
1. Check internet connection
2. Disable VPN or proxy
3. Clear application cache
4. Manually download from website
5. Check GitHub status page

**Problem**: Update installation fails
**Solution**:
1. Download latest DMG from website
2. Drag to Applications folder
3. Click "Replace" when prompted
4. Your documents will be preserved

## Advanced Configuration

### Command Line Usage

```bash
# Open application
open -a "Spreadsheet Moment"

# Open specific file
open -a "Spreadsheet Moment" ~/Documents/file.csv

# Open with debug mode
/Applications/Spreadsheet\ Moment.app/Contents/MacOS/spreadsheet-moment --debug

# View application bundle
ls -la /Applications/Spreadsheet\ Moment.app/Contents/
```

### Custom Configuration

```bash
# Custom config location
/Applications/Spreadsheet\ Moment.app/Contents/MacOS/spreadsheet-moment --config ~/custom-config.json

# Custom data directory
/Applications/Spreadsheet\ Moment.app/Contents/MacOS/spreadsheet-moment --data-dir ~/SpreadsheetData
```

### Integration with macOS

### Spotlight Integration
1. Application automatically integrates with Spotlight
2. Press `Command + Space`
3. Type "Spreadsheet Moment"
4. Press Enter to launch

### Touch Bar Support (MacBook Pro)
- Touch Bar support coming in v1.1
- Will include quick actions and formatting tools

### Notification Center
1. System notifications for:
   - Available updates
   - Document operations
   - Background tasks
2. Customize in System Preferences → Notifications

### Accessibility
1. VoiceOver support
2. Full keyboard navigation
3. High contrast mode support
4. Zoom text support

## Security & Privacy

### Code Signing & Notarization

**Production Release**:
- Code signed with Developer ID Application
- Notarized by Apple
- No Gatekeeper warnings

**Development Build**:
- Unsigned or self-signed
- May trigger Gatekeeper warnings
- Use "Right-click → Open" to launch

### Permissions

**File System**: Access to user-selected files
**Network**: For updates only
**Notifications**: System notifications
**Accessibility**: Full keyboard navigation

### Data Storage
- **Location**: `~/Library/Application Support/ai.superinstance.spreadsheet-moment/`
- **Content**: User preferences, recent documents, cache
- **Encryption**: Not encrypted (local storage only)
- **Sync**: None (local only, cloud sync planned)

### Privacy
- **No telemetry**: No data collection
- **No tracking**: No usage analytics
- **Local-first**: All data stored locally
- **Open source**: Code available for audit

## Performance Optimization

### Reduce Memory Usage
1. Close unused documents
2. Limit recent documents history
3. Disable animations (Settings)
4. Restart application periodically

### Improve Performance
1. Install on SSD (not HDD)
2. Keep at least 10 GB free space
3. Update macOS regularly
4. Close other applications
5. Increase RAM if < 8 GB

### Monitor Performance
```bash
# Check memory usage
ps aux | grep -i spreadsheet

# Monitor CPU usage
top -pid $(pgrep spreadsheet-moment)

# Check disk usage
du -sh ~/Library/Application\ Support/ai.superinstance.spreadsheet-moment
```

## Keyboard Shortcuts

### Application Shortcuts
- `Cmd + N`: New document
- `Cmd + O`: Open document
- `Cmd + S`: Save document
- `Cmd + W`: Close document
- `Cmd + Q`: Quit application
- `Cmd + ,`: Open settings

### macOS System Shortcuts
- `Cmd + Tab`: Switch applications
- `Cmd + H`: Hide application
- `Cmd + M`: Minimize window
- `Cmd + Option + Esc`: Force quit

## Getting Help

### Documentation
- **Website**: https://docs.superinstance.ai
- **Wiki**: https://github.com/SuperInstance/polln/wiki
- **API Docs**: https://api.superinstance.ai

### Community
- **Discord**: https://discord.gg/superinstance
- **Reddit**: r/SuperInstance
- **Twitter**: @SuperInstanceAI

### Support
- **Email**: support@superinstance.ai
- **Issues**: https://github.com/SuperInstance/polln/issues
- **FAQ**: https://superinstance.ai/faq

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
**Platform**: macOS 10.13+

**Supported Architectures**: Intel (x86_64), Apple Silicon (aarch64)

---

**Need Help?** Contact us at support@superinstance.ai
