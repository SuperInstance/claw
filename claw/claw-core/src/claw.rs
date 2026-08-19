//! Claw agent core types.

use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use schemars::JsonSchema;
use crate::common::*;
use crate::equipment::Equipment;
#[cfg(test)]
use crate::common::EquipmentError;

/// Execution metrics.
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct ExecutionMetrics {
    pub total_executions: Option<i64>,
    pub successful_executions: Option<i64>,
    pub failed_executions: Option<i64>,
    pub average_execution_time_ms: Option<f64>,
    #[schemars(with = "String")]
    pub last_execution_time: Option<DateTime<Utc>>,
}

/// Thinking metrics.
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct ThinkingMetrics {
    pub total_thinking_steps: Option<i64>,
    pub average_thinking_time_ms: Option<f64>,
    pub tokens_processed: Option<i64>,
    pub tokens_generated: Option<i64>,
}

/// Resource metrics.
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct ResourceMetrics {
    pub peak_memory_mb: Option<f64>,
    pub average_cpu_percent: Option<f64>,
    pub api_calls_made: Option<i64>,
}

/// Social metrics.
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct SocialMetrics {
    pub messages_sent: Option<i64>,
    pub messages_received: Option<i64>,
    pub consensus_participations: Option<i64>,
}

/// Combined metrics for a Claw agent.
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct ClawMetrics {
    pub execution: Option<ExecutionMetrics>,
    pub thinking: Option<ThinkingMetrics>,
    pub resources: Option<ResourceMetrics>,
    pub social: Option<SocialMetrics>,
}

/// Timeout configuration.
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct TimeoutConfig {
    pub execution_timeout_ms: Option<i32>,
    pub thinking_timeout_ms: Option<i32>,
    pub idle_timeout_ms: Option<i32>,
}

/// Resource limits.
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct ResourceLimits {
    pub max_memory_mb: Option<i32>,
    pub max_cpu_percent: Option<f64>,
    pub max_concurrent_operations: Option<i32>,
}

/// Retry policy.
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct RetryPolicy {
    pub max_retries: Option<i32>,
    pub initial_delay_ms: Option<i32>,
    pub backoff_multiplier: Option<f64>,
    pub max_delay_ms: Option<i32>,
    pub retryable_errors: Option<Vec<String>>,
}

/// Execution configuration.
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct ExecutionConfig {
    pub max_iterations: Option<i32>,
    pub thinking_budget: Option<i32>,
    pub parallel_execution: Option<bool>,
    pub streaming: Option<bool>,
}

/// Debugging configuration.
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct DebuggingConfig {
    pub log_level: Option<String>,
    pub trace_execution: Option<bool>,
    pub record_thoughts: Option<bool>,
    pub profiling: Option<bool>,
}

/// Runtime configuration for a Claw agent.
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct RuntimeConfiguration {
    pub timeout: Option<TimeoutConfig>,
    pub resources: Option<ResourceLimits>,
    pub retry_policy: Option<RetryPolicy>,
    pub execution: Option<ExecutionConfig>,
    pub debugging: Option<DebuggingConfig>,
}

/// Semantic memory configuration.
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct SemanticMemoryConfig {
    pub enabled: Option<bool>,
    pub max_entries: Option<i32>,
    pub retention_policy: Option<String>,
    pub embedding_model: Option<String>,
}

/// Working memory configuration.
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct WorkingMemoryConfig {
    pub max_items: Option<i32>,
    pub expiration_ms: Option<i32>,
}

/// Episodic memory configuration.
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct EpisodicMemoryConfig {
    pub enabled: Option<bool>,
    pub max_episodes: Option<i32>,
    pub compression_threshold: Option<i32>,
}

/// Memory configuration.
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct MemoryConfiguration {
    pub semantic_memory: Option<SemanticMemoryConfig>,
    pub working_memory: Option<WorkingMemoryConfig>,
    pub episodic_memory: Option<EpisodicMemoryConfig>,
}

/// Error handling configuration.
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct ErrorHandling {
    pub max_consecutive_errors: Option<i32>,
    pub error_recovery_strategy: Option<String>,
    #[schemars(with = "String")]
    pub fallback_claw: Option<Uuid>,
    pub notification_channels: Option<Vec<String>>,
    pub error_blacklist: Option<Vec<String>>,
}

/// Main Claw agent structure.
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct ClawAgent {
    #[schemars(with = "String")]
    pub id: Uuid,
    pub name: Option<String>,
    pub model: ModelConfiguration,
    pub seed: SeedReference,
    pub state: ClawState,
    /// Stored equipped items (rich Equipment definitions, carry their own muscle memory).
    pub equipment: Vec<Equipment>,
    /// Muscle-memory patterns for auto-reequip when conditions re-encounter.
    pub reequip_triggers: Vec<MuscleMemory>,
    pub config: RuntimeConfiguration,
    pub relationships: Option<ClawRelationships>,
    pub metrics: Option<ClawMetrics>,
    pub triggers: Option<TriggerConfiguration>,
    pub memory: Option<MemoryConfiguration>,
    pub error_handling: Option<ErrorHandling>,
    pub metadata: Option<Metadata>,
}

impl ClawAgent {
    /// Create a new ClawAgent with default values.
    pub fn new(
        id: Uuid,
        name: Option<String>,
        model: ModelConfiguration,
        seed: SeedReference,
    ) -> Self {
        Self {
            id,
            name,
            model,
            seed,
            state: ClawState::Dormant,
            equipment: Vec::new(),
            reequip_triggers: Vec::new(),
            config: RuntimeConfiguration {
                timeout: None,
                resources: None,
                retry_policy: None,
                execution: None,
                debugging: None,
            },
            relationships: None,
            metrics: None,
            triggers: None,
            memory: None,
            error_handling: None,
            metadata: None,
        }
    }

