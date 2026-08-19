//! Common types for the Claw engine.

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use schemars::JsonSchema;
use uuid::Uuid;

// ---------------------------------------------------------------------------
// State and Slot enums
// ---------------------------------------------------------------------------

/// Claw lifecycle state.
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, JsonSchema)]
pub enum ClawState {
    Dormant,
    Active,
    Thinking,
    Learning,
    Stale,
    Consensusing,
}

/// Equipment slot types (10 slots).
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, JsonSchema)]
#[serde(rename_all = "PascalCase")]
pub enum EquipmentSlot {
    Memory,
    Reasoning,
    Consensus,
    Spreadsheet,
    Distillation,
    Perception,
    Coordination,
    Communication,
    SelfImprovement,
    Monitoring,
}

// ---------------------------------------------------------------------------
// Equipment
// ---------------------------------------------------------------------------

/// Equipment module configuration.
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct EquipmentModule {
    pub slot: EquipmentSlot,
    pub module_type: String,
    pub config: serde_json::Value,
    pub priority: Option<i32>,
    pub enabled: Option<bool>,
}

/// Implementation details (stub for schema completeness).
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct ImplementationDetails {
    pub language: Option<String>,
    pub entry_point: Option<String>,
    pub config_schema: Option<serde_json::Value>,
}

/// Equipment metadata.
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct EquipmentMetadata {
    pub author: Option<String>,
    pub version: String,
    pub tags: Option<Vec<String>>,
    #[schemars(with = "String")]
    pub created_at: Option<DateTime<Utc>>,
    #[schemars(with = "String")]
    pub updated_at: Option<DateTime<Utc>>,
}

/// Muscle memory trigger condition.
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct MuscleMemoryCondition {
    #[serde(rename = "type")]
    pub r#type: String,
    pub pattern: Option<String>,
    pub threshold: Option<f64>,
    pub metric: Option<String>,
    pub direction: Option<String>,
}

/// Muscle memory trigger.
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct MuscleMemoryTrigger {
    pub condition: MuscleMemoryCondition,
    pub action: String,
    pub priority: Option<i32>,
    pub cooldown_seconds: Option<i32>,
}

/// Muscle memory for equipment.
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct MuscleMemory {
    pub triggers: Vec<MuscleMemoryTrigger>,
    #[schemars(with = "String")]
    pub last_used: Option<DateTime<Utc>>,
    pub use_count: Option<i32>,
    pub success_rate: Option<f64>,
}

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

/// Equipment operation errors.
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema, thiserror::Error)]
pub enum EquipmentError {
    #[error("Equipment slot already occupied: {0:?}")]
    SlotOccupied(EquipmentSlot),

    #[error("Equipment slot is empty: {0:?}")]
    SlotEmpty(EquipmentSlot),

    #[error("Equipment module not found for slot: {0:?}")]
    ModuleNotFound(EquipmentSlot),

    #[error("Equipment dependency not satisfied: {0}")]
    DependencyNotSatisfied(String),

    #[error("Equipment conflict detected: {0} conflicts with {1}")]
    ConflictDetected(String, String),

    #[error("Resource constraint failed: {0}")]
    ResourceConstraintFailed(String),

    #[error("Duplicate equipment slot: {0:?}")]
    DuplicateSlot(EquipmentSlot),
}

// ---------------------------------------------------------------------------
// Model and Runtime Configuration
// ---------------------------------------------------------------------------

/// Model provider enum.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, JsonSchema)]
pub enum ModelProvider {
    Local,
    OpenRouter,
    Anthropic,
    OpenAI,
    Custom(String),
}

/// Model configuration for a Claw agent.
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct ModelConfiguration {
    pub provider: ModelProvider,
    pub model_name: String,
    pub api_key: Option<String>,
    pub temperature: Option<f64>,
    pub max_tokens: Option<u32>,
    pub endpoint: Option<String>,
}

impl Default for ModelConfiguration {
    fn default() -> Self {
        Self {
            provider: ModelProvider::Local,
            model_name: "default".to_string(),
            api_key: None,
            temperature: Some(0.7),
            max_tokens: Some(1024),
            endpoint: None,
        }
    }
}

