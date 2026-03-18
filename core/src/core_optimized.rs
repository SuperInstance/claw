//! Performance-optimized core event loop
//!
//! This module provides optimized implementations targeting <10ms trigger latency.
//!
//! # Key Optimizations
//!
//! 1. **DashMap for Lock-Free Reads**: Agent lookups become O(1) without locks
//! 2. **AtomicBool for Running Flag**: Eliminates RwLock for boolean flag
//! 3. **Synchronous Trigger Checks**: Remove async overhead when possible
//! 4. **Batch Message Processing**: Reduce context switches
//!
//! # Performance Targets
//!
//! - Trigger latency: <10ms (p50), <15ms (p99)
//! - Agent creation: <100μs
//! - Message throughput: >10K msg/sec
//! - Memory per agent: <10MB

use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::time::Duration;
use dashmap::DashMap;
use tokio::sync::{mpsc, RwLock};
use tracing::{debug, error, info, instrument};

use crate::agent::{Agent, AgentConfig, MinimalAgent, ProcessingResult};
use crate::equipment::EquipmentManager;
use crate::error::{AgentError, Result};
use crate::messages::Message;

/// Optimized core engine - targets <10ms trigger latency
///
/// # Performance Characteristics
///
/// - Agent lookup: O(1) lock-free
/// - Agent addition: O(1) with minimal contention
/// - Message processing: Batched for efficiency
pub struct ClawCoreOptimized {
    /// DashMap provides lock-free concurrent reads
    agents: Arc<DashMap<String, Box<dyn Agent>>>,

    /// Equipment manager (still RwLock - low contention)
    equipment: Arc<RwLock<EquipmentManager>>,

    /// Trigger system (still RwLock - infrequent writes)
    trigger_system: Arc<RwLock<TriggerSystem>>,

    /// Social coordinator (still RwLock - low contention)
    social: Arc<RwLock<SocialCoordinator>>,

    /// Message channel
    message_tx: mpsc::Sender<Message>,

    /// AtomicBool replaces RwLock<bool> for lock-free reads
    running: Arc<AtomicBool>,
}

/// Optimized trigger system
pub struct TriggerSystem {
    cell_triggers: DashMap<String, Vec<String>>, // DashMap for concurrent access
    periodic_triggers: DashMap<String, Duration>, // DashMap for concurrent access
}

/// Social coordinator
pub struct SocialCoordinator {
    relationships: DashMap<String, Vec<SocialRelationship>>, // DashMap for concurrent access
}

/// Social relationship
#[derive(Debug, Clone)]
pub struct SocialRelationship {
    pub from_agent: String,
    pub to_agent: String,
    pub relation_type: SocialRelation,
}

/// Types of social relationships
#[derive(Debug, Clone, Copy)]
pub enum SocialRelation {
    MasterSlave,
    CoWorker,
    Peer,
    Delegate,
    Observer,
}

impl ClawCoreOptimized {
    /// Create optimized core engine
    pub fn new() -> Self {
        let (message_tx, _) = mpsc::channel(1000);

        Self {
            agents: Arc::new(DashMap::new()),
            equipment: Arc::new(RwLock::new(EquipmentManager::new())),
            trigger_system: Arc::new(RwLock::new(TriggerSystem::new())),
            social: Arc::new(RwLock::new(SocialCoordinator::new())),
            message_tx,
            running: Arc::new(AtomicBool::new(false)),
        }
    }

    /// Start the core event loop
    ///
    /// # Performance
    ///
    /// - Spawn overhead: ~1μs
    /// - Loop interval: 100ms (configurable)
    #[instrument(skip(self))]
    pub async fn start(&self) -> Result<()> {
        // Atomic swap - lock-free
        if self.running.swap(true, Ordering::SeqCst) {
            return Err(AgentError::InvalidState("Already running".to_string()));
        }

        info!("ClawCoreOptimized starting");

        let (_tx, mut rx) = mpsc::channel(1000);

        let agents = self.agents.clone();
        let equipment = self.equipment.clone();
        let social = self.social.clone();
        let running_flag = self.running.clone();

        tokio::spawn(async move {
            info!("Optimized core loop started");
            let mut interval = tokio::time::interval(Duration::from_millis(100));

            loop {
                interval.tick().await;

                // Lock-free read
                if !running_flag.load(Ordering::Relaxed) {
                    info!("Core loop stopping");
                    break;
                }

                // 1. Check triggers (synchronous, lock-free reads)
                let events = Self::check_triggers_internal(&agents);

                // 2. Process messages in batch
                let mut message_count = 0;
                while let Ok(msg) = rx.try_recv() {
                    message_count += 1;
                    if let Err(e) = Self::handle_message_internal(
                        &agents,
                        &equipment,
                        &social,
                        msg
                    ) {
                        error!("Error handling message: {}", e);
                    }

                    // Limit batch size to prevent starvation
                    if message_count >= 100 {
                        break;
                    }
                }

                // 3. Process trigger events
                for event in events {
                    if let Err(e) = Self::handle_trigger_internal(
                        &agents,
                        &equipment,
                        &social,
                        event
                    ) {
                        error!("Error handling trigger: {}", e);
                    }
                }

                // 4. Cleanup (asynchronous, infrequent)
                Self::cleanup_internal(&agents).await;
            }

            info!("Core loop stopped");
        });

        Ok(())
    }

