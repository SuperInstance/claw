# Desktop Application Architecture

## Overview

The Spreadsheet Moment desktop application is built using Tauri, combining a React frontend with a Rust backend for optimal performance and native integrations.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Desktop Application                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                   React Frontend                      │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  UI Layer (Components, Pages)                  │  │  │
│  │  ├────────────────────────────────────────────────┤  │  │
│  │  │  State Management (Zustand Stores)             │  │  │
│  │  ├────────────────────────────────────────────────┤  │  │
│  │  │  Business Logic (Hooks, Utils)                 │  │  │
│  │  ├────────────────────────────────────────────────┤  │  │
│  │  │  Tauri API Layer (IPC Bridge)                  │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                   │
│                    Tauri IPC                                 │
│                           │                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                   Rust Backend                        │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  Command Handlers (Tauri Commands)             │  │  │
│  │  ├────────────────────────────────────────────────┤  │  │
│  │  │  Business Logic (Services)                     │  │  │
│  │  ├────────────────────────────────────────────────┤  │  │
│  │  │  Data Layer (Database, File System)            │  │  │
│  │  ├────────────────────────────────────────────────┤  │  │
│  │  │  Native Integrations (OS APIs)                 │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              System Integration Layer                 │  │
│  │  • File System     • Notifications  • Clipboard       │  │
│  │  • Window Manager  • Auto-Update     • System Tray    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Frontend Architecture (React)

### Component Hierarchy

```
App
├── TauriProvider
│   └── Provides Tauri context to all components
└── Layout
    ├── Sidebar
    │   └── Navigation menu
    ├── TitleBar
    │   └── Custom window controls
    └── Content Area
        ├── HomePage
        ├── SpreadsheetPage
        │   └── SpreadsheetGrid
        ├── DocumentsPage
        │   └── DocumentList
        └── SettingsPage
```

### State Management

**Document Store** (`store/documentStore.ts`):
- Current document state
- Document list
- CRUD operations
- Persistence

**System Store** (`store/systemStore.ts`):
- System information
- App version
- Update status
- Notifications

### Routing

React Router handles navigation:
- `/` - Home page
- `/spreadsheet/:id` - Spreadsheet editor
- `/documents` - Document browser
- `/settings` - Settings page

## Backend Architecture (Rust)

### Command Structure

All Tauri commands are defined in `src-tauri/src/commands/`:

- `fs.rs` - File system operations
- `file_types.rs` - CSV/Excel parsing
- `database.rs` - Document storage
- `notifications.rs` - System notifications
- `system.rs` - System information
- `window.rs` - Window management
- `clipboard.rs` - Clipboard operations
- `updater.rs` - Auto-update logic

### Database Schema

```sql
CREATE TABLE documents (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    metadata TEXT
);
```

### File Watcher

Monitors file system changes:
- Created files
- Modified files
- Deleted files
- Emits events to frontend

## IPC Communication

### Frontend to Backend

```typescript
// Frontend invokes Tauri command
const result = await invoke('command_name', { arg1: value1 });
```

### Backend to Frontend

```rust
// Backend emits event
app_handle.emit("event_name", payload)?;
```

```typescript
// Frontend listens for events
listen('event_name', (event) => {
  console.log(event.payload);
});
```

## Native Integrations

### File System

- Read/write files
- Directory operations
- File watching
- File associations

### Notifications

- System notifications
- Notification permissions
- Custom notification sounds

### Window Management

- Custom title bar
- Window controls (minimize, maximize, close)
- System tray integration
- Multi-monitor support

### Auto-Update

- Version checking
- Download updates
- Install updates
- Rollback support

## Security Model

### Content Security Policy

```
default-src 'self';
connect-src 'self' https://* http://localhost:*;
img-src 'self' asset: https://*;
style-src 'self' 'unsafe-inline';
script-src 'self' 'wasm-eval';
```

### File Access Scope

Configured in `tauri.conf.json`:
```json
{
  "fs": {
    "scope": ["**"]
  }
}
```

### Command Allowlist

Only whitelisted commands can be invoked:
```json
{
  "allowlist": {
    "fs": { "all": true },
    "dialog": { "all": true },
    "notification": { "all": true }
  }
}
```

## Performance Optimization

### Frontend

- **Code Splitting**: Separate chunks for vendors
- **Lazy Loading**: Components loaded on demand
- **Memoization**: React.memo for expensive components
- **Virtual Scrolling**: For large spreadsheets

### Backend

- **Async Operations**: Tokio runtime
- **Connection Pooling**: SQLite connection reuse
- **Caching**: Document caching in memory
- **Optimized Builds**: LTO and codegen-units

## Build Process

### Development

1. Vite dev server (port 1420)
2. Tauri watches for changes
3. Hot module replacement

### Production

1. Build frontend with Vite
2. Bundle with Tauri
3. Package installers
4. Code signing
5. Notarization (macOS)

## Deployment

### Platform-Specific Outputs

**Windows**:
- NSIS installer
- MSI installer (optional)

**macOS**:
- DMG image
- PKG installer (optional)

**Linux**:
- DEB package (Debian/Ubuntu)
- RPM package (Fedora/openSUSE)
- AppImage (universal)

## Extensibility

### Adding New Commands

1. Define command in `src-tauri/src/commands/`
2. Add to `main.rs` invoke_handler
3. Update allowlist in `tauri.conf.json`

### Adding New UI Components

1. Create component in `src/components/`
2. Add routing in `App.tsx`
3. Style with Tailwind CSS
4. Test with Tauri dev

## Testing Strategy

### Unit Tests

- Frontend: Vitest
- Backend: Rust tests

### Integration Tests

- Tauri command tests
- Database tests
- File system tests

### E2E Tests

- User workflows
- Cross-platform tests

## Future Enhancements

### Phase 2
- Plugin system
- Custom themes
- Keyboard shortcuts
- Advanced formulas

### Phase 3
- Cloud sync
- Collaboration features
- Version history
- Backup/restore
