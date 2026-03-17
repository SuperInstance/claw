//! Core event loop for cellular agent processing
//!
//! This is the heart of the Cell-First Actor Model - a minimal ~500-line event loop
//! that handles trigger checking, event routing, agent processing, and social coordination.

use std::collections::HashMap;
use std::sync::Arc;
use std::time::Duration;
use tokio::sync::{mpsc, RwLock};
use tracing::{debug, error, info};

use crate::agent::{Agent, AgentConfig, MinimalAgent, ProcessingResult};
use crate::equipment::EquipmentManager;
use crate::error::{AgentError, Result};
use crate::messages::Message;

/// Core engine - manages agents and processes events
pub struct ClawCore {
    agents: Arc<RwLock<HashMap<String, Box<dyn Agent>>>>,
    equipment: Arc<RwLock<EquipmentManager>>,
    trigger_system: TriggerSystem,
    social: Arc<RwLock<SocialCoordinator>>,
    message_tx: mpsc::Sender<Message>,
    running: Arc<RwLock<bool>>,
}

/// Trigger system - checks for activation conditions
pub struct TriggerSystem {
    cell_triggers: HashMap<String, Vec<String>>, // cell_ref -> agent_ids
    periodic_triggers: HashMap<String, Duration>, // agent_id -> interval
}

/// Social coordinator - handles multi-agent patterns
pub struct SocialCoordinator {
    relationships: HashMap<String, Vec<SocialRelationship>>,
}

/// Social relationship between agents
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

impl ClawCore {
    /// Create a new core engine
    pub fn new() -> Self {
        let (message_tx, _) = mpsc::channel(1000);

        Self {
            agents: Arc::new(RwLock::new(HashMap::new())),
            equipment: Arc::new(RwLock::new(EquipmentManager::new())),
            trigger_system: TriggerSystem::new(),
            social: Arc::new(RwLock::new(SocialCoordinator::new())),
            message_tx,
            running: Arc::new(RwLock::new(false)),
        }
    }

    /// Start the core event loop
    pub async fn start(&self) -> Result<()> {
        let mut running = self.running.write().await;
        if *running {
            return Err(AgentError::InvalidState("Already running".to_string()));
        }
        *running = true;
        drop(running);

        info!("ClawCore starting");

        // Create a new channel for the core loop
        let (_tx, mut rx) = mpsc::channel(1000);

        // Spawn the core loop
        let agents = self.agents.clone();
        let equipment = self.equipment.clone();
        let social = self.social.clone();
        let running_flag = self.running.clone();

        // Note: In production, you'd want to integrate the existing message_tx
        // For now, we'll use a dedicated channel for the core loop

        tokio::spawn(async move {
            info!("Core loop started");
            let mut interval = tokio::time::interval(Duration::from_millis(100));

            loop {
                interval.tick().await;

                // Check if still running
                {
                    let running = running_flag.read().await;
                    if !*running {
                        info!("Core loop stopping");
                        break;
                    }
                }

                // 1. Check triggers
                let events = Self::check_triggers_internal(&agents).await;

                // 2. Process messages
                if let Ok(msg) = rx.try_recv() {
                    if let Err(e) = Self::handle_message_internal(
                        &agents,
                        &equipment,
                        &social,
                        msg
                    ).await {
                        error!("Error handling message: {}", e);
                    }
                }

                // 3. Process trigger events
                for event in events {
                    if let Err(e) = Self::handle_trigger_internal(
                        &agents,
                        &equipment,
                        &social,
                        event
                    ).await {
                        error!("Error handling trigger: {}", e);
                    }
                }

                // 4. Cleanup
                Self::cleanup_internal(&agents).await;
            }

            info!("Core loop stopped");
        });

        Ok(())
    }

    /// Stop the core event loop
    pub async fn stop(&self) -> Result<()> {
        let mut running = self.running.write().await;
        *running = false;
        info!("ClawCore stopping");
        Ok(())
    }

    /// Add an agent
    pub async fn add_agent(&self, config: AgentConfig) -> Result<()> {
        let agent = Box::new(MinimalAgent::new(config)) as Box<dyn Agent>;

        let mut agents = self.agents.write().await;
        let id = agent.id().to_string();

        if agents.contains_key(&id) {
            return Err(AgentError::AgentAlreadyExists(id));
        }

        agents.insert(id.clone(), agent);
        info!("Added agent: {}", id);

        Ok(())
    }

    /// Remove an agent
    pub async fn remove_agent(&self, id: &str) -> Result<()> {
        let mut agents = self.agents.write().await;

        if !agents.contains_key(id) {
            return Err(AgentError::AgentNotFound(id.to_string()));
        }

        agents.remove(id);
        info!("Removed agent: {}", id);

        Ok(())
    }

    /// Send a message to an agent
    pub async fn send_message(&self, message: Message) -> Result<()> {
        self.message_tx.send(message)
            .await
            .map_err(|e| AgentError::ProcessingError(e.to_string()))
    }

