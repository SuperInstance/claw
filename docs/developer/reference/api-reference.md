# API Reference

Complete reference documentation for all SuperInstance API endpoints.

## Base URLs

| Environment | URL |
|-------------|-----|
| Production | `https://api.superinstance.ai/v1` |
| Staging | `https://staging.api.superinstance.ai/v1` |
| Development | `http://localhost:3000/v1` |

## Authentication

All API requests require authentication using an API key or JWT token.

### API Key Authentication

```http
Authorization: Bearer YOUR_API_KEY
```

Or using header:

```http
X-API-Key: YOUR_API_KEY
```

### JWT Token Authentication

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### Generating JWT Tokens

```javascript
const response = await fetch('https://api.superinstance.ai/v1/auth/token', {
  method: 'POST',
  headers: {
    'X-API-Key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    expiresIn: 3600 // 1 hour
  })
})

const { token } = await response.json()
```

---

## Instances

### List Instances

```http
GET /instances
```

List all SuperInstances with optional filtering.

**Parameters:**

| Name | Type | In | Required | Description |
|------|------|-----|----------|-------------|
| type | string | query | No | Filter by instance type |
| state | string | query | No | Filter by instance state |
| spreadsheetId | string | query | No | Filter by spreadsheet ID |
| limit | integer | query | No | Max items to return (1-1000) |
| offset | integer | query | No | Pagination offset |

**Example Request:**

