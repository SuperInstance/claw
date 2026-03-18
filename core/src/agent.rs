//! Core Agent trait and implementations - MVP Version
//!
//! Agents are the fundamental unit of computation in the Cell-First Actor Model.
//! MVP version provides basic agent lifecycle and state management.

use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

use crate::messages::{Message, QueryType, TriggerPayload};
use crate::equipment::{Equipment, EquipmentSlot};
use crate::error::{AgentError, Result};

/// Agent status
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, utoipa::ToSchema)]
pub enum AgentStatus {
    /// Agent is idle
    Idle,
    /// Agent is processing
    Processing,
    /// Agent encountered an error
    Error(String),
    /// Agent is stopped
    Stopped,
}

/// Agent configuration
#[derive(Debug, Clone, Serialize, Deserialize, utoipa::ToSchema)]
pub struct AgentConfig {
    #[serde(default)]
    pub id: String,
    pub cell_ref: String,
    pub model: String,
    #[serde(default)]
    pub config: HashMap<String, serde_json::Value>,
}

/// Agent state - simplified for MVP
#[derive(Debug, Clone, Serialize, Deserialize, utoipa::ToSchema)]
pub struct AgentState {
    pub status: AgentStatus,
    pub memory: HashMap<String, serde_json::Value>,
    pub has_memory_equipment: bool,
}

impl Default for AgentState {
    fn default() -> Self {
        Self {
            status: AgentStatus::Idle,
            memory: HashMap::new(),
            has_memory_equipment: false,
        }
    }
}

/// Core Agent trait
#[async_trait]
pub trait Agent: Send + Sync {
    /// Get agent ID
    fn id(&self) -> &str;

    /// Get agent status
    fn status(&self) -> &AgentStatus;

    /// Get agent state
    fn state(&self) -> AgentState;

    /// Process a message
    async fn process(&mut self, message: Message) -> Result<ProcessingResult>;

    /// Query agent
    async fn query(&self, query_type: QueryType) -> Result<serde_json::Value>;

    /// Equip memory equipment
    async fn equip_memory(&mut self, equipment: Box<dyn Equipment>) -> Result<()>;

    /// Stop the agent
    async fn stop(&mut self) -> Result<()>;
}

/// Result of agent processing
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProcessingResult {
    pub agent_id: String,
    pub message_id: String,
    pub success: bool,
    pub output: Option<String>,
    pub processing_time_ms: u64,
}

/// Minimal Agent implementation - MVP version
pub struct MinimalAgent {
    id: String,
    cell_ref: String,
    model: String,
    config: HashMap<String, serde_json::Value>,
    state: AgentState,
    memory_equipment: Option<Box<dyn Equipment>>,
}

impl MinimalAgent {
    /// Create a new minimal agent
    pub fn new(config: AgentConfig) -> Self {
        Self {
            id: config.id.clone(),
            cell_ref: config.cell_ref.clone(),
            model: config.model.clone(),
            config: config.config,
            state: AgentState::default(),
            memory_equipment: None,
        }
    }

    /// Get agent config
    pub fn config(&self) -> &AgentConfig {
        // Recreate config for reference
        &AgentConfig {
            id: self.id.clone(),
            cell_ref: self.cell_ref.clone(),
            model: self.model.clone(),
            config: self.config.clone(),
        }
    }

    /// Get cell reference
    pub fn cell_ref(&self) -> &str {
        &self.cell_ref
    }

    /// Get model
    pub fn model(&self) -> &str {
        &self.model
    }
}

#[async_trait]
impl Agent for MinimalAgent {
    fn id(&self) -> &str {
        &self.id
    }

    fn status(&self) -> &AgentStatus {
        &self.state.status
    }

    fn state(&self) -> AgentState {
        self.state.clone()
    }

