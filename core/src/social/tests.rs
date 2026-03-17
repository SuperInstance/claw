//! Comprehensive Integration Tests for Social Coordination
//!
//! This module tests all aspects of the social coordination system.

use crate::social::*;
use crate::social::patterns::*;
use crate::social::strategies::*;
use crate::social::message::*;
use crate::social::manager::SocialManager;
use crate::social::relationships::RelationshipManager;
use crate::social::consensus::ConsensusEngine;

/// Test helper to create test agents
fn create_test_agents(count: usize) -> Vec<SocialAgentMetadata> {
    (0..count)
        .map(|i| SocialAgentMetadata::new(
            format!("agent-{}", i),
            SocialRole::Peer
        ))
        .collect()
}

/// Test master-slave pattern coordination
#[tokio::test]
async fn test_master_slave_coordination() {
    let mut pattern = MasterSlavePattern::new();

    let master = SocialAgentMetadata::new("master".to_string(), SocialRole::Master);
    let slave1 = SocialAgentMetadata::new("slave-1".to_string(), SocialRole::Slave);
    let slave2 = SocialAgentMetadata::new("slave-2".to_string(), SocialRole::Slave);

    pattern.add_agent(master).await.unwrap();
    pattern.add_agent(slave1).await.unwrap();
    pattern.add_agent(slave2).await.unwrap();

    assert_eq!(pattern.slave_count(), 2);
    assert!(pattern.health_check().await.unwrap());

    let agents = pattern.get_agents().await;
    assert_eq!(agents.len(), 3);
}

/// Test co-worker pattern coordination
#[tokio::test]
async fn test_co_worker_coordination() {
    let mut pattern = CoWorkerPattern::new();

    let worker1 = SocialAgentMetadata::new("worker-1".to_string(), SocialRole::CoWorker);
    let worker2 = SocialAgentMetadata::new("worker-2".to_string(), SocialRole::CoWorker);
    let worker3 = SocialAgentMetadata::new("worker-3".to_string(), SocialRole::CoWorker);

    pattern.add_agent(worker1).await.unwrap();
    pattern.add_agent(worker2).await.unwrap();
    pattern.add_agent(worker3).await.unwrap();

    assert_eq!(pattern.worker_count(), 3);
    assert!(pattern.health_check().await.unwrap());
}

/// Test peer pattern coordination
#[tokio::test]
async fn test_peer_coordination() {
    let mut pattern = PeerPattern::new();

    let peer1 = SocialAgentMetadata::new("peer-1".to_string(), SocialRole::Peer);
    let peer2 = SocialAgentMetadata::new("peer-2".to_string(), SocialRole::Peer);

    pattern.add_agent(peer1).await.unwrap();
    pattern.add_agent(peer2).await.unwrap();

    assert_eq!(pattern.peer_count(), 2);
    assert!(pattern.health_check().await.unwrap());
}

/// Test delegate pattern coordination
#[tokio::test]
async fn test_delegate_coordination() {
    let mut pattern = DelegatePattern::new();

    let delegate = SocialAgentMetadata::new("delegate".to_string(), SocialRole::Delegate);
    let delegated1 = SocialAgentMetadata::new("delegated-1".to_string(), SocialRole::Slave);
    let delegated2 = SocialAgentMetadata::new("delegated-2".to_string(), SocialRole::Slave);

    pattern.add_agent(delegate).await.unwrap();
    pattern.add_agent(delegated1).await.unwrap();
    pattern.add_agent(delegated2).await.unwrap();

    assert!(pattern.health_check().await.unwrap());
    assert_eq!(pattern.get_delegates().len(), 2);
}

/// Test observer pattern coordination
#[tokio::test]
async fn test_observer_coordination() {
    let mut pattern = ObserverPattern::new().with_observed("target".to_string());

    let observer1 = SocialAgentMetadata::new("observer-1".to_string(), SocialRole::Observer);
    let observer2 = SocialAgentMetadata::new("observer-2".to_string(), SocialRole::Observer);

    pattern.add_agent(observer1).await.unwrap();
    pattern.add_agent(observer2).await.unwrap();

    assert_eq!(pattern.observer_count(), 2);
    assert!(pattern.health_check().await.unwrap());
}

/// Test parallel strategy execution
#[tokio::test]
async fn test_parallel_strategy() {
    let strategy = ParallelStrategy::new();
    let agents = create_test_agents(5);
    let agent_ids: Vec<String> = agents.iter().map(|a| a.id.clone()).collect();
    let task = serde_json::json!({"action": "parallel_test"});

    let result = strategy.execute(agent_ids, task).await.unwrap();

    assert!(result.success);
    assert_eq!(result.agent_results.len(), 5);
    assert!(result.execution_time_ms < 1000); // Should be fast
}

