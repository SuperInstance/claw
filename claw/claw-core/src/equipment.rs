//! Equipment types for Claw agents.

use serde::{Deserialize, Serialize};
use schemars::JsonSchema;
use crate::common::*;

/// Equipment cost structure.
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct EquipmentCost {
    pub memory_bytes: i64,
    pub cpu_percent: f64,
    pub latency_ms: f64,
    pub cost_per_use: f64,
    pub energy_joules: Option<f64>,
}

/// Equipment benefit structure.
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct EquipmentBenefit {
    pub accuracy_boost: f64,
    pub speed_multiplier: f64,
    pub confidence_boost: Option<f64>,
    pub capability_gain: Option<Vec<String>>,
    pub reliability_improvement: Option<f64>,
}

/// Resource availability for trigger conditions.
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct ResourceAvailability {
    pub memory_bytes: Option<i64>,
    pub cpu_percent: Option<f64>,
}

/// Resource pressure for trigger conditions.
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct ResourcePressure {
    pub memory_below: Option<i64>,
    pub cpu_above: Option<f64>,
}

/// When to equip condition.
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct EquipWhen {
    pub confidence_below: Option<f64>,
    pub task_type_matches: Option<Vec<String>>,
    pub resource_available: Option<ResourceAvailability>,
    pub user_explicit_request: Option<bool>,
    pub frequency_above: Option<f64>,
}

/// When to unequip condition.
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct UnequipWhen {
    pub confidence_above: Option<f64>,
    pub idle_duration_exceeds: Option<i32>,
    pub resource_pressure: Option<ResourcePressure>,
    pub cost_benefit_ratio: Option<f64>,
    pub user_explicit_request: Option<bool>,
}

/// Call teacher condition.
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct CallTeacher {
    pub min_confidence: f64,
    pub max_confidence: f64,
    pub teacher_equipment: String,
}

/// Trigger thresholds for equipment.
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct TriggerThresholds {
    pub equip_when: EquipWhen,
    pub unequip_when: UnequipWhen,
    pub call_teacher: Option<CallTeacher>,
}

/// Equipment definition.
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct Equipment {
    pub name: String,
    pub slot: EquipmentSlot,
    pub version: String,
    pub description: String,
    pub cost: EquipmentCost,
    pub benefit: EquipmentBenefit,
    pub trigger_thresholds: TriggerThresholds,
    pub capabilities: Vec<Capability>,
    pub dependencies: Option<Vec<String>>,
    pub conflicts: Option<Vec<String>>,
    pub muscle_memory: MuscleMemory,
    pub implementation: Option<ImplementationDetails>,
    pub metadata: Option<EquipmentMetadata>,
}

impl Equipment {
    /// Create a new Equipment with minimal required fields.
    pub fn new(
        name: String,
        slot: EquipmentSlot,
        version: String,
        description: String,
        cost: EquipmentCost,
        benefit: EquipmentBenefit,
        trigger_thresholds: TriggerThresholds,
        capabilities: Vec<Capability>,
        muscle_memory: MuscleMemory,
    ) -> Self {
        Self {
            name,
            slot,
            version,
            description,
            cost,
            benefit,
            trigger_thresholds,
            capabilities,
            dependencies: None,
            conflicts: None,
            muscle_memory,
            implementation: None,
            metadata: None,
        }
    }

    /// Check if this equipment can be equipped given the current state.
    pub fn can_equip(&self, claw: &crate::claw::ClawAgent) -> bool {
        let ew = &self.trigger_thresholds.equip_when;

        // user_explicit_request overrides everything
        if let Some(true) = ew.user_explicit_request {
            return true;
        }

        // confidence_below: equip if claw confidence is below threshold
        if let Some(threshold) = ew.confidence_below {
            if let Some(metrics) = &claw.metrics {
                if let Some(conf) = metrics.execution.as_ref().and_then(|e| e.average_execution_time_ms) {
                    // Repurpose: low execution time = high confidence proxy
                    if conf < threshold {
                        return true;
                    }
                }
            }
        }

        // resource_available: check if resources meet minimums
        if let Some(ra) = &ew.resource_available {
            if let Some(resources) = &claw.config.resources {
                if let Some(min_mem) = ra.memory_bytes {
                    if let Some(max_mem) = resources.max_memory_mb {
                        // Convert MB to bytes for comparison (1 MB = 1_048_576 bytes)
                        let max_bytes = (max_mem as i64) * 1_048_576;
                        if max_bytes < min_mem {
                            return false;
                        }
                    }
                }
            }
        }

        // task_type_matches: check if trigger type matches
        if let Some(task_types) = &ew.task_type_matches {
            if let Some(trigger_cfg) = &claw.triggers {
                let trigger_type = trigger_cfg.r#type.as_str();
                for tt in task_types {
                    if trigger_type == tt.as_str() {
                        return true;
                    }
                }
            }
        }

        // frequency_above: check recent execution frequency
        if let Some(_freq) = ew.frequency_above {
            if let Some(metrics) = &claw.metrics {
                if let Some(total) = metrics.execution.as_ref().and_then(|e| e.total_executions) {
                    if total > 0 {
                        return true;
                    }
                }
            }
        }

        false
    }

    /// Check if this equipment should be unequipped given the current state.
    pub fn should_unequip(&self, claw: &crate::claw::ClawAgent) -> bool {
        let uw = &self.trigger_thresholds.unequip_when;

        // user_explicit_request overrides everything
        if let Some(true) = uw.user_explicit_request {
            return true;
        }

        // idle_duration_exceeds: check last execution time
        if let Some(max_idle) = uw.idle_duration_exceeds {
            if let Some(metrics) = &claw.metrics {
                if let Some(last) = metrics.execution.as_ref().and_then(|e| e.last_execution_time) {
                    let now = chrono::Utc::now();
                    let idle_secs = (now - last).num_seconds() as i32;
                    if idle_secs > max_idle {
                        return true;
                    }
                }
            }
        }

        // confidence_above: unequip if confidence is high
        if let Some(threshold) = uw.confidence_above {
            if let Some(metrics) = &claw.metrics {
                if let Some(conf) = metrics.execution.as_ref().and_then(|e| e.average_execution_time_ms) {
                    if conf > threshold {
                        return true;
                    }
                }
            }
        }

        // cost_benefit_ratio: unequip if cost exceeds benefit
        if let Some(max_ratio) = uw.cost_benefit_ratio {
            let total_cost = self.cost.cost_per_use;
            let total_benefit = self.benefit.accuracy_boost + self.benefit.speed_multiplier;
            if total_benefit > 0.0 && total_cost / total_benefit > max_ratio {
                return true;
            }
        }

        false
    }
}