    /// Register a cell trigger
    pub async fn register_cell_trigger(&mut self, cell_ref: String, agent_id: String) -> Result<()> {
        self.trigger_system.register_cell_trigger(cell_ref, agent_id);
        Ok(())
    }

    /// Register a periodic trigger
    pub async fn register_periodic_trigger(&mut self, agent_id: String, interval_ms: u64) -> Result<()> {
        self.trigger_system.register_periodic_trigger(agent_id, interval_ms);
        Ok(())
    }

    /// Add a social relationship
    pub async fn add_relationship(&self, from: String, to: String, relation: SocialRelation) -> Result<()> {
        let mut social = self.social.write().await;
        social.add_relationship(from, to, relation);
        Ok(())
    }

    /// Get the number of active agents
    pub async fn agent_count(&self) -> usize {
        self.agents.read().await.len()
    }

    /// Check if an agent exists
    pub async fn has_agent(&self, id: &str) -> bool {
        self.agents.read().await.contains_key(id)
    }

    // ========== Internal Core Loop Methods ==========

    async fn check_triggers_internal(_agents: &Arc<RwLock<HashMap<String, Box<dyn Agent>>>>) -> Vec<Message> {
        // In a real implementation, this would check cell changes, timers, etc.
        // For now, return empty vec
        Vec::new()
    }

    async fn handle_message_internal(
        agents: &Arc<RwLock<HashMap<String, Box<dyn Agent>>>>,
        equipment: &Arc<RwLock<EquipmentManager>>,
        social: &Arc<RwLock<SocialCoordinator>>,
        message: Message,
    ) -> Result<()> {
        let agent_id = message.agent_id()
            .ok_or_else(|| AgentError::UnsupportedMessage("No agent_id".to_string()))?;

        let mut agents_guard = agents.write().await;
        let agent = agents_guard.get_mut(agent_id)
            .ok_or_else(|| AgentError::AgentNotFound(agent_id.to_string()))?;

        debug!("Processing message for agent: {}", agent_id);

        // Process the message
        let result = agent.process(message.clone()).await?;

        // Extract muscle memory
        let equipment_guard = equipment.write().await;
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

    async fn handle_trigger_internal(
        agents: &Arc<RwLock<HashMap<String, Box<dyn Agent>>>>,
        equipment: &Arc<RwLock<EquipmentManager>>,
        social: &Arc<RwLock<SocialCoordinator>>,
        message: Message,
    ) -> Result<()> {
        Self::handle_message_internal(agents, equipment, social, message).await
    }

    async fn cleanup_internal(agents: &Arc<RwLock<HashMap<String, Box<dyn Agent>>>>) {
        let mut agents_guard = agents.write().await;

        // Remove stopped agents
        let to_remove: Vec<String> = agents_guard.iter()
            .filter(|(_, agent)| {
                matches!(agent.status(), crate::agent::AgentStatus::Stopped)
            })
            .map(|(id, _)| id.clone())
            .collect();

        for id in to_remove {
            debug!("Cleaning up stopped agent: {}", id);
            agents_guard.remove(&id);
        }
    }
}

impl Default for ClawCore {
    fn default() -> Self {
        Self::new()
    }
}

impl TriggerSystem {
    pub fn new() -> Self {
        Self {
            cell_triggers: HashMap::new(),
            periodic_triggers: HashMap::new(),
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
            relationships: HashMap::new(),
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
            for relation in relations {
                debug!("Coordinating: {} -> {} ({:?})", agent_id, relation.to_agent, relation.relation_type);
                // In a real implementation, this would send messages to related agents
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
    async fn test_core_creation() {
        let core = ClawCore::new();
        assert!(!*core.running.read().await);
    }

    #[tokio::test]
    async fn test_add_agent() {
        let core = ClawCore::new();

        let config = AgentConfig {
            id: "test-agent".to_string(),
            cell_ref: "A1".to_string(),
            model: "test-model".to_string(),
            equipment: vec![],
            config: std::collections::HashMap::new(),
        };

        core.add_agent(config).await.unwrap();

        let agents = core.agents.read().await;
        assert!(agents.contains_key("test-agent"));
    }

    #[tokio::test]
    async fn test_remove_agent() {
        let core = ClawCore::new();

        let config = AgentConfig {
            id: "test-agent".to_string(),
            cell_ref: "A1".to_string(),
            model: "test-model".to_string(),
            equipment: vec![],
            config: std::collections::HashMap::new(),
        };

        core.add_agent(config).await.unwrap();
        core.remove_agent("test-agent").await.unwrap();

        let agents = core.agents.read().await;
        assert!(!agents.contains_key("test-agent"));
    }

    #[tokio::test]
    async fn test_add_relationship() {
        let core = ClawCore::new();
        core.add_relationship(
            "agent-1".to_string(),
            "agent-2".to_string(),
            SocialRelation::CoWorker,
        ).await.unwrap();

        let social = core.social.read().await;
        assert!(social.relationships.contains_key("agent-1"));
    }
}
