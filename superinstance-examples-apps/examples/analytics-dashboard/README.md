# Real-Time Analytics Dashboard

Production-ready real-time analytics dashboard demonstrating SuperInstance agent coordination at scale.

## Overview

This dashboard showcases:
- **1,000+ coordinated claw agents** monitoring data streams
- **Real-time anomaly detection** with ML-based agents
- **Spatial visualization** using constrainttheory geometric substrate
- **Sub-10ms trigger latency** for critical alerts
- **WebSocket-based live updates** for seamless UX

## Features

### Agent Coordination
- 1,000+ claw agents running in parallel
- Master-slave coordination for distributed processing
- Perspective-based filtering for relevant data
- Automatic load balancing

### Real-Time Monitoring
- Live data stream processing
- Anomaly detection with ML agents
- Custom alert thresholds
- Historical trend analysis

### Spatial Visualization
- 3D data space visualization
- Agent positioning with FPS perspective
- Interactive filtering
- Heat map overlays

### Performance
- ~10ms trigger latency
- 100K operations/second throughput
- ~50MB memory footprint
- Sub-100ms UI updates

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Analytics Dashboard                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Frontend (React + TypeScript)                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Dashboard UI                    Visualization        │    │
│  │  • Agent Grid                   • D3.js Charts       │    │
│  │  • Live Metrics                 • 3D View            │    │
│  │  • Alert Panel                  • Heat Maps          │    │
│  └─────────────────────────────────────────────────────┘    │
│                           ↓↑ WebSocket                       │
│  Backend (Node.js + Express)                                 │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  WebSocket Server                API Gateway         │    │
│  │  • Agent Management              • Data Endpoints    │    │
│  │  • Event Broadcasting            • Alert System      │    │
│  └─────────────────────────────────────────────────────┘    │
│                           ↓↑                                 │
│  SuperInstance Services                                       │
│  ┌──────────────────┐      ┌──────────────────┐             │
│  │  Claw Agents     │      │ ConstraintTheory │             │
│  │  • 1,000 agents  │      │  • Spatial index │             │
│  │  • ML inference  │      │  • Perspective   │             │
│  │  • Coordination  │      │  • Geometric ops │             │
│  └──────────────────┘      └──────────────────┘             │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

### Prerequisites

- Node.js 18+
- Docker 20+
- Access to SuperInstance services

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Docker Deployment

```bash
# Build image
npm run docker:build

# Run container
npm run docker:run

# Or use docker-compose
docker-compose up -d
```

## Usage

### 1. Initialize Agents

```typescript
import { ClawClient } from '@superinstance/claw-client';

const claw = new ClawClient({
  endpoint: process.env.CLAW_ENDPOINT,
  apiKey: process.env.CLAW_API_KEY
});

// Create monitoring agents
const agents = await Promise.all(
  Array.from({ length: 1000 }, (_, i) =>
    claw.createAgent({
      id: `analytics-agent-${i}`,
      model: 'deepseek-chat',
      seed: {
        purpose: 'Monitor data stream and detect anomalies',
        trigger: { type: 'data', source: `stream-${i % 10}` }
      },
      equipment: ['MEMORY', 'REASONING'],
      position: {
        x: Math.random() * 1000,
        y: Math.random() * 1000,
        z: Math.random() * 1000
      }
    })
  )
);
```

### 2. Set Up Spatial Queries

```typescript
import { GeoEngine } from '@superinstance/constrainttheory';

const geo = new GeoEngine({
  endpoint: process.env.GEO_ENDPOINT
});

// Create agent with position
await geo.createAgent({
  id: 'main-monitor',
  position: [500, 500, 500],
  orientation: [0, 0, 1]
});

// Query visible agents
const visibleAgents = await geo.queryFromPerspective('main-monitor', {
  radius: 200,
  fieldOfView: Math.PI / 2
});
```

### 3. Monitor Data Streams

```typescript
// Connect to data stream
const stream = await claw.connectDataStream({
  source: 'sales-data',
  format: 'json',
  batchSize: 100
});

// Process events
stream.on('data', async (data) => {
  // Distribute to agents
  const agentId = selectAgentForData(data);
  await claw.triggerAgent(agentId, data);
});

// Handle anomalies
stream.on('anomaly', async (anomaly) => {
  // Alert system
  await alertSystem.send({
    severity: 'high',
    message: 'Anomaly detected',
    data: anomaly
  });
});
```

## Configuration

### Environment Variables

```env
# API Endpoints
VITE_CLAW_ENDPOINT=ws://localhost:8080
VITE_GEO_ENDPOINT=http://localhost:3001
VITE_API_ENDPOINT=http://localhost:3000

# Authentication
VITE_CLAW_API_KEY=your-api-key

# WebSocket
VITE_WS_URL=ws://localhost:3000

# Features
VITE_AGENT_COUNT=1000
VITE_ENABLE_3D=true
VITE_ENABLE_HEATMAP=true
```

## API Reference

### WebSocket Events

#### Client → Server

```typescript
// Subscribe to agent updates
{ type: 'subscribe', agents: ['agent-1', 'agent-2'] }

// Trigger agent
{ type: 'trigger', agentId: 'agent-1', data: { ... } }

// Query state
{ type: 'query', agentId: 'agent-1' }
```

#### Server → Client

```typescript
// Agent update
{
  type: 'agent-update',
  agentId: 'agent-1',
  state: 'THINKING',
  data: { ... }
}

// Alert
{
  type: 'alert',
  severity: 'high',
  message: 'Anomaly detected',
  timestamp: '2024-01-01T00:00:00Z'
}

// Metrics update
{
  type: 'metrics',
  agents: 1000,
  triggers: 50000,
  anomalies: 5
}
```

## Testing

```bash
# Unit tests
npm test

# UI test runner
npm run test:ui

# E2E tests
npm run test:e2e
```

## Performance Metrics

| Metric | Value | Target |
|--------|-------|--------|
| Agent Count | 1,000 | 1,000+ |
| Trigger Latency | ~10ms | <100ms |
| Memory Usage | ~50MB | <100MB |
| Throughput | 100K ops/s | 50K+ ops/s |
| UI Update Rate | 60fps | 30+ fps |

## Deployment

### Kubernetes

```bash
# Deploy to Kubernetes
kubectl apply -f kubernetes/

# Check status
kubectl get pods -l app=analytics-dashboard

# Port forward
kubectl port-forward svc/analytics-dashboard 3000:3000
```

### Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Scale agents
docker-compose up -d --scale claw-agents=10
```

## Troubleshooting

### High Memory Usage

- Reduce agent count in configuration
- Enable agent pooling
- Adjust memory limits

### Slow Trigger Latency

- Check network connectivity
- Verify agent positions are optimized
- Enable spatial indexing

### Connection Issues

- Verify WebSocket endpoint is reachable
- Check API key validity
- Review CORS settings

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md)

## License

MIT

## Support

- Issues: https://github.com/SuperInstance/superinstance-examples-apps/issues
- Discord: https://discord.gg/superinstance
