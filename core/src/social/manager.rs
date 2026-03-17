//! Social Manager for Multi-Agent Coordination
//!
//! This module provides the main social manager that orchestrates multi-agent coordination.

use crate::social::{
    CoordinationConfig, CoordinationMetrics, CoordinationResult,
    Relationship, RelationshipManager, SocialAgentMetadata, SocialError, SocialMessage,
    SocialPattern, SocialResult,
};
use crate::social::strategies::CoordinationStrategy;
use crate::social::message::MessageBroker;
use crate::social::patterns::{
    CoWorkerPattern, DelegatePattern, MasterSlavePattern, ObserverPattern, PeerPattern,
};
use crate::social::strategies::{
    ConsensusStrategy, MajorityVoteStrategy, ParallelStrategy, SequentialStrategy,
    WeightedStrategy,
};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use std::time::Instant;
use tokio::sync::RwLock;

/// Social manager for coordinating multi-agent interactions
pub struct SocialManager {
    config: CoordinationConfig,
    metrics: Arc<RwLock<CoordinationMetrics>>,
    relationship_manager: Arc<RwLock<RelationshipManager>>,
    message_broker: Arc<MessageBroker>,
    active_coordinations: Arc<RwLock<HashMap<String, ActiveCoordination>>>,
}

/// Active coordination state
#[derive(Debug, Clone, Serialize, Deserialize)]
struct ActiveCoordination {
    id: String,
    agents: Vec<String>,
    strategy: String,
    started_at: u64,
    status: String,
}