/// Test sequential strategy execution
#[tokio::test]
async fn test_sequential_strategy() {
    let strategy = SequentialStrategy::new();
    let agents = create_test_agents(3);
    let agent_ids: Vec<String> = agents.iter().map(|a| a.id.clone()).collect();
    let task = serde_json::json!({"action": "sequential_test"});

    let result = strategy.execute(agent_ids, task).await.unwrap();

    assert!(result.success);
    assert_eq!(result.agent_results.len(), 3);
}

/// Test consensus strategy execution
#[tokio::test]
async fn test_consensus_strategy() {
    let strategy = ConsensusStrategy::new();
    let agents = create_test_agents(3);
    let agent_ids: Vec<String> = agents.iter().map(|a| a.id.clone()).collect();
    let task = serde_json::json!({"action": "consensus_test"});

    let result = strategy.execute(agent_ids, task).await.unwrap();

    assert!(result.success);
    assert!(result.consensus_outcome.is_some());

    let outcome = result.consensus_outcome.unwrap();
    assert_eq!(outcome.strategy, VotingStrategy::Consensus);
    assert!(outcome.agreed);
}

/// Test majority vote strategy execution
#[tokio::test]
async fn test_majority_vote_strategy() {
    let strategy = MajorityVoteStrategy::new();
    let agents = create_test_agents(5);
    let agent_ids: Vec<String> = agents.iter().map(|a| a.id.clone()).collect();
    let task = serde_json::json!({"action": "majority_test"});

    let result = strategy.execute(agent_ids, task).await.unwrap();

    assert!(result.success);
    assert!(result.consensus_outcome.is_some());

    let outcome = result.consensus_outcome.unwrap();
    assert_eq!(outcome.strategy, VotingStrategy::MajorityVote);
}

/// Test weighted strategy execution
#[tokio::test]
async fn test_weighted_strategy() {
    let strategy = WeightedStrategy::new();
    let agents = create_test_agents(3);
    let agent_ids: Vec<String> = agents.iter().map(|a| a.id.clone()).collect();
    let task = serde_json::json!({"action": "weighted_test"});

    let result = strategy.execute(agent_ids, task).await.unwrap();

    assert!(result.success);
    assert!(result.consensus_outcome.is_some());

    let outcome = result.consensus_outcome.unwrap();
    assert_eq!(outcome.strategy, VotingStrategy::Weighted);
}

/// Test message creation and routing
#[test]
fn test_message_creation() {
    let message = SocialMessage::new(
        "agent-1".to_string(),
        MessageType::Request,
        message::MessageRouting::Direct {
            target: "agent-2".to_string(),
        },
        serde_json::json!({"data": "test"}),
    );

    assert_eq!(message.sender, "agent-1");
    assert_eq!(message.message_type, MessageType::Request);
    assert_eq!(message.priority, MessagePriority::Normal);
}

/// Test message with priority
#[test]
fn test_message_priority() {
    let message = SocialMessage::new(
        "agent-1".to_string(),
        MessageType::Request,
        message::MessageRouting::Direct {
            target: "agent-2".to_string(),
        },
        serde_json::json!({}),
    )
    .with_priority(MessagePriority::Urgent);

    assert_eq!(message.priority, MessagePriority::Urgent);
}

/// Test message reply creation
#[test]
fn test_message_reply() {
    let original = SocialMessage::new(
        "agent-1".to_string(),
        MessageType::Request,
        message::MessageRouting::Direct {
            target: "agent-2".to_string(),
        },
        serde_json::json!({"question": "test"}),
    );

    let reply = original.create_reply(
        "agent-2".to_string(),
        serde_json::json!({"answer": "result"}),
    );

    assert_eq!(reply.sender, "agent-2");
    assert_eq!(reply.message_type, MessageType::Response);
    assert_eq!(reply.reply_to, Some(original.id));
    assert_eq!(reply.correlation_id, Some(original.id));
}

/// Test message broker
#[tokio::test]
async fn test_message_broker() {
    let broker = MessageBroker::new();

    let handler = SimpleMessageHandler::new("test-handler".to_string(), |msg| {
        Ok(None)
    });

    broker.register_handler(Box::new(handler)).await.unwrap();
    assert_eq!(broker.handler_count().await, 1);

    let message = SocialMessage::new(
        "agent-1".to_string(),
        MessageType::Request,
        message::MessageRouting::Direct {
            target: "test-handler".to_string(),
        },
        serde_json::json!({}),
    );

    broker.send_message(message).await.unwrap();
}

