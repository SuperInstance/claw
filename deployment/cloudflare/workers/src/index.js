/**
 * Spreadsheet Moment - Cloudflare Worker Entry Point
 * MIT License - Copyright (c) 2026 SuperInstance Research Team
 *
 * Main Worker entry point with GraphQL API v2, WebSocket subscriptions,
 * analytics, i18n, and community features
 */
import { graphql, parse, validate } from 'graphql';
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
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const path = url.pathname;
        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: CORS_HEADERS });
        }
        try {
            // Health check
            if (path === '/health') {
                return jsonResponse({
                    status: 'healthy',
                    version: env.VERSION,
                    timestamp: new Date().toISOString(),
                });
            }
            // GraphQL API endpoint
            if (path === '/graphql' || path === '/api/v2/graphql') {
                if (request.method === 'GET') {
                    // GraphQL GET request (query only)
                    return handleGraphQLGet(request, env, ctx);
                }
                else if (request.method === 'POST') {
                    // GraphQL POST request
                    return handleGraphQLPost(request, env, ctx);
                }
            }
            // WebSocket endpoint for subscriptions
            if (path === '/graphql-subscriptions' || path === '/api/v2/subscriptions') {
                return handleWebSocketUpgrade(request, env);
            }
            // Analytics endpoint
            if (path.startsWith('/analytics/')) {
                return handleAnalytics(request, env, ctx);
            }
            // i18n endpoint
            if (path.startsWith('/i18n/')) {
                return handleI18n(request, env, ctx);
            }
            // Community endpoints
            if (path.startsWith('/community/')) {
                return handleCommunity(request, env, ctx);
            }
            // Collaboration endpoint (Durable Object)
            if (path.startsWith('/collaborate/')) {
                return handleCollaboration(request, env);
            }
            // Static assets from R2
            if (path.startsWith('/assets/')) {
                return handleAsset(request, env);
            }
            // 404 Not Found
            return jsonResponse({
                error: 'Not Found',
                message: `The requested path ${path} was not found`,
                status: 404,
            }, 404);
        }
        catch (error) {
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
 * Handle GraphQL GET request
 */
async function handleGraphQLGet(request, env, ctx) {
    const url = new URL(request.url);
    const query = url.searchParams.get('query');
    const variables = url.searchParams.get('variables');
    const operationName = url.searchParams.get('operationName');
    if (!query) {
        return jsonResponse({
            errors: [{
                    message: 'Must provide query parameter',
                }],
        }, 400);
    }
    return executeGraphQL({
        query,
        variables: variables ? JSON.parse(variables) : undefined,
        operationName: operationName || undefined,
    }, request, env, ctx);
}
/**
 * Handle GraphQL POST request
 */
async function handleGraphQLPost(request, env, ctx) {
    const body = await request.json();
    if (!body.query) {
        return jsonResponse({
            errors: [{
                    message: 'Must provide query in request body',
                }],
        }, 400);
    }
    return executeGraphQL({
        query: body.query,
        variables: body.variables,
        operationName: body.operationName,
    }, request, env, ctx);
}
/**
 * Execute GraphQL query
 */
async function executeGraphQL(params, request, env, ctx) {
    try {
        // Get schema (imported from the actual schema file)
        const schema = await getGraphQLSchema(env);
        // Parse query
        const document = parse(params.query);
        // Validate query
        const validationErrors = validate(schema, document);
        if (validationErrors.length > 0) {
            return jsonResponse({
                errors: validationErrors.map(err => ({
                    message: err.message,
                    locations: err.locations,
                })),
            }, 400);
        }
        // Build context
        const context = {
            req: request,
            env,
            ctx,
            user: await authenticateUser(request, env),
        };
        // Execute query
        const result = await graphql({
            schema,
            source: params.query,
            variableValues: params.variables,
            operationName: params.operationName,
            contextValue: context,
        });
        return jsonResponse(result);
    }
    catch (error) {
        console.error('GraphQL execution error:', error);
        return jsonResponse({
            errors: [{
                    message: error instanceof Error ? error.message : 'Unknown error',
                }],
        }, 500);
    }
}
/**
 * Get GraphQL schema
 */
async function getGraphQLSchema(env) {
    // In a real implementation, this would import and build the schema
    // For now, return a minimal schema
    const { buildSchema } = await import('graphql');
    return buildSchema(`
    type Query {
      viewer: User
      spreadsheet(id: ID!): Spreadsheet
    }

    type Mutation {
      createSpreadsheet(name: String!, description: String): Spreadsheet
    }

    type User {
      id: ID!
      email: String!
      name: String
      avatar: String
    }

    type Spreadsheet {
      id: ID!
      name: String!
      description: String
      createdAt: String!
      updatedAt: String!
    }
  `);
}
/**
 * Authenticate user from request
 */
async function authenticateUser(request, env) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return undefined;
    }
    const token = authHeader.substring(7);
    try {
        // Verify JWT token
        const jwt = await import('jsonwebtoken');
        const decoded = jwt.verify(token, env.JWT_SECRET);
        return decoded;
    }
    catch (error) {
        return undefined;
    }
}
/**
 * Handle WebSocket upgrade for subscriptions
 */
