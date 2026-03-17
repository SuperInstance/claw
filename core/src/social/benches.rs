//! Performance Benchmarks for Social Coordination
//!
//! This module provides comprehensive benchmarks for all social coordination features.

use criterion::{black_box, criterion_group, criterion_main, Criterion, BenchmarkId};
use crate::social::*;
use crate::social::patterns::*;
use crate::social::strategies::*;
use crate::social::message::*;
use crate::social::manager::SocialManager;
use crate::social::relationships::RelationshipManager;
use crate::social::consensus::{ConsensusEngine, VoteRecord};
use std::sync::Arc;
use tokio::runtime::Runtime;

/// Benchmark master-slave pattern creation
fn bench_master_slave_pattern(c: &mut Criterion) {
    let rt = Runtime::new().unwrap();

    c.bench_function("master_slave_pattern_create", |b| {
        b.to_async(&rt).iter(|| {
            let mut pattern = MasterSlavePattern::new();
            let master = SocialAgentMetadata::new("master".to_string(), SocialRole::Master);
            let slave1 = SocialAgentMetadata::new("slave-1".to_string(), SocialRole::Slave);
            let slave2 = SocialAgentMetadata::new("slave-2".to_string(), SocialRole::Slave);

            async move {
                pattern.add_agent(master).await.unwrap();
                pattern.add_agent(slave1).await.unwrap();
                pattern.add_agent(slave2).await.unwrap();
            }
        })
    });
}

/// Benchmark parallel strategy with varying agent counts
fn bench_parallel_strategy(c: &mut Criterion) {
    let rt = Runtime::new().unwrap();

    let mut group = c.benchmark_group("parallel_strategy");

    for agent_count in [2, 5, 10, 20, 50].iter() {
        group.bench_with_input(BenchmarkId::from_parameter(agent_count), agent_count, |b, &count| {
            let agents: Vec<String> = (0..count).map(|i| format!("agent-{}", i)).collect();
            let task = serde_json::json!({"action": "bench"});
            let strategy = ParallelStrategy::new();

            b.to_async(&rt).iter(|| {
                strategy.execute(black_box(agents.clone()), black_box(task.clone()))
            });
        });
    }

    group.finish();
}

/// Benchmark sequential strategy with varying agent counts
fn bench_sequential_strategy(c: &mut Criterion) {
    let rt = Runtime::new().unwrap();

    let mut group = c.benchmark_group("sequential_strategy");

    for agent_count in [2, 5, 10, 20].iter() {
        group.bench_with_input(BenchmarkId::from_parameter(agent_count), agent_count, |b, &count| {
            let agents: Vec<String> = (0..count).map(|i| format!("agent-{}", i)).collect();
            let task = serde_json::json!({"action": "bench"});
            let strategy = SequentialStrategy::new();

            b.to_async(&rt).iter(|| {
                strategy.execute(black_box(agents.clone()), black_box(task.clone()))
            });
        });
    }

    group.finish();
}

/// Benchmark consensus strategy
fn bench_consensus_strategy(c: &mut Criterion) {
    let rt = Runtime::new().unwrap();

    let mut group = c.benchmark_group("consensus_strategy");

    for agent_count in [3, 5, 10, 20].iter() {
        group.bench_with_input(BenchmarkId::from_parameter(agent_count), agent_count, |b, &count| {
            let agents: Vec<String> = (0..count).map(|i| format!("agent-{}", i)).collect();
            let task = serde_json::json!({"action": "bench"});
            let strategy = ConsensusStrategy::new();

            b.to_async(&rt).iter(|| {
                strategy.execute(black_box(agents.clone()), black_box(task.clone()))
            });
        });
    }

    group.finish();
}

/// Benchmark message creation
fn bench_message_creation(c: &mut Criterion) {
    c.bench_function("message_creation", |b| {
        b.iter(|| {
            SocialMessage::new(
                black_box("agent-1".to_string()),
                black_box(MessageType::Request),
                black_box(message::MessageRouting::Direct {
                    target: "agent-2".to_string(),
                }),
                black_box(serde_json::json!({"data": "test"})),
            )
        })
    });
}

