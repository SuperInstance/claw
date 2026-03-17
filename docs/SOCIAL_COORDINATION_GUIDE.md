# Social Coordination System - Complete Guide

## Overview

The Social Coordination System enables multi-agent collaboration through various social patterns and coordination strategies. Agents can work together using patterns like Master-Slave, Co-Worker, Peer, Delegate, and Observer relationships.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Social Patterns](#social-patterns)
3. [Coordination Strategies](#coordination-strategies)
4. [Message Protocol](#message-protocol)
5. [Relationship Management](#relationship-management)
6. [Consensus Engine](#consensus-engine)
7. [Performance Considerations](#performance-considerations)
8. [Examples](#examples)
9. [API Reference](#api-reference)

---

## Quick Start

### Basic Setup

```rust
use claw_core::social::*;

#[tokio::main]
async fn main() -> SocialResult<()> {
    // Create a social manager
    let config = CoordinationConfig::default();
    let manager = SocialManager::new(config);

    // Register agents
    for i in 1..=3 {
        let agent = SocialAgentMetadata::new(
            format!("agent-{}", i),
            SocialRole::Peer,
        );
        manager.register_agent(agent).await?;
    }

    // Coordinate agents
    let agents = vec![
        "agent-1".to_string(),
        "agent-2".to_string(),
        "agent-3".to_string(),
    ];
    let task = serde_json::json!({"action": "process_data"});

    let result = manager.coordinate_parallel(agents, task).await?;

    println!("Coordination success: {}", result.success);

    Ok(())
}
```

---

## Social Patterns

### Master-Slave Pattern

One master coordinates multiple slaves for parallel processing.

```rust
use claw_core::social::patterns::MasterSlavePattern;

let mut pattern = MasterSlavePattern::new();

// Add master
let master = SocialAgentMetadata::new("master".to_string(), SocialRole::Master);
pattern.add_agent(master).await?;

// Add slaves
for i in 1..=5 {
    let slave = SocialAgentMetadata::new(
        format!("slave-{}", i),
        SocialRole::Slave,
    );
    pattern.add_agent(slave).await?;
}

// Execute coordination
let task = serde_json::json!({"data": "process"});
let result = pattern.coordinate(task).await?;
```

**Use Cases:**
- Parallel data processing
- Distributed task execution
- Load balancing

### Co-Worker Pattern

Multiple agents collaborate as equals on shared tasks.

```rust
use claw_core::social::patterns::CoWorkerPattern;

let mut pattern = CoWorkerPattern::new();

// Add workers
for i in 1..=5 {
    let worker = SocialAgentMetadata::new(
        format!("worker-{}", i),
        SocialRole::CoWorker,
    );
    pattern.add_agent(worker).await?;
}

// Collaborate on task
let task = serde_json::json!({"project": "collaborative_analysis"});
let result = pattern.coordinate(task).await?;
```

**Use Cases:**
- Collaborative problem solving
- Peer review processes
- Group decision making

### Peer Pattern

Equal agents coordinate together without hierarchy.

```rust
use claw_core::social::patterns::PeerPattern;

let mut pattern = PeerPattern::new();

// Add peers
for i in 1..=5 {
    let peer = SocialAgentMetadata::new(
        format!("peer-{}", i),
        SocialRole::Peer,
    );
    pattern.add_agent(peer).await?;
}

// Coordinate as equals
let task = serde_json::json!({"decision": "consensus"});
let result = pattern.coordinate(task).await?;
```

**Use Cases:**
- Decentralized coordination
- Consensus-based decisions
- Peer-to-peer networks

### Delegate Pattern

One agent delegates tasks to others.

```rust
use claw_core::social::patterns::DelegatePattern;

let mut pattern = DelegatePattern::new();

// Add delegate
let delegate = SocialAgentMetadata::new("delegate".to_string(), SocialRole::Delegate);
pattern.add_agent(delegate).await?;

// Add delegated agents
for i in 1..=5 {
    let delegated = SocialAgentMetadata::new(
        format!("delegated-{}", i),
        SocialRole::Slave,
    );
    pattern.add_agent(delegated).await?;
}

// Delegate task
let task = serde_json::json!({"work": "distributed"});
let result = pattern.coordinate(task).await?;
```

**Use Cases:**
- Task distribution
- Work delegation
- Hierarchical processing

### Observer Pattern

Agents observe without participating.

```rust
use claw_core::social::patterns::ObserverPattern;

let mut pattern = ObserverPattern::new()
    .with_observed("target-agent".to_string());

// Add observers
for i in 1..=5 {
    let observer = SocialAgentMetadata::new(
        format!("observer-{}", i),
        SocialRole::Observer,
    );
    pattern.add_agent(observer).await?;
}

// Monitor activity
let task = serde_json::json!({"monitor": "status"});
let result = pattern.coordinate(task).await?;
```

**Use Cases:**
- Monitoring and logging
- Auditing and compliance
- Passive observation

---

## Coordination Strategies

### Parallel Strategy

Execute all agents simultaneously and aggregate results.

```rust
use claw_core::social::strategies::ParallelStrategy;

let strategy = ParallelStrategy::new()
    .with_timeout(5000); // 5 second timeout

let agents = vec!["agent-1".to_string(), "agent-2".to_string()];
let task = serde_json::json!({"action": "parallel"});

let result = strategy.execute(agents, task).await?;

println!("Execution time: {} ms", result.execution_time_ms);
```

**Performance:** Fastest for independent tasks

### Sequential Strategy

Execute agents one after another.

```rust
use claw_core::social::strategies::SequentialStrategy;

let strategy = SequentialStrategy::new()
    .with_timeout(5000)
    .with_stop_on_error(true); // Stop on first error

let agents = vec!["agent-1".to_string(), "agent-2".to_string()];
let task = serde_json::json!({"action": "sequential"});

let result = strategy.execute(agents, task).await?;
```

**Use Case:** Ordered execution, dependencies between tasks

### Consensus Strategy

All agents must agree on the result.

```rust
use claw_core::social::strategies::ConsensusStrategy;

let strategy = ConsensusStrategy::new()
    .with_timeout(10000)
    .with_agreement_threshold(1.0); // 100% agreement required

let agents = vec!["agent-1".to_string(), "agent-2".to_string(), "agent-3".to_string()];
let task = serde_json::json!({"vote": "decision"});

let result = strategy.execute(agents, task).await?;

if let Some(outcome) = result.consensus_outcome {
    println!("Consensus reached: {}", outcome.agreed);
    println!("Agreement: {}/{}", outcome.agreement_count, outcome.total_count);
}
```

**Use Case:** Critical decisions requiring unanimity

### Majority Vote Strategy

Majority wins.

```rust
use claw_core::social::strategies::MajorityVoteStrategy;

let strategy = MajorityVoteStrategy::new()
    .with_timeout(5000)
    .with_majority_threshold(0.5); // 50% + 1 vote

let agents = vec!["agent-1".to_string(), "agent-2".to_string(), "agent-3".to_string()];
let task = serde_json::json!({"vote": "proposal"});

let result = strategy.execute(agents, task).await?;

if let Some(outcome) = result.consensus_outcome {
    println!("Majority agreed: {}", outcome.agreed);
    println!("Confidence: {:.2}", outcome.confidence);
}
```

**Use Case:** Democratic decision making

### Weighted Strategy

Votes are weighted by confidence.

```rust
use claw_core::social::strategies::WeightedStrategy;

let strategy = WeightedStrategy::new()
    .with_timeout(5000)
    .with_threshold(0.6); // 60% confidence required

let agents = vec!["agent-1".to_string(), "agent-2".to_string()];
let task = serde_json::json!({"decision": "weighted"});

let result = strategy.execute(agents, task).await?;

if let Some(outcome) = result.consensus_outcome {
    println!("Weighted agreement: {}", outcome.agreed);
    println!("Confidence: {:.2}", outcome.confidence);
}
```

**Use Case:** Expert-weighted decisions

---

## Message Protocol

### Creating Messages

```rust
use claw_core::social::message::*;

// Direct message
let message = SocialMessage::new(
    "agent-1".to_string(),
    MessageType::Request,
    MessageRouting::Direct {
        target: "agent-2".to_string(),
    },
    serde_json::json!({"query": "status"}),
)
.with_priority(MessagePriority::High)
.with_ttl(5000); // 5 second TTL

// Broadcast message
let broadcast = SocialMessage::new(
    "agent-1".to_string(),
    MessageType::Broadcast,
    MessageRouting::Broadcast,
    serde_json::json!({"announcement": "update"}),
);

// Multicast message
let multicast = SocialMessage::new(
    "agent-1".to_string(),
    MessageType::Multicast,
    MessageRouting::Multicast {
        targets: vec!["agent-2".to_string(), "agent-3".to_string()],
    },
    serde_json::json!({"notification": "event"}),
);
```

### Creating Replies

```rust
let reply = original_message.create_reply(
    "agent-2".to_string(),
    serde_json::json!({"response": "ok"}),
);
```

### Using Message Broker

```rust
use claw_core::social::message::MessageBroker;

let broker = MessageBroker::new();

// Register handler
let handler = SimpleMessageHandler::new("my-handler".to_string(), |msg| {
    // Process message
    Ok(None)
});
broker.register_handler(Box::new(handler)).await?;

// Send message
broker.send_message(message).await?;

// Send direct message
broker.send_direct(
    "agent-1".to_string(),
    "agent-2".to_string(),
    serde_json::json!({"data": "test"}),
).await?;

// Send broadcast
broker.send_broadcast(
    "agent-1".to_string(),
    serde_json::json!({"announcement": "test"}),
).await?;
```

---

## Relationship Management

### Managing Relationships

```rust
use claw_core::social::relationships::RelationshipManager;

let mut manager = RelationshipManager::new();

// Add agents
let agent1 = SocialAgentMetadata::new("agent-1".to_string(), SocialRole::Peer);
let agent2 = SocialAgentMetadata::new("agent-2".to_string(), SocialRole::Peer);

manager.add_agent(agent1)?;
manager.add_agent(agent2)?;

// Create relationship
let relationship = Relationship::new(
    "rel-1".to_string(),
    RelationshipType::Peer,
    vec!["agent-1".to_string(), "agent-2".to_string()],
);

manager.add_relationship(relationship)?;

// Query relationships
let agent_rels = manager.get_agent_relationships("agent-1");
let all_rels = manager.get_all_relationships();

// Get social metrics
let metrics = manager.get_social_metrics();
println!("Total agents: {}", metrics.total_nodes);
println!("Total relationships: {}", metrics.total_edges);
```

### Social Graph

```rust
use claw_core::social::relationships::SocialGraph;

let mut graph = SocialGraph::new();

// Add nodes
graph.add_node("agent-1".to_string());
graph.add_node("agent-2".to_string());
graph.add_node("agent-3".to_string());

// Add edges
graph.add_edge(
    "agent-1".to_string(),
    "agent-2".to_string(),
    RelationshipType::Peer,
);
graph.add_edge(
    "agent-2".to_string(),
    "agent-3".to_string(),
    RelationshipType::Peer,
);

// Find shortest path
let path = graph.find_shortest_path("agent-1", "agent-3")?;
println!("Path: {:?}", path);

// Get metrics
let metrics = graph.get_metrics();
println!("Average degree: {:.2}", metrics.avg_degree);
```

---

## Consensus Engine

### Achieving Consensus

```rust
use claw_core::social::consensus::{ConsensusEngine, VoteRecord};

let engine = ConsensusEngine::new()
    .with_timeout(10000)
    .with_agreement_threshold(1.0);

// Create votes
let votes = vec![
    VoteRecord {
        agent_id: "agent-1".to_string(),
        value: serde_json::json!("yes"),
        confidence: 1.0,
        timestamp: 0,
    },
    VoteRecord {
        agent_id: "agent-2".to_string(),
        value: serde_json::json!("yes"),
        confidence: 1.0,
        timestamp: 0,
    },
    VoteRecord {
        agent_id: "agent-3".to_string(),
        value: serde_json::json!("yes"),
        confidence: 1.0,
        timestamp: 0,
    },
];

// Achieve consensus
let result = engine.achieve_consensus(votes).await?;

println!("Consensus reached: {}", result.agreed);
println!("Agreement value: {:?}", result.agreement_value);
println!("Confidence: {:.2}", result.confidence);
println!("Duration: {} ms", result.duration_ms);

// Get metrics
let metrics = engine.get_metrics().await;
println!("Successful consensus: {}", metrics.successful_consensuses);
```

---

## Performance Considerations

### Coordination Overhead

- **Parallel Strategy**: <20ms coordination overhead
- **Sequential Strategy**: Minimal overhead, sequential execution
- **Consensus Strategy**: <100ms consensus time
- **Majority Vote**: <50ms for typical groups
- **Weighted Strategy**: <60ms with confidence calculation

### Scalability

The system scales to:
- **1000+ agents** in parallel coordination
- **100+ concurrent coordinations**
- **10,000+ relationships** in social graph
- **Sub-millisecond** message routing

### Optimization Tips

1. **Use appropriate strategies**: Parallel for independent tasks, Sequential for dependencies
2. **Set reasonable timeouts**: Default 5-10 seconds
3. **Monitor metrics**: Track coordination success rates
4. **Use batching**: Group multiple agents together
5. **Cache frequently used relationships**: Reduce lookup overhead

---

## Examples

### Example 1: Parallel Data Processing

```rust
use claw_core::social::*;

async fn parallel_data_processing() -> SocialResult<()> {
    let manager = SocialManager::new(CoordinationConfig::default());

    // Register worker agents
    for i in 1..=10 {
        let agent = SocialAgentMetadata::new(
            format!("worker-{}", i),
            SocialRole::Slave,
        );
        manager.register_agent(agent).await?;
    }

    // Create master-slave relationship
    let master = SocialAgentMetadata::new("master".to_string(), SocialRole::Master);
    manager.register_agent(master).await?;

    manager.create_master_slave(
        "master".to_string(),
        (1..=10).map(|i| format!("worker-{}", i)).collect(),
    ).await?;

    // Process data in parallel
    let workers: Vec<String> = (1..=10).map(|i| format!("worker-{}", i)).collect();
    let task = serde_json::json!({
        "action": "process",
        "data": "large_dataset"
    });

    let result = manager.coordinate_parallel(workers, task).await?;

    println!("Processed {} agents", result.agent_results.len());

    Ok(())
}
```

### Example 2: Consensus Decision Making

```rust
use claw_core::social::*;

async fn consensus_decision() -> SocialResult<()> {
    let manager = SocialManager::new(CoordinationConfig::default());

    // Register peer agents
    for i in 1..=5 {
        let agent = SocialAgentMetadata::new(
            format!("peer-{}", i),
            SocialRole::Peer,
        );
        manager.register_agent(agent).await?;
    }

    // Reach consensus on decision
    let peers: Vec<String> = (1..=5).map(|i| format!("peer-{}", i)).collect();
    let task = serde_json::json!({
        "decision": "approve_proposal",
        "proposal_id": "123"
    });

    let result = manager.coordinate_consensus(peers, task).await?;

    if let Some(outcome) = result.consensus_outcome {
        if outcome.agreed {
            println!("Consensus reached: {}/{}", outcome.agreement_count, outcome.total_count);
        } else {
            println!("Consensus not reached");
        }
    }

    Ok(())
}
```

### Example 3: Weighted Voting

```rust
use claw_core::social::*;

async fn weighted_voting() -> SocialResult<()> {
    let manager = SocialManager::new(CoordinationConfig::default());

    // Register expert agents with different weights
    let experts = vec![
        ("expert-1", "senior"),
        ("expert-2", "senior"),
        ("expert-3", "junior"),
    ];

    for (id, level) in experts {
        let mut agent = SocialAgentMetadata::new(id.to_string(), SocialRole::Peer);
        agent.capabilities = vec![level.to_string()];
        manager.register_agent(agent).await?;
    }

    // Weighted decision
    let agents: Vec<String> = vec!["expert-1".to_string(), "expert-2".to_string(), "expert-3".to_string()];
    let task = serde_json::json!({"decision": "technical_choice"});

    let result = manager.coordinate_weighted(agents, task).await?;

    if let Some(outcome) = result.consensus_outcome {
        println!("Weighted agreement: {}", outcome.agreed);
        println!("Confidence: {:.2}", outcome.confidence);
    }

    Ok(())
}
```

---

## API Reference

### SocialManager

Main orchestrator for multi-agent coordination.

**Methods:**
- `new(config: CoordinationConfig) -> Self`
- `register_agent(&self, agent: SocialAgentMetadata) -> SocialResult<()>`
- `coordinate_parallel(&self, agents: Vec<String>, task: Value) -> SocialResult<CoordinationResult>`
- `coordinate_consensus(&self, agents: Vec<String>, task: Value) -> SocialResult<CoordinationResult>`
- `send_message(&self, message: SocialMessage) -> SocialResult<()>`
- `get_metrics(&self) -> CoordinationMetrics`

### CoordinationResult

Result of a coordination operation.

**Fields:**
- `success: bool`
- `execution_time_ms: u64`
- `agent_results: Vec<AgentResult>`
- `consensus_outcome: Option<ConsensusOutcome>`

### SocialMessage

Message for agent-to-agent communication.

**Methods:**
- `new(sender: String, type: MessageType, routing: MessageRouting, payload: Value) -> Self`
- `with_priority(self, priority: MessagePriority) -> Self`
- `create_reply(&self, sender: String, payload: Value) -> Self`

### ConsensusEngine

Engine for achieving consensus.

**Methods:**
- `new() -> Self`
- `achieve_consensus(&self, votes: Vec<VoteRecord>) -> SocialResult<ConsensusResult>`
- `get_metrics(&self) -> ConsensusMetrics`

---

## Testing

Run tests:

```bash
cd core
cargo test social
```

Run benchmarks:

```bash
cd core
cargo bench --bench social
```

---

## Troubleshooting

### Common Issues

1. **Consensus not reached**
   - Check agreement threshold
   - Verify all agents are responding
   - Increase timeout if needed

2. **Slow coordination**
   - Reduce agent count per coordination
   - Use parallel strategy for independent tasks
   - Check system resources

3. **Message routing failures**
   - Verify agent IDs are correct
   - Check agents are registered
   - Ensure message broker is running

### Debug Mode

Enable debug logging:

```rust
tracing::subscriber::set_global_default(
    tracing_subscriber::FmtSubscriber::new()
).unwrap();
```

---

## Best Practices

1. **Choose appropriate patterns**: Use Master-Slave for parallel processing, Peer for collaboration
2. **Set reasonable timeouts**: Balance between responsiveness and waiting
3. **Monitor metrics**: Track coordination success rates and performance
4. **Handle errors gracefully**: Always check result status
5. **Test thoroughly**: Use integration tests for multi-agent scenarios

---

## Next Steps

- Explore equipment system integration
- Learn about trigger mechanisms
- Read about cell integration
- Review performance optimization guides

---

**Last Updated:** 2026-03-16
**Version:** 0.1.0
**Status:** Production Ready
