/**
 * Test Fixtures
 * Pre-built test data for integration tests
 */

import { v4 as uuidv4 } from 'uuid';
import { TestUser, TestSpreadsheet, TestPost } from '../database/seeds';

/**
 * Spreadsheet cell data fixture
 */
export interface TestCell {
  value: string | number;
  formula?: string;
  style?: {
    bold?: boolean;
    italic?: boolean;
    backgroundColor?: string;
    color?: string;
  };
}

/**
 * Spreadsheet sheet data fixture
 */
export interface TestSheet {
  name: string;
  cells: Record<string, TestCell>;
}

/**
 * Complete spreadsheet data fixture
 */
export const SPREADSHEET_DATA = {
  sheets: [
    {
      name: 'Sheet1',
      cells: {
        A1: { value: 'Name', formula: '', style: { bold: true } },
        B1: { value: 'Age', formula: '', style: { bold: true } },
        C1: { value: 'City', formula: '', style: { bold: true } },
        A2: { value: 'John Doe', formula: '' },
        B2: { value: 30, formula: '' },
        C2: { value: 'New York', formula: '' },
        A3: { value: 'Jane Smith', formula: '' },
        B3: { value: 25, formula: '' },
        C3: { value: 'Los Angeles', formula: '' },
        A4: { value: 'Bob Johnson', formula: '' },
        B4: { value: 35, formula: '' },
        C4: { value: 'Chicago', formula: '' },
      },
    },
    {
      name: 'Sheet2',
      cells: {
        A1: { value: 'Product', formula: '', style: { bold: true } },
        B1: { value: 'Price', formula: '', style: { bold: true } },
        C1: { value: 'Quantity', formula: '', style: { bold: true } },
        D1: { value: 'Total', formula: '=B2*C2', style: { bold: true } },
        A2: { value: 'Widget A', formula: '' },
        B2: { value: 10.99, formula: '' },
        C2: { value: 5, formula: '' },
        D2: { value: 54.95, formula: '=B2*C2' },
      },
    },
  ],
};

/**
 * Analytics event fixtures
 */
export const ANALYTICS_EVENTS = {
  sheetView: {
    event_type: 'sheet_view',
    properties: {
      sheet_id: uuidv4(),
      duration: 5000,
      referrer: 'direct',
    },
  },

  sheetEdit: {
    event_type: 'sheet_edit',
    properties: {
      sheet_id: uuidv4(),
      cells_modified: ['A1', 'B2', 'C3'],
      edit_duration: 1200,
    },
  },

  sheetShare: {
    event_type: 'sheet_share',
    properties: {
      sheet_id: uuidv4(),
      share_method: 'email',
      recipient_count: 3,
    },
  },

  userLogin: {
    event_type: 'user_login',
    properties: {
      method: 'email_password',
      success: true,
    },
  },

  userLogout: {
    event_type: 'user_logout',
    properties: {
      session_duration: 3600,
    },
  },

  collaborationStart: {
    event_type: 'collaboration_start',
    properties: {
      sheet_id: uuidv4(),
      collaborator_count: 2,
    },
  },

  formulaError: {
    event_type: 'formula_error',
    properties: {
      sheet_id: uuidv4(),
      cell: 'D5',
      formula: '=INVALID(A1)',
      error_type: 'invalid_reference',
    },
  },
};

/**
 * Community post fixtures
 */
export const COMMUNITY_POSTS = {
  englishTutorial: {
    title: 'Getting Started with Spreadsheet Moment',
    content: 'Welcome to Spreadsheet Moment! This tutorial will help you get started with creating your first spreadsheet...',
    locale: 'en-US',
    tags: ['tutorial', 'getting-started', 'beginner'],
  },

  spanishTutorial: {
    title: 'Comenzando con Spreadsheet Moment',
    content: 'Bienvenido a Spreadsheet Moment Este tutorial te ayudará a comenzar creando tu primera hoja de cálculo...',
    locale: 'es-ES',
    tags: ['tutorial', 'principiante', 'ayuda'],
  },

  japaneseTips: {
    title: 'スプレッドシートモメントのヒント',
    content: 'スプレッドシートモメントのヒントとコツをご紹介します...',
    locale: 'ja-JP',
    tags: ['ヒント', 'コツ', '上級'],
  },

  englishQuestion: {
    title: 'How to use VLOOKUP?',
    content: 'Can someone explain how to use VLOOKUP function in Spreadsheet Moment?',
    locale: 'en-US',
    tags: ['question', 'formula', 'vlookup'],
  },

  featureRequest: {
    title: 'Feature Request: Dark Mode',
    content: 'It would be great to have a dark mode option for better nighttime viewing...',
    locale: 'en-US',
    tags: ['feature-request', 'ui', 'dark-mode'],
  },
};

/**
 * Comment fixtures
 */
export const COMMENTS = {
  helpfulAnswer: {
    content: 'Great question! To use VLOOKUP, you need to specify the lookup value, table range, column index, and match type. Here\'s an example: =VLOOKUP(A2, B2:D10, 3, FALSE)',
  },

  thankYou: {
    content: 'This helped me a lot! Thank you for the detailed explanation.',
  },

  suggestion: {
    content: 'Have you tried using INDEX/MATCH instead? It\'s more flexible and faster for large datasets.',
  },

  feedback: {
    content: 'I agree! Dark mode would be amazing. Please add this feature.',
  },
};

/**
 * User preferences fixtures
 */