/// Benchmark message reply creation
fn bench_message_reply(c: &mut Criterion) {
    let original = SocialMessage::new(
        "agent-1".to_string(),
        MessageType::Request,
        message::MessageRouting::Direct {
            target: "agent-2".to_string(),
        },
        serde_json::json!({"question": "test"}),
    );

    c.bench_function("message_reply_creation", |b| {
        b.iter(|| {
            original.create_reply(
                black_box("agent-2".to_string()),
                black_box(serde_json::json!({"answer": "result"})),
            )
        })
    });
}

/// Benchmark message broker
fn bench_message_broker(c: &mut Criterion) {
    let rt = Runtime::new().unwrap();

    c.bench_function("message_broker_send", |b| {
        b.to_async(&rt).iter(|| {
            let broker = MessageBroker::new();
            let handler = SimpleMessageHandler::new("test-handler".to_string(), |msg| {
                Ok(None)
            });

            async move {
                broker.register_handler(Box::new(handler)).await.unwrap();
                let message = SocialMessage::new(
                    "agent-1".to_string(),
                    MessageType::Request,
                    message::MessageRouting::Direct {
                        target: "test-handler".to_string(),
                    },
                    serde_json::json!({}),
                );
                broker.send_message(message).await
            }
        })
    });
}

/// Benchmark relationship manager
fn bench_relationship_manager(c: &mut Criterion) {
    c.bench_function("relationship_manager_add_agent", |b| {
        b.iter(|| {
            let mut manager = RelationshipManager::new();
            let agent = SocialAgentMetadata::new("agent-1".to_string(), SocialRole::Peer);
            manager.add_agent(black_box(agent))
        })
    });
}

/// Benchmark social graph path finding
fn bench_social_graph_path(c: &mut Criterion) {
    let mut graph = SocialGraph::new();

    // Create a graph with 100 nodes
    for i in 0..100 {
        graph.add_node(format!("node-{}", i));
    }

    // Create edges
    for i in 0..99 {
        graph.add_edge(
            format!("node-{}", i),
            format!("node-{}", i + 1),
            RelationshipType::Peer,
        );
    }

    c.bench_function("social_graph_path_finding", |b| {
        b.iter(|| {
            graph.find_shortest_path(black_box("node-0"), black_box("node-99"))
        })
    });
}

/// Benchmark consensus engine
fn bench_consensus_engine(c: &mut Criterion) {
    let rt = Runtime::new().unwrap();

    let mut group = c.benchmark_group("consensus_engine");

    for agent_count in [3, 5, 10, 20, 50].iter() {
        group.bench_with_input(BenchmarkId::from_parameter(agent_count), agent_count, |b, &count| {
            let engine = ConsensusEngine::new();
            let votes: Vec<VoteRecord> = (0..count)
                .map(|i| VoteRecord {
                    agent_id: format!("agent-{}", i),
                    value: serde_json::json!("yes"),
                    confidence: 1.0,
                    timestamp: 0,
                })
                .collect();

            b.to_async(&rt).iter(|| {
                engine.achieve_consensus(black_box(votes.clone()))
            });
        });
    }

    group.finish();
}

/// Benchmark social manager coordination
fn bench_social_manager_coordination(c: &mut Criterion) {
    let rt = Runtime::new().unwrap();

    let mut group = c.benchmark_group("social_manager_coordination");

    for agent_count in [2, 5, 10, 20].iter() {
        group.bench_with_input(BenchmarkId::from_parameter(agent_count), agent_count, |b, &count| {
            b.to_async(&rt).iter(|| {
                let manager = SocialManager::new(CoordinationConfig::default());

                async move {
                    // Register agents
                    for i in 0..count {
                        let agent = SocialAgentMetadata::new(
                            format!("agent-{}", i),
                            SocialRole::Peer,
                        );
                        manager.register_agent(agent).await.unwrap();
                    }

                    let agents: Vec<String> = (0..count).map(|i| format!("agent-{}", i)).collect();
                    let task = serde_json::json!({"action": "bench"});

                    manager.coordinate_parallel(agents, task).await
                }
            })
        });
    }

    group.finish();
}