```bash
curl -X GET "https://api.superinstance.ai/v1/instances?type=learning_agent&state=running&limit=50" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Response:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "instance_abc123",
        "type": "learning_agent",
        "name": "My Agent",
        "state": "running",
        "createdAt": "2024-01-15T10:30:00Z",
        "configuration": {
          "resources": {
            "cpu": 50,
            "memory": 512
          }
        }
      }
    ],
    "total": 150,
    "limit": 50,
    "offset": 0
  },
  "meta": {
    "requestId": "req_abc123",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Create Instance

```http
POST /instances
```

Create a new SuperInstance.

**Request Body:**

```json
{
  "type": "learning_agent",
  "name": "My Agent",
  "description": "An AI agent for data processing",
  "cellPosition": {
    "row": 1,
    "col": 1,
    "sheet": "Sheet1"
  },
  "spreadsheetId": "sheet_abc123",
  "configuration": {
    "resources": {
      "cpu": 50,
      "memory": 512,
      "gpu": 10
    },
    "constraints": {
      "maxRuntime": 3600000,
      "maxMemory": 1024
    }
  },
  "capabilities": ["transform", "aggregate"],
  "initialData": {
    "model": "neural_network_v1"
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "instance_abc123",
    "type": "learning_agent",
    "name": "My Agent",
    "state": "initialized",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "meta": {
    "requestId": "req_abc123",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Get Instance

```http
GET /instances/{instanceId}
```

Get details of a specific instance.

**Path Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| instanceId | string | Yes | Instance ID |

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "instance_abc123",
    "type": "learning_agent",
    "name": "My Agent",
    "description": "An AI agent for data processing",
    "state": "running",
    "confidence": {
      "score": 0.87,
      "factors": [
        {"name": "data_quality", "value": 0.92, "weight": 0.3},
        {"name": "model_accuracy", "value": 0.85, "weight": 0.5}
      ]
    },
    "rate": {
      "current": 42.5,
      "previous": 40.2,
      "change": 2.3,
      "timestamp": "2024-01-15T10:30:00Z"
    },
    "configuration": {
      "resources": {
        "cpu": 50,
        "memory": 512,
        "gpu": 10
      }
    },
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T11:30:00Z"
  }
}
```

### Update Instance

```http
PUT /instances/{instanceId}
```

Update instance configuration.

**Request Body:**

```json
{
  "name": "Updated Agent Name",
  "description": "Updated description",
  "configuration": {
    "resources": {
      "cpu": 75,
      "memory": 1024,
      "gpu": 25
    }
  }
}
```

### Delete Instance

```http
DELETE /instances/{instanceId}
```

Terminate and remove an instance.

---

## Instance Lifecycle

### Activate Instance

```http
POST /instances/{instanceId}/activate
```

Activate an instance.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "instance_abc123",
    "state": "running",
    "activatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### Deactivate Instance

```http
POST /instances/{instanceId}/deactivate
```

Gracefully deactivate an instance.

### Terminate Instance

```http
POST /instances/{instanceId}/terminate
```

Forcefully terminate an instance.

---

## Rate-Based Operations

### Update Rate State

```http
POST /instances/{instanceId}/rate/update
```

Update rate-based state tracking.

**Request Body:**

```json
{
  "value": 42.5,
  "timestamp": 1640995200000,
  "metadata": {
    "source": "sensor_A1",
    "unit": "celsius"
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "instanceId": "instance_abc123",
    "rate": {
      "current": 42.5,
      "previous": 40.2,
      "change": 2.3,
      "timestamp": "2024-01-15T10:30:00Z"
    },
    "triggered": {
      "deadband": false,
      "cascade": false
    }
  }
}
```

### Predict Future State

```http
POST /instances/{instanceId}/rate/predict
```

Predict future state based on current rate.

**Request Body:**

```json
{
  "horizon": 3600000,
  "confidence": 0.95
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "instanceId": "instance_abc123",
    "prediction": {
      "value": 45.2,
      "confidenceInterval": {
        "lower": 43.1,
        "upper": 47.3
      },
      "uncertainty": 0.05,
      "horizon": 3600000
    }
  }
}
```

### Get Rate History

```http
GET /instances/{instanceId}/rate/history
```

Get rate change history.

**Query Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| startTime | integer | No | Start timestamp (ms) |
| endTime | integer | No | End timestamp (ms) |
| limit | integer | No | Max items to return |
| resolution | string | No | Data resolution (raw, minute, hour, day) |

**Response:**

```json
{
  "success": true,
  "data": {
    "instanceId": "instance_abc123",
    "history": [
      {
        "timestamp": 1640995200000,
        "value": 42.5,
        "change": 2.3
      },
      {
        "timestamp": 1640995260000,
        "value": 43.1,
        "change": 0.6
      }
    ],
    "summary": {
      "min": 40.2,
      "max": 43.1,
      "average": 42.0,
      "trend": "increasing"
    }
  }
}
```

---

## Message Passing

### Send Message

```http
POST /instances/{instanceId}/messages
```

Send a message to an instance.

**Request Body:**

```json
{
  "type": "data",
  "payload": {
    "temperature": 22.5,
    "humidity": 65
  },
  "targetInstanceId": "instance_xyz789"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "messageId": "msg_abc123",
    "status": "sent",
    "sentAt": "2024-01-15T10:30:00Z"
  }
}
```

### Get Messages

```http
GET /instances/{instanceId}/messages
```

Get messages for an instance.

**Query Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| type | string | No | Filter by message type |
| status | string | No | Filter by status |
| limit | integer | No | Max items to return |
| offset | integer | No | Pagination offset |

---

## Connections

### Create Connection

```http
POST /instances/{instanceId}/connections
```

Create a connection to another instance.

**Request Body:**

```json
{
  "targetInstanceId": "instance_xyz789",
  "configuration": {
    "messageFilter": {
      "types": ["data", "event"]
    },
    "transform": {
      "enabled": true,
      "rules": ["normalize", "aggregate"]
    }
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "connectionId": "conn_abc123",
    "sourceInstanceId": "instance_abc123",
    "targetInstanceId": "instance_xyz789",
    "state": "active",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### Get Connections

```http
GET /instances/{instanceId}/connections
```

Get all connections for an instance.

### Delete Connection

```http
DELETE /instances/{instanceId}/connections/{connectionId}
```

Disconnect from another instance.

---

## Confidence

### Get Confidence Metrics

```http
GET /instances/{instanceId}/confidence
```

Get confidence metrics for an instance.

**Response:**

```json
{
  "success": true,
  "data": {
    "instanceId": "instance_abc123",
    "confidence": {
      "score": 0.87,
      "factors": [
        {
          "name": "data_quality",
          "value": 0.92,
          "weight": 0.3
        },
        {
          "name": "model_accuracy",
          "value": 0.85,
          "weight": 0.5
        }
      ],
      "history": [
        {
          "timestamp": 1640995200000,
          "score": 0.85
        },
        {
          "timestamp": 1640995260000,
          "score": 0.87
        }
      ]
    }
  }
}
```

### Adjust Confidence

```http
POST /instances/{instanceId}/confidence/adjust
```

Manually adjust confidence score.

**Request Body:**

```json
{
  "adjustment": 0.1,
  "reason": "Additional validation data received"
}
```

Or set absolute value:

```json
{
  "absoluteValue": 0.95,
  "reason": "Manual override based on expert analysis"
}
```

---

## System

### Health Check

```http
GET /health
```

Check API server health.

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0",
  "uptime": 86400
}
```

### Get System Status

```http
GET /system/status
```

Get overall system status.

**Response:**

```json
{
  "success": true,
  "data": {
    "status": "operational",
    "instances": {
      "total": 1500,
      "running": 1200,
      "idle": 250,
      "error": 50
    },
    "resources": {
      "cpu": {
        "used": 75,
        "total": 100
      },
      "memory": {
        "used": 6144,
        "total": 8192
      }
    }
  }
}
```

### Get System Metrics

```http
GET /system/metrics
```

Get detailed system metrics.

**Query Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| timeRange | string | No | Time range (1h, 24h, 7d, 30d) |
| metric | string | No | Specific metric |

---

## Batch Operations

### Batch Update Rates

```http
POST /batch/rate/update
```

Batch update rates for multiple instances.

**Request Body:**

```json
{
  "updates": [
    {
      "instanceId": "instance_abc123",
      "value": 42.5,
      "timestamp": 1640995200000
    },
    {
      "instanceId": "instance_xyz789",
      "value": 38.2,
      "timestamp": 1640995200000
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "successful": [
      {
        "instanceId": "instance_abc123",
        "rate": {
          "current": 42.5,
          "previous": 40.2,
          "change": 2.3
        }
      }
    ],
    "failed": [
      {
        "instanceId": "instance_xyz789",
        "error": {
          "code": "INSTANCE_NOT_FOUND",
          "message": "Instance not found"
        }
      }
    ]
  }
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Invalid request parameters |
| `UNAUTHORIZED` | Invalid or missing authentication |
| `FORBIDDEN` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `INSTANCE_ERROR` | Instance error state |
| `INTERNAL_ERROR` | Internal server error |

---

## Rate Limits

| Plan | Requests/Minute | Requests/Hour |
|------|----------------|---------------|
| Free | 60 | 1,000 |
| Pro | 300 | 10,000 |
| Enterprise | Custom | Custom |

Rate limit headers are included in every response:

```http
X-RateLimit-Limit: 300
X-RateLimit-Remaining: 299
X-RateLimit-Reset: 1640995200
```

---

## WebSocket API

### Connect to Real-Time Updates

```javascript
const ws = new WebSocket('wss://api.superinstance.ai/v1/instances/{instanceId}/realtime?token=JWT_TOKEN')

ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  console.log('Real-time update:', data)
}
```

### WebSocket Events

| Event | Description |
|-------|-------------|
| `message` | New message received |
| `stateChanged` | Instance state changed |
| `rateUpdated` | Rate value updated |
| `confidenceChanged` | Confidence score changed |

---

## SDKs

Official SDKs are available for:

- **JavaScript/TypeScript**: `@superinstance/sdk`
- **Python**: `superinstance`
- **Go**: `github.com/superinstance/superinstance-go`
- **Java**: `com.superinstance:superinstance-java`

See [SDK Documentation](/developer/sdk/) for details.

---

## Testing

Use the [API Explorer](/developer/explorer/) to test endpoints interactively.

For automated testing, use the development environment:

```javascript
const client = new SuperInstanceClient({
  apiKey: process.env.DEV_API_KEY,
  baseURL: 'https://dev-api.superinstance.ai/v1'
})
```

## Next Steps

- **[API Explorer](/developer/explorer/)**: Interactive API testing
- **[SDK Documentation](/developer/sdk/)**: SDK-specific guides
- **[Examples](/developer/examples/)**: Code examples
- **[Tutorials](/developer/tutorials/)**: Step-by-step tutorials
