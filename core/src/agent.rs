//! Core Agent trait and implementations
//!
//! Agents are the fundamental unit of computation in the Cell-First Actor Model.
//! Each agent represents a single cell in the spreadsheet.

use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::time::Instant;

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

    /// Agent is waiting for equipment
    Equipping,

    /// Agent encountered an error
    Error(String),

    /// Agent is stopped
    Stopped,
}

/// Serializable wrapper for Instant
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct SerializableInstant {
    pub secs_since_epoch: u64,
    pub nanos_since_epoch: u32,
}

impl From<Instant> for SerializableInstant {
    fn from(instant: Instant) -> Self {
        let duration = instant.duration_since(Instant::now());
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap();
        let total_nanos = now.as_nanos() as i128 - duration.as_nanos() as i128;
        Self {
            secs_since_epoch: (total_nanos / 1_000_000_000) as u64,
            nanos_since_epoch: (total_nanos % 1_000_000_000) as u32,
        }
    }
}

/// Agent metadata
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentMetadata {
    pub id: String,
    pub cell_ref: String,
    pub model: String,
    pub created_at: SerializableInstant,
    pub last_active: SerializableInstant,
}

/// Agent configuration
#[derive(Debug, Clone, Serialize, Deserialize, utoipa::ToSchema)]
pub struct AgentConfig {
    #[serde(default)]
    pub id: String,
    pub cell_ref: String,
    pub model: String,

    #[serde(default)]
    pub equipment: Vec<EquipmentSlot>,

    #[serde(default)]
    pub config: HashMap<String, serde_json::Value>,
}

/// Agent state
#[derive(Debug, Clone, Serialize, Deserialize, utoipa::ToSchema)]
pub struct AgentState {
    pub status: AgentStatus,
    pub reasoning: Option<String>,
    pub learning_metrics: LearningMetrics,
    pub equipment: Vec<EquipmentSlot>,
    pub memory: HashMap<String, serde_json::Value>,
}

/// Learning metrics for tracking agent improvement
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LearningMetrics {
    pub total_processed: u64,
    pub successful_processed: u64,
    pub failed_processed: u64,
    pub avg_processing_time_ms: f64,
    pub last_accuracy_score: Option<f64>,
}

