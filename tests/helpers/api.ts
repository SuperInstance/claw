/**
 * API Test Helpers
 * Provides utilities for testing GraphQL API endpoints
 */

import request from 'supertest';
import { Express } from 'express';
import jwt from 'jsonwebtoken';
import { TestUser, generateTestJwtPayload } from '../database/seeds';

export interface GraphQLResponse<T = any> {
  data?: T;
  errors?: Array<{
    message: string;
    path?: string[];
    extensions?: any;
  }>;
}

export class ApiTestClient {
  private app: Express;
  private authToken: string | null = null;

  constructor(app: Express) {
    this.app = app;
  }

  /**
   * Set authentication token for requests
   */
  setAuthToken(token: string): void {
    this.authToken = token;
  }

  /**
   * Set authentication token from user
   */
  async authenticateUser(user: TestUser): Promise<string> {
    const payload = generateTestJwtPayload(user);
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'test-jwt-secret-key-for-integration-tests');
    this.setAuthToken(token);
    return token;
  }

  /**
   * Clear authentication token
   */
  clearAuth(): void {
    this.authToken = null;
  }

  /**
   * Build request headers
   */
  private getHeaders(additionalHeaders: Record<string, string> = {}): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...additionalHeaders,
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  /**
   * Execute GraphQL query
   */
  async query<T = any>(
    query: string,
    variables?: Record<string, any>,
    headers?: Record<string, string>
  ): Promise<GraphQLResponse<T>> {
    const response = await request(this.app)
      .post('/graphql')
      .set(this.getHeaders(headers))
      .send({
        query,
        variables,
      });

    return response.body;
  }

  /**
   * Execute GraphQL mutation
   */
  async mutate<T = any>(
    mutation: string,
    variables?: Record<string, any>,
    headers?: Record<string, string>
  ): Promise<GraphQLResponse<T>> {
    return this.query<T>(mutation, variables, headers);
  }

  /**
   * Execute raw HTTP request
   */
  async request(
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    path: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<any> {
    const req = request(this.app)[method](path).set(this.getHeaders(headers));

    if (data && ['post', 'put', 'patch'].includes(method)) {
      req.send(data);
    }

    return req;
  }

  /**
   * Test GraphQL query for errors
   */
  async expectGraphQLError(
    query: string,
    variables?: Record<string, any>,
    expectedErrorMessage?: string
  ): Promise<any> {
    const response = await this.query(query, variables);

    expect(response.errors).toBeDefined();
    expect(response.errors).toHaveLengthGreaterThan(0);

    if (expectedErrorMessage) {
      expect(response.errors?.[0].message).toContain(expectedErrorMessage);
    }

    return response;
  }

  /**
   * Test GraphQL query for authentication error
   */
  async expectAuthError(query: string, variables?: Record<string, any>): Promise<void> {
    await this.expectGraphQLError(query, variables, 'Authentication required');
  }

  /**
   * Test GraphQL query for authorization error
   */
  async expectAuthorizationError(query: string, variables?: Record<string, any>): Promise<void> {
    await this.expectGraphQLError(query, variables, 'Not authorized');
  }
}

/**
 * GraphQL query builders
 */
export const GraphQLQueries = {
  // User queries
  getUser: (id: string) => `
    query GetUser {
      user(id: "${id}") {
        id
        email
        username
        locale
        role
        createdAt
      }
    }
  `,

  getMe: `
    query GetMe {
      me {
        id
        email
        username
        locale
        role
        preferences
      }
    }
  `,

  // Spreadsheet queries
  getSpreadsheet: (id: string) => `
    query GetSpreadsheet {
      spreadsheet(id: "${id}") {
        id
        name
        description
        isPublic
        createdAt
        updatedAt
        owner {
          id
          username
        }
      }
    }
  `,

  listSpreadsheets: (first = 10, after = '') => `
    query ListSpreadsheets {
      spreadsheets(first: ${first}${after ? `, after: "${after}"` : ''}) {
        edges {
          node {
            id
            name
            description
            isPublic
            createdAt
          }
          cursor
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          endCursor
          startCursor
        }
        totalCount
      }
    }
  `,

  // Analytics queries
  getAnalytics: (spreadsheetId: string, startDate: string, endDate: string) => `
    query GetAnalytics {
      analytics(spreadsheetId: "${spreadsheetId}", startDate: "${startDate}", endDate: "${endDate}") {
        totalViews
        uniqueUsers
        averageSessionDuration
        topActions {
          action
          count
        }
      }
    }
  `,

  // Community queries
  getPosts: (first = 10, locale = 'en-US') => `
    query GetPosts {
      posts(first: ${first}, locale: "${locale}") {
        id
        title
        content
        locale
        tags
        upvotes
        downvotes
        createdAt
        author {
          id
          username
        }
      }
    }
  `,

  getPost: (id: string) => `
    query GetPost {
      post(id: "${id}") {
        id
        title
        content
        locale
        tags
        upvotes
        downvotes
        createdAt
        author {
          id
          username
        }
        comments {
          id
          content
          upvotes
          createdAt
          author {
            id
            username
          }
        }
      }
    }
  `,
};