impl SocialManager {
    pub fn new(config: CoordinationConfig) -> Self {
        Self {
            config: config.clone(),
            metrics: Arc::new(RwLock::new(CoordinationMetrics::default())),
            relationship_manager: Arc::new(RwLock::new(RelationshipManager::new())),
            message_broker: Arc::new(MessageBroker::new()),
            active_coordinations: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    /// Register an agent with the social manager
    pub async fn register_agent(&self, agent: SocialAgentMetadata) -> SocialResult<()> {
        let mut manager = self.relationship_manager.write().await;
        manager.add_agent(agent)?;
        Ok(())
    }

    /// Unregister an agent
    pub async fn unregister_agent(&self, agent_id: &str) -> SocialResult<()> {
        let mut manager = self.relationship_manager.write().await;
        manager.remove_agent(agent_id)?;
        Ok(())
    }

    /// Create a master-slave relationship
    pub async fn create_master_slave(
        &self,
        master_id: String,
        slave_ids: Vec<String>,
    ) -> SocialResult<String> {
        let mut pattern = MasterSlavePattern::new();
        let manager = self.relationship_manager.read().await;

        // Add master
        if let Some(master) = manager.get_agent(&master_id) {
            let mut master_meta = master.clone();
            master_meta.role = crate::social::SocialRole::Master;
            pattern.add_agent(master_meta).await?;
        } else {
            return Err(SocialError::AgentNotFound(master_id));
        }

        // Add slaves
        for slave_id in slave_ids {
            if let Some(slave) = manager.get_agent(&slave_id) {
                let mut slave_meta = slave.clone();
                slave_meta.role = crate::social::SocialRole::Slave;
                pattern.add_agent(slave_meta).await?;
            } else {
                return Err(SocialError::AgentNotFound(slave_id));
            }
        }

        // Store relationship
        let relationship_id = uuid::Uuid::new_v4().to_string();
        let mut manager_write = self.relationship_manager.write().await;
        manager_write.add_relationship(Relationship {
            id: relationship_id.clone(),
            relationship_type: crate::social::RelationshipType::MasterSlave,
            participants: vec![master_id],
            state: crate::social::RelationshipState::Active,
            metadata: HashMap::new(),
        })?;

        Ok(relationship_id)
    }

    /// Create a co-worker relationship
    pub async fn create_co_worker(
        &self,
        worker_ids: Vec<String>,
    ) -> SocialResult<String> {
        let mut pattern = CoWorkerPattern::new();
        let manager = self.relationship_manager.read().await;

        // Add workers
        for worker_id in worker_ids {
            if let Some(worker) = manager.get_agent(&worker_id) {
                let mut worker_meta = worker.clone();
                worker_meta.role = crate::social::SocialRole::CoWorker;
                pattern.add_agent(worker_meta).await?;
            } else {
                return Err(SocialError::AgentNotFound(worker_id));
            }
        }

        // Store relationship
        let relationship_id = uuid::Uuid::new_v4().to_string();
        Ok(relationship_id)
    }

    /// Execute coordination with strategy
    pub async fn coordinate(
        &self,
        agents: Vec<String>,
        strategy: Box<dyn CoordinationStrategy>,
        task: serde_json::Value,
    ) -> SocialResult<CoordinationResult> {
        let start = Instant::now();
        let coordination_id = uuid::Uuid::new_v4().to_string();

        // Update metrics
        {
            let mut metrics = self.metrics.write().await;
            metrics.total_coordinations += 1;

            if agents.len() > metrics.peak_parallel_agents {
                metrics.peak_parallel_agents = agents.len();
            }
        }

        // Track active coordination
        {
            let mut active = self.active_coordinations.write().await;
            active.insert(
                coordination_id.clone(),
                ActiveCoordination {
                    id: coordination_id.clone(),
                    agents: agents.clone(),
                    strategy: format!("{:?}", strategy.execution_strategy()),
                    started_at: std::time::SystemTime::now()
                        .duration_since(std::time::UNIX_EPOCH)
                        .unwrap()
                        .as_secs(),
                    status: "running".to_string(),
                },
            );
        }

        // Execute coordination
        let result = strategy.execute(agents.clone(), task).await;

        // Update coordination state
        {
            let mut active = self.active_coordinations.write().await;
            if let Some(coordination) = active.get_mut(&coordination_id) {
                coordination.status = if result.is_ok() {
                    "completed".to_string()
                } else {
                    "failed".to_string()
                };
            }
        }

        // Update metrics
        {
            let mut metrics = self.metrics.write().await;
            let execution_time = start.elapsed().as_millis() as f64;

            match &result {
                Ok(r) => {
                    metrics.successful_coordinations += 1;
                    metrics.messages_routed += r.agent_results.len() as u64;

                    if r.consensus_outcome.is_some() {
                        if r.consensus_outcome.as_ref().unwrap().agreed {
                            metrics.consensus_reached += 1;
                        } else {
                            metrics.consensus_failed += 1;
                        }
                    }
                }
                Err(_) => {
                    metrics.failed_coordinations += 1;
                    metrics.routing_failures += 1;
                }
            }

            // Update average coordination time
            let total = metrics.total_coordinations as f64;
            let avg = metrics.avg_coordination_time_ms;
            metrics.avg_coordination_time_ms = (avg * (total - 1.0) + execution_time) / total;
        }

        result
    }

    /// Send message between agents
    pub async fn send_message(&self, message: SocialMessage) -> SocialResult<()> {
        self.message_broker.send_message(message).await
    }

    /// Get coordination metrics
    pub async fn get_metrics(&self) -> CoordinationMetrics {
        self.metrics.read().await.clone()
    }

    /// Get all relationships
    pub async fn get_relationships(&self) -> Vec<Relationship> {
        let manager = self.relationship_manager.read().await;
        manager.get_all_relationships()
    }

    /// Get agent relationships
    pub async fn get_agent_relationships(&self, agent_id: &str) -> Vec<Relationship> {
        let manager = self.relationship_manager.read().await;
        manager.get_agent_relationships(agent_id)
    }

    /// Health check
    pub async fn health_check(&self) -> SocialResult<bool> {
        let metrics = self.metrics.read().await;

        // Check if system is healthy
        let failure_rate = if metrics.total_coordinations > 0 {
            metrics.failed_coordinations as f64 / metrics.total_coordinations as f64
        } else {
            0.0
        };

        Ok(failure_rate < 0.5) // Less than 50% failure rate
    }

    /// Get active coordinations
    pub async fn get_active_coordinations(&self) -> Vec<ActiveCoordination> {
        let active = self.active_coordinations.read().await;
        active.values().cloned().collect()
    }

    /// Cancel an active coordination
    pub async fn cancel_coordination(&self, coordination_id: &str) -> SocialResult<()> {
        let mut active = self.active_coordinations.write().await;
        active
            .remove(coordination_id)
            .ok_or_else(|| SocialError::AgentNotFound(coordination_id.to_string()))?;
        Ok(())
    }

    /// Create parallel coordination
    pub async fn coordinate_parallel(
        &self,
        agents: Vec<String>,
        task: serde_json::Value,
    ) -> SocialResult<CoordinationResult> {
        let strategy = ParallelStrategy::new().with_timeout(self.config.coordination_timeout_ms);
        self.coordinate(agents, Box::new(strategy), task).await
    }

    /// Create sequential coordination
    pub async fn coordinate_sequential(
        &self,
        agents: Vec<String>,
        task: serde_json::Value,
    ) -> SocialResult<CoordinationResult> {
        let strategy = SequentialStrategy::new().with_timeout(self.config.coordination_timeout_ms);
        self.coordinate(agents, Box::new(strategy), task).await
    }

    /// Create consensus coordination
    pub async fn coordinate_consensus(
        &self,
        agents: Vec<String>,
        task: serde_json::Value,
    ) -> SocialResult<CoordinationResult> {
        let strategy = ConsensusStrategy::new().with_timeout(self.config.consensus_timeout_ms);
        self.coordinate(agents, Box::new(strategy), task).await
    }

    /// Create majority vote coordination
    pub async fn coordinate_majority_vote(
        &self,
        agents: Vec<String>,
        task: serde_json::Value,
    ) -> SocialResult<CoordinationResult> {
        let strategy = MajorityVoteStrategy::new().with_timeout(self.config.coordination_timeout_ms);
        self.coordinate(agents, Box::new(strategy), task).await
    }

    /// Create weighted coordination
    pub async fn coordinate_weighted(
        &self,
        agents: Vec<String>,
        task: serde_json::Value,
    ) -> SocialResult<CoordinationResult> {
        let strategy = WeightedStrategy::new().with_timeout(self.config.coordination_timeout_ms);
        self.coordinate(agents, Box::new(strategy), task).await
    }

    /// Reset metrics
    pub async fn reset_metrics(&self) {
        let mut metrics = self.metrics.write().await;
        *metrics = CoordinationMetrics::default();
    }
}

impl Default for SocialManager {
    fn default() -> Self {
        Self::new(CoordinationConfig::default())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::social::SocialRole;

    #[tokio::test]
    async fn test_social_manager_creation() {
        let manager = SocialManager::new(CoordinationConfig::default());
        assert!(manager.health_check().await.unwrap());
    }

    #[tokio::test]
    async fn test_agent_registration() {
        let manager = SocialManager::new(CoordinationConfig::default());

        let agent = SocialAgentMetadata::new("agent-1".to_string(), SocialRole::Peer);
        manager.register_agent(agent).await.unwrap();

        let metrics = manager.get_metrics().await;
        assert_eq!(metrics.total_coordinations, 0);
    }

    #[tokio::test]
    async fn test_parallel_coordination() {
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
    }

    #[tokio::test]
    async fn test_consensus_coordination() {
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

    #[tokio::test]
    async fn test_metrics_tracking() {
        let manager = SocialManager::new(CoordinationConfig::default());

        // Register agents
        for i in 1..=2 {
            let agent = SocialAgentMetadata::new(
                format!("agent-{}", i),
                SocialRole::Peer,
            );
            manager.register_agent(agent).await.unwrap();
        }

        let agents = vec![
            "agent-1".to_string(),
            "agent-2".to_string(),
        ];
        let task = serde_json::json!({"action": "test"});

        manager.coordinate_parallel(agents.clone(), task.clone()).await.unwrap();

        let metrics = manager.get_metrics().await;
        assert_eq!(metrics.total_coordinations, 1);
        assert_eq!(metrics.successful_coordinations, 1);
    }
}
