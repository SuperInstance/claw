/**
 * Test Helpers and Utilities
 * Reusable testing utilities for Spreadsheet Moment platform
 */

import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  route?: string;
  withRouter?: boolean;
}

export function renderWithProviders(
  ui: ReactElement,
  {
    route = '/',
    withRouter = true,
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    if (withRouter) {
      window.history.pushState({}, 'Test page', route);
      return <BrowserRouter>{children}</BrowserRouter>;
    }
    return <>{children}</>;
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Mock data generators
export const mockUsers = {
  basic: {
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  withProfile: {
    id: '2',
    username: 'profileuser',
    email: 'profile@example.com',
    profile: {
      firstName: 'Test',
      lastName: 'User',
      bio: 'Test bio',
      location: 'Test Location'
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
};

export const mockPosts = {
  basic: {
    id: '1',
    title: 'Test Post',
    content: 'Test content',
    authorId: '1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  withReplies: {
    id: '2',
    title: 'Post with Replies',
    content: 'Content with replies',
    authorId: '1',
    replies: [
      {
        id: 'r1',
        content: 'First reply',
        authorId: '2',
        createdAt: new Date('2024-01-02')
      }
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02')
  }
};

export const mockTemplates = {
  basic: {
    id: '1',
    name: 'Test Template',
    description: 'Test description',
    category: 'basic',
    authorId: '1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  withCells: {
    id: '2',
    name: 'Complex Template',
    description: 'Template with cells',
    category: 'complex',
    authorId: '1',
    cells: [
      { id: 'c1', type: 'data', value: 'test' },
      { id: 'c2', type: 'formula', value: '=SUM(A1:A10)' }
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
};

// Async utilities
export const waitForCondition = async (
  condition: () => boolean,
  timeout = 5000
): Promise<void> => {
  const startTime = Date.now();
  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error(`Condition not met within ${timeout}ms`);
    }
    await new Promise(resolve => setTimeout(resolve, 50));
  }
};

export const flushPromises = () => new Promise(resolve => setImmediate(resolve));

// Mock fetch
export const mockFetch = (data: any, ok = true, status = 200) => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok,
      status,
      json: () => Promise.resolve(data)
    } as Response)
  );
};

// Mock WebSocket
export class MockWebSocket {
  static instances: MockWebSocket[] = [];

  url: string;
  readyState: number = 0; // CONNECTING
  onopen: ((event: MessageEvent) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;

  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);

    // Simulate connection
    setTimeout(() => {
      this.readyState = 1; // OPEN
      if (this.onopen) {
        this.onopen(new MessageEvent('open'));
      }
    }, 0);
  }

  send(data: string) {
    if (this.readyState !== 1) {
      throw new Error('WebSocket is not open');
    }
  }

  close() {
    this.readyState = 3; // CLOSED
    if (this.onclose) {
      this.onclose(new CloseEvent('close'));
    }
  }

  static mockMessage(data: any) {
    MockWebSocket.instances.forEach(ws => {
      if (ws.onmessage) {
        ws.onmessage(new MessageEvent('message', { data: JSON.stringify(data) }));
      }
    });
  }

  static mockError(error: any) {
    MockWebSocket.instances.forEach(ws => {
      if (ws.onerror) {
        ws.onerror(new Event('error'));
      }
    });
  }

  static clear() {
    MockWebSocket.instances = [];
  }
}

// Mock IntersectionObserver
export const mockIntersectionObserver = () => {
  const mockIntersectionObserver = jest.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null
  });
  window.IntersectionObserver = mockIntersectionObserver;
  return mockIntersectionObserver;
};

// Mock ResizeObserver
export const mockResizeObserver = () => {
  const mockResizeObserver = jest.fn();
  mockResizeObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null
  });
  window.ResizeObserver = mockResizeObserver;
  return mockResizeObserver;
};

// Performance testing utilities
export const measureRenderTime = async (callback: () => void) => {
  const start = performance.now();
  await callback();
  return performance.now() - start;
};

// Accessibility testing helpers
export const assertAccessible = (container: HTMLElement) => {
  // Basic accessibility checks
  const buttons = container.querySelectorAll('button');
  buttons.forEach(button => {
    const hasAccessibleName =
      button.textContent?.trim() ||
      button.getAttribute('aria-label') ||
      button.getAttribute('aria-labelledby');
    if (!hasAccessibleName) {
      throw new Error('Button found without accessible name');
    }
  });

  const images = container.querySelectorAll('img');
  images.forEach(img => {
    if (!img.getAttribute('alt')) {
      throw new Error('Image found without alt text');
    }
  });

  const inputs = container.querySelectorAll('input');
  inputs.forEach(input => {
    const hasLabel =
      input.getAttribute('aria-label') ||
      input.getAttribute('aria-labelledby') ||
      document.querySelector(`label[for="${input.id}"]`);
    if (!hasLabel) {
      throw new Error('Input found without associated label');
    }
  });
};

// Focus management utilities
export const getFocusableElements = (container: HTMLElement) => {
  const focusableSelectors = [
    'button:not([disabled])',
    '[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ].join(', ');

  return Array.from(container.querySelectorAll(focusableSelectors));
};

export const assertTabOrder = (container: HTMLElement, expectedOrder: string[]) => {
  const focusableElements = getFocusableElements(container);
  expectedOrder.forEach((selector, index) => {
    const element = container.querySelector(selector);
    expect(element).toBe(focusableElements[index]);
  });
};

// Date/time utilities
export const mockDate = (dateString: string) => {
  const mockDate = new Date(dateString);
  jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);
  return mockDate;
};

// Random data generators
export const generateRandomString = (length: number) => {
  return Math.random().toString(36).substring(2, length + 2);
};

export const generateRandomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const generateRandomEmail = () => {
  return `test${generateRandomString(8)}@example.com`;
};

// Error matching utilities
export const expectErrorWithMessage = async (
  callback: () => Promise<any> | any,
  expectedMessage: string
) => {
  await expect(callback).rejects.toThrow(expectedMessage);
};

// Storage utilities for testing
export const setMockLocalStorage = (key: string, value: any) => {
  window.localStorage.setItem(key, JSON.stringify(value));
};

export const getMockLocalStorage = (key: string) => {
  const item = window.localStorage.getItem(key);
  return item ? JSON.parse(item) : null;
};

export const clearMockLocalStorage = () => {
  window.localStorage.clear();
};

// Re-export testing library utilities
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
