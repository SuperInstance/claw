# Claw API Documentation

## Overview

The Claw API provides a RESTful interface for managing cellular agents in the Claw engine. It supports creating, updating, querying, and deleting agents, along with real-time WebSocket communication for live updates.

## Base URL

```
http://localhost:3000
```

## Authentication

The API uses JWT (JSON Web Token) authentication. Include the token in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

### Authentication Flow

1. **Authenticate** to receive access token and refresh token
2. **Include access token** in the `Authorization` header for protected endpoints
3. **Refresh token** when access token expires
4. **Logout** by invalidating the token

## API Endpoints

### Health Check

Check if the API is running and get basic statistics.

**Endpoint:** `GET /health`

**Authentication:** None required

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "version": "0.1.0",
    "uptime": 3600,
    "active_agents": 5,
    "connected_clients": 3
  },
  "request_id": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2026-03-16T12:00:00Z"
}
```

---

### Authentication

#### Authenticate

Authenticate with username and password to receive JWT tokens.

**Endpoint:** `POST /api/v1/auth`

**Authentication:** None required

**Request Body:**
```json
{
  "username": "string (1-100 characters)",
  "password": "string (8-100 characters)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 3600,
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "request_id": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2026-03-16T12:00:00Z"
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid credentials

#### Refresh Token

Refresh access token using refresh token.

**Endpoint:** `POST /api/v1/auth/refresh`

**Authentication:** None required (uses refresh token)

**Request Body:**
```json
{
  "refresh_token": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 3600,
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "request_id": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2026-03-16T12:00:00Z"
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid refresh token

---

### Agent Management

#### Create Agent

Create a new cellular agent with specified configuration.

**Endpoint:** `POST /api/v1/agents`

**Authentication:** Required

**Request Body:**
```json
{
  "id": "optional UUID",
  "model": "string (e.g., 'deepseek-chat', 'gpt-4')",
  "max_tokens": 2000,
  "temperature": 0.7,
  "equipment": ["optional array of equipment slots"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "state": {
      "status": "IDLE",
      "reasoning": null,
      "last_activity": "2026-03-16T12:00:00Z"
    },
    "config": {
      "model": "deepseek-chat",
      "max_tokens": 2000,
      "temperature": 0.7
    },
    "equipped": [],
    "created_at": "2026-03-16T12:00:00Z",
    "updated_at": "2026-03-16T12:00:00Z"
  },
  "request_id": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2026-03-16T12:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Missing or invalid token
- `409 Conflict` - Agent already exists

#### Get Agent

Get detailed information about a specific agent.

**Endpoint:** `GET /api/v1/agents/:id`

**Authentication:** Required

**URL Parameters:**
- `id` (UUID) - Agent ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "state": {
      "status": "THINKING",
      "reasoning": "Processing cell update",
      "last_activity": "2026-03-16T12:00:00Z"
    },
    "config": {
      "model": "deepseek-chat",
      "max_tokens": 2000,
      "temperature": 0.7
    },
    "equipped": ["MEMORY", "REASONING"],
    "created_at": "2026-03-16T12:00:00Z",
    "updated_at": "2026-03-16T12:00:00Z"
  },
  "request_id": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2026-03-16T12:00:00Z"
}
```

**Error Responses:**
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Agent not found

#### Update Agent

Update agent configuration.

**Endpoint:** `PUT /api/v1/agents/:id`

**Authentication:** Required

**URL Parameters:**
- `id` (UUID) - Agent ID

**Request Body:**
```json
{
  "model": "string (optional)",
  "max_tokens": 2000,
  "temperature": 0.5
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "state": {
      "status": "IDLE",
      "reasoning": null,
      "last_activity": "2026-03-16T12:00:00Z"
    },
    "config": {
      "model": "gpt-4",
      "max_tokens": 2000,
      "temperature": 0.5
    },
    "equipped": ["MEMORY"],
    "created_at": "2026-03-16T12:00:00Z",
    "updated_at": "2026-03-16T12:01:00Z"
  },
  "request_id": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2026-03-16T12:01:00Z"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Agent not found

#### Delete Agent

Delete an agent permanently.

**Endpoint:** `DELETE /api/v1/agents/:id`

**Authentication:** Required

**URL Parameters:**
- `id` (UUID) - Agent ID

**Response:**
- Status Code: `204 No Content`

**Error Responses:**
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Agent not found

#### List Agents

Get a list of all agents with pagination.

**Endpoint:** `GET /api/v1/agents`

**Authentication:** Required

**Query Parameters:**
- `page` (optional, default: 0)
- `page_size` (optional, default: 100)