/// Resource configuration.
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct ResourceConfiguration {
    pub max_memory_mb: Option<u64>,
    pub max_cpu_percent: Option<f64>,
    pub timeout_seconds: Option<u32>,
}

/// Execution configuration.
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct ExecutionConfiguration {
    pub max_retries: Option<u32>,
    pub retry_delay_ms: Option<u64>,
    pub parallel: Option<bool>,
}

/// Runtime configuration.

// ---------------------------------------------------------------------------
// Trigger and Memory Configuration
// ---------------------------------------------------------------------------

/// Trigger configuration.
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct TriggerConfiguration {
    #[serde(rename = "type")]
    pub r#type: String,
    pub enabled: Option<bool>,
    pub config: Option<serde_json::Value>,
}

/// Error handling configuration.
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct ErrorHandling {
    pub strategy: Option<String>,
    pub max_retries: Option<u32>,
    pub fallback_action: Option<String>,
    pub notify_on_error: Option<bool>,
}

/// Metadata for a Claw agent.
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct Metadata {
    #[schemars(with = "String")]
    pub created_at: Option<DateTime<Utc>>,
    #[schemars(with = "String")]
    pub updated_at: Option<DateTime<Utc>>,
    #[schemars(with = "String")]
    pub created_by: Option<Uuid>,
    pub tags: Option<Vec<String>>,
    pub description: Option<String>,
}

// ---------------------------------------------------------------------------
// Relationships
// ---------------------------------------------------------------------------

/// Coworker relationship.
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct Coworker {
    #[schemars(with = "String")]
    pub claw_id: Uuid,
    pub relationship_type: String,
}

/// Claw relationships (master/slave/coworker).
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct ClawRelationships {
    #[schemars(with = "Vec<String>")]
    pub master_of: Option<Vec<Uuid>>,
    #[schemars(with = "String")]
    pub slave_of: Option<Uuid>,
    pub coworkers: Option<Vec<Coworker>>,
}

// ---------------------------------------------------------------------------
// Metrics
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Seed reference
// ---------------------------------------------------------------------------

/// Reference to a seed with optional parameters and version.
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema, Default)]
pub struct SeedReference {
    pub seed_id: String,
    pub parameters: Option<serde_json::Value>,
    pub version: Option<String>,
}

impl SeedReference {
    /// Create a new seed reference with just an ID.
    pub fn new(seed_id: impl Into<String>) -> Self {
        Self {
            seed_id: seed_id.into(),
            parameters: None,
            version: None,
        }
    }
}

// ---------------------------------------------------------------------------
// Consensus
// ---------------------------------------------------------------------------

/// Consensus participant.
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct ConsensusParticipant {
    #[schemars(with = "String")]
    pub claw_id: Uuid,
    pub vote: Option<String>,
    pub confidence: Option<f64>,
}

/// Consensus configuration.
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct ConsensusConfiguration {
    pub participants: Vec<ConsensusParticipant>,
    pub threshold: Option<f64>,
    pub timeout_ms: Option<u64>,
}

/// Consensus state.
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct ConsensusState {
    pub round: u32,
    #[schemars(with = "Vec<(String, String)>")]
    pub votes: Vec<(Uuid, String)>,
    pub decided: bool,
    pub decision: Option<String>,
}

// ---------------------------------------------------------------------------
// Spatial / Geometric
// ---------------------------------------------------------------------------

/// Dodecet position (12-bit per axis, 48 total).
#[derive(Debug, Clone, Copy, Serialize, Deserialize, JsonSchema, PartialEq, Eq, Hash)]
pub struct DodecetPosition {
    pub x: u16,
    pub y: u16,
    pub z: u16,
    pub theta: u16,
}

impl Default for DodecetPosition {
    fn default() -> Self {
        Self {
            x: 0,
            y: 0,
            z: 0,
            theta: 0,
        }
    }
}

/// Spatial context for a sensory event.
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct SpatialContext {
    pub position: DodecetPosition,
    pub radius: Option<u16>,
    pub viewport: Option<(u16, u16, u16, u16)>,
}

