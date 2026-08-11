# Collaborative Planning Tool

Production-ready collaborative planning application demonstrating multi-agent consensus and real-time collaboration.

## Overview

A modern planning tool that enables teams to collaborate with AI agents assisting in coordination, conflict resolution, and consensus building.

## Features

### Multi-Agent Consensus
- Holonomic consensus for agreement
- Master-slave coordination for tasks
- Conflict resolution algorithms
- Voting mechanisms

### Real-Time Collaboration
- SmartCRDT-based state sync
- WebSocket live updates
- Conflict-free replication
- Automatic merge resolution

### AI Agent Assistance
- Claw agents for planning assistance
- Suggestion generation
- Risk analysis
- Resource optimization

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Collaborative Planner                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Frontend (Next.js + React)                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Planning Board                    Agent Panel        │    │
│  │  • Task Cards                    • AI Assistants     │    │
│  │  • Timeline                      • Consensus View    │    │
│  │  • Resources                     • Suggestions       │    │
│  └─────────────────────────────────────────────────────┘    │
│                           ↓↑ WebSocket                       │
│  Backend (Node.js + PostgreSQL)                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  API Server                       SmartCRDT Engine   │    │
│  │  • REST Endpoints                • State Sync        │    │
│  │  • WebSocket Server              • Conflict Res      │    │
│  │  • Auth/Session                  • Event Log         │    │
│  └─────────────────────────────────────────────────────┘    │
│                           ↓↑                                 │
│  Database Layer                                              │
│  ┌──────────────────┐      ┌──────────────────┐             │
│  │  PostgreSQL      │      │  Redis Cache     │             │
│  │  • Plans         │      │  • Sessions      │             │
│  │  • Tasks         │      │  • Locks         │             │
│  │  • Consensus     │      │  • Pub/Sub       │             │
│  └──────────────────┘      └──────────────────┘             │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

### Docker Deployment

```bash
docker-compose up -d
```

### Manual Installation

```bash
npm install
npm run dev
```

## Usage

### Create a Plan

```typescript
const plan = await createPlan({
  name: 'Q1 Product Launch',
  owner: 'user-1',
  collaborators: ['user-2', 'user-3'],
  agents: ['planning-assistant', 'risk-analyzer']
});
```

### Add Task with Consensus

```typescript
const task = await addTask(planId, {
  title: 'Design marketing materials',
  assignee: 'user-2',
  deadline: '2024-03-01',
  requiresConsensus: true
});

// Agents vote on task
await voteOnTask(taskId, {
  agentId: 'planning-assistant',
  vote: 'approve',
  reasoning: 'Aligns with timeline'
});
```

### Resolve Conflicts

```typescript
const resolution = await resolveConflict(conflictId, {
  strategy: 'consensus',
  participants: ['user-1', 'user-2', 'planning-assistant'],
  timeout: 30000
});
```

## API Reference

### Plans

```typescript
// Create plan
POST /api/plans
{
  name: string;
  owner: string;
  collaborators: string[];
  agents: string[];
}

// Get plan
GET /api/plans/:id

// Update plan
PATCH /api/plans/:id
{
  name?: string;
  collaborators?: string[];
}
```

### Tasks

```typescript
// Add task
POST /api/plans/:id/tasks
{
  title: string;
  assignee: string;
  deadline: string;
  requiresConsensus: boolean;
}

// Vote on task
POST /api/tasks/:id/vote
{
  agentId: string;
  vote: 'approve' | 'reject' | 'abstain';
  reasoning: string;
}
```

### Consensus

```typescript
// Get consensus status
GET /api/tasks/:id/consensus

// Trigger consensus
POST /api/tasks/:id/consensus/trigger
{
  participants: string[];
  timeout: number;
}
```

## Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Integration tests
npm run test:integration
```

## Deployment

```bash
# Build
npm run build

# Start
npm start

# Docker
docker-compose up -d
```

## License

MIT