**Response:**
```json
{
  "success": true,
  "data": {
    "agents": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "state": {
          "status": "IDLE",
          "reasoning": null,
          "last_activity": "2026-03-16T12:00:00Z"
        },
        "config": {
          "model": "deepseek-chat",
          "max_tokens": 2000,
          "temperature": 0.7
        },
        "equipped": ["MEMORY"],
        "created_at": "2026-03-16T12:00:00Z",
        "updated_at": "2026-03-16T12:00:00Z"
      }
    ],
    "total": 1,
    "page": 0,
    "page_size": 100
  },
  "request_id": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2026-03-16T12:00:00Z"
}
```

**Error Responses:**
- `401 Unauthorized` - Missing or invalid token

#### Get Agent State

Get current state of the agent.

**Endpoint:** `GET /api/v1/agents/:id/state`

**Authentication:** Required

**URL Parameters:**
- `id` (UUID) - Agent ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "state": {
      "status": "THINKING",
      "reasoning": "Processing spreadsheet update",
      "last_activity": "2026-03-16T12:00:00Z"
    },
    "equipped": ["MEMORY", "REASONING"],
    "created_at": "2026-03-16T12:00:00Z",
    "updated_at": "2026-03-16T12:00:00Z"
  },
  "request_id": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2026-03-16T12:00:00Z"
}
```

**Error Responses:**
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Agent not found

---

### Equipment Management

#### Equip Agent

Equip agent with specified equipment.

**Endpoint:** `POST /api/v1/agents/:id/equip`

**Authentication:** Required

**URL Parameters:**
- `id` (UUID) - Agent ID

**Request Body:**
```json
{
  "equipment": ["MEMORY", "REASONING", "CONSENSUS"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "state": {
      "status": "IDLE",
      "reasoning": null,
      "last_activity": "2026-03-16T12:00:00Z"
    },
    "config": {
      "model": "deepseek-chat",
      "max_tokens": 2000,
      "temperature": 0.7
    },
    "equipped": ["MEMORY", "REASONING", "CONSENSUS"],
    "created_at": "2026-03-16T12:00:00Z",
    "updated_at": "2026-03-16T12:01:00Z"
  },
  "request_id": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2026-03-16T12:01:00Z"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid equipment or equipment already equipped
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Agent not found

#### Unequip Agent

Unequip specified equipment from agent.

**Endpoint:** `POST /api/v1/agents/:id/unequip`

**Authentication:** Required

**URL Parameters:**
- `id` (UUID) - Agent ID

**Request Body:**
```json
{
  "equipment": ["MEMORY"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "state": {
      "status": "IDLE",
      "reasoning": null,
      "last_activity": "2026-03-16T12:00:00Z"
    },
    "config": {
      "model": "deepseek-chat",
      "max_tokens": 2000,
      "temperature": 0.7
    },
    "equipped": ["REASONING", "CONSENSUS"],
    "created_at": "2026-03-16T12:00:00Z",
    "updated_at": "2026-03-16T12:01:00Z"
  },
  "request_id": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2026-03-16T12:01:00Z"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid equipment or equipment not equipped
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Agent not found

---

## WebSocket

### Connect to WebSocket

Connect to the WebSocket endpoint for real-time agent updates.

**Endpoint:** `WS /ws`

**Authentication:** Optional (include JWT token in query parameter: `?token=<jwt-token>`)

**Message Types:**

#### Agent Update
```json
{
  "type": "agent_update",
  "data": {
    "agent_id": "550e8400-e29b-41d4-a716-446655440000",
    "state": {
      "status": "THINKING",
      "reasoning": "Processing data",
      "last_activity": "2026-03-16T12:00:00Z"
    },
    "timestamp": "2026-03-16T12:00:00Z"
  }
}
```

#### Agent Created
```json
{
  "type": "agent_created",
  "data": {
    "agent_id": "550e8400-e29b-41d4-a716-446655440000",
    "config": {
      "model": "deepseek-chat",
      "max_tokens": 2000,
      "temperature": 0.7
    },
    "timestamp": "2026-03-16T12:00:00Z"
  }
}
```

#### Agent Deleted
```json
{
  "type": "agent_deleted",
  "data": {
    "agent_id": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2026-03-16T12:00:00Z"
  }
}
```

#### Equipment Changed
```json
{
  "type": "equipment_changed",
  "data": {
    "agent_id": "550e8400-e29b-41d4-a716-446655440000",
    "equipped": ["MEMORY", "REASONING"],
    "timestamp": "2026-03-16T12:00:00Z"
  }
}
```

#### Error
```json
{
  "type": "error",
  "data": {
    "code": "ERROR_CODE",
    "message": "Error description"
  }
}
```

#### Ping/Pong
```json
{
  "type": "ping",
  "data": {
    "timestamp": "2026-03-16T12:00:00Z"
  }
}
```

```json
{
  "type": "pong",
  "data": {
    "timestamp": "2026-03-16T12:00:00Z"
  }
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "code": "ERROR_CODE",
  "message": "Human readable error message",
  "details": {},
  "stack_trace": "Development only",
  "request_id": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2026-03-16T12:00:00Z"
}
```

### Error Codes

| Status Code | Error Code | Description |
|------------|-----------|-------------|
| 400 | BAD_REQUEST | Invalid request data |
| 401 | UNAUTHORIZED | Missing or invalid authentication |
| 403 | FORBIDDEN | Insufficient permissions |
| 404 | NOT_FOUND | Resource not found |
| 409 | CONFLICT | Resource conflict |
| 422 | VALIDATION_ERROR | Request validation failed |
| 429 | RATE_LIMIT_EXCEEDED | Too many requests |
| 500 | INTERNAL_ERROR | Internal server error |
| 503 | SERVICE_UNAVAILABLE | Service temporarily unavailable |

---

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Default Limit:** 100 requests per 10 seconds per IP
- **Headers:**
  - `Retry-After`: Seconds until retry is allowed
  - `X-RateLimit-Limit`: Request limit per window
  - `X-RateLimit-Remaining`: Remaining requests in current window
  - `X-RateLimit-Reset`: Unix timestamp when limit resets

When rate limit is exceeded, the API returns:
- Status Code: `429 Too Many Requests`
- Response body with error details

---

## CORS

The API supports CORS (Cross-Origin Resource Sharing) for web applications.

**Allowed Origins:** All (`*` in development)
**Allowed Methods:** All HTTP methods
**Allowed Headers:** All headers
**Max Age:** 3600 seconds (1 hour)

---

## OpenAPI/Swagger Documentation

Interactive API documentation is available at:

```
http://localhost:3000/swagger-ui/
```

The OpenAPI specification is available at:

```
http://localhost:3000/api-docs/openapi.json
```

---

## Example Usage

### Using cURL

#### Authenticate
```bash
curl -X POST http://localhost:3000/api/v1/auth \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

#### Create Agent
```bash
curl -X POST http://localhost:3000/api/v1/agents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "model": "deepseek-chat",
    "max_tokens": 2000,
    "temperature": 0.7
  }'
```

#### Get Agent
```bash
curl -X GET http://localhost:3000/api/v1/agents/AGENT_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### List Agents
```bash
curl -X GET http://localhost:3000/api/v1/agents \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using JavaScript/Fetch

```javascript
// Authenticate
async function authenticate(username, password) {
  const response = await fetch('http://localhost:3000/api/v1/auth', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();
  return data.data.access_token;
}

// Create Agent
async function createAgent(token, config) {
  const response = await fetch('http://localhost:3000/api/v1/agents', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(config),
  });

  return await response.json();
}

// Usage
const token = await authenticate('testuser', 'password123');
const agent = await createAgent(token, {
  model: 'deepseek-chat',
  max_tokens: 2000,
  temperature: 0.7,
});
console.log(agent);
```

### Using WebSocket

```javascript
// Connect to WebSocket
const ws = new WebSocket('ws://localhost:3000/ws?token=YOUR_JWT_TOKEN');

ws.onopen = () => {
  console.log('Connected to WebSocket');
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);

  switch (message.type) {
    case 'agent_created':
      console.log('Agent created:', message.data.agent_id);
      break;
    case 'agent_update':
      console.log('Agent updated:', message.data.agent_id, message.data.state);
      break;
    case 'agent_deleted':
      console.log('Agent deleted:', message.data.agent_id);
      break;
    case 'equipment_changed':
      console.log('Equipment changed:', message.data.agent_id, message.data.equipped);
      break;
    case 'error':
      console.error('WebSocket error:', message.data.message);
      break;
  }
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

ws.onclose = () => {
  console.log('WebSocket connection closed');
};

// Send ping
setInterval(() => {
  ws.send(JSON.stringify({
    type: 'ping',
    data: { timestamp: new Date().toISOString() }
  }));
}, 30000);
```

---

## Best Practices

1. **Always use HTTPS** in production
2. **Validate all input** on the client side before sending
3. **Handle errors gracefully** and provide user feedback
4. **Implement retry logic** with exponential backoff for rate limits
5. **Cache responses** where appropriate to reduce load
6. **Use WebSocket** for real-time updates instead of polling
7. **Keep tokens secure** and never expose them in client-side code
8. **Refresh tokens** before they expire to maintain sessions
9. **Monitor rate limits** and implement backoff strategies
10. **Use pagination** for large result sets

---

## Support

For issues, questions, or contributions:

- **GitHub:** https://github.com/SuperInstance/claw
- **Documentation:** https://github.com/SuperInstance/claw/tree/main/docs
- **Email:** team@superinstance.dev

---

**Version:** 0.1.0
**Last Updated:** 2026-03-16
