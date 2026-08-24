//! Core Data Structures for the Claw Engine
//! Mapping of `schemas_gold_standard/claw_agent.json`

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

// -----------------------------------------------------------------------------
// Core Entity: Claw Agent
// -----------------------------------------------------------------------------

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClawAgent {
    pub id: Uuid,
    pub version: String,
    pub name: String,

    #[serde(rename = "model")]
    pub model_config: ModelConfiguration,
    
    // Updated to match the rich ThermodynamicState structure
    // In schema: "thermodynamicState", in current code stub: "state"
    // Since state.rs uses .thermo but stub uses .state, I'll keep .state 
    // and update state.rs to use it.
    pub state: ThermodynamicState,
    
    pub temperature: f64,
    
    #[serde(rename = "semanticDistance")]
    pub semantic_distance: f64,

    #[serde(rename = "lastValidation")]
    pub last_validation: DateTime<Utc>,
    
    #[serde(rename = "moltCount")]
    pub molt_count: u8,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub capability: Option<f64>,

    pub equipment: Vec<EquipmentSlot>,
    pub seed: Seed,
    pub shell: Shell,

    #[serde(rename = "executionContext", skip_serializing_if = "Option::is_none")]
    pub execution_context: Option<ExecutionContext>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub origin: Option<Origin>,
}

// -----------------------------------------------------------------------------
// Configuration & Intelligence
// -----------------------------------------------------------------------------

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelConfiguration {
    pub provider: String, // e.g., "openai", "anthropic"
    
    #[serde(rename = "modelId")]
    pub model_id: String,
    
    #[serde(skip_serializing_if = "Option::is_none")]
    pub temperature: Option<f64>,
    
    #[serde(skip_serializing_if = "Option::is_none")]
    pub deterministic: Option<bool>,

    #[serde(rename = "contextWindow", skip_serializing_if = "Option::is_none")]
    pub context_window: Option<u32>,
}

// -----------------------------------------------------------------------------
// Thermodynamic State (Rich Model)
// -----------------------------------------------------------------------------

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThermodynamicState {
    pub phase: Phase,
    
    #[serde(rename = "cycleCount")]
    pub cycle_count: u64,

    pub gamma: GammaState,
    pub eta: EtaState,
    pub molt: MoltState,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "UPPERCASE")]