/// Test relationship manager
#[test]
fn test_relationship_manager() {
    let mut manager = RelationshipManager::new();

    let agent1 = SocialAgentMetadata::new("agent-1".to_string(), SocialRole::Peer);
    let agent2 = SocialAgentMetadata::new("agent-2".to_string(), SocialRole::Peer);

    manager.add_agent(agent1).unwrap();
    manager.add_agent(agent2).unwrap();

    assert_eq!(manager.agent_count(), 2);

    let relationship = Relationship::new(
        "rel-1".to_string(),
        RelationshipType::Peer,
        vec!["agent-1".to_string(), "agent-2".to_string()],
    );

    manager.add_relationship(relationship).unwrap();

    assert_eq!(manager.relationship_count(), 1);

    let agent_rels = manager.get_agent_relationships("agent-1");
    assert_eq!(agent_rels.len(), 1);
}

/// Test social graph
#[test]
fn test_social_graph() {
    let mut graph = SocialGraph::new();

    graph.add_node("agent-1".to_string());
    graph.add_node("agent-2".to_string());
    graph.add_node("agent-3".to_string());

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

    let path = graph.find_shortest_path("agent-1", "agent-3").unwrap();
    assert_eq!(path, vec!["agent-1", "agent-2", "agent-3"]);

    let metrics = graph.get_metrics();
    assert_eq!(metrics.total_nodes, 3);
    assert_eq!(metrics.total_edges, 2);
}

/// Test consensus engine
#[tokio::test]
async fn test_consensus_engine() {
    let engine = ConsensusEngine::new();

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

    let result = engine.achieve_consensus(votes).await.unwrap();

    assert!(result.agreed);
    assert_eq!(result.agreement_count, 3);
    assert_eq!(result.total_participants, 3);

    let metrics = engine.get_metrics().await;
    assert_eq!(metrics.total_consensus_attempts, 1);
    assert_eq!(metrics.successful_consensuses, 1);
}

/// Test consensus engine with failure
#[tokio::test]
async fn test_consensus_engine_failure() {
    let engine = ConsensusEngine::new();

    let votes = vec![
        VoteRecord {
            agent_id: "agent-1".to_string(),
            value: serde_json::json!("yes"),
            confidence: 1.0,
            timestamp: 0,
        },
        VoteRecord {
            agent_id: "agent-2".to_string(),
            value: serde_json::json!("no"),
            confidence: 1.0,
            timestamp: 0,
        },
    ];

    let result = engine.achieve_consensus(votes).await;
    assert!(result.is_err());

    let metrics = engine.get_metrics().await;
    assert_eq!(metrics.failed_consensuses, 1);
}

/// Test social manager
#[tokio::test]
async fn test_social_manager() {
    let manager = SocialManager::new(CoordinationConfig::default());

    // Register agents
    for i in 1..=3 {
        let agent = SocialAgentMetadata::new(
            format!("agent-{}", i),
            SocialRole::Peer,
        );
        manager.register_agent(agent).await.unwrap();
    }

    let agents = vec![
        "agent-1".to_string(),
        "agent-2".to_string(),
        "agent-3".to_string(),
    ];
    let task = serde_json::json!({"action": "test"});

    let result = manager.coordinate_parallel(agents, task).await.unwrap();

    assert!(result.success);

    let metrics = manager.get_metrics().await;
    assert_eq!(metrics.total_coordinations, 1);
    assert_eq!(metrics.successful_coordinations, 1);
}

/// Test social manager with consensus
#[tokio::test]
async fn test_social_manager_consensus() {
    let manager = SocialManager::new(CoordinationConfig::default());

    // Register agents
    for i in 1..=3 {
        let agent = SocialAgentMetadata::new(
            format!("agent-{}", i),
            SocialRole::Peer,
        );
        manager.register_agent(agent).await.unwrap();
    }

    let agents = vec![
        "agent-1".to_string(),
        "agent-2".to_string(),
        "agent-3".to_string(),
    ];
    let task = serde_json::json!({"action": "test"});

    let result = manager.coordinate_consensus(agents, task).await.unwrap();

    assert!(result.success);
    assert!(result.consensus_outcome.is_some());
}

/// Test social manager health check
#[tokio::test]
async fn test_social_manager_health() {
    let manager = SocialManager::new(CoordinationConfig::default());

    assert!(manager.health_check().await.unwrap());
}