function handleWebSocketUpgrade(request, env) {
    // Upgrade to WebSocket for GraphQL subscriptions
    // This would integrate with graphql-ws or similar
    return new Response('WebSocket subscriptions not yet implemented', {
        status: 501,
    });
}
/**
 * Handle analytics requests
 */
async function handleAnalytics(request, env, ctx) {
    const url = new URL(request.url);
    const metricPath = url.pathname.replace('/analytics/', '');
    // Parse metric path (e.g., "metrics/user.active", "dashboard/overview")
    const [type, ...rest] = metricPath.split('/');
    switch (type) {
        case 'metrics':
            return getAnalyticsMetrics(rest.join('/'), request, env);
        case 'dashboard':
            return getAnalyticsDashboard(rest.join('/'), request, env);
        case 'events':
            return recordAnalyticsEvent(request, env, ctx);
        default:
            return jsonResponse({ error: 'Unknown analytics endpoint' }, 404);
    }
}
/**
 * Get analytics metrics
 */
async function getAnalyticsMetrics(metricName, request, env) {
    // Query D1 for metrics
    const url = new URL(request.url);
    const timeRange = url.searchParams.get('timeRange') || '24h';
    const results = await env.DB.prepare(`
    SELECT
      metric_name,
      metric_value,
      timestamp
    FROM usage_metrics
    WHERE metric_name = ?
      AND timestamp >= datetime('now', '-' || ? || ' hours')
    ORDER BY timestamp DESC
    LIMIT 1000
  `).bind(metricName, timeRange.replace('h', '')).all();
    return jsonResponse({
        metric: metricName,
        timeRange,
        data: results.results,
    });
}
/**
 * Get analytics dashboard
 */
async function getAnalyticsDashboard(dashboardId, request, env) {
    // Return dashboard configuration
    const dashboards = {
        overview: {
            widgets: [
                { type: 'metric-card', title: 'Active Users', metric: 'users.active' },
                { type: 'metric-card', title: 'Total Spreadsheets', metric: 'spreadsheets.total' },
                { type: 'line-chart', title: 'User Growth', metrics: ['users.daily'] },
            ],
        },
    };
    const dashboard = dashboards[dashboardId];
    if (!dashboard) {
        return jsonResponse({ error: 'Dashboard not found' }, 404);
    }
    return jsonResponse(dashboard);
}
/**
 * Record analytics event
 */
async function recordAnalyticsEvent(request, env, ctx) {
    if (request.method !== 'POST') {
        return jsonResponse({ error: 'Method not allowed' }, 405);
    }
    const body = await request.json();
    // Insert event into database
    await env.DB.prepare(`
    INSERT INTO analytics_events (user_id, session_id, event_type, event_data, created_at)
    VALUES (?, ?, ?, ?, datetime('now'))
  `).bind(body.userId || null, body.sessionId || null, body.eventType, JSON.stringify(body.eventData || {})).run();
    return jsonResponse({ success: true });
}
/**
 * Handle i18n requests
 */