pub enum Phase {
    Dormant,
    Thinking,
    Processing,
    Molt,
    Error,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GammaState {
    /// Potential Energy (Crystallized Intelligence)
    pub potential: f64,
    /// Rate of change
    pub delta: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EtaState {
    /// Entropy (Knowledge / Disorder)
    pub entropy: f64,
    /// Rate of change
    pub delta: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MoltState {
    pub generation: u32,
    pub history: Vec<MoltProtocol>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MoltProtocol {
    pub generation: u32,
    
    #[serde(rename = "exoskeleton")]
    pub exoskeleton: String,
    
    #[serde(rename = "softSkeleton")]
    pub soft_skeleton: String,
    
    #[serde(rename = "hardeningTimeMs")]
    pub hardening_time_ms: u64,
    
    #[serde(rename = "isLearningActive")]
    pub is_learning_active: bool,
}

// -----------------------------------------------------------------------------
// Seed: The DNA
// -----------------------------------------------------------------------------

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Seed {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<Uuid>,
    pub purpose: String,
    pub trigger: Trigger,
    
    #[serde(rename = "learningStrategy")]
    pub learning_strategy: LearningStrategy,

    #[serde(rename = "defaultEquipment")]
    pub default_equipment: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum Trigger {
    #[serde(rename = "periodic")]
    Periodic { interval: u64 },
    
    #[serde(rename = "event")]
    Event { event: String },
    
    #[serde(rename = "cron")]
    Cron { cron: String },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum LearningStrategy {
    #[serde(rename = "reinforcement")]
    Reinforcement,
    
    #[serde(rename = "replay")]
    Replay { 
        #[serde(rename = "bufferSize")]
        buffer_size: u32 
    },
    
    #[serde(rename = "distillation")]
    Distillation { architecture: String },
}

// -----------------------------------------------------------------------------
// Equipment: The Tools
// -----------------------------------------------------------------------------

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EquipmentSlot {
    #[serde(rename = "type")]
    pub slot_type: EquipmentType,
    pub active: bool,
    
    #[serde(skip_serializing_if = "Option::is_none")]
    pub module: Option<ModuleInstance>,

    #[serde(rename = "activationCondition", skip_serializing_if = "Option::is_none")]
    pub activation_condition: Option<serde_json::Value>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub cost: Option<CostMetrics>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum EquipmentType {
    #[serde(rename = "SENSOR")]
    Sensor,
    #[serde(rename = "MEMORY")]
    Memory,
    #[serde(rename = "REASONING")]
    Reasoning,
    #[serde(rename = "COMMUNICATION")]
    Communication,
    #[serde(rename = "COORDINATION")]
    Coordination,
    #[serde(rename = "VERIFICATION")]
    Verification,
    #[serde(rename = "CREATIVE")]
    Creative,
    #[serde(rename = "DISTILLATION")]
    Distillation,
    #[serde(rename = "SONAR")]
    Sonar,
    #[serde(rename = "VISION")]
    Vision,
    #[serde(rename = "AUDIO")]
    Audio,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModuleInstance {
    pub id: Uuid,
    pub name: String,
    pub category: String,
    
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    
    #[serde(skip_serializing_if = "Option::is_none")]
    pub capabilities: Option<Vec<String>>,

    #[serde(rename = "configSchema", skip_serializing_if = "Option::is_none")]
    pub config_schema: Option<serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CostMetrics {
    #[serde(rename = "memoryMB", skip_serializing_if = "Option::is_none")]
    pub memory_mb: Option<u32>,
    
    #[serde(rename = "computeMS", skip_serializing_if = "Option::is_none")]
    pub compute_ms: Option<u32>,
    
    #[serde(rename = "gammaDrain", skip_serializing_if = "Option::is_none")]
    pub gamma_drain: Option<f64>,
}

// -----------------------------------------------------------------------------
// Identity: The Shell
// -----------------------------------------------------------------------------

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Shell {
    pub id: String,
    
    #[serde(rename = "moltCount", skip_serializing_if = "Option::is_none")]
    pub molt_count: Option<u8>,
    
    #[serde(rename = "lastMolt", skip_serializing_if = "Option::is_none")]
    pub last_molt: Option<DateTime<Utc>>,

    #[serde(rename = "identityHash", skip_serializing_if = "Option::is_none")]
    pub identity_hash: Option<String>,
    
    #[serde(skip_serializing_if = "Option::is_none")]
    pub history: Option<Vec<DateTime<Utc>>>,
}

// -----------------------------------------------------------------------------
// Miscellaneous
// -----------------------------------------------------------------------------

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExecutionContext {
    #[serde(rename = "kvCacheFingerprint", skip_serializing_if = "Option::is_none")]
    pub kv_cache_fingerprint: Option<String>,
    
    #[serde(rename = "lastInputHash", skip_serializing_if = "Option::is_none")]
    pub last_input_hash: Option<String>,
    
    #[serde(rename = "lastOutputHash", skip_serializing_if = "Option::is_none")]
    pub last_output_hash: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Origin {
    #[serde(rename = "spawnedBy", skip_serializing_if = "Option::is_none")]
    pub spawned_by: Option<Uuid>,
    
    #[serde(rename = "spawnContext", skip_serializing_if = "Option::is_none")]
    pub spawn_context: Option<String>,
    
    #[serde(rename = "spawnTimestamp", skip_serializing_if = "Option::is_none")]
    pub spawn_timestamp: Option<DateTime<Utc>>,
}
