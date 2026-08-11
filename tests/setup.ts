/**
 * Jest Setup File
 * Configured for Spreadsheet Moment Platform Testing
 */

import { jest } from '@jest/globals';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Mock performance API for testing
global.performance = {
  ...global.performance,
  now: jest.fn(() => Date.now()),
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByName: jest.fn(() => []),
  getEntriesByType: jest.fn(() => []),
  clearMarks: jest.fn(),
  clearMeasures: jest.fn(),
};

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;

// Mock requestAnimationFrame
global.requestAnimationFrame = (callback: FrameRequestCallback) => {
  return setTimeout(callback, 0) as unknown as number;
};

global.cancelAnimationFrame = (id: number) => {
  clearTimeout(id);
};

// Mock crypto.getRandomValues for testing
if (!global.crypto) {
  global.crypto = {} as any;
}

Object.defineProperty(global.crypto, 'getRandomValues', {
  value: jest.fn((array) => {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  }),
});

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] || null,
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] || null,
  };
})();

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

// Mock WebSocket
class WebSocketMock {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  readyState = WebSocketMock.OPEN;
  url = '';
  protocol = '';
  extensions = '';

  onopen: ((event: MessageEvent) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;

  constructor(url: string) {
    this.url = url;
  }

  send(data: string | ArrayBuffer) {
    if (this.readyState !== WebSocketMock.OPEN) {
      throw new Error('WebSocket is not open');
    }
    // Simulate successful send
  }

  close(code?: number, reason?: string) {
    this.readyState = WebSocketMock.CLOSED;
    if (this.onclose) {
      this.onclose({ code: code || 1000, reason: reason || '', wasClean: true } as CloseEvent);
    }
  }

  addEventListener(type: string, listener: EventListener) {
    // Mock implementation
  }

  removeEventListener(type: string, listener: EventListener) {
    // Mock implementation
  }
}

global.WebSocket = WebSocketMock as any;

// Set timezone for consistent date testing
process.env.TZ = 'UTC';

// Extend Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidLocale(): R;
      toBeAccessible(): R;
      toBeSecure(): R;
    }
  }
}

// Custom matchers
expect.extend({
  toBeValidLocale(received: string) {
    const validLocales = ['en-US', 'en-GB', 'es-ES', 'fr-FR', 'de-DE', 'ja-JP', 'zh-CN'];
    const pass = validLocales.includes(received);
    return {
      pass,
      message: () => pass
        ? `expected ${received} not to be a valid locale`
        : `expected ${received} to be a valid locale`,
    };
  },
  toBeAccessible(received: any) {
    const hasAriaLabels = received.querySelectorAll && received.querySelectorAll('[aria-label]').length > 0;
    const pass = hasAriaLabels;
    return {
      pass,
      message: () => pass
        ? `expected element not to be accessible`
        : `expected element to be accessible with ARIA labels`,
    };
  },
  toBeSecure(received: string) {
    const isHTTPS = received.startsWith('https://');
    const pass = isHTTPS;
    return {
      pass,
      message: () => pass
        ? `expected URL not to be secure`
        : `expected URL to use HTTPS protocol`,
    };
  },
});

// Error handling for unhandled promises
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Promise Rejection:', error);
});

// Test timeout configuration
jest.setTimeout(10000);