export const USER_PREFERENCES = {
  default: {
    theme: 'light',
    language: 'en-US',
    timezone: 'America/New_York',
    notifications: {
      email: true,
      push: false,
      digest: 'daily',
    },
  },

  darkMode: {
    theme: 'dark',
    language: 'en-US',
    timezone: 'America/Los_Angeles',
    notifications: {
      email: false,
      push: true,
      digest: 'weekly',
    },
  },

  spanish: {
    theme: 'light',
    language: 'es-ES',
    timezone: 'Europe/Madrid',
    notifications: {
      email: true,
      push: true,
      digest: 'daily',
    },
  },
};

/**
 * Permission level fixtures
 */
export const PERMISSIONS = {
  owner: {
    canRead: true,
    canWrite: true,
    canDelete: true,
    canShare: true,
    canManageCollaborators: true,
  },

  editor: {
    canRead: true,
    canWrite: true,
    canDelete: false,
    canShare: false,
    canManageCollaborators: false,
  },

  commenter: {
    canRead: true,
    canWrite: false,
    canDelete: false,
    canShare: false,
    canManageCollaborators: false,
    canComment: true,
  },

  viewer: {
    canRead: true,
    canWrite: false,
    canDelete: false,
    canShare: false,
    canManageCollaborators: false,
  },
};

/**
 * Rate limit fixtures
 */
export const RATE_LIMITS = {
  api: {
    endpoint: '/graphql',
    maxRequests: 100,
    windowMs: 60000, // 1 minute
  },

  auth: {
    endpoint: '/auth/login',
    maxRequests: 5,
    windowMs: 900000, // 15 minutes
  },

  upload: {
    endpoint: '/upload',
    maxRequests: 10,
    windowMs: 3600000, // 1 hour
  },
};

/**
 * Error response fixtures
 */
export const ERRORS = {
  authenticationRequired: {
    message: 'Authentication required',
    code: 'AUTH_REQUIRED',
    statusCode: 401,
  },

  invalidCredentials: {
    message: 'Invalid email or password',
    code: 'INVALID_CREDENTIALS',
    statusCode: 401,
  },

  notAuthorized: {
    message: 'You are not authorized to perform this action',
    code: 'NOT_AUTHORIZED',
    statusCode: 403,
  },

  notFound: {
    message: 'Resource not found',
    code: 'NOT_FOUND',
    statusCode: 404,
  },

  validationError: {
    message: 'Validation error',
    code: 'VALIDATION_ERROR',
    statusCode: 400,
  },

  rateLimitExceeded: {
    message: 'Rate limit exceeded',
    code: 'RATE_LIMIT_EXCEEDED',
    statusCode: 429,
  },

  serverError: {
    message: 'Internal server error',
    code: 'INTERNAL_SERVER_ERROR',
    statusCode: 500,
  },
};

/**
 * Mock external API responses
 */
export const MOCK_API_RESPONSES = {
  weather: {
    temperature: 72,
    condition: 'Sunny',
    humidity: 45,
    windSpeed: 8,
  },

  currency: {
    base: 'USD',
    rates: {
      EUR: 0.85,
      GBP: 0.73,
      JPY: 110.0,
      CAD: 1.25,
    },
  },

  stock: {
    symbol: 'AAPL',
    price: 175.50,
    change: 2.35,
    changePercent: 1.35,
  },
};

/**
 * Test scenario builders
 */
export class TestScenarioBuilder {
  private users: TestUser[] = [];
  private spreadsheets: TestSpreadsheet[] = [];
  private posts: TestPost[] = [];

  withUsers(count: number): this {
    // Users will be generated when scenario is built
    (this as any).userCount = count;
    return this;
  }

  withSpreadsheets(count: number, ownerId?: string): this {
    (this as any).spreadsheetCount = count;
    (this as any).spreadsheetOwnerId = ownerId;
    return this;
  }

  withPosts(count: number, authorId?: string): this {
    (this as any).postCount = count;
    (this as any).postAuthorId = authorId;
    return this;
  }

  async build(): Promise<{
    users: TestUser[];
    spreadsheets: TestSpreadsheet[];
    posts: TestPost[];
  }> {
    const { generateTestUser, generateTestSpreadsheet, generateTestPost, seedTestUsers } = await import(
      '../database/seeds'
    );

    // Generate users
    const userCount = (this as any).userCount || 0;
    if (userCount > 0) {
      this.users = await seedTestUsers(userCount);
    }

    // Generate spreadsheets
    const spreadsheetCount = (this as any).spreadsheetCount || 0;
    const spreadsheetOwnerId = (this as any).spreadsheetOwnerId || this.users[0]?.id;
    if (spreadsheetCount > 0 && spreadsheetOwnerId) {
      for (let i = 0; i < spreadsheetCount; i++) {
        this.spreadsheets.push(generateTestSpreadsheet({ owner_id: spreadsheetOwnerId }));
      }
    }

    // Generate posts
    const postCount = (this as any).postCount || 0;
    const postAuthorId = (this as any).postAuthorId || this.users[0]?.id;
    if (postCount > 0 && postAuthorId) {
      for (let i = 0; i < postCount; i++) {
        this.posts.push(generateTestPost({ author_id: postAuthorId }));
      }
    }

    return {
      users: this.users,
      spreadsheets: this.spreadsheets,
      posts: this.posts,
    };
  }
}

/**
 * Create a test scenario builder
 */
export function createScenario(): TestScenarioBuilder {
  return new TestScenarioBuilder();
}

/**
 * Wait helper for async tests
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry helper for flaky tests
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxAttempts) {
        await wait(delay);
      }
    }
  }

  throw lastError;
}
