# Claw API Quick Reference Card

## Base URL
```
http://localhost:3000
```

## Authentication
```bash
# Get token
curl -X POST http://localhost:3000/api/v1/auth \
  -H "Content-Type: application/json" \
  -d '{"username":"user","password":"pass123"}'

# Use token
curl -H "Authorization: Bearer TOKEN" http://localhost:3000/api/v1/agents
```

## REST Endpoints

### Health
```
GET /health
```

### Auth
```
POST /api/v1/auth              # Login
POST /api/v1/auth/refresh      # Refresh token
```

### Agents
```
POST   /api/v1/agents          # Create agent
GET    /api/v1/agents          # List agents
GET    /api/v1/agents/:id      # Get agent
PUT    /api/v1/agents/:id      # Update agent
DELETE /api/v1/agents/:id      # Delete agent
GET    /api/v1/agents/:id/state  # Get state
```

### Equipment
```
POST /api/v1/agents/:id/equip    # Equip
POST /api/v1/agents/:id/unequip  # Unequip
```

## WebSocket
```
ws://localhost:3000/ws?token=TOKEN
```

## Common Responses

### Success
```json
{
  "success": true,
  "data": { ... },
  "request_id": "uuid",
  "timestamp": "2026-03-16T12:00:00Z"
}
```

### Error
```json
{
  "success": false,
  "code": "ERROR_CODE",
  "message": "Human readable message",
  "request_id": "uuid",
  "timestamp": "2026-03-16T12:00:00Z"
}
```

## HTTP Status Codes
- 200 OK
- 201 Created
- 204 No Content
- 400 Bad Request
- 401 Unauthorized
- 404 Not Found
- 429 Rate Limit Exceeded
- 500 Internal Server Error

## Rate Limits
- 100 requests / 10 seconds
- Headers: `Retry-After`, `X-RateLimit-*`

## Documentation
- Swagger UI: http://localhost:3000/swagger-ui
- OpenAPI: http://localhost:3000/api-docs/openapi.json

## Quick Examples

### Create Agent
```bash
curl -X POST http://localhost:3000/api/v1/agents \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-chat",
    "max_tokens": 2000,
    "temperature": 0.7
  }'
```

### Get Agent
```bash
curl http://localhost:3000/api/v1/agents/ID \
  -H "Authorization: Bearer TOKEN"
```

### List Agents
```bash
curl http://localhost:3000/api/v1/agents \
  -H "Authorization: Bearer TOKEN"
```

### Equip Agent
```bash
curl -X POST http://localhost:3000/api/v1/agents/ID/equip \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"equipment": ["MEMORY", "REASONING"]}'
```

### WebSocket (JavaScript)
```javascript
const ws = new WebSocket('ws://localhost:3000/ws?token=TOKEN');
ws.onmessage = (e) => console.log(JSON.parse(e.data));
```

## Environment Variables
```bash
CLAW_HOST=127.0.0.1
CLAW_PORT=3000
JWT_SECRET=your-secret-key-32-chars-min
RUST_LOG=info
```

## Run Server
```bash
# Development
cargo run --bin claw-server

# Production
cargo build --release --bin claw-server
./target/release/claw-server
```

## Tests
```bash
# Unit tests
cargo test --lib

# Integration tests
cargo test --test api_tests

# With coverage
cargo tarpaulin --out Html
```

## Support
- GitHub: https://github.com/SuperInstance/claw
- Docs: core/docs/API_DOCUMENTATION.md
- Email: team@superinstance.dev