/// Benchmark concurrent coordinations
fn bench_concurrent_coordinations(c: &mut Criterion) {
    let rt = Runtime::new().unwrap();

    let mut group = c.benchmark_group("concurrent_coordinations");

    for concurrent_count in [2, 5, 10].iter() {
        group.bench_with_input(BenchmarkId::from_parameter(concurrent_count), concurrent_count, |b, &count| {
            b.to_async(&rt).iter(|| {
                let manager = Arc::new(SocialManager::new(CoordinationConfig::default()));

                async move {
                    // Register agents
                    for i in 0..20 {
                        let agent = SocialAgentMetadata::new(
                            format!("agent-{}", i),
                            SocialRole::Peer,
                        );
                        manager.register_agent(agent).await.unwrap();
                    }

                    // Spawn concurrent coordinations
                    let mut handles = Vec::new();

                    for i in 0..count {
                        let manager_clone = manager.clone();
                        let handle = tokio::spawn(async move {
                            let agents = vec![
                                format!("agent-{}", (i % 20)),
                                format!("agent-{}", ((i + 1) % 20)),
                            ];
                            let task = serde_json::json!({"concurrent": i});
                            manager_clone.coordinate_parallel(agents, task).await
                        });
                        handles.push(handle);
                    }

                    // Wait for all to complete
                    for handle in handles {
                        handle.await.unwrap().unwrap();
                    }
                }
            })
        });
    }

    group.finish();
}

/// Benchmark metrics tracking overhead
fn bench_metrics_tracking(c: &mut Criterion) {
    let rt = Runtime::new().unwrap();

    c.bench_function("metrics_tracking", |b| {
        b.to_async(&rt).iter(|| {
            let manager = SocialManager::new(CoordinationConfig::default());

            async move {
                // Register agent
                let agent = SocialAgentMetadata::new("agent-1".to_string(), SocialRole::Peer);
                manager.register_agent(agent).await.unwrap();

                // Get metrics
                manager.get_metrics().await
            }
        })
    });
}

/// Benchmark relationship creation
fn bench_relationship_creation(c: &mut Criterion) {
    c.bench_function("relationship_creation", |b| {
        b.iter(|| {
            let mut manager = RelationshipManager::new();

            // Add agents
            for i in 0..3 {
                let agent = SocialAgentMetadata::new(
                    format!("agent-{}", i),
                    SocialRole::Peer,
                );
                manager.add_agent(agent).unwrap();
            }

            // Create relationship
            let relationship = Relationship::new(
                "rel-1".to_string(),
                RelationshipType::Peer,
                vec!["agent-0".to_string(), "agent-1".to_string(), "agent-2".to_string()],
            );

            manager.add_relationship(black_box(relationship))
        })
    });
}

/// Benchmark social graph metrics
fn bench_social_graph_metrics(c: &mut Criterion) {
    let mut manager = RelationshipManager::new();

    // Create a large graph
    for i in 0..100 {
        let agent = SocialAgentMetadata::new(format!("agent-{}", i), SocialRole::Peer);
        manager.add_agent(agent).unwrap();
    }

    for i in 0..99 {
        let relationship = Relationship::new(
            format!("rel-{}", i),
            RelationshipType::Peer,
            vec![format!("agent-{}", i), format!("agent-{}", i + 1)],
        );
        manager.add_relationship(relationship).unwrap();
    }

    c.bench_function("social_graph_metrics_calculation", |b| {
        b.iter(|| {
            manager.get_social_metrics()
        })
    });
}

criterion_group!(
    benches,
    bench_master_slave_pattern,
    bench_parallel_strategy,
    bench_sequential_strategy,
    bench_consensus_strategy,
    bench_message_creation,
    bench_message_reply,
    bench_message_broker,
    bench_relationship_manager,
    bench_social_graph_path,
    bench_consensus_engine,
    bench_social_manager_coordination,
    bench_concurrent_coordinations,
    bench_metrics_tracking,
    bench_relationship_creation,
    bench_social_graph_metrics
);

criterion_main!(benches);