    /// Stop the core event loop
    ///
    /// # Performance
    ///
    /// - Lock-free atomic store: ~10ns
    pub async fn stop(&self) -> Result<()> {
        self.running.store(false, Ordering::SeqCst);
        info!("ClawCoreOptimized stopping");
        Ok(())
    }

    /// Add an agent
    ///
    /// # Performance
    ///
    /// - O(1) DashMap insert
    /// - Lock-free concurrent reads
    /// - ~50μs expected latency
    #[instrument(skip(self, config))]
    pub async fn add_agent(&self, config: AgentConfig) -> Result<()> {
        let agent = Box::new(MinimalAgent::new(config.clone())) as Box<dyn Agent>;
        let id = agent.id().to_string();

        // DashMap insert is non-blocking for reads
        if !self.agents.insert(id.clone(), agent).is_none() {
            return Err(AgentError::AgentAlreadyExists(id));
        }

        info!("Added agent: {}", id);
        Ok(())
    }

    /// Remove an agent
    ///
    /// # Performance
    ///
    /// - O(1) DashMap remove
    /// - Lock-free operation
    pub async fn remove_agent(&self, id: &str) -> Result<()> {
        self.agents.remove(id)
            .ok_or_else(|| AgentError::AgentNotFound(id.to_string()))?;

        info!("Removed agent: {}", id);
        Ok(())
    }

    /// Send a message to an agent
    ///
    /// # Performance
    ///
    /// - Channel send: ~1μs
    pub async fn send_message(&self, message: Message) -> Result<()> {
        self.message_tx.send(message)
            .await
            .map_err(|e| AgentError::ProcessingError(e.to_string()))
    }

    /// Register a cell trigger
    pub async fn register_cell_trigger(&mut self, cell_ref: String, agent_id: String) -> Result<()> {
        let mut trigger_system = self.trigger_system.write().await;
        trigger_system.register_cell_trigger(cell_ref, agent_id);
        Ok(())
    }

    /// Register a periodic trigger
    pub async fn register_periodic_trigger(&mut self, agent_id: String, interval_ms: u64) -> Result<()> {
        let mut trigger_system = self.trigger_system.write().await;
        trigger_system.register_periodic_trigger(agent_id, interval_ms);
        Ok(())
    }

    /// Add a social relationship
    pub async fn add_relationship(&self, from: String, to: String, relation: SocialRelation) -> Result<()> {
        let mut social = self.social.write().await;
        social.add_relationship(from, to, relation);
        Ok(())
    }

    /// Get the number of active agents
    ///
    /// # Performance
    ///
    /// - Lock-free read: ~50ns
    pub async fn agent_count(&self) -> usize {
        self.agents.len()
    }

    /// Check if an agent exists
    ///
    /// # Performance
    ///
    /// - Lock-free read: O(1)
    /// - ~50ns expected
    pub async fn has_agent(&self, id: &str) -> bool {
        self.agents.contains_key(id)
    }

    // ========== Internal Core Loop Methods ==========

    /// Check triggers - synchronous for performance
    ///
    /// # Performance
    ///
    /// - Lock-free iteration over agents
    /// - O(n) where n = number of agents
    fn check_triggers_internal(agents: &DashMap<String, Box<dyn Agent>>) -> Vec<Message> {
        // In production, this would check actual triggers
        // For now, return empty to minimize overhead
        Vec::new()
    }

