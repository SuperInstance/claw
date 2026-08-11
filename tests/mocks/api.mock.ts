/**
 * API Mock Objects
 */

import { jest } from '@jest/globals';

export const mockGraphQLContext = {
  user: null,
  session: null,
  dataLoader: null,
  request: {
    headers: new Headers(),
    ip: '127.0.0.1',
    userAgent: 'test-agent',
  },
};

export const mockDataLoader = {
  load: jest.fn(),
  loadMany: jest.fn(),
  prime: jest.fn(),
  clear: jest.fn(),
  clearAll: jest.fn(),
};

export class MockPubSub {
  private subscribers: Map<string, Set<Function>> = new Map();

  publish = jest.fn((topic: string, payload: any) => {
    const subscribers = this.subscribers.get(topic) || new Set();
    subscribers.forEach((callback) => callback(payload));
    return Promise.resolve(true);
  });

  subscribe = jest.fn((topic: string, callback: Function) => {
    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, new Set());
    }
    this.subscribers.get(topic)!.add(callback);
    return Promise.resolve({ id: Math.random().toString(36) });
  });

  unsubscribe = jest.fn((topic: string, callback: Function) => {
    const subscribers = this.subscribers.get(topic);
    if (subscribers) {
      subscribers.delete(callback);
    }
    return Promise.resolve(true);
  });

  clear = jest.fn(() => {
    this.subscribers.clear();
  });
}

export const mockGraphQLResolvers = {
  Query: {
    user: jest.fn(),
    spreadsheet: jest.fn(),
    spreadsheets: jest.fn(),
    analytics: jest.fn(),
  },
  Mutation: {
    createSpreadsheet: jest.fn(),
    updateSpreadsheet: jest.fn(),
    deleteSpreadsheet: jest.fn(),
  },
  Subscription: {
    spreadsheetUpdated: jest.fn(),
    collaboratorJoined: jest.fn(),
  },
};

export const mockGraphQLSchema = {
  getQueryType: jest.fn(),
  getMutationType: jest.fn(),
  getSubscriptionType: jest.fn(),
  getType: jest.fn(),
};

export const createMockApolloServer = () => ({
  start: jest.fn().mockResolvedValue(undefined),
  stop: jest.fn().mockResolvedValue(undefined),
  executeOperation: jest.fn().mockResolvedValue({
    data: {},
    errors: null,
  }),
});

export const mockSubscriptionServer = {
  close: jest.fn(),
  getSubscriptions: jest.fn(() => []),
};
