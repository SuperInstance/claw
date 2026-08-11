# Desktop Application Integration Guide

## Overview

This guide explains how to integrate and use the Spreadsheet Moment desktop application with the existing web application and SuperInstance infrastructure.

## Architecture Integration

### Web Application Wrapping

The desktop application wraps the existing web application at `spreadsheet-moment/website/`:

```
Web App (spreadsheet-moment/website/)
    ↓
Desktop Wrapper (deployment/desktop/)
    ↓
Tauri Native Shell
```

### Shared Components

React components and pages are shared between web and desktop versions:

```typescript
// Import from web app
import { SpreadsheetGrid } from '../../../website/src/components/SpreadsheetGrid';
import { FormulaEditor } from '../../../website/src/components/FormulaEditor';
```

## API Integration

### Backend Connection

The desktop app connects to the SuperInstance API:

```typescript
// src/utils/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.superinstance.ai';

export async function callAgent(cellId: string, prompt: string) {
  const response = await fetch(`${API_BASE_URL}/agent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cellId, prompt }),
  });
  return response.json();
}
```

### Local-First Architecture

The desktop app supports offline mode:

```typescript
// src/store/documentStore.ts
export const useDocumentStore = create(() => ({
  // Try local first
  async loadDocument(id: string) {
    try {
      return await invoke('load_document', { id });
    } catch (error) {
      // Fall back to API if local fails
      return await fetchFromAPI(id);
    }
  },
}));
```

## File System Integration

### Opening Files from File Manager

File associations are configured in `tauri.conf.json`:

```json
{
  "tauri": {
    "bundle": {
      "fileAssociations": [
        {
          "ext": ["csv", "xlsx", "xlsm"],
          "name": "Spreadsheet",
          "role": "Editor",
          "mimeType": ["text/csv", "application/vnd.ms-excel"]
        }
      ]
    }
  }
}
```

### Handling File Opens

```typescript
// src/main.tsx
useEffect(() => {
  const unlisten = listen('tauri://file-open', async (event) => {
    const filePath = event.payload as string;
    const content = await invoke('read_file', { path: filePath });

    if (filePath.endsWith('.csv')) {
      const data = await invoke('parse_csv', { path: filePath });
      openSpreadsheet(data);
    } else if (filePath.endsWith('.xlsx')) {
      const data = await invoke('parse_excel', { path: filePath });
      openSpreadsheet(data);
    }
  });

  return () => { unlisten.then(fn => fn()); };
}, []);
```

## Cell Agent Integration

### Connecting to SuperInstance Agents

Each cell can connect to a SuperInstance agent:

```typescript
// src/hooks/useCellAgent.ts
export function useCellAgent(cellId: string) {
  const [agent, setAgent] = useState<Agent | null>(null);

  useEffect(() => {
    // Check if we have a local agent
    const localAgent = localStorage.getItem(`agent-${cellId}`);
    if (localAgent) {
      setAgent(JSON.parse(localAgent));
      return;
    }

    // Otherwise, create a new agent
    createAgent(cellId).then(setAgent);
  }, [cellId]);

  const updateCell = async (value: string) => {
    // Update locally
    setCellValue(cellId, value);

    // Send to agent for processing
    await invoke('process_cell', {
      cellId,
      value,
      agentType: 'superinstance',
    });
  };

  return { agent, updateCell };
}
```

### Agent Communication

```typescript
// src/utils/agentCommunication.ts
export async function communicateWithAgent(
  cellId: string,
  message: string
): Promise<string> {
  try {
    // Try local agent first (offline mode)
    const response = await invoke('agent_chat', {
      cellId,
      message,
      local: true,
    });

    return response;
  } catch (error) {
    // Fall back to remote API
    const response = await fetch(`${API_BASE_URL}/agent/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cellId, message }),
    });

    return response.text();
  }
}
```

## Database Integration

### SQLite Schema

The desktop app uses SQLite for local storage:

```sql
-- Documents table
CREATE TABLE documents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  metadata TEXT
);

-- Agents table (for offline mode)
CREATE TABLE agents (
  id TEXT PRIMARY KEY,
  cell_id TEXT NOT NULL,
  type TEXT NOT NULL,
  config TEXT NOT NULL,
  FOREIGN KEY (cell_id) REFERENCES documents(id)
);

-- Cache table (for API responses)
CREATE TABLE cache (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  expires_at TEXT NOT NULL
);
```

### Database Access

```typescript
// src/hooks/useDatabase.ts
export function useDatabase() {
  const saveDocument = async (document: Document) => {
    return await invoke('save_document', {
      id: document.id,
      name: document.name,
      content: JSON.stringify(document.content),
      metadata: JSON.stringify(document.metadata),
    });
  };

  const loadDocument = async (id: string) => {
    return await invoke('load_document', { id });
  };

  return { saveDocument, loadDocument };
}
```

## Sync Integration

### Cloud Sync (Optional)

The desktop app can sync with the cloud:

```typescript
// src/utils/sync.ts
export async function syncWithCloud() {
  const documents = await invoke('list_documents');

  for (const doc of documents) {
    const cloudDoc = await fetch(`${API_BASE_URL}/documents/${doc.id}`);

    if (cloudDoc.ok) {
      const cloudData = await cloudDoc.json();

      // Merge changes
      const merged = mergeDocuments(doc, cloudData);

      // Update local
      await invoke('save_document', merged);

      // Update cloud
      await fetch(`${API_BASE_URL}/documents/${doc.id}`, {
        method: 'PUT',
        body: JSON.stringify(merged),
      });
    }
  }
}
```

## Plugin Integration

### Desktop-Specific Plugins

The desktop app can load plugins:

```typescript
// src/plugins/desktopPlugin.ts
export interface DesktopPlugin {
  name: string;
  version: string;
  init: () => Promise<void>;
  destroy: () => Promise<void>;
  commands: Record<string, (...args: any[]) => any>;
}

export async function loadPlugin(pluginPath: string): Promise<DesktopPlugin> {
  const plugin = await import(pluginPath);
  await plugin.init();
  return plugin;
}
```

### Native Plugin Example

```rust
// src-tauri/src/plugins/native_plugin.rs
use tauri::command;

#[command]
pub async fn native_operation(input: String) -> Result<String, String> {
    // Perform native operation
    Ok(format!("Processed: {}", input))
}
```

## Testing Integration

### Testing Native Commands

```typescript
// tests/commands.test.ts
import { test, expect } from 'vitest';
import { invoke } from '@tauri-apps/api/tauri';

test('read_file command', async () => {
  const content = await invoke('read_file', {
    path: '/tmp/test.txt',
  });
  expect(content).toBeDefined();
});
```

### E2E Testing

```typescript
// tests/e2e/spreadsheet.test.ts
import { test, expect } from '@playwright/test';

test('create and save spreadsheet', async ({ page }) => {
  await page.goto('/');
  await page.click('text=New Spreadsheet');
  await page.fill('[data-testid="cell-A1"]', 'Hello');
  await page.click('text=Save');
  await expect(page.locator('text=Saved successfully')).toBeVisible();
});
```

## Deployment Integration

### CI/CD Integration

The desktop app integrates with the existing CI/CD pipeline:

```yaml
# .github/workflows/desktop-build.yml
on:
  push:
    paths:
      - 'spreadsheet-moment/**'
      - 'deployment/desktop/**'

jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
    steps:
      - uses: actions/checkout@v4
      - name: Build desktop app
        run: |
          cd deployment/desktop
          npm install
          npm run tauri:build
```

### Release Integration

Desktop releases are coordinated with web releases:

```bash
# Release script
#!/bin/bash
VERSION=$1

# Deploy web
cd spreadsheet-moment/website
npm run deploy

# Build desktop
cd ../../deployment/desktop
npm run build:all

# Create GitHub release
gh release create "v$VERSION" \
  --notes "Release $VERSION" \
  src-tauri/target/*/release/bundle/*
```

## Monitoring Integration

### Error Tracking

```typescript
// src/utils/errorTracking.ts
import * as Sentry from '@sentry/browser';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
});

// Tauri-specific errors
if (window.__TAURI__) {
  window.__TAURI__.core.once('tauri://error', (event) => {
    Sentry.captureException(event.payload);
  });
}
```

### Analytics

```typescript
// src/utils/analytics.ts
export function trackEvent(event: string, properties?: Record<string, any>) {
  if (import.meta.env.VITE_ENABLE_ANALYTICS === 'true') {
    // Send to analytics
    gtag('event', event, properties);
  }
}
```

## Troubleshooting Integration Issues

### API Connection Issues

1. **Check API URL**: Verify `VITE_API_URL` in `.env`
2. **Test connectivity**: Use `ping api.superinstance.ai`
3. **Check credentials**: Verify API keys are set

### File Association Issues

1. **Windows**: Check registry entries
2. **macOS**: Verify Launch Services
3. **Linux**: Check MIME database

### Sync Issues

1. **Check internet connection**
2. **Verify API accessibility**
3. **Check sync logs in app data directory`

## Best Practices

### 1. Local-First Development

- Always save locally first
- Sync to cloud in background
- Handle offline gracefully

### 2. Error Handling

- Provide helpful error messages
- Log errors for debugging
- Offer recovery options

### 3. Performance

- Cache API responses
- Use web workers for heavy operations
- Implement lazy loading

### 4. Security

- Validate all inputs
- Use HTTPS for API calls
- Store credentials securely

## Support

For integration issues:
- Documentation: https://docs.superinstance.ai
- GitHub Issues: https://github.com/SuperInstance/polln/issues
- Discord: https://discord.gg/superinstance

---

Last updated: 2024-03-14