async function handleI18n(request, env, ctx) {
    const url = new URL(request.url);
    const locale = url.pathname.split('/')[3];
    // Check cache first
    const cacheKey = `i18n:${locale}`;
    const cached = await env.CACHE.get(cacheKey);
    if (cached) {
        return jsonResponse(JSON.parse(cached), 200, {
            'X-Cache': 'HIT',
        });
    }
    // Query translations from database
    const translations = await getTranslations(locale, env);
    // Cache for 1 hour
    ctx.waitUntil(env.CACHE.put(cacheKey, JSON.stringify(translations), {
        expirationTtl: 3600,
    }));
    return jsonResponse(translations, 200, {
        'X-Cache': 'MISS',
    });
}
/**
 * Get translations for locale
 */
async function getTranslations(locale, env) {
    const results = await env.DB.prepare(`
    SELECT key, value
    FROM translations
    WHERE locale = ?
  `).bind(locale).all();
    const translations = {};
    for (const row of results.results) {
        translations[row.key] = row.value;
    }
    return translations;
}
/**
 * Handle community requests
 */
async function handleCommunity(request, env, ctx) {
    const url = new URL(request.url);
    const resource = url.pathname.split('/')[3];
    switch (resource) {
        case 'posts':
            return handleForumPosts(request, env);
        case 'templates':
            return handleTemplates(request, env);
        case 'users':
            return handleUsers(request, env);
        default:
            return jsonResponse({ error: 'Unknown community resource' }, 404);
    }
}
/**
 * Handle forum posts
 */
async function handleForumPosts(request, env) {
    if (request.method === 'GET') {
        const url = new URL(request.url);
        const category = url.searchParams.get('category');
        const limit = parseInt(url.searchParams.get('limit') || '20');
        let query = 'SELECT * FROM forum_posts';
        const params = [];
        if (category) {
            query += ' WHERE category = ?';
            params.push(category);
        }
        query += ' ORDER BY created_at DESC LIMIT ?';
        params.push(limit);
        const results = await env.DB.prepare(query).bind(...params).all();
        return jsonResponse({
            posts: results.results,
        });
    }
    return jsonResponse({ error: 'Method not allowed' }, 405);
}
/**
 * Handle templates
 */
async function handleTemplates(request, env) {
    if (request.method === 'GET') {
        const url = new URL(request.url);
        const category = url.searchParams.get('category');
        const featured = url.searchParams.get('featured') === 'true';
        let query = 'SELECT * FROM templates WHERE approved = 1';
        const params = [];
        if (category) {
            query += ' AND category = ?';
            params.push(category);
        }
        if (featured) {
            query += ' AND featured = 1';
        }
        query += ' ORDER BY downloads DESC LIMIT 50';
        const results = await env.DB.prepare(query).bind(...params).all();
        return jsonResponse({
            templates: results.results,
        });
    }
    return jsonResponse({ error: 'Method not allowed' }, 405);
}
/**
 * Handle users
 */
async function handleUsers(request, env) {
    const url = new URL(request.url);
    const userId = url.pathname.split('/')[4];
    if (request.method === 'GET' && userId) {
        const user = await env.DB.prepare(`
      SELECT id, name, avatar, bio, reputation, created_at
      FROM users
      WHERE id = ?
    `).bind(userId).first();
        if (!user) {
            return jsonResponse({ error: 'User not found' }, 404);
        }
        return jsonResponse({ user });
    }
    return jsonResponse({ error: 'Method not allowed' }, 405);
}
/**
 * Handle collaboration requests (Durable Object)
 */
async function handleCollaboration(request, env) {
    const url = new URL(request.url);
    const spreadsheetId = url.pathname.split('/')[3];
    // Get or create Durable Object stub
    const stub = env.COLLABORATION.get(env.COLLABORATION.idFromName(spreadsheetId));
    // Forward request to Durable Object
    return stub.fetch(request);
}
/**
 * Handle static assets from R2
 */
async function handleAsset(request, env) {
    const url = new URL(request.url);
    const key = url.pathname.substring(8); // Remove '/assets/'
    const object = await env.ASSETS.get(key);
    if (!object) {
        return jsonResponse({ error: 'Asset not found' }, 404);
    }
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('Cache-Control', 'public, max-age=31536000');
    return new Response(object.body, { headers });
}
/**
 * Helper: Create JSON response
 */
function jsonResponse(data, status = 200, headers = {}) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json',
            ...CORS_HEADERS,
            ...headers,
        },
    });
}
//# sourceMappingURL=index.js.map