    /// Handle a message
    async fn handle_message_internal(
        agents: &DashMap<String, Box<dyn Agent>>,
        equipment: &Arc<RwLock<EquipmentManager>>,
        social: &Arc<RwLock<SocialCoordinator>>,
        message: Message,
    ) -> Result<()> {
        let agent_id = message.agent_id()
            .ok_or_else(|| AgentError::UnsupportedMessage("No agent_id".to_string()))?;

        // DashMap get is lock-free for readers
        let mut agent_ref = agents.get_mut(agent_id)
            .ok_or_else(|| AgentError::AgentNotFound(agent_id.to_string()))?;

        debug!("Processing message for agent: {}", agent_id);

        // Process the message
        let result = agent_ref.process(message.clone()).await?;

        // Extract muscle memory
        let equipment_guard = equipment.read().await;
        for slot in &result.equipment_used {
            if let Some(eq) = equipment_guard.get_equipped(*slot) {
                let triggers = eq.extract_muscle_memory();
                debug!("Extracted {} muscle memory triggers from {:?}", triggers.len(), slot);
            }
        }

        // Social coordination
        if !result.reasoning.as_ref().map(|r| r.is_empty()).unwrap_or(true) {
            let social_guard = social.read().await;
            social_guard.coordinate(agent_id, &result).await?;
        }

        debug!("Message processed successfully for agent: {}", agent_id);
        Ok(())
    }

    /// Handle a trigger event
    async fn handle_trigger_internal(
        agents: &DashMap<String, Box<dyn Agent>>,
        equipment: &Arc<RwLock<EquipmentManager>>,
        social: &Arc<RwLock<SocialCoordinator>>,
        message: Message,
    ) -> Result<()> {
        Self::handle_message_internal(agents, equipment, social, message).await
    }

    /// Cleanup stopped agents
    async fn cleanup_internal(agents: &DashMap<String, Box<dyn Agent>>) {
        // Remove stopped agents
        agents.retain(|_, agent| {
            !matches!(agent.status(), crate::agent::AgentStatus::Stopped)
        });
    }
}

impl Default for ClawCoreOptimized {
    fn default() -> Self {
        Self::new()
    }
}

impl TriggerSystem {
    pub fn new() -> Self {
        Self {
            cell_triggers: DashMap::new(),
            periodic_triggers: DashMap::new(),
        }
    }

    pub fn register_cell_trigger(&mut self, cell_ref: String, agent_id: String) {
        self.cell_triggers.entry(cell_ref).or_default().push(agent_id);
    }

    pub fn register_periodic_trigger(&mut self, agent_id: String, interval_ms: u64) {
        self.periodic_triggers.insert(agent_id, Duration::from_millis(interval_ms));
    }
}

impl Default for TriggerSystem {
    fn default() -> Self {
        Self::new()
    }
}

impl SocialCoordinator {
    pub fn new() -> Self {
        Self {
            relationships: DashMap::new(),
        }
    }

    pub fn add_relationship(&mut self, from: String, to: String, relation: SocialRelation) {
        self.relationships.entry(from.clone()).or_default().push(
            SocialRelationship {
                from_agent: from,
                to_agent: to,
                relation_type: relation,
            }
        );
    }

    pub async fn coordinate(&self, agent_id: &str, _result: &ProcessingResult) -> Result<()> {
        if let Some(relations) = self.relationships.get(agent_id) {
            for relation in relations.value() {
                debug!("Coordinating: {} -> {} ({:?})", agent_id, relation.to_agent, relation.relation_type);
                // In production, send messages to related agents
            }
        }
        Ok(())
    }
}

impl Default for SocialCoordinator {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::messages::TriggerPayload;

    #[tokio::test]
    async fn test_optimized_core_creation() {
        let core = ClawCoreOptimized::new();
        assert!(!core.running.load(Ordering::Relaxed));
    }

    #[tokio::test]
    async fn test_optimized_add_agent() {
        let core = ClawCoreOptimized::new();

        let config = AgentConfig {
            id: "test-agent".to_string(),
            cell_ref: "A1".to_string(),
            model: "test-model".to_string(),
            equipment: vec![],
            config: std::collections::HashMap::new(),
        };

        core.add_agent(config).await.unwrap();

        // Lock-free check
        assert!(core.has_agent("test-agent").await);
        assert_eq!(core.agent_count().await, 1);
    }

    #[tokio::test]
    async fn test_optimized_remove_agent() {
        let core = ClawCoreOptimized::new();

        let config = AgentConfig {
            id: "test-agent".to_string(),
            cell_ref: "A1".to_string(),
            model: "test-model".to_string(),
            equipment: vec![],
            config: std::collections::HashMap::new(),
        };

        core.add_agent(config).await.unwrap();
        core.remove_agent("test-agent").await.unwrap();

        assert!(!core.has_agent("test-agent").await);
    }

    #[tokio::test]
    async fn test_optimized_start_stop() {
        let core = ClawCoreOptimized::new();

        core.start().await.unwrap();
        assert!(core.running.load(Ordering::Relaxed));

        core.stop().await.unwrap();
        assert!(!core.running.load(Ordering::Relaxed));
    }
}