    async fn process(&mut self, message: Message) -> Result<ProcessingResult> {
        let start = std::time::Instant::now();

        // Update status
        self.state.status = AgentStatus::Processing;

        // Process the message based on type
        let result = match &message {
            Message::Trigger { payload } => {
                self.process_trigger(payload).await
            }
            Message::Cancel => {
                self.state.status = AgentStatus::Stopped;
                Ok(ProcessingResult {
                    agent_id: self.id().to_string(),
                    message_id: message.id().to_string(),
                    success: true,
                    output: Some("Agent stopped".to_string()),
                    processing_time_ms: start.elapsed().as_millis() as u64,
                })
            }
            Message::Query { query_type } => {
                let result = self.query(query_type.clone()).await?;
                Ok(ProcessingResult {
                    agent_id: self.id().to_string(),
                    message_id: message.id().to_string(),
                    success: true,
                    output: Some(serde_json::to_string(&result)?),
                    processing_time_ms: start.elapsed().as_millis() as u64,
                })
            }
            _ => Err(AgentError::UnsupportedMessage(message.id().to_string())),
        };

        // Reset status
        if self.state.status != AgentStatus::Stopped {
            self.state.status = AgentStatus::Idle;
        }

        result
    }

    async fn query(&self, query_type: QueryType) -> Result<serde_json::Value> {
        match query_type {
            QueryType::State => Ok(serde_json::to_value(&self.state)?),
            QueryType::Reasoning => Ok(serde_json::json!({"reasoning": "not_implemented_in_mvp"})),
            QueryType::Learning => Ok(serde_json::json!({"learning": "not_implemented_in_mvp"})),
            QueryType::Equipment => Ok(serde_json::json!({"memory_equipped": self.state.has_memory_equipment})),
            QueryType::Social => Ok(serde_json::json!({"social": "not_implemented_in_mvp"})),
        }
    }

    async fn equip_memory(&mut self, equipment: Box<dyn Equipment>) -> Result<()> {
        if equipment.slot() != EquipmentSlot::Memory {
            return Err(AgentError::InvalidEquipment("Only Memory equipment supported in MVP".to_string()));
        }

        self.memory_equipment = Some(equipment);
        self.state.has_memory_equipment = true;
        Ok(())
    }

    async fn stop(&mut self) -> Result<()> {
        self.state.status = AgentStatus::Stopped;
        Ok(())
    }
}

impl MinimalAgent {
    async fn process_trigger(&mut self, payload: &TriggerPayload) -> Result<ProcessingResult> {
        let mut output = format!("Processed trigger: {:?}", payload);

        // Use memory equipment if available
        if let Some(memory) = &self.memory_equipment {
            let mut data = HashMap::new();
            match payload {
                TriggerPayload::Data { cell_ref, new_value, .. } => {
                    data.insert("cell".to_string(), serde_json::json!(cell_ref));
                    data.insert("value".to_string(), new_value.clone());
                }
                TriggerPayload::Periodic { interval_ms, .. } => {
                    data.insert("interval".to_string(), serde_json::json!(interval_ms));
                }
                TriggerPayload::Formula { formula, result } => {
                    data.insert("formula".to_string(), serde_json::json!(formula));
                    data.insert("result".to_string(), result.clone());
                }
                TriggerPayload::External { source, event_data } => {
                    data.insert("source".to_string(), serde_json::json!(source));
                    for (k, v) in event_data {
                        data.insert(k, v);
                    }
                }
            }

            let result = memory.process(data).await?;
            output = format!("{} | Memory: {}", output, result);
        }

        Ok(ProcessingResult {
            agent_id: self.id().to_string(),
            message_id: format!("msg-{}", std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_nanos()),
            success: true,
            output: Some(output),
            processing_time_ms: 10,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_agent_creation() {
        let config = AgentConfig {
            id: "test-agent".to_string(),
            cell_ref: "A1".to_string(),
            model: "test-model".to_string(),
            config: HashMap::new(),
        };

        let agent = MinimalAgent::new(config);
        assert_eq!(agent.id(), "test-agent");
        assert_eq!(agent.status(), &AgentStatus::Idle);
        assert_eq!(agent.cell_ref(), "A1");
        assert_eq!(agent.model(), "test-model");
    }

    #[test]
    fn test_agent_state_default() {
        let state = AgentState::default();
        assert_eq!(state.status, AgentStatus::Idle);
        assert_eq!(state.memory.len(), 0);
        assert_eq!(state.has_memory_equipment, false);
    }

    #[tokio::test]
    async fn test_agent_stop() {
        let config = AgentConfig {
            id: "test-agent".to_string(),
            cell_ref: "A1".to_string(),
            model: "test-model".to_string(),
            config: HashMap::new(),
        };

        let mut agent = MinimalAgent::new(config);
        agent.stop().await.unwrap();
        assert_eq!(agent.status(), &AgentStatus::Stopped);
    }
}