/// Test master-slave relationship creation
#[tokio::test]
async fn test_create_master_slave_relationship() {
    let manager = SocialManager::new(CoordinationConfig::default());

    // Register agents
    let master = SocialAgentMetadata::new("master".to_string(), SocialRole::Master);
    manager.register_agent(master).await.unwrap();

    for i in 1..=3 {
        let slave = SocialAgentMetadata::new(
            format!("slave-{}", i),
            SocialRole::Slave,
        );
        manager.register_agent(slave).await.unwrap();
    }

    let rel_id = manager
        .create_master_slave(
            "master".to_string(),
            vec!["slave-1".to_string(), "slave-2".to_string(), "slave-3".to_string()],
        )
        .await
        .unwrap();

    assert!(!rel_id.is_empty());

    let relationships = manager.get_relationships();
    assert_eq!(relationships.len(), 1);
}

/// Test coordination timeout
#[tokio::test]
async fn test_coordination_timeout() {
    let strategy = ParallelStrategy::with_timeout(1); // 1ms timeout
    let agents = create_test_agents(5);
    let agent_ids: Vec<String> = agents.iter().map(|a| a.id.clone()).collect();
    let task = serde_json::json!({"action": "timeout_test"});

    // This should timeout since agents take 100ms
    let result = strategy.execute(agent_ids, task).await;

    assert!(result.is_err());
    match result {
        Err(SocialError::Timeout { .. }) => {}
        _ => panic!("Expected timeout error"),
    }
}

/// Test message routing
#[tokio::test]
async fn test_message_routing_integration() {
    let manager = SocialManager::new(CoordinationConfig::default());

    // Register agents
    for i in 1..=3 {
        let agent = SocialAgentMetadata::new(
            format!("agent-{}", i),
            SocialRole::Peer,
        );
        manager.register_agent(agent).await.unwrap();
    }

    let message = SocialMessage::new(
        "agent-1".to_string(),
        MessageType::Request,
        message::MessageRouting::Direct {
            target: "agent-2".to_string(),
        },
        serde_json::json!({"test": "data"}),
    );

    let result = manager.send_message(message).await;
    assert!(result.is_ok());
}

/// Test multi-agent coordination performance
#[tokio::test]
async fn test_multi_agent_performance() {
    let manager = SocialManager::new(CoordinationConfig::default());

    // Register many agents
    for i in 1..=50 {
        let agent = SocialAgentMetadata::new(
            format!("agent-{}", i),
            SocialRole::Peer,
        );
        manager.register_agent(agent).await.unwrap();
    }

    let agents: Vec<String> = (1..=50).map(|i| format!("agent-{}", i)).collect();
    let task = serde_json::json!({"action": "performance_test"});

    let start = std::time::Instant::now();
    let result = manager.coordinate_parallel(agents, task).await.unwrap();
    let duration = start.elapsed();

    assert!(result.success);
    assert!(duration.as_millis() < 1000, "Coordination should be fast");

    let metrics = manager.get_metrics().await;
    assert_eq!(metrics.peak_parallel_agents, 50);
}

/// Test error handling
#[tokio::test]
async fn test_error_handling() {
    let manager = SocialManager::new(CoordinationConfig::default());

    // Try to coordinate non-existent agents
    let agents = vec![
        "non-existent-1".to_string(),
        "non-existent-2".to_string(),
    ];
    let task = serde_json::json!({});

    // This should handle the error gracefully
    let result = manager.coordinate_parallel(agents, task).await;

    // The result should be ok even with non-existent agents
    // (since we're simulating)
    assert!(result.is_ok());
}

/// Test concurrent coordinations
#[tokio::test]
async fn test_concurrent_coordinations() {
    let manager = Arc::new(SocialManager::new(CoordinationConfig::default()));

    // Register agents
    for i in 1..=10 {
        let agent = SocialAgentMetadata::new(
            format!("agent-{}", i),
            SocialRole::Peer,
        );
        manager.register_agent(agent).await.unwrap();
    }

    // Spawn multiple concurrent coordinations
    let mut handles = Vec::new();

    for i in 0..5 {
        let manager_clone = manager.clone();
        let handle = tokio::spawn(async move {
            let agents = vec![
                format!("agent-{}", (i * 2 + 1)),
                format!("agent-{}", (i * 2 + 2)),
            ];
            let task = serde_json::json!({"concurrent": i});
            manager_clone.coordinate_parallel(agents, task).await
        });
        handles.push(handle);
    }

    // Wait for all to complete
    for handle in handles {
        let result = handle.await.unwrap();
        assert!(result.is_ok());
    }

    let metrics = manager.get_metrics().await;
    assert_eq!(metrics.total_coordinations, 5);
    assert_eq!(metrics.successful_coordinations, 5);
}

// Helper function for concurrent tests
use std::sync::Arc;
