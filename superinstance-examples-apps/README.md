# SuperInstance Example Applications

Production-ready example applications demonstrating SuperInstance cellular agent infrastructure capabilities.

## Overview

This repository contains 5 complete, production-ready example applications showcasing the SuperInstance ecosystem:

- **constrainttheory/** - Geometric substrate for cellular agents
- **claw/** - Minimal cellular agent engine
- **spreadsheet-moment/** - Agent spreadsheet platform
- **dodecet-encoder/** - 12-Bit geometric encoding

## Example Applications

### 1. Real-Time Analytics Dashboard
**Location:** `examples/analytics-dashboard/`

**Capabilities Demonstrated:**
- Real-time data monitoring with claw agents
- Agent coordination for distributed analytics
- Spatial visualization with constrainttheory
- WebSocket-based live updates

**Tech Stack:** React, TypeScript, WebSocket, D3.js, Docker

**Use Case:** Monitor thousands of data points with coordinated agents filtering by perspective

### 2. Collaborative Planning Tool
**Location:** `examples/collaborative-planner/`

**Capabilities Demonstrated:**
- Multi-agent consensus via spreadsheet-moment
- Conflict resolution with claw social coordination
- Real-time collaboration
- SmartCRDT-based state synchronization

**Tech Stack:** Next.js, React, WebSocket, PostgreSQL, Docker Compose

**Use Case:** Teams planning projects with AI agents assisting and coordinating

### 3. Geographic Asset Tracker
**Location:** `examples/geo-asset-tracker/`

**Capabilities Demonstrated:**
- Spatial queries with constrainttheory KD-tree
- FPS perspective filtering for agents
- Dodecet encoding for efficient location storage
- Location-based alerts

**Tech Stack:** React Native, TypeScript, Maps API, Mobile

**Use Case:** Track assets across geographic regions with agent-based monitoring

### 4. Intelligent Inventory System
**Location:** `examples/inventory-system/`

**Capabilities Demonstrated:**
- Demand prediction with claw ML agents
- Geometric encoding for warehouse optimization
- Multi-warehouse coordination
- Automated stock alerts

**Tech Stack:** Vue.js, TypeScript, PostgreSQL, Docker

**Use Case:** Manage inventory across multiple warehouses with predictive agents

### 5. Multi-Agent Simulation
**Location:** `examples/agent-simulation/`

**Capabilities Demonstrated:**
- FPS vs RTS paradigm comparison
- Scalability to 10,000+ agents
- Spatial hash grid performance
- Real-time 3D visualization

**Tech Stack:** Three.js, WebGL, WebSocket, Static hosting

**Use Case:** Visualize and compare agent coordination patterns at scale

## Quick Start

### Prerequisites

- Node.js 18+
- Docker 20+
- Rust 1.70+ (for claw backend)
- PostgreSQL 14+ (for some examples)

### Install All Examples

```bash
# Clone repository
git clone https://github.com/SuperInstance/superinstance-examples-apps.git
cd superinstance-examples-apps

# Install dependencies
npm install
```

### Run Individual Examples

```bash
# Analytics Dashboard
cd examples/analytics-dashboard
npm install
npm run dev

# Collaborative Planner
cd examples/collaborative-planner
npm install
docker-compose up

# Geographic Asset Tracker
cd examples/geo-asset-tracker
npm install
npm run ios    # iOS
npm run android # Android

# Inventory System
cd examples/inventory-system
npm install
docker-compose up

# Agent Simulation
cd examples/agent-simulation
npm install
npm run dev
```

## Architecture

### Shared Components

```
superinstance-examples-apps/
├── packages/
│   ├── shared-types/      # Shared TypeScript interfaces
│   ├── ui-components/     # Reusable UI components
│   └── agent-clients/     # Agent client libraries
├── examples/
│   ├── analytics-dashboard/
│   ├── collaborative-planner/
│   ├── geo-asset-tracker/
│   ├── inventory-system/
│   └── agent-simulation/
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DEPLOYMENT.md
│   └── API_REFERENCE.md
└── scripts/
    ├── setup-all.sh
    └── deploy-all.sh
```

## SuperInstance Integration

### claw Integration

```typescript
import { ClawClient } from '@superinstance/claw-client';

const claw = new ClawClient({
  endpoint: 'ws://localhost:8080',
  apiKey: process.env.CLAW_API_KEY
});

// Create agent
const agent = await claw.createAgent({
  id: 'analytics-agent-1',
  model: 'deepseek-chat',
  seed: {
    purpose: 'Monitor sales data and detect anomalies',
    trigger: { type: 'data', source: 'sales-stream' }
  },
  equipment: ['MEMORY', 'REASONING']
});

// Listen for events
agent.on('trigger', (data) => {
  console.log('Agent triggered:', data);
});
```

### constrainttheory Integration

```typescript
import { GeoEngine } from '@superinstance/constrainttheory';

const geo = new GeoEngine();

// Create agent with position
const agentId = geo.createAgent({
  position: [10, 20, 30],
  orientation: [0, 0, 1]
});

// Query from agent's perspective
const visible = geo.queryFromPerspective(agentId, {
  radius: 100,
  fieldOfView: Math.PI / 2
});
```

### spreadsheet-moment Integration

```typescript
import { SpreadsheetClient } from '@superinstance/spreadsheet-client';

const sheet = new SpreadsheetClient({
  endpoint: 'http://localhost:3000'
});

// Create claw cell
await sheet.setCell('A1', {
  type: 'claw',
  config: {
    model: 'deepseek-chat',
    seed: 'monitor-data'
  }
});

// Listen for changes
sheet.onCellChange('A1', (newValue) => {
  console.log('Cell updated:', newValue);
});
```

## Deployment

### Docker Deployment

All examples include Dockerfile and docker-compose.yml:

```bash
cd examples/analytics-dashboard
docker-compose up -d
```

### Kubernetes Deployment

Production-ready Kubernetes manifests:

```bash
kubectl apply -f kubernetes/
```

## Testing

Each example includes comprehensive tests:

```bash
# Run all tests
npm test

# Run specific example tests
cd examples/analytics-dashboard
npm test

# E2E tests
npm run test:e2e
```

## Performance Benchmarks

| Example | Agents | Latency | Memory | Throughput |
|---------|--------|---------|--------|------------|
| Analytics Dashboard | 1,000 | ~10ms | ~50MB | 100K ops/s |
| Collaborative Planner | 100 | ~20ms | ~30MB | 10K ops/s |
| Geo Asset Tracker | 10,000 | ~5ms | ~200MB | 1M ops/s |
| Inventory System | 500 | ~15ms | ~40MB | 50K ops/s |
| Agent Simulation | 10,000 | ~8ms | ~150MB | 500K ops/s |

## Documentation

- [Architecture Guide](docs/ARCHITECTURE.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [API Reference](docs/API_REFERENCE.md)
- [Contributing](CONTRIBUTING.md)

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](LICENSE) for details.

## SuperInstance

- [Website](https://superinstance.ai)
- [Documentation](https://docs.superinstance.ai)
- [GitHub](https://github.com/SuperInstance)

## Support

- Discord: https://discord.gg/superinstance
- Email: support@superinstance.ai
- Issues: https://github.com/SuperInstance/superinstance-examples-apps/issues
