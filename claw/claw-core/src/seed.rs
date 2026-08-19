//! Seed types for Claw agent initialization and learning.

use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use schemars::JsonSchema;
use crate::common::*;

/// Trigger condition for seed activation.
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct TriggerCondition {
    #[serde(rename = "type")]
    pub r#type: String,
    pub config: Option<serde_json::Value>,
}

/// Learning strategy for seed.
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct LearningStrategy {
    #[serde(rename = "type")]
    pub r#type: String,
    pub config: Option<serde_json::Value>,
}

/// Early stopping configuration.
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct EarlyStoppingConfig {
    pub enabled: Option<bool>,
    pub patience: Option<i32>,
    pub min_delta: Option<f64>,
    pub monitor: Option<String>,
}

/// Optimization target.
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct OptimizationTarget {
    pub primary: String,
    pub secondary: Option<String>,
    pub thresholds: Option<serde_json::Value>,
}

/// Training configuration.
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct TrainingConfiguration {
    pub data_source: String,
    pub data_format: String,
    pub iterations: Option<i32>,
    pub learning_rate: Option<f64>,
    pub batch_size: Option<i32>,
    pub validation_split: Option<f64>,
    pub early_stopping: Option<EarlyStoppingConfig>,
    pub optimization_target: Option<OptimizationTarget>,
    pub preprocessing: Option<Vec<String>>,
}

/// Learned parameters.
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct LearnedParameters {
    pub version: i32,
    pub parameters: serde_json::Value,
    pub checksum: Option<String>,
    #[schemars(with = "String")]
    pub training_timestamp: Option<DateTime<Utc>>,
    pub performance_estimate: Option<f64>,
}

/// Performance history entry.
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct PerformanceHistory {
    pub iteration: i32,
    #[schemars(with = "String")]
    pub timestamp: DateTime<Utc>,
    pub metrics: serde_json::Value,
}

/// Final metrics after training.
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct FinalMetrics {
    pub accuracy: Option<f64>,
    pub precision: Option<f64>,
    pub recall: Option<f64>,
    pub f1_score: Option<f64>,
    pub latency_mean_ms: Option<f64>,
    pub latency_p95_ms: Option<f64>,
    pub latency_p99_ms: Option<f64>,
    pub throughput_per_second: Option<f64>,
    pub memory_mb: Option<f64>,
}

/// Stabilization metrics.
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct StabilizationMetrics {
    pub is_stabilized: bool,
    pub convergence_iteration: Option<i32>,
    pub performance_history: Option<Vec<PerformanceHistory>>,
    pub final_metrics: Option<FinalMetrics>,
    pub stability_score: Option<f64>,
}

/// Seed metadata.
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct SeedMetadata {
    pub version: String,
    #[schemars(with = "String")]
    pub created_at: DateTime<Utc>,
    #[schemars(with = "String")]
    pub updated_at: Option<DateTime<Utc>>,
    pub author: Option<String>,
    pub tags: Option<Vec<String>>,
}

/// Distillation configuration.
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct DistillationConfig {
    pub enabled: Option<bool>,
    pub target_size_mb: Option<f64>,
    pub target_latency_ms: Option<f64>,
    pub temperature: Option<f64>,
    pub compression_ratio: Option<f64>,
    pub preserve_accuracy: Option<f64>,
}

/// Main seed structure for Claw agents.
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct ClawSeed {
    pub id: String,
    pub purpose: String,
    pub trigger: TriggerCondition,
    pub learning_strategy: LearningStrategy,
    pub default_equipment: Vec<EquipmentSlot>,
    pub training_data: Option<TrainingConfiguration>,
    pub learned_parameters: Option<LearnedParameters>,
    pub stabilization_metrics: Option<StabilizationMetrics>,
    pub metadata: Option<SeedMetadata>,
    pub distillation_config: Option<DistillationConfig>,
}

impl ClawSeed {
    /// Create a new ClawSeed with minimal required fields.
    pub fn new(
        id: String,
        purpose: String,
        trigger: TriggerCondition,
        learning_strategy: LearningStrategy,
        default_equipment: Vec<EquipmentSlot>,
    ) -> Self {
        Self {
            id,
            purpose,
            trigger,
            learning_strategy,
            default_equipment,
            training_data: None,
            learned_parameters: None,
            stabilization_metrics: None,
            metadata: None,
            distillation_config: None,
        }
    }

    /// Check if the seed is stabilized.
    pub fn is_stabilized(&self) -> bool {
        self.stabilization_metrics
            .as_ref()
            .map(|m| m.is_stabilized)
            .unwrap_or(false)
    }

    /// Get the current learned parameters version.
    pub fn learned_version(&self) -> Option<i32> {
        self.learned_parameters.as_ref().map(|p| p.version)
    }

    /// Validate the seed configuration.
    /// Returns `Err(String)` if any required field is missing or semantically invalid.
    pub fn validate(&self) -> Result<(), String> {
        if self.id.trim().is_empty() {
            return Err("seed.id must not be empty".into());
        }
        if self.purpose.trim().is_empty() {
            return Err("seed.purpose must not be empty".into());
        }
        if self.trigger.r#type.trim().is_empty() {
            return Err("seed.trigger.type must not be empty".into());
        }
        if self.learning_strategy.r#type.trim().is_empty() {
            return Err("seed.learning_strategy.type must not be empty".into());
        }
        if self.default_equipment.is_empty() {
            return Err("seed.default_equipment must contain at least one slot".into());
        }
        Ok(())
    }

    /// Serialize the seed to JSON.
    pub fn to_json(&self) -> Result<String, serde_json::Error> {
        serde_json::to_string_pretty(self)
    }

    /// Deserialize a seed from JSON.
    pub fn from_json(json: &str) -> Result<Self, serde_json::Error> {
        serde_json::from_str(json)
    }
}