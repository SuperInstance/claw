/**
 * Spreadsheet Moment - Cloudflare Worker Entry Point (Simplified)
 * MIT License - Copyright (c) 2026 SuperInstance Research Team
 *
 * Basic Worker with health check and API endpoints
 */

/**
 * Environment variables
 */
export interface Env {
  // D1 Database
  DB: D1Database;

  // KV Storage
  CACHE: KVNamespace;
  SESSIONS: KVNamespace;

  // R2 Buckets
  ASSETS: R2Bucket;
  UPLOADS: R2Bucket;

  // Durable Objects (disabled for simplified deployment)
  // COLLABORATION: any;

  // Secrets
  JWT_SECRET?: string;
  DATABASE_URL?: string;
  SMTP_PASSWORD?: string;
  STRIPE_SECRET_KEY?: string;

  // Environment variables
  ENVIRONMENT: string;
  LOG_LEVEL: string;
  VERSION: string;
}

/**
 * CORS headers
 */
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

/**
 * Main Worker handler
 */
export default {
  /**
   * Handle fetch requests
   */
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    try {
      // Health check
      if (path === '/health' || path === '/') {
        return jsonResponse({
          status: 'healthy',
          version: env.VERSION || '1.0.0',
          timestamp: new Date().toISOString(),
          environment: env.ENVIRONMENT || 'development',
        });
      }

      // API v1 endpoints
      if (path.startsWith('/api/v1/')) {
        return handleApiV1(request, env, ctx, path);
      }

      // GraphQL endpoint (placeholder)
      if (path === '/graphql') {
        return jsonResponse({
          error: 'GraphQL endpoint not yet implemented',
          message: 'Please use REST API v1 endpoints',
        }, 501);
      }

      // 404 Not Found
      return jsonResponse({
        error: 'Not Found',
        message: `The requested path ${path} was not found`,
        status: 404,
      }, 404);

    } catch (error) {
      console.error('Error handling request:', error);
      return jsonResponse({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
        status: 500,
      }, 500);
    }
  },
};

/**
 * Handle API v1 endpoints
 */
async function handleApiV1(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
  path: string
): Promise<Response> {
  const endpoint = path.replace('/api/v1/', '');

  switch (endpoint) {
    case 'health':
      return jsonResponse({
        status: 'ok',
        database: await checkDatabase(env),
        timestamp: new Date().toISOString(),
      });

    case 'users':
      if (request.method === 'GET') {
        return await getUsers(env);
      }
      return jsonResponse({ error: 'Method not allowed' }, 405);

    case 'spreadsheets':
      if (request.method === 'GET') {
        return await getSpreadsheets(env);
      }
      if (request.method === 'POST') {
        return await createSpreadsheet(request, env);
      }
      return jsonResponse({ error: 'Method not allowed' }, 405);

    default:
      return jsonResponse({ error: 'Unknown endpoint' }, 404);
  }
}

/**
 * Check database connectivity
 */
async function checkDatabase(env: Env): Promise<string> {
  try {
    const result = await env.DB.prepare('SELECT 1').first();
    return result ? 'connected' : 'error';
  } catch (error) {
    return 'error';
  }
}

/**
 * Get users
 */
async function getUsers(env: Env): Promise<Response> {
  try {
    const result = await env.DB.prepare(
      'SELECT id, email, name, created_at FROM users LIMIT 10'
    ).all();

    return jsonResponse({
      users: result.results,
      count: result.results.length,
    });
  } catch (error) {
    return jsonResponse({
      error: 'Failed to fetch users',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, 500);
  }
}

/**
 * Get spreadsheets
 */
async function getSpreadsheets(env: Env): Promise<Response> {
  try {
    const result = await env.DB.prepare(
      'SELECT id, name, description, owner_id, created_at FROM spreadsheets LIMIT 10'
    ).all();

    return jsonResponse({
      spreadsheets: result.results,
      count: result.results.length,
    });
  } catch (error) {
    return jsonResponse({
      error: 'Failed to fetch spreadsheets',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, 500);
  }
}

/**
 * Create spreadsheet
 */
async function createSpreadsheet(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json() as {
      name?: string;
      description?: string;
      owner_id?: string;
    };

    if (!body.name || !body.owner_id) {
      return jsonResponse({
        error: 'Missing required fields',
        required: ['name', 'owner_id'],
      }, 400);
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await env.DB.prepare(
      'INSERT INTO spreadsheets (id, name, description, owner_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(
      id,
      body.name,
      body.description || null,
      body.owner_id,
      now,
      now
    ).run();

    return jsonResponse({
      id,
      name: body.name,
      description: body.description,
      owner_id: body.owner_id,
      created_at: now,
      updated_at: now,
    }, 201);
  } catch (error) {
    return jsonResponse({
      error: 'Failed to create spreadsheet',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, 500);
  }
}

/**
 * Helper: Create JSON response
 */
function jsonResponse(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
      ...headers,
    },
  });
}
