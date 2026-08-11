# Multi-Agent Simulation

Interactive 3D simulation demonstrating FPS vs RTS agent coordination paradigms at scale.

## Overview

A real-time 3D simulation that visualizes and compares FPS (First-Person-Shooter) vs RTS (Real-Time-Strategy) agent coordination patterns with up to 10,000+ agents.

## Features

### FPS vs RTS Comparison
- Side-by-side paradigm comparison
- Performance metrics visualization
- Scalability benchmarks
- Coordination pattern analysis

### Real-Time 3D Visualization
- Three.js WebGL rendering
- 60 FPS animation
- Interactive camera controls
- Agent position/orientation display

### Spatial Hash Grid
- O(1) spatial queries
- Collision detection
- Neighbor lookup
- Range queries

### Agent Coordination
- Master-slave patterns
- Peer-to-peer communication
- Consensus algorithms
- Task delegation

## Tech Stack

- **Frontend:** Three.js, WebGL
- **Language:** TypeScript
- **Build:** Vite
- **Deployment:** Static hosting

## Quick Start

```bash
npm install
npm run dev
```

## Usage

### Initialize Simulation

```typescript
import { Simulation } from './simulation';

const sim = new Simulation({
  agentCount: 10000,
  paradigm: 'fps', // or 'rts'
  spatialIndexing: true
});

await sim.initialize();
```

### Add Agents

```typescript
// FPS agent (has perspective)
const fpsAgent = sim.addAgent({
  id: 'fps-agent-1',
  position: { x: 0, y: 0, z: 0 },
  orientation: { x: 0, y: 0, z: 1 },
  paradigm: 'fps'
});

// RTS agent (global view)
const rtsAgent = sim.addAgent({
  id: 'rts-agent-1',
  paradigm: 'rts'
});
```

### Query Spatial Relationships

```typescript
// FPS: Query from agent's perspective
const fpsVisible = sim.queryFromPerspective(fpsAgent.id, {
  radius: 100,
  fieldOfView: Math.PI / 2
});

// RTS: Global query (sees everything)
const rtsVisible = sim.queryAll();
```

### Visualize

```typescript
// Start rendering
sim.start();

// Toggle visualization modes
sim.setVisualizationMode('3d');
sim.setVisualizationMode('heatmap');
sim.setVisualizationMode('graph');
```

## Performance Benchmarks

| Agent Count | FPS Query | RTS Query | Memory |
|-------------|-----------|-----------|--------|
| 100 | <1ms | ~5ms | ~5MB |
| 1,000 | ~2ms | ~50ms | ~30MB |
| 10,000 | ~8ms | ~500ms | ~150MB |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Multi-Agent Simulation                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Visualization Layer (Three.js)                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  3D Scene                          Metrics Panel      │    │
│  │  • Agent meshes                   • Performance      │    │
│  │  • Orientation vectors            • Comparison       │    │
│  │  • Field of view                  • Stats            │    │
│  └─────────────────────────────────────────────────────┘    │
│                           ↓                                  │
│  Simulation Engine                                           │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Agent Manager                     Physics Engine    │    │
│  │  • Spawn/despawn                  • Movement         │    │
│  │  • State management               • Collision        │    │
│  │  • Coordination                   • Bounds           │    │
│  └─────────────────────────────────────────────────────┘    │
│                           ↓                                  │
│  Spatial Indexing                                            │
│  ┌──────────────────┐      ┌──────────────────┐             │
│  │  Spatial Hash    │      │  KD-tree         │             │
│  │  • Grid cells    │      │  • Spatial tree  │             │
│  │  • Fast lookup   │      │  • Range query   │             │
│  │  • O(1) access   │      │  • O(log n)      │             │
│  └──────────────────┘      └──────────────────┘             │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Controls

### Camera
- **Orbit:** Left-click + drag
- **Pan:** Right-click + drag
- **Zoom:** Scroll wheel

### Simulation
- **Pause:** Space
- **Reset:** R
- **Spawn agents:** + key
- **Despawn agents:** - key

### View Modes
- **1:** 3D view
- **2:** Heat map
- **3:** Graph view
- **4:** Split comparison

## API Reference

### Simulation Class

```typescript
class Simulation {
  constructor(config: SimulationConfig);

  // Agents
  addAgent(config: AgentConfig): Agent;
  removeAgent(id: string): void;
  getAgent(id: string): Agent | undefined;

  // Queries
  queryFromPerspective(agentId: string, options: QueryOptions): Agent[];
  queryNearby(position: Vector3, radius: number): Agent[];
  queryAll(): Agent[];

  // Visualization
  start(): void;
  pause(): void;
  reset(): void;
  setVisualizationMode(mode: VisualizationMode): void;

  // Metrics
  getMetrics(): SimulationMetrics;
}
```

## Testing

```bash
npm test
```

## Deployment

```bash
# Build
npm run build

# Deploy to static hosting
npm run deploy
```

## License

MIT
