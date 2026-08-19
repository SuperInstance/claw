//! claw-api - Public API types and traits for Claw agents.

pub mod rest;
pub mod traits;
pub mod ws;

// Re-export core types from claw_core
pub use claw_core::{
    Capability,
    ClawRelationships, ClawSeed, ClawState, ConsensusDecision, Coworker, Equipment,
    EquipmentCost, EquipmentBenefit, EquipmentMetadata, EquipmentModule,
    EquipmentSlot, ExecutionConfig, ExecutionMetrics,
    ImplementationDetails, LearnedParameters, MemoryConfiguration, ModelConfiguration,
    ModelProvider, MuscleMemory, MuscleMemoryCondition, MuscleMemoryTrigger,
    OptimizationTarget, ResonanceScore, ResourceLimits, ResourceMetrics,
    RetryPolicy, SeedReference, SemanticMemoryConfig, SocialMetrics, StabilizationMetrics,
    ThinkingMetrics, TimeoutConfig, TrainingConfiguration, TriggerConfiguration,
    TriggerCondition, TriggerThresholds, WorkingMemoryConfig,
};

// Re-export API-specific types
pub use rest::{
    CreateBotRequest, CreateClawRequest, EquipRequest, ErrorResponse, ExecuteRequest,
    ExecuteResponse, ListAgentsResponse,
};