/**
 * GraphQL mutation builders
 */
export const GraphQLMutations = {
  // User mutations
  register: (email: string, username: string, password: string, locale = 'en-US') => `
    mutation Register {
      register(input: {
        email: "${email}"
        username: "${username}"
        password: "${password}"
        locale: "${locale}"
      }) {
        user {
          id
          email
          username
          locale
        }
        token
      }
    }
  `,

  login: (email: string, password: string) => `
    mutation Login {
      login(input: {
        email: "${email}"
        password: "${password}"
      }) {
        user {
          id
          email
          username
          locale
        }
        token
      }
    }
  `,

  logout: `
    mutation Logout {
      logout {
        success
      }
    }
  `,

  // Spreadsheet mutations
  createSpreadsheet: (name: string, description = '') => `
    mutation CreateSpreadsheet {
      createSpreadsheet(input: {
        name: "${name.replace(/"/g, '\\"')}"
        description: "${description.replace(/"/g, '\\"')}"
      }) {
        id
        name
        description
        isPublic
        createdAt
      }
    }
  `,

  updateSpreadsheet: (id: string, name?: string, description?: string) => `
    mutation UpdateSpreadsheet {
      updateSpreadsheet(input: {
        id: "${id}"
        ${name ? `name: "${name.replace(/"/g, '\\"')}"` : ''}
        ${description ? `description: "${description.replace(/"/g, '\\"')}"` : ''}
      }) {
        id
        name
        description
        updatedAt
      }
    }
  `,

  deleteSpreadsheet: (id: string) => `
    mutation DeleteSpreadsheet {
      deleteSpreadsheet(id: "${id}") {
        success
      }
    }
  `,

  // Collaborator mutations
  addCollaborator: (spreadsheetId: string, email: string, role = 'viewer') => `
    mutation AddCollaborator {
      addCollaborator(input: {
        spreadsheetId: "${spreadsheetId}"
        email: "${email}"
        role: ${role}
      }) {
        id
        role
        user {
          id
          email
          username
        }
      }
    }
  `,

  removeCollaborator: (spreadsheetId: string, userId: string) => `
    mutation RemoveCollaborator {
      removeCollaborator(input: {
        spreadsheetId: "${spreadsheetId}"
        userId: "${userId}"
      }) {
        success
      }
    }
  `,

  // Post mutations
  createPost: (title: string, content: string, tags: string[] = []) => `
    mutation CreatePost {
      createPost(input: {
        title: "${title.replace(/"/g, '\\"')}"
        content: "${content.replace(/"/g, '\\"')}"
        tags: ${JSON.stringify(tags)}
      }) {
        id
        title
        content
        tags
        createdAt
      }
    }
  `,

  upvotePost: (postId: string) => `
    mutation UpvotePost {
      upvotePost(postId: "${postId}") {
        id
        upvotes
      }
    }
  `,

  downvotePost: (postId: string) => `
    mutation DownvotePost {
      downvotePost(postId: "${postId}") {
        id
        downvotes
      }
    }
  `,

  // Comment mutations
  addComment: (postId: string, content: string) => `
    mutation AddComment {
      addComment(input: {
        postId: "${postId}"
        content: "${content.replace(/"/g, '\\"')}"
      }) {
        id
        content
        createdAt
        author {
          id
          username
        }
      }
    }
  `,
};

/**
 * Extract data from GraphQL response
 */
export function extractData<T>(response: GraphQLResponse<T>): T {
  if (response.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(response.errors)}`);
  }
  if (!response.data) {
    throw new Error('No data in GraphQL response');
  }
  return response.data;
}

/**
 * Extract first error from GraphQL response
 */
export function extractError(response: GraphQLResponse): string | undefined {
  return response.errors?.[0]?.message;
}

/**
 * Create a test request builder for non-GraphQL endpoints
 */
export class RequestBuilder {
  private headers: Record<string, string> = {};
  private queryParams: Record<string, string> = {};
  private body: any = null;

  constructor(private app: Express) {}

  withAuth(token: string): this {
    this.headers['Authorization'] = `Bearer ${token}`;
    return this;
  }

  withHeader(key: string, value: string): this {
    this.headers[key] = value;
    return this;
  }

  withQuery(key: string, value: string): this {
    this.queryParams[key] = value;
    return this;
  }

  withBody(body: any): this {
    this.body = body;
    return this;
  }

  async get(path: string) {
    let req = request(this.app).get(path).set(this.headers);
    if (Object.keys(this.queryParams).length > 0) {
      req = req.query(this.queryParams);
    }
    return req;
  }

  async post(path: string) {
    return request(this.app).post(path).set(this.headers).send(this.body);
  }

  async put(path: string) {
    return request(this.app).put(path).set(this.headers).send(this.body);
  }

  async patch(path: string) {
    return request(this.app).patch(path).set(this.headers).send(this.body);
  }

  async delete(path: string) {
    return request(this.app).delete(path).set(this.headers);
  }

  reset(): void {
    this.headers = {};
    this.queryParams = {};
    this.body = null;
  }
}
