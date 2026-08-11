# Spreadsheet Moment - Desktop Application

AI-powered distributed spreadsheet platform as a native desktop application.

## Features

- **Native Performance**: Built with Tauri for lightweight, fast performance
- **Cross-Platform**: Windows, macOS, and Linux support
- **Offline Mode**: Full functionality without internet connection
- **File Associations**: Open CSV and Excel files directly from the file manager
- **System Notifications**: Native desktop notifications for updates and alerts
- **Auto-Update**: Automatic update notifications and installation
- **Local Storage**: SQLite database for document storage
- **Custom Window Controls**: Native-looking window decorations

## Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- Rust 1.70+ (with Cargo)
- Platform-specific dependencies:
  - **Windows**: Microsoft Visual C++ Build Tools
  - **macOS**: Xcode Command Line Tools
  - **Linux**: webkit2gtk, libgtk-3-dev, etc.

### Installation

1. Clone the repository:
```bash
git clone https://github.com/SuperInstance/polln.git
cd polln/deployment/desktop
```

2. Install dependencies:
```bash
npm install
```

3. Run in development mode:
```bash
npm run tauri:dev
```

## Building for Production

### Windows

```bash
# Using the build script
scripts\build-windows.bat

# Or manually
npm run tauri:build
```

Output: `src-tauri/target/release/bundle/nsis/Spreadsheet Moment_1.0.0_x64-setup.exe`

### macOS

```bash
# Intel Macs
npm run tauri:build -- --target x86_64-apple-darwin

# Apple Silicon Macs
npm run tauri:build -- --target aarch64-apple-darwin

# Universal (requires both architectures)
npm run build:macos
```

Output: `src-tauri/target/x86_64-apple-darwin/release/bundle/dmg/Spreadsheet Moment_1.0.0_x64.dmg`

### Linux

```bash
# Using the build script
chmod +x scripts/build-linux.sh
./scripts/build-linux.sh

# Or manually
npm run tauri:build
```

Output: `src-tauri/target/release/bundle/deb/spreadsheet-moment_1.0.0_amd64.deb`

## Development

### Project Structure

```
deployment/desktop/
├── src/                      # React frontend
│   ├── components/          # React components
│   ├── pages/               # Page components
│   ├── contexts/            # React contexts
│   ├── store/               # Zustand state management
│   ├── hooks/               # Custom React hooks
│   ├── utils/               # Utility functions
│   └── types/               # TypeScript types
├── src-tauri/               # Tauri Rust backend
│   ├── src/
│   │   ├── commands/        # Tauri commands
│   │   ├── database.rs      # SQLite database
│   │   ├── file_watcher.rs  # File system watcher
│   │   ├── notifications.rs # Notification handler
│   │   ├── updater.rs       # Auto-updater
│   │   └── utils/           # Utility modules
│   ├── Cargo.toml           # Rust dependencies
│   └── tauri.conf.json      # Tauri configuration
├── scripts/                 # Build and release scripts
│   ├── build-windows.bat    # Windows build script
│   ├── build-macos.sh       # macOS build script
│   ├── build-linux.sh       # Linux build script
│   ├── sign-windows.bat     # Windows code signing
│   ├── sign-macos.sh        # macOS code signing
│   └── release.sh           # Release automation
├── .github/
│   └── workflows/           # GitHub Actions CI/CD
│       ├── build.yml        # Build workflow
│       └── notarize-macos.yml # macOS notarization
├── package.json             # Node.js dependencies
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite configuration
└── tailwind.config.js       # Tailwind CSS configuration
```

### Key Technologies

**Frontend:**
- React 18 with TypeScript
- Tauri API for native functionality
- Zustand for state management
- React Router for navigation
- Framer Motion for animations
- Tailwind CSS for styling

**Backend:**
- Rust with Tauri
- SQLite for local storage
- tokio for async runtime
- notify for file system watching
- reqwest for HTTP requests

### Available Scripts

```bash
# Development
npm run dev                 # Start Vite dev server
npm run tauri:dev          # Start Tauri dev mode

# Building
npm run build              # Build frontend only
npm run tauri:build        # Build desktop application
npm run build:windows      # Build for Windows
npm run build:macos        # Build for macOS (Intel)
npm run build:macos:arm    # Build for macOS (Apple Silicon)
npm run build:linux        # Build for Linux
npm run build:all          # Build for all platforms

# Code Signing
npm run sign:windows       # Sign Windows executable
npm run sign:macos         # Sign macOS application
npm run notarize:macos     # Notarize macOS application

# Testing
npm run test               # Run tests
npm run test:ui            # Run tests with UI
npm run test:coverage      # Run tests with coverage

# Linting and Formatting
npm run lint               # Lint code
npm run lint:fix           # Fix linting issues
npm run format             # Format code
npm run typecheck          # Type check code
```

