// Tauri API helpers
export async function invokeTauriCommand<T = any>(
  command: string,
  args?: Record<string, any>
): Promise<T> {
  if (!window.__TAURI__) {
    throw new Error('Not running in Tauri environment');
  }

  try {
    // @ts-ignore - Tauri invoke is available at runtime
    return await window.__TAURI__.invoke(command, args);
  } catch (error) {
    console.error(`Failed to invoke Tauri command "${command}":`, error);
    throw error;
  }
}

// File system helpers
export async function readFile(path: string): Promise<string> {
  return invokeTauriCommand('read_file', { path });
}

export async function writeFile(path: string, content: string): Promise<void> {
  return invokeTauriCommand('write_file', { path, content });
}

export async function readDirectory(path: string): Promise<string[]> {
  return invokeTauriCommand('read_dir', { path });
}

// Clipboard helpers
export async function readClipboard(): Promise<string> {
  return invokeTauriCommand('read_clipboard');
}

export async function writeClipboard(text: string): Promise<void> {
  return invokeTauriCommand('write_clipboard', { text });
}

// Window helpers
export async function minimizeWindow(): Promise<void> {
  return invokeTauriCommand('minimize_window');
}

export async function maximizeWindow(): Promise<void> {
  return invokeTauriCommand('maximize_window');
}

export async function closeWindow(): Promise<void> {
  return invokeTauriCommand('close_window');
}

// Notification helpers
export async function showNotification(title: string, body: string): Promise<void> {
  return invokeTauriCommand('send_notification', { title, body });
}

// Format helpers
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

// Generate unique ID
export function generateId(): string {
  return crypto.randomUUID();
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

// Throttle function
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