impl Default for LearningMetrics {
    fn default() -> Self {
        Self {
            total_processed: 0,
            successful_processed: 0,
            failed_processed: 0,
            avg_processing_time_ms: 0.0,
            last_accuracy_score: None,
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

    /// Equip an equipment slot
    async fn equip(&mut self, equipment: Box<dyn Equipment>) -> Result<()>;

    /// Unequip an equipment slot
    async fn unequip(&mut self, slot: EquipmentSlot) -> Result<()>;

    /// Check if agent has equipment equipped
    fn has_equipment(&self, slot: EquipmentSlot) -> bool;

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
    pub reasoning: Option<String>,
    pub processing_time_ms: u64,
    pub equipment_used: Vec<EquipmentSlot>,
    pub muscle_memory_triggers: Vec<String>,
}

/// Minimal Agent implementation
pub struct MinimalAgent {
    metadata: AgentMetadata,
    #[allow(dead_code)]
    config: AgentConfig,
    state: AgentState,
    equipped: HashMap<EquipmentSlot, Box<dyn Equipment>>,
    #[allow(dead_code)]
    created_at_instant: Instant,
    last_active_instant: Instant,
}

impl MinimalAgent {
    /// Create a new minimal agent
    pub fn new(config: AgentConfig) -> Self {
        let now = Instant::now();
        let now_serializable: SerializableInstant = now.into();

        Self {
            metadata: AgentMetadata {
                id: config.id.clone(),
                cell_ref: config.cell_ref.clone(),
                model: config.model.clone(),
                created_at: now_serializable.clone(),
                last_active: now_serializable,
            },
            config,
            state: AgentState {
                status: AgentStatus::Idle,
                reasoning: None,
                learning_metrics: LearningMetrics::default(),
                equipment: Vec::new(),
                memory: HashMap::new(),
            },
            equipped: HashMap::new(),
            created_at_instant: now,
            last_active_instant: now,
        }
    }

    /// Get agent config
    pub fn config(&self) -> &AgentConfig {
        &self.config
    }

    /// Update last active timestamp
    fn update_last_active(&mut self) {
        self.last_active_instant = Instant::now();
        self.metadata.last_active = self.last_active_instant.into();
    }
}

#[async_trait]
impl Agent for MinimalAgent {
    fn id(&self) -> &str {
        &self.metadata.id
    }

    fn status(&self) -> &AgentStatus {
        &self.state.status
    }

    fn state(&self) -> AgentState {
        self.state.clone()
    }

    async fn process(&mut self, message: Message) -> Result<ProcessingResult> {
        let start = Instant::now();
        self.update_last_active();

        // Update status
        self.state.status = AgentStatus::Processing;

        // Process the message based on type
        let result = match &message {
            Message::Trigger { payload, .. } => {
                self.process_trigger(payload).await
            }
            Message::Cancel { .. } => {
                self.state.status = AgentStatus::Stopped;
                Ok(ProcessingResult {
                    agent_id: self.id().to_string(),
                    message_id: message.id().to_string(),
                    success: true,
                    output: Some("Agent stopped".to_string()),
                    reasoning: None,
                    processing_time_ms: start.elapsed().as_millis() as u64,
                    equipment_used: self.state.equipment.clone(),
                    muscle_memory_triggers: Vec::new(),
                })
            }
            Message::Query { query_type, .. } => {
                let result = self.query(query_type.clone()).await?;
                Ok(ProcessingResult {
                    agent_id: self.id().to_string(),
                    message_id: message.id().to_string(),
                    success: true,
                    output: Some(serde_json::to_string(&result)?),
                    reasoning: None,
                    processing_time_ms: start.elapsed().as_millis() as u64,
                    equipment_used: self.state.equipment.clone(),
                    muscle_memory_triggers: Vec::new(),
                })
            }
            _ => Err(AgentError::UnsupportedMessage(message.id().to_string())),
        };

        // Update learning metrics
        match &result {
            Ok(r) => {
                self.state.learning_metrics.total_processed += 1;
                if r.success {
                    self.state.learning_metrics.successful_processed += 1;
                } else {
                    self.state.learning_metrics.failed_processed += 1;
                }

                let time = r.processing_time_ms as f64;
                let avg = self.state.learning_metrics.avg_processing_time_ms;
                let count = self.state.learning_metrics.total_processed as f64;
                self.state.learning_metrics.avg_processing_time_ms =
                    (avg * (count - 1.0) + time) / count;
            }
            Err(_) => {
                self.state.learning_metrics.total_processed += 1;
                self.state.learning_metrics.failed_processed += 1;
            }
        }

        // Reset status
        if self.state.status != AgentStatus::Stopped {
            self.state.status = AgentStatus::Idle;
        }

        result
    }

    async fn query(&self, query_type: QueryType) -> Result<serde_json::Value> {
        match query_type {
            QueryType::State => Ok(serde_json::to_value(&self.state)?),
            QueryType::Reasoning => Ok(serde_json::to_value(&self.state.reasoning)?),
            QueryType::Learning => Ok(serde_json::to_value(&self.state.learning_metrics)?),
            QueryType::Equipment => Ok(serde_json::to_value(&self.state.equipment)?),
            QueryType::Social => Ok(serde_json::json!({"social": "not_implemented"})),
        }
    }

    async fn equip(&mut self, equipment: Box<dyn Equipment>) -> Result<()> {
        let slot = equipment.slot();

        // Check if already equipped
        if self.equipped.contains_key(&slot) {
            return Err(AgentError::EquipmentAlreadyEquipped(slot));
        }

        // Equip the equipment
        self.equipped.insert(slot, equipment);
        self.state.equipment.push(slot);

        Ok(())
    }

    async fn unequip(&mut self, slot: EquipmentSlot) -> Result<()> {
        // Check if equipped
        if !self.equipped.contains_key(&slot) {
            return Err(AgentError::EquipmentNotEquipped(slot));
        }

        // Unequip
        self.equipped.remove(&slot);
        self.state.equipment.retain(|s| s != &slot);

        Ok(())
    }

    fn has_equipment(&self, slot: EquipmentSlot) -> bool {
        self.equipped.contains_key(&slot)
    }

    async fn stop(&mut self) -> Result<()> {
        self.state.status = AgentStatus::Stopped;
        Ok(())
    }
}

impl MinimalAgent {
    async fn process_trigger(&mut self, payload: &TriggerPayload) -> Result<ProcessingResult> {
        // Process trigger using equipped equipment
        let mut reasoning_steps = Vec::new();

        // Convert messages::TriggerPayload to ws::protocol::TriggerPayload
        let ws_payload = crate::ws::protocol::TriggerPayload {
            trigger_type: format!("{:?}", payload),
            data: match payload {
                TriggerPayload::Data { cell_ref, new_value, .. } => {
                    let mut map = std::collections::HashMap::new();
                    map.insert("cell".to_string(), serde_json::json!(cell_ref));
                    map.insert("value".to_string(), new_value.clone());
                    map
                }
                TriggerPayload::Periodic { interval_ms, timestamp } => {
                    let mut map = std::collections::HashMap::new();
                    map.insert("interval".to_string(), serde_json::json!(interval_ms));
                    map.insert("timestamp".to_string(), serde_json::json!(timestamp));
                    map
                }
                TriggerPayload::Formula { formula, result } => {
                    let mut map = std::collections::HashMap::new();
                    map.insert("formula".to_string(), serde_json::json!(formula));
                    map.insert("result".to_string(), result.clone());
                    map
                }
                TriggerPayload::External { source, event_data } => {
                    let mut data = event_data.clone();
                    data.insert("source".to_string(), serde_json::json!(source));
                    data
                }
            },
        };

        // Use MEMORY equipment if available
        if let Some(memory) = self.equipped.get(&EquipmentSlot::Memory) {
            let result = memory.process(ws_payload.clone()).await?;
            reasoning_steps.push(format!("Memory: {}", result));
        }

        // Use REASONING equipment if available
        if let Some(reasoning) = self.equipped.get(&EquipmentSlot::Reasoning) {
            let result = reasoning.process(ws_payload.clone()).await?;
            reasoning_steps.push(format!("Reasoning: {}", result));
        }

        // Generate output
        let output = format!("Processed trigger: {:?}", payload);

        Ok(ProcessingResult {
            agent_id: self.id().to_string(),
            message_id: format!("msg-{}", std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_nanos()),
            success: true,
            output: Some(output),
            reasoning: if reasoning_steps.is_empty() {
                None
            } else {
                Some(reasoning_steps.join("\n"))
            },
            processing_time_ms: 10, // Placeholder
            equipment_used: self.state.equipment.clone(),
            muscle_memory_triggers: Vec::new(),
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
            equipment: Vec::new(),
            config: HashMap::new(),
        };

        let agent = MinimalAgent::new(config);
        assert_eq!(agent.id(), "test-agent");
        assert_eq!(agent.status(), &AgentStatus::Idle);
    }

    #[test]
    fn test_learning_metrics() {
        let metrics = LearningMetrics::default();
        assert_eq!(metrics.total_processed, 0);
        assert_eq!(metrics.successful_processed, 0);
    }
}