    /// Get the current state.
    pub fn state(&self) -> &ClawState {
        &self.state
    }

    /// Set the state.
    pub fn set_state(&mut self, state: ClawState) {
        self.state = state;
    }

    /// Equip a full Equipment item into the given slot.
    pub fn equip(&mut self, slot: EquipmentSlot, equipment: Equipment) -> Result<(), EquipmentError> {
        if equipment.slot != slot {
            return Err(EquipmentError::SlotOccupied(slot));
        }
        if self.equipment.iter().any(|e| e.slot == slot) {
            return Err(EquipmentError::DuplicateSlot(slot));
        }
        self.equipment.push(equipment);
        Ok(())
    }

    /// Unequip the item in the given slot, returning it alongside its muscle-memory pattern.
    pub fn unequip(&mut self, slot: EquipmentSlot) -> Result<(Equipment, MuscleMemory), EquipmentError> {
        if let Some(pos) = self.equipment.iter().position(|e| e.slot == slot) {
            let equipment = self.equipment.remove(pos);
            let memory = equipment.muscle_memory.clone();
            self.reequip_triggers.push(memory.clone());
            Ok((equipment, memory))
        } else {
            Err(EquipmentError::SlotEmpty(slot))
        }
    }

    /// Get equipment by slot.
    pub fn get_equipment(&self, slot: EquipmentSlot) -> Option<&Equipment> {
        self.equipment.iter().find(|e| e.slot == slot)
    }

    /// Scan stored muscle-memory patterns and re-equip any whose conditions match.
    /// Returns the list of `MuscleMemory` entries whose triggers fired.
    pub fn try_reequip(&mut self) -> Vec<MuscleMemory> {
        let now = chrono::Utc::now();
        let mut fired = Vec::new();

        for memory in &self.reequip_triggers {
            for trigger in &memory.triggers {
                if self.evaluate_trigger(trigger, now) {
                    fired.push(memory.clone());
                    break;
                }
            }
        }

        // Clear fired memories so they don't re-trigger indefinitely.
        // (Caller is expected to re-equip before the next scan.)
        self.reequip_triggers.clear();
        fired
    }

    /// Evaluate a single `MuscleMemoryTrigger` against current state.
    fn evaluate_trigger(&self, trigger: &MuscleMemoryTrigger, now: chrono::DateTime<chrono::Utc>) -> bool {
        let c = &trigger.condition;

        // Cooldown guard
        if let Some(cooldown) = trigger.cooldown_seconds {
            if let Some(last) = self.metrics.as_ref().and_then(|m| {
                m.execution.as_ref().and_then(|e| e.last_execution_time)
            }) {
                let elapsed = (now - last).num_seconds();
                if elapsed < i64::from(cooldown) {
                    return false;
                }
            }
        }

        match c.r#type.as_str() {
            "state_change" => {
                // "pattern" encodes the expected state, e.g. "Active" or "Dormant"
                if let Some(expected) = &c.pattern {
                    let state_str = format!("{:?}", self.state);
                    return state_str == *expected;
                }
                false
            }
            "metric_threshold" => {
                // "metric" names a metric path, "threshold" is the value, "direction" is "above"/"below"
                if let (Some(metric), Some(threshold)) = (&c.metric, c.threshold) {
                    let value = self.read_metric(metric);
                    if let Some(v) = value {
                        return match c.direction.as_deref() {
                            Some("above") => v > threshold,
                            Some("below") => v < threshold,
                            _ => v == threshold,
                        };
                    }
                }
                false
            }
            "idle" => {
                // "threshold" = max idle seconds before trigger fires
                if let Some(max_idle) = c.threshold {
                    if let Some(last) = self.metrics.as_ref().and_then(|m| {
                        m.execution.as_ref().and_then(|e| e.last_execution_time)
                    }) {
                        let idle = (now - last).num_seconds() as f64;
                        return idle > max_idle;
                    }
                }
                false
            }
            "always" => true,
            _ => false,
        }
    }

    /// Read a named metric from the agent's metrics tree.
    /// Returns `None` if the metric path is not found.
    fn read_metric(&self, path: &str) -> Option<f64> {
        let parts: Vec<&str> = path.split('.').collect();
        match parts.as_slice() {
            ["execution", "total_executions"] => {
                self.metrics.as_ref()?.execution.as_ref()?.total_executions.map(|v| v as f64)
            }
            ["execution", "failed_executions"] => {
                self.metrics.as_ref()?.execution.as_ref()?.failed_executions.map(|v| v as f64)
            }
            ["execution", "average_execution_time_ms"] => {
                self.metrics.as_ref()?.execution.as_ref()?.average_execution_time_ms
            }
            ["thinking", "total_thinking_steps"] => {
                self.metrics.as_ref()?.thinking.as_ref()?.total_thinking_steps.map(|v| v as f64)
            }
            ["thinking", "tokens_processed"] => {
                self.metrics.as_ref()?.thinking.as_ref()?.tokens_processed.map(|v| v as f64)
            }
            ["resources", "peak_memory_mb"] => {
                self.metrics.as_ref()?.resources.as_ref()?.peak_memory_mb
            }
            ["resources", "average_cpu_percent"] => {
                self.metrics.as_ref()?.resources.as_ref()?.average_cpu_percent
            }
            ["social", "consensus_participations"] => {
                self.metrics.as_ref()?.social.as_ref()?.consensus_participations.map(|v| v as f64)
            }
            _ => None,
        }
    }
}
