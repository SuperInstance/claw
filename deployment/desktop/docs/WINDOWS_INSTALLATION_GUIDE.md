# Windows Installation Guide - Spreadsheet Moment Desktop

## System Requirements

### Minimum Requirements
- **Operating System**: Windows 10 (64-bit) or later
- **Processor**: Intel Core i3 or equivalent
- **Memory**: 4 GB RAM
- **Storage**: 100 MB available space
- **Network**: Internet connection for updates

### Recommended Requirements
- **Operating System**: Windows 11 (64-bit)
- **Processor**: Intel Core i5 or equivalent
- **Memory**: 8 GB RAM
- **Storage**: 500 MB available space
- **Network**: Broadband internet connection

## Installation Methods

### Method 1: Official Installer (Recommended)

#### Step 1: Download
1. Visit the official website: https://superinstance.ai/spreadsheet-moment
2. Click the "Download for Windows" button
3. Save `Spreadsheet-Moment-Setup.exe` to your Downloads folder

#### Step 2: Install
1. Double-click `Spreadsheet-Moment-Setup.exe`
2. If Windows SmartScreen appears, click "More info" → "Run anyway"
3. Select installation language
4. Choose installation directory (default: `C:\Program Files\Spreadsheet Moment`)
5. Select additional options:
   - Create desktop shortcut (recommended)
   - Create Start Menu shortcut (recommended)
   - Auto-start on login (optional)
6. Click "Install"
7. Wait for installation to complete (~30 seconds)
8. Click "Finish" to launch the application

#### Step 3: First Launch
1. The application will launch automatically after installation
2. If Windows Firewall prompts, allow network access (for updates)
3. The application will check for updates on first launch

### Method 2: Microsoft Store (Coming Soon)

1. Open Microsoft Store
2. Search for "Spreadsheet Moment"
3. Click "Get" or "Install"
4. Wait for download and installation
5. Launch from Start Menu

### Method 3: Chocolatey Package Manager

```powershell
# Install Chocolatey (if not already installed)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install Spreadsheet Moment
choco install spreadsheet-moment
```

## Installation Verification

### Check Installation
1. Press `Win + X` and select "Apps and Features"
2. Search for "Spreadsheet Moment"
3. Verify version: 1.0.0 or higher

### Test Launch
1. Double-click desktop shortcut or find in Start Menu
2. Application should launch in < 3 seconds
3. You should see the main dashboard

## File Associations

The application automatically associates itself with:
- `.csv` - Comma-separated values files
- `.xlsx` - Excel spreadsheet files
- `.xlsm` - Excel macro-enabled files

To open a file with Spreadsheet Moment:
1. Right-click any supported file
2. Select "Open with" → "Spreadsheet Moment"

## Uninstallation

### Standard Uninstall
1. Press `Win + X` and select "Apps and Features"
2. Search for "Spreadsheet Moment"
3. Click "Uninstall"
4. Confirm uninstallation
5. Application will be removed from your system

### Manual Cleanup (Optional)
After uninstall, you may want to remove user data:
```powershell
# Remove application data
Remove-Item -Path "$env:APPDATA\ai.superinstance.spreadsheet-moment" -Recurse -Force

# Remove documents (optional)
Remove-Item -Path "$env:USERPROFILE\Documents\Spreadsheet Moment" -Recurse -Force
```

## Troubleshooting

### Installation Fails

**Problem**: Installer won't run
**Solution**:
1. Right-click installer → "Run as administrator"
2. Temporarily disable antivirus
3. Check Windows Defender SmartScreen settings

**Problem**: "App can't run on your PC"
**Solution**:
1. Click "More info" → "Run anyway"
2. Or: Update Windows Defender definitions
3. Or: Contact support for unsigned version

### Application Won't Launch

**Problem**: Double-click does nothing
**Solution**:
1. Check Task Manager for background processes
2. Restart the application
3. Restart Windows
4. Check Windows Event Viewer for crash logs

**Problem**: Application crashes on startup
**Solution**:
1. Update graphics drivers
2. Install latest Windows updates
3. Run Windows compatibility troubleshooter
4. Contact support with crash logs

### Update Issues

**Problem**: Updates won't download
**Solution**:
1. Check internet connection
2. Disable VPN or proxy
3. Clear application cache
4. Manually download latest version from website

**Problem**: Update installation fails
**Solution**:
1. Uninstall current version
2. Download and install latest version
3. Your documents will be preserved

### Performance Issues

**Problem**: Application is slow
**Solution**:
1. Close other applications
2. Check Task Manager for resource usage
3. Disable Windows animations (Settings → Ease of Access)
4. Install on SSD instead of HDD

**Problem**: High memory usage
**Solution**:
1. Restart application periodically
2. Limit number of open documents
3. Clear recent documents history
4. Check for memory leaks in Task Manager

## Advanced Configuration

### Portable Installation

For a portable installation (without admin rights):
1. Download the portable version (ZIP archive)
2. Extract to USB drive or folder
3. Run `Spreadsheet-Moment.exe` directly
4. All data will be stored in the application directory

### Silent Installation

For automated deployment:
```powershell
# Silent install
Spreadsheet-Moment-Setup.exe /S /D=C:\Program Files\Spreadsheet Moment

# Silent uninstall
"C:\Program Files\Spreadsheet Moment\unins000.exe" /SILENT
```

### Command-Line Options

```powershell
# Open specific file
Spreadsheet-Moment.exe "C:\path\to\file.csv"

# Open with debug mode
Spreadsheet-Moment.exe --debug

# Open with custom config
Spreadsheet-Moment.exe --config "C:\custom\config.json"
```

## Security & Privacy

### Data Storage
- **Location**: `%APPDATA%\ai.superinstance.spreadsheet-moment\`
- **Content**: User preferences, recent documents, cache
- **Encryption**: Not encrypted (local storage only)

### Network Access
- **Updates**: Checks GitHub releases
- **Telemetry**: None (no data collection)
- **Cloud Sync**: Optional (future feature)

### Permissions
- **File System**: Read/write to user-selected files
- **Network**: For updates only
- **Notifications**: System tray notifications
- **Startup**: Optional auto-start

## Getting Help

### Documentation
- **Website**: https://docs.superinstance.ai
- **Wiki**: https://github.com/SuperInstance/polln/wiki
- **Tutorials**: https://www.youtube.com/@SuperInstance

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

---

**Version**: 1.0.0
**Last Updated**: 2025-03-15
**Platform**: Windows 10/11

---

**Need Help?** Contact us at support@superinstance.ai