// ---------------------------------------------------------------------------
// Capability enum
// ---------------------------------------------------------------------------

/// Equipment capability.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, JsonSchema)]
pub enum Capability {
    MemoryPersistence,
    Reasoning,
    Consensus,
    SpreadsheetIntegration,
    ModelDistillation,
    MultiAgentCoordination,
    SpatialFiltering,
    SeedLearning,
    SelfImprovement,
    Monitoring,
}

// ---------------------------------------------------------------------------
// Spatial index (Phase 6)
// ---------------------------------------------------------------------------

/// A receptive field — the region of geometric space a claw can perceive or
/// be affected by.
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct ReceptiveField {
    /// Center position in dodecet space.
    pub center: DodecetPosition,
    /// Maximum Euclidean query radius.
    pub radius: f64,
}

impl Default for ReceptiveField {
    fn default() -> Self {
        Self {
            center: DodecetPosition::default(),
            radius: 0.0,
        }
    }
}

/// A point in geometric space associated with an agent ID.
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct SpatialEntry {
    #[schemars(with = "String")]
    pub agent_id: Uuid,
    pub position: DodecetPosition,
}

impl SpatialEntry {
    pub fn new(agent_id: Uuid, position: DodecetPosition) -> Self {
        Self {
            agent_id,
            position,
        }
    }
}

/// Trait for spatial indexing structures.
/// Implementors provide O(log n) nearest-neighbor or radius queries.
pub trait SpatialIndex {
    /// Insert a spatial entry.
    fn insert(&mut self, entry: SpatialEntry);

    /// Remove an entry by agent ID.
    fn remove(&mut self, agent_id: Uuid) -> Option<SpatialEntry>;

    /// Return all entries within `radius` of `center`.
    fn query_radius(&self, center: DodecetPosition, radius: f64) -> Vec<&SpatialEntry>;

    /// Return the k-nearest entries to `center`.
    fn query_knn(&self, center: DodecetPosition, k: usize) -> Vec<&SpatialEntry>;
}

/// Naive linear spatial index.
/// Suitable for small fleets (< 1,000 agents) and as a fallback.
#[derive(Debug, Clone, Default, Serialize, Deserialize, JsonSchema)]
pub struct NaiveSpatialIndex {
    entries: Vec<SpatialEntry>,
}

impl NaiveSpatialIndex {
    pub fn new() -> Self {
        Self {
            entries: Vec::new(),
        }
    }

    /// Euclidean distance squared between two dodecet positions.
    #[inline]
    fn distance_sq(a: &DodecetPosition, b: &DodecetPosition) -> i64 {
        let dx = i64::from(a.x) - i64::from(b.x);
        let dy = i64::from(a.y) - i64::from(b.y);
        let dz = i64::from(a.z) - i64::from(b.z);
        let dt = i64::from(a.theta) - i64::from(b.theta);
        dx * dx + dy * dy + dz * dz + dt * dt
    }
}

impl SpatialIndex for NaiveSpatialIndex {
    fn insert(&mut self, entry: SpatialEntry) {
        if let Some(pos) = self.entries.iter().position(|e| e.agent_id == entry.agent_id) {
            self.entries[pos] = entry;
        } else {
            self.entries.push(entry);
        }
    }

    fn remove(&mut self, agent_id: Uuid) -> Option<SpatialEntry> {
        if let Some(pos) = self.entries.iter().position(|e| e.agent_id == agent_id) {
            Some(self.entries.remove(pos))
        } else {
            None
        }
    }

    fn query_radius(&self, center: DodecetPosition, radius: f64) -> Vec<&SpatialEntry> {
        let r_sq = (radius * radius) as i64;
        self.entries
            .iter()
            .filter(|e| {
                let d_sq = Self::distance_sq(&e.position, &center);
                d_sq <= r_sq
            })
            .collect()
    }

    fn query_knn(&self, center: DodecetPosition, k: usize) -> Vec<&SpatialEntry> {
        let mut sorted = self.entries.iter().collect::<Vec<_>>();
        sorted.sort_by_key(|e| Self::distance_sq(&e.position, &center));
        sorted.truncate(k);
        sorted
    }
}
