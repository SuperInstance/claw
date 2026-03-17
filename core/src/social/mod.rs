//! Social Coordination Module
//!
//! This module provides multi-agent coordination patterns for the Claw system.
//! It enables agents to work together through various social patterns and coordination strategies.

pub mod patterns;
pub mod strategies;
pub mod manager;
pub mod message;
pub mod routing;
pub mod consensus;
pub mod relationships;

// Re-exports for convenience
pub use patterns::{
    SocialPattern, SocialRole, RelationshipType,
    MasterSlavePattern, CoWorkerPattern, PeerPattern,
    DelegatePattern, ObserverPattern
};
pub use strategies::{
    CoordinationStrategy, ExecutionStrategy, VotingStrategy,
    ParallelStrategy, SequentialStrategy, ConsensusStrategy,
    MajorityVoteStrategy, WeightedStrategy, CoordinationResult
};
pub use manager::SocialManager;
pub use message::{
    SocialMessage, MessageType, MessagePriority, MessageRouting,
    SocialMessageHandler, MessageBroker
};
pub use routing::{
    MessageRouter, RouterType, BroadcastRouter,
    DirectRouter, MulticastRouter
};
pub use consensus::{
    ConsensusEngine, ConsensusResult, VotingOutcome,
    ConsensusMetrics
};
pub use relationships::{
    Relationship, RelationshipManager, RelationshipState,
    SocialGraph, SocialMetrics
};

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use thiserror::Error;

/// Social coordination errors
#[derive(Error, Debug, Clone, Serialize, Deserialize)]
pub enum SocialError {
    #[error("Agent not found: {0}")]
    AgentNotFound(String),

    #[error("Relationship already exists: {0} -> {1}")]
    RelationshipExists(String, String),

    #[error("Relationship not found: {0} -> {1}")]
    RelationshipNotFound(String, String),

    #[error("Consensus not reached: {0}/{1} agreed", agreed, total)]
    ConsensusNotReached { agreed: usize, total: usize },

    #[error("Message routing failed: {0}")]
    RoutingFailed(String),

    #[error("Coordination timeout: {0}ms exceeded", timeout_ms)]
    Timeout { timeout_ms: u64 },

    #[error("Invalid coordination strategy: {0}")]
    InvalidStrategy(String),

    #[error("Deadlock detected in coordination")]
    DeadlockDetected,

    #[error("Resource limit exceeded: {0}")]
    ResourceLimitExceeded(String),
}

/// Result type for social operations
pub type SocialResult<T> = Result<T, SocialError>;

/// Agent metadata for social coordination
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SocialAgentMetadata {
    pub id: String,
    pub role: SocialRole,
    pub capabilities: Vec<String>,
    pub load_factor: f64,
    pub available: bool,
    pub last_seen: u64,
}

impl SocialAgentMetadata {
    pub fn new(id: String, role: SocialRole) -> Self {
        Self {
            id,
            role,
            capabilities: Vec::new(),
            load_factor: 0.0,
            available: true,
            last_seen: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs(),
        }
    }

    pub fn with_capabilities(mut self, capabilities: Vec<String>) -> Self {
        self.capabilities = capabilities;
        self
    }

    pub fn with_load_factor(mut self, load: f64) -> Self {
        self.load_factor = load;
        self
    }

    pub fn is_available(&self) -> bool {
        self.available && self.load_factor < 0.8
    }
}

/// Coordination configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CoordinationConfig {
    pub max_parallel_agents: usize,
    pub coordination_timeout_ms: u64,
    pub consensus_timeout_ms: u64,
    pub message_buffer_size: usize,
    pub enable_monitoring: bool,
    pub deadlock_detection: bool,
}

impl Default for CoordinationConfig {
    fn default() -> Self {
        Self {
            max_parallel_agents: 100,
            coordination_timeout_ms: 5000,
            consensus_timeout_ms: 10000,
            message_buffer_size: 1000,
            enable_monitoring: true,
            deadlock_detection: true,
        }
    }
}

/// Coordination metrics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CoordinationMetrics {
    pub total_coordinations: u64,
    pub successful_coordinations: u64,
    pub failed_coordinations: u64,
    pub avg_coordination_time_ms: f64,
    pub peak_parallel_agents: usize,
    pub consensus_reached: u64,
    pub consensus_failed: u64,
    pub messages_routed: u64,
    pub routing_failures: u64,
}

impl Default for CoordinationMetrics {
    fn default() -> Self {
        Self {
            total_coordinations: 0,
            successful_coordinations: 0,
            failed_coordinations: 0,
            avg_coordination_time_ms: 0.0,
            peak_parallel_agents: 0,
            consensus_reached: 0,
            consensus_failed: 0,
            messages_routed: 0,
            routing_failures: 0,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_social_agent_metadata() {
        let agent = SocialAgentMetadata::new(
            "agent-1".to_string(),
            SocialRole::Master
        )
        .with_capabilities(vec!["processing".to_string()])
        .with_load_factor(0.5);

        assert_eq!(agent.id, "agent-1");
        assert!(agent.is_available());
    }

    #[test]
    fn test_coordination_config() {
        let config = CoordinationConfig::default();
        assert_eq!(config.max_parallel_agents, 100);
        assert_eq!(config.coordination_timeout_ms, 5000);
    }

    #[test]
    fn test_social_error_display() {
        let err = SocialError::AgentNotFound("test-agent".to_string());
        assert!(err.to_string().contains("Agent not found"));
    }
}