## Configuration

### Tauri Configuration

Located in `src-tauri/tauri.conf.json`:

- Window properties (size, decorations, etc.)
- File associations (.csv, .xlsx)
- Security policies and CSP
- Auto-update configuration
- Bundle metadata

### Environment Variables

- `TAURI_PLATFORM`: Target platform (windows, darwin, linux)
- `TAURI_DEBUG`: Enable debug mode
- `VITE_*`: Frontend environment variables

## Auto-Update System

The desktop application includes an auto-update mechanism:

1. **Update Server**: GitHub Releases serves update packages
2. **Update Check**: Application checks for updates on startup
3. **Notification**: User is notified of available updates
4. **Installation**: Updates are downloaded and installed automatically

### Setting Up Update Server

1. Create a GitHub Release with the built binaries
2. Upload `latest.json` with update information:
```json
{
  "version": "1.0.1",
  "notes": "Bug fixes and improvements",
  "pub_date": "2024-03-14T00:00:00Z",
  "platforms": {
    "windows-x86_64": {
      "signature": "...",
      "url": "https://github.com/SuperInstance/polln/releases/download/v1.0.1/Spreadsheet.Moment_1.0.1_x64-setup.exe"
    }
  }
}
```

## File Associations

The application registers itself as the default handler for:
- `.csv` - Comma-separated values files
- `.xlsx` - Excel spreadsheet files
- `.xlsm` - Excel macro-enabled files

## Native Integrations

### System Notifications

```typescript
import { showNotification } from './utils';

showNotification('Update Available', 'Version 1.0.1 is ready to install');
```

### File System

```typescript
import { readFile, writeFile } from './utils';

const content = await readFile('/path/to/file.csv');
await writeFile('/path/to/file.csv', content);
```

### Clipboard

```typescript
import { readClipboard, writeClipboard } from './utils';

const text = await readClipboard();
await writeClipboard('Hello, Clipboard!');
```

### Window Controls

```typescript
import { minimizeWindow, maximizeWindow, closeWindow } from './utils';

await minimizeWindow();
await maximizeWindow();
await closeWindow(); // Hides window to system tray
```

## Troubleshooting

### Build Issues

**Windows:**
- Install Microsoft Visual C++ Build Tools
- Ensure Rust is installed with `rustup show`
- Check that Webview2 is installed

**macOS:**
- Install Xcode Command Line Tools: `xcode-select --install`
- Ensure Xcode license is accepted: `sudo xcodebuild -license accept`
- For notarization, set up Apple Developer credentials

**Linux:**
- Install webkit2gtk and other dependencies
- On Ubuntu/Debian: `sudo apt-get install libwebkit2gtk-4.0-dev build-essential`
- On Fedora: `sudo dnf install webkit2gtk3-devel openssl-devel`

### Development Issues

- **Port 1420 in use**: Change port in `vite.config.ts`
- **Hot reload not working**: Check Tauri dev server logs
- **Database errors**: Check app data directory permissions

## Distribution

### Code Signing

**Windows:**
1. Obtain a code signing certificate
2. Set `SPREADSHEET_MOMENT_CERT_THUMBPRINT` environment variable
3. Run: `npm run sign:windows`

**macOS:**
1. Join Apple Developer Program
2. Create signing certificate in Xcode
3. Set `SPREADSHEET_MOMENT_SIGNING_IDENTITY` environment variable
4. Run: `npm run sign:macos`
5. Notarize: `npm run notarize:macos`

### Automated Releases

GitHub Actions automatically:
1. Builds for all platforms on tag push
2. Creates GitHub Release with artifacts
3. Notarizes macOS builds (requires secrets)

Required secrets:
- `APPLE_CERTIFICATES_P12`
- `APPLE_CERTIFICATES_PASSWORD`
- `APPLE_SIGNING_IDENTITY`
- `APPLE_ID`
- `APPLE_APP_SPECIFIC_PASSWORD`
- `APPLE_TEAM_ID`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm run test`
5. Lint code: `npm run lint:fix`
6. Format code: `npm run format`
7. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

- Documentation: https://docs.superinstance.ai
- GitHub Issues: https://github.com/SuperInstance/polln/issues
- Discord: https://discord.gg/superinstance

---

Built with love by SuperInstance - Every cell is a SuperInstance agent
