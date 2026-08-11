/**
 * Test Helper Functions
 * Reusable utilities for test scenarios
 */

/**
 * Creates a mock event object
 */
export function createMockEvent(type: string, properties: Record<string, any> = {}): Event {
  return {
    type,
    ...properties,
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
  } as any;
}

/**
 * Creates a mock user object
 */
export function createMockUser(overrides: Record<string, any> = {}) {
  return {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user',
    locale: 'en-US',
    createdAt: new Date('2024-01-01'),
    ...overrides,
  };
}

/**
 * Creates a mock session object
 */
export function createMockSession(overrides: Record<string, any> = {}) {
  return {
    id: 'session-123',
    userId: 'user-123',
    token: 'mock-token',
    expiresAt: new Date(Date.now() + 3600000),
    ...overrides,
  };
}

/**
 * Waits for async operations to complete
 */
export function flushPromises(): Promise<void> {
  return new Promise((resolve) => setImmediate(resolve));
}

/**
 * Delays execution for specified milliseconds
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Creates a mock response object
 */
export function createMockResponse() {
  const res: any = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    headers: {},
    setHeader: jest.fn(function (this: any, name: string, value: string) {
      this.headers[name] = value;
      return this;
    }),
    getHeader: jest.fn(function (this: any, name: string) {
      return this.headers[name];
    }),
  };
  return res;
}

/**
 * Creates a mock request object
 */
export function createMockRequest(overrides: Record<string, any> = {}) {
  return {
    method: 'GET',
    url: '/',
    headers: {},
    query: {},
    params: {},
    body: {},
    user: null,
    session: null,
    ...overrides,
  };
}

/**
 * Generates mock metrics data
 */
export function generateMockMetrics(count: number = 100) {
  return Array.from({ length: count }, (_, i) => ({
    timestamp: Date.now() - i * 1000,
    value: Math.random() * 100,
    label: `metric-${i}`,
  }));
}

/**
 * Generates mock analytics events
 */
export function generateMockEvents(count: number = 50) {
  const eventTypes = ['click', 'view', 'submit', 'hover', 'scroll'];
  return Array.from({ length: count }, (_, i) => ({
    id: `event-${i}`,
    type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
    timestamp: Date.now() - i * 1000,
    userId: `user-${Math.floor(Math.random() * 10)}`,
    sessionId: `session-${Math.floor(Math.random() * 5)}`,
    properties: {
      x: Math.random() * 100,
      y: Math.random() * 100,
    },
  }));
}

/**
 * Creates a mock database connection
 */
export function createMockDatabase() {
  return {
    query: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
    transaction: jest.fn(),
    rollback: jest.fn(),
    commit: jest.fn(),
  };
}

/**
 * Creates a mock cache client
 */
export function createMockCache() {
  const cache = new Map();
  return {
    get: jest.fn((key) => Promise.resolve(cache.get(key))),
    set: jest.fn((key, value) => {
      cache.set(key, value);
      return Promise.resolve();
    }),
    delete: jest.fn((key) => {
      cache.delete(key);
      return Promise.resolve();
    }),
    clear: jest.fn(() => {
      cache.clear();
      return Promise.resolve();
    }),
    has: jest.fn((key) => Promise.resolve(cache.has(key))),
  };
}

/**
 * Mock performance timing data
 */
export function createMockPerformanceData() {
  return {
    navigationStart: Date.now() - 1000,
    loadEventEnd: Date.now(),
    domContentLoaded: Date.now() - 500,
    firstPaint: Date.now() - 800,
    firstContentfulPaint: Date.now() - 750,
    largestContentfulPaint: Date.now() - 600,
    cumulativeLayoutShift: 0.1,
    firstInputDelay: 50,
    timeToInteractive: Date.now() - 400,
  };
}

/**
 * Generates mock locale data
 */
export function createMockLocaleData(locale: string) {
  const translations: Record<string, Record<string, any>> = {
    'en-US': {
      greeting: 'Hello',
      farewell: 'Goodbye',
      common: {
        yes: 'Yes',
        no: 'No',
        submit: 'Submit',
        cancel: 'Cancel',
      },
    },
    'es-ES': {
      greeting: 'Hola',
      farewell: 'Adiós',
      common: {
        yes: 'Sí',
        no: 'No',
        submit: 'Enviar',
        cancel: 'Cancelar',
      },
    },
    'fr-FR': {
      greeting: 'Bonjour',
      farewell: 'Au revoir',
      common: {
        yes: 'Oui',
        no: 'Non',
        submit: 'Soumettre',
        cancel: 'Annuler',
      },
    },
  };

  return translations[locale] || translations['en-US'];
}

/**
 * Creates mock forum posts
 */
export function createMockForumPosts(count: number = 10) {
  return Array.from({ length: count }, (_, i) => ({
    id: `post-${i}`,
    title: `Test Post ${i}`,
    content: `This is test content for post ${i}`,
    author: createMockUser({ id: `user-${i}` }),
    createdAt: new Date(Date.now() - i * 86400000),
    updatedAt: new Date(Date.now() - i * 86400000),
    likes: Math.floor(Math.random() * 100),
    replies: [],
    tags: [`tag-${i % 5}`],
  }));
}

/**
 * Creates mock user profile
 */
export function createMockUserProfile(overrides: Record<string, any> = {}) {
  return {
    id: 'profile-123',
    userId: 'user-123',
    username: 'testuser',
    avatar: 'https://example.com/avatar.jpg',
    bio: 'Test user bio',
    location: 'San Francisco, CA',
    website: 'https://example.com',
    joinedAt: new Date('2024-01-01'),
    stats: {
      posts: 42,
      likes: 128,
      followers: 56,
      following: 34,
    },
    badges: ['early-adopter', 'contributor'],
    ...overrides,
  };
}

/**
 * Generates mock gamification data
 */
export function createMockGamificationData(overrides: Record<string, any> = {}) {
  return {
    userId: 'user-123',
    level: 5,
    experience: 2500,
    experienceToNext: 1000,
    badges: [
      { id: 'first-post', name: 'First Post', earnedAt: new Date('2024-01-01') },
      { id: 'helper', name: 'Helper', earnedAt: new Date('2024-01-15') },
    ],
    achievements: [
      { id: '10-posts', name: 'Ten Posts', progress: 10, total: 10, completed: true },
      { id: '50-likes', name: 'Popular', progress: 35, total: 50, completed: false },
    ],
    streak: {
      current: 7,
      longest: 14,
      lastActivity: new Date(),
    },
    ...overrides,
  };
}
