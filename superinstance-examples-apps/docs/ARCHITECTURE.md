# Architecture Documentation

Comprehensive architecture guide for SuperInstance example applications.

## Table of Contents

1. [Overall Architecture](#overall-architecture)
2. [Shared Components](#shared-components)
3. [Example Architectures](#example-architectures)
4. [Integration Patterns](#integration-patterns)
5. [Data Flow](#data-flow)
6. [Security](#security)
7. [Scalability](#scalability)

## Overall Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SuperInstance Examples Ecosystem                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    Shared Packages                           │    │
│  │  • shared-types (TypeScript interfaces)                     │    │
│  │  • ui-components (Reusable React/Vue components)            │    │
│  │  • agent-clients (API client libraries)                     │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                           ▲         ▲         ▲                     │
│                           │         │         │                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    Example Applications                      │    │
│  │                                                             │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │    │
│  │  │   Analytics  │  │ Collaborative│  │     Geo      │       │    │
│  │  │   Dashboard  │  │   Planner    │  │   Tracker    │       │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘       │    │
│  │                                                             │    │
│  │  ┌──────────────┐  ┌──────────────┐                         │    │
│  │  │  Inventory   │  │   Agent      │                         │    │
│  │  │   System     │  │ Simulation   │                         │    │
│  │  └──────────────┘  └──────────────┘                         │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                           │         │         │                     │
│                           ▼         ▼         ▼                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    SuperInstance Services                    │    │
│  │                                                             │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │    │
│  │  │     Claw     │  │  Constraint  │  │ Spreadsheet  │       │    │
│  │  │   (Agents)   │  │   Theory     │  │   Moment     │       │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘       │    │
│  │                                                             │    │
│  │  ┌──────────────┐                                          │    │
│  │  │   Dodecet    │                                          │    │
│  │  │   Encoder    │                                          │    │
│  │  └──────────────┘                                          │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

## Shared Components

### shared-types

**Purpose:** Centralized TypeScript type definitions

**Contents:**
- Agent types (Agent, AgentSeed, Trigger, etc.)
- Spatial types (Position3D, Orientation3D, SpatialQuery)
- Communication types (WebSocketMessage, AlertMessage)
- Domain types (Plan, Task, Asset, Product, etc.)

**Usage:**
```typescript
import { Agent, SpatialQuery } from '@superinstance/shared-types';
```

### ui-components

**Purpose:** Reusable UI components across examples

**Components:**
- AgentCard (display agent info)
- MetricsPanel (show performance metrics)
- AlertPanel (display alerts)
- Visualization3D (Three.js viewer)

### agent-clients

**Purpose:** API client libraries for SuperInstance services

**Clients:**
- ClawClient (claw agent management)
- GeoClient (constraint spatial queries)
- SpreadsheetClient (spreadsheet-moment integration)

## Example Architectures

### Analytics Dashboard

**Pattern:** Real-time data processing with agent coordination

```
Browser (React)
    ↓ WebSocket
Node.js Backend
    ↓
Claw Agents (1,000+)
    ↓
ConstraintTheory (Spatial indexing)
```

**Key Features:**
- 1,000+ coordinated agents
- Sub-10ms trigger latency
- Real-time visualization
- Spatial filtering

### Collaborative Planner

**Pattern:** Multi-user collaboration with consensus

```
Browser (Next.js)
    ↓ WebSocket
Node.js Backend
    ↓
SmartCRDT Engine (State sync)
    ↓
Claw Agents (Consensus)
    ↓
PostgreSQL (Persistence)
```

**Key Features:**
- Conflict-free replication
- Holonomic consensus
- Real-time collaboration
- AI assistance

### Geographic Asset Tracker

**Pattern:** Mobile location tracking with spatial queries

```
Mobile App (React Native)
    ↓ WebSocket
Backend API
    ↓
ConstraintTheory (KD-tree)
    ↓
Dodecet Encoder (12-bit positions)
```

**Key Features:**
- GPS tracking
- Spatial queries
- FPS perspective filtering
- Efficient encoding

### Inventory System

**Pattern:** ML-based prediction with coordination

```
Browser (Vue.js)
    ↓ REST API
Node.js Backend
    ↓
Claw Agents (ML prediction)
    ↓
PostgreSQL (Inventory data)
```

**Key Features:**
- Demand forecasting
- Multi-warehouse coordination
- Smart alerts
- Cost optimization

### Agent Simulation

**Pattern:** 3D visualization for paradigm comparison

```
Browser (Three.js)
    ↓
Simulation Engine
    ↓
Spatial Hash Grid
    ↓
Agent Coordination
```

**Key Features:**
- FPS vs RTS comparison
- 10,000+ agents
- Real-time 3D visualization
- Performance metrics

## Integration Patterns

### 1. Agent Creation Pattern

```typescript
// Create agent with position
const agent = await ClawService.createAgent({
  id: 'agent-1',
  model: 'deepseek-chat',
  seed: {
    purpose: 'Monitor data',
    trigger: { type: 'data', source: 'stream-1' }
  },
  equipment: ['MEMORY', 'REASONING'],
  position: { x: 100, y: 200, z: 300 }
});

// Register with spatial engine
await GeoService.createAgent(agent);
```

### 2. Spatial Query Pattern

```typescript
// Query from agent's perspective (FPS)
const visible = await GeoService.queryFromPerspective(agentId, {
  radius: 100,
  fieldOfView: Math.PI / 2
});

// Global query (RTS)
const all = await GeoService.queryAll();
```

### 3. Event Streaming Pattern

```typescript
// Subscribe to agent updates
WebSocketManager.on('agent-update', (update) => {
  console.log('Agent updated:', update);
});

// Trigger agent
await ClawService.triggerAgent(agentId, data);
```

### 4. Consensus Pattern

```typescript
// Request consensus
const consensus = await createConsensus({
  taskId: 'task-1',
  participants: ['agent-1', 'agent-2', 'agent-3'],
  strategy: 'holonomic'
});

// Vote
await vote(consensus.id, {
  participantId: 'agent-1',
  vote: 'approve',
  reasoning: 'Aligns with goals'
});
```

## Data Flow

### Real-Time Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│  1. Data Source                                              │
│     ↓                                                        │
│  2. WebSocket receives data                                   │
│     ↓                                                        │
│  3. Backend distributes to agents                             │
│     ↓                                                        │
│  4. Agents process with triggers                              │
│     ↓                                                        │
│  5. Results broadcast via WebSocket                          │
│     ↓                                                        │
│  6. Frontend updates UI                                       │
└─────────────────────────────────────────────────────────────┘
```

### Collaboration Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│  1. User makes edit                                          │
│     ↓                                                        │
│  2. SmartCRDT creates operation                               │
│     ↓                                                        │
│  3. Operation broadcast to all clients                        │
│     ↓                                                        │
│  4. Each client applies operation                             │
│     ↓                                                        │
│  5. State converges without conflicts                         │
└─────────────────────────────────────────────────────────────┘
```

## Security

### Authentication

```typescript
// API key authentication
const claw = new ClawClient({
  endpoint: 'ws://localhost:8080',
  apiKey: process.env.CLAW_API_KEY
});

// JWT tokens
const token = await authService.login({
  username: 'user',
  password: 'pass'
});
```

### Authorization

```typescript
// Role-based access control
const permissions = {
  user: ['read', 'write'],
  admin: ['read', 'write', 'delete', 'manage']
};

// Check permission
if (hasPermission(user, 'delete')) {
  await deleteAgent(agentId);
}
```

### Data Validation

```typescript
// Zod schemas
const AgentSchema = z.object({
  id: z.string().min(1),
  model: z.string(),
  seed: z.object({
    purpose: z.string(),
    trigger: z.object({
      type: z.enum(['data', 'periodic', 'event'])
    })
  })
});

// Validate
const validated = AgentSchema.parse(data);
```

## Scalability

### Horizontal Scaling

```
┌─────────────────────────────────────────────────────────────┐
│  Load Balancer                                               │
│     ↓                                                        │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                      │
│  │ Instance│  │ Instance│  │ Instance│                      │
│  │    1    │  │    2    │  │    3    │                      │
│  └─────────┘  └─────────┘  └─────────┘                      │
│       ↓            ↓            ↓                            │
│  Shared Database (PostgreSQL)                               │
│  Shared Cache (Redis)                                       │
└─────────────────────────────────────────────────────────────┘
```

### Vertical Scaling

- Increase agent capacity per instance
- Optimize memory usage
- Use GPU acceleration for ML

### Caching Strategy

```typescript
// Redis cache
await cache.set(`agent:${agentId}`, agent, 3600);

// Get from cache
const cached = await cache.get(`agent:${agentId}`);
if (cached) return cached;

// Fetch from database
const agent = await db.getAgent(agentId);
await cache.set(`agent:${agentId}`, agent, 3600);
return agent;
```

## Performance Optimization

### 1. Agent Pooling

```typescript
// Reuse agents instead of creating new ones
const pool = new AgentPool({
  min: 100,
  max: 1000,
  idleTimeout: 30000
});

const agent = await pool.acquire();
await pool.release(agent);
```

### 2. Batch Operations

```typescript
// Batch agent creation
const agents = await ClawService.createAgents(configs);

// Batch triggers
await Promise.all(
  agents.map(agent => ClawService.triggerAgent(agent.id, data))
);
```

### 3. Spatial Indexing

```typescript
// Use KD-tree for fast spatial queries
const geo = new GeoEngine({
  indexType: 'kd-tree',
  bucketSize: 32
});

// O(log n) queries instead of O(n)
const nearby = await geo.queryNearby(position, radius);
```

## Monitoring

### Metrics Collection

```typescript
// Track performance
metrics.increment('agent.triggers');
metrics.timing('agent.latency', latency);
metrics.gauge('agents.active', agents.length);
```

### Logging

```typescript
// Structured logging
logger.info('Agent triggered', {
  agentId: agent.id,
  latency: result.latency,
  timestamp: new Date().toISOString()
});
```

### Alerting

```typescript
// Alert on threshold exceed
if (latency > 100) {
  alertService.send({
    severity: 'warning',
    message: 'High latency detected',
    value: latency
  });
}
```

## Deployment

### Docker Deployment

```bash
# Build image
docker build -t app-name .

# Run container
docker run -p 3000:3000 app-name
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-name
spec:
  replicas: 3
  selector:
    matchLabels:
      app: app-name
  template:
    metadata:
      labels:
        app: app-name
    spec:
      containers:
      - name: app-name
        image: app-name:latest
        ports:
        - containerPort: 3000
```

### CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: npm test
```

## Best Practices

1. **Type Safety:** Use TypeScript for all code
2. **Error Handling:** Comprehensive error handling
3. **Logging:** Structured logging with context
4. **Testing:** Unit, integration, and E2E tests
5. **Documentation:** Clear code documentation
6. **Security:** Validate inputs, use HTTPS
7. **Performance:** Monitor and optimize
8. **Scalability:** Design for horizontal scaling
