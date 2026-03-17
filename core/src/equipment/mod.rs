//! Equipment system for dynamic agent capabilities
//!
//! Equipment provides modular capabilities that agents can dynamically equip and unequip.
//! When unequipped, "muscle memory" triggers are extracted for future re-equipment.
//!
//! ## Module Organization
//!
//! - [`hierarchical_memory`] - L1/L2/L3 memory hierarchy with caching
//! - [`muscle_memory`] - Pattern learning and trigger extraction
//! - [`loading`] - Lazy loading and resource pooling
//! - [`slots`] - Enhanced equipment implementations for all 6 slots

use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

// Use the WebSocket protocol version of TriggerPayload (struct)
// This provides consistent API across the equipment system
use crate::ws::protocol::TriggerPayload;
use crate::error::{AgentError, Result};

// Sub-modules
pub mod hierarchical_memory;
pub mod muscle_memory;
pub mod loading;
pub mod slots;
pub mod monitoring;
pub mod benches;
pub mod tests;

// Re-export commonly used types from modules
pub use hierarchical_memory::{
    HierarchicalMemory, MemoryTier, MemoryStats
};
pub use muscle_memory::{
    MuscleMemorySystem, MuscleMemoryTrigger, TriggerCondition,
    TriggerContext, UsageEvent, MuscleMemoryStats, ComparisonOp, LogicalOp
};
pub use loading::{
    EquipmentLoader, EquipmentPool, EquipmentFactory, LazyEquipment,
    ResourceLimits, LoaderStats, PoolStats, ResourceUsage
};
pub use slots::{
    MemoryEquipment, ReasoningEquipment, ConsensusEquipment,
    SpreadsheetEquipment, DistillationEquipment, CoordinationEquipment
};
pub use monitoring::{
    ResourceMonitor, ResourceMetrics, PerformanceMetrics, HealthStatus,
    HealthCheck, MetricsUpdate, TotalResourceUsage, MonitoringSummary,
    BenchmarkResults
};

// Re-export SerializableInstant from agent module
pub use crate::agent::SerializableInstant;

/// Equipment slots - different capability areas
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq, Hash, utoipa::ToSchema)]
pub enum EquipmentSlot {
    /// Memory - state persistence and retrieval
    Memory,

    /// Reasoning - decision making and inference
    Reasoning,

    /// Consensus - multi-agent agreement
    Consensus,

    /// Spreadsheet - cell integration
    Spreadsheet,

    /// Distillation - model compression
    Distillation,

    /// Coordination - multi-agent orchestration
    Coordination,
}

/// Core Equipment trait
#[async_trait]
pub trait Equipment: Send + Sync {
    /// Get the equipment slot
    fn slot(&self) -> EquipmentSlot;

    /// Get equipment name
    fn name(&self) -> &str;

    /// Process a trigger payload
    async fn process(&self, payload: TriggerPayload) -> Result<String>;

    /// Get equipment cost (for cost/benefit analysis)
    fn cost(&self) -> EquipmentCost;

    /// Extract muscle memory triggers
    fn extract_muscle_memory(&self) -> Vec<MuscleMemoryTrigger>;

    /// Check if equipment should be unequipped
    fn should_unequip(&self) -> bool;
}

/// Equipment cost metrics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EquipmentCost {
    pub memory_mb: f64,
    pub cpu_percent: f64,
    pub load_time_ms: u64,
    pub execution_overhead_ms: u64,
}

/// Equipment Manager - handles dynamic equip/unequip
pub struct EquipmentManager {
    equipped: HashMap<EquipmentSlot, Box<dyn Equipment>>,
    muscle_memory: HashMap<EquipmentSlot, Vec<MuscleMemoryTrigger>>,
    cost_thresholds: EquipmentCostThresholds,
}

/// Thresholds for equipment cost/benefit analysis
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EquipmentCostThresholds {
    pub max_memory_mb: f64,
    pub max_cpu_percent: f64,
    pub max_load_time_ms: u64,
}

impl Default for EquipmentCostThresholds {
    fn default() -> Self {
        Self {
            max_memory_mb: 10.0,
            max_cpu_percent: 50.0,
            max_load_time_ms: 50,
        }
    }
}

impl EquipmentManager {
    /// Create a new equipment manager
    pub fn new() -> Self {
        Self {
            equipped: HashMap::new(),
            muscle_memory: HashMap::new(),
            cost_thresholds: EquipmentCostThresholds::default(),
        }
    }

    /// Set cost thresholds
    pub fn set_thresholds(&mut self, thresholds: EquipmentCostThresholds) {
        self.cost_thresholds = thresholds;
    }

    /// Equip an equipment
    pub async fn equip(&mut self, equipment: Box<dyn Equipment>) -> Result<()> {
        let slot = equipment.slot();

        // Check cost thresholds
        let cost = equipment.cost();
        if cost.memory_mb > self.cost_thresholds.max_memory_mb {
            return Err(AgentError::EquipmentTooExpensive(slot, "memory".to_string()));
        }

        // Store muscle memory if replacing
        if let Some(existing) = self.equipped.get(&slot) {
            let triggers = existing.extract_muscle_memory();
            self.muscle_memory.insert(slot, triggers);
        }

        // Equip the new equipment
        self.equipped.insert(slot, equipment);

        Ok(())
    }

    /// Unequip an equipment
    pub async fn unequip(&mut self, slot: EquipmentSlot) -> Result<Option<Box<dyn Equipment>>> {
        // Extract muscle memory before unequipping
        if let Some(equipment) = self.equipped.get(&slot) {
            let triggers = equipment.extract_muscle_memory();
            self.muscle_memory.insert(slot, triggers);
        }

        Ok(self.equipped.remove(&slot))
    }

    /// Get equipped equipment
    pub fn get_equipped(&self, slot: EquipmentSlot) -> Option<&dyn Equipment> {
        self.equipped.get(&slot).map(|e| e.as_ref())
    }

    /// Check if equipment is equipped
    pub fn is_equipped(&self, slot: EquipmentSlot) -> bool {
        self.equipped.contains_key(&slot)
    }

    /// Get all equipped slots
    pub fn equipped_slots(&self) -> Vec<EquipmentSlot> {
        self.equipped.keys().copied().collect()
    }

    /// Get muscle memory triggers for a slot
    pub fn muscle_memory_triggers(&self, slot: EquipmentSlot) -> &[MuscleMemoryTrigger] {
        self.muscle_memory.get(&slot)
            .map(|v| v.as_slice())
            .unwrap_or(&[])
    }

    /// Perform cost/benefit analysis for equipping equipment
    pub fn should_equip(&self, equipment: &dyn Equipment, context: &ProcessingContext) -> bool {
        let cost = equipment.cost();
        let benefit = self.estimate_benefit(equipment, context);

        // Simple cost/benefit: benefit must outweigh cost
        benefit > cost.memory_mb * cost.cpu_percent
    }

    /// Estimate benefit of equipment
    fn estimate_benefit(&self, equipment: &dyn Equipment, _context: &ProcessingContext) -> f64 {
        // Check muscle memory for historical benefit
        if let Some(triggers) = self.muscle_memory.get(&equipment.slot()) {
            let avg_confidence: f64 = triggers.iter()
                .map(|t| t.confidence)
                .sum::<f64>() / triggers.len() as f64;

            return avg_confidence * 100.0;
        }

        // Default benefit based on slot
        match equipment.slot() {
            EquipmentSlot::Memory => 80.0,
            EquipmentSlot::Reasoning => 90.0,
            EquipmentSlot::Consensus => 70.0,
            EquipmentSlot::Spreadsheet => 85.0,
            EquipmentSlot::Distillation => 60.0,
            EquipmentSlot::Coordination => 75.0,
        }
    }

    /// Auto-unequip expensive equipment
    pub async fn auto_unequip_expensive(&mut self) -> Vec<EquipmentSlot> {
        let mut unequipped = Vec::new();

        for (slot, equipment) in &self.equipped {
            let cost = equipment.cost();
            if (cost.memory_mb > self.cost_thresholds.max_memory_mb
                || cost.cpu_percent > self.cost_thresholds.max_cpu_percent)
                && equipment.should_unequip()
            {
                unequipped.push(*slot);
            }
        }

        for slot in &unequipped {
            self.unequip(*slot).await.ok();
        }

        unequipped
    }

    /// Ensure required equipment is equipped
    pub async fn ensure_equipped(&mut self, slots: &[EquipmentSlot]) -> Result<()> {
        for slot in slots {
            if !self.is_equipped(*slot) {
                // Check muscle memory for auto-equip triggers
                if let Some(triggers) = self.muscle_memory.get(slot) {
                    for trigger in triggers {
                        if trigger.confidence > 0.8 {
                            return Err(AgentError::EquipmentShouldBeEquipped(*slot));
                        }
                    }
                }
            }
        }
        Ok(())
    }
}

impl Default for EquipmentManager {
    fn default() -> Self {
        Self::new()
    }
}

/// Context for cost/benefit analysis
#[derive(Debug, Clone)]
pub struct ProcessingContext {
    pub agent_id: String,
    pub message_count: u64,
    pub avg_processing_time_ms: f64,
    pub error_rate: f64,
}

/// Example: Simple Memory Equipment
pub struct SimpleMemoryEquipment {
    name: String,
    #[allow(dead_code)]
    memory: HashMap<String, serde_json::Value>,
    cost: EquipmentCost,
}

impl Default for SimpleMemoryEquipment {
    fn default() -> Self {
        Self::new()
    }
}

impl SimpleMemoryEquipment {
    pub fn new() -> Self {
        Self {
            name: "SimpleMemory".to_string(),
            memory: HashMap::new(),
            cost: EquipmentCost {
                memory_mb: 1.0,
                cpu_percent: 5.0,
                load_time_ms: 5,
                execution_overhead_ms: 1,
            },
        }
    }
}

#[async_trait]
impl Equipment for SimpleMemoryEquipment {
    fn slot(&self) -> EquipmentSlot {
        EquipmentSlot::Memory
    }

    fn name(&self) -> &str {
        &self.name
    }

    async fn process(&self, _payload: TriggerPayload) -> Result<String> {
        Ok("Memory processed".to_string())
    }

    fn cost(&self) -> EquipmentCost {
        self.cost.clone()
    }

    fn extract_muscle_memory(&self) -> Vec<MuscleMemoryTrigger> {
        let now: SerializableInstant = std::time::Instant::now().into();
        vec![
            MuscleMemoryTrigger {
                id: "simple_memory_retrieval".to_string(),
                equipment_slot: EquipmentSlot::Memory,
                condition: TriggerCondition::Pattern {
                    pattern: "data_retrieval".to_string(),
                    min_frequency: 5,
                },
                confidence: 0.85,
                frequency: 5,
                last_triggered: now.clone(),
                first_learned: now,
                trigger_count: 1,
                avg_benefit: 85.0,
            }
        ]
    }

    fn should_unequip(&self) -> bool {
        false
    }
}

/// Reasoning Equipment - decision making and inference
pub struct ReasoningEngine {
    name: String,
    #[allow(dead_code)]
    model: String,
    cost: EquipmentCost,
}

impl Default for ReasoningEngine {
    fn default() -> Self {
        Self::new()
    }
}

impl ReasoningEngine {
    pub fn new() -> Self {
        Self {
            name: "EscalationEngine".to_string(),
            model: "deepseek-reasoner".to_string(),
            cost: EquipmentCost {
                memory_mb: 3.0,
                cpu_percent: 30.0,
                load_time_ms: 20,
                execution_overhead_ms: 50,
            },
        }
    }
}

#[async_trait]
impl Equipment for ReasoningEngine {
    fn slot(&self) -> EquipmentSlot {
        EquipmentSlot::Reasoning
    }

    fn name(&self) -> &str {
        &self.name
    }

    async fn process(&self, payload: TriggerPayload) -> Result<String> {
        // Simulate reasoning process
        Ok(format!("Reasoned: {:?}", payload))
    }

    fn cost(&self) -> EquipmentCost {
        self.cost.clone()
    }

    fn extract_muscle_memory(&self) -> Vec<MuscleMemoryTrigger> {
        let now: SerializableInstant = std::time::Instant::now().into();
        vec![
            MuscleMemoryTrigger {
                id: "reasoning_complexity".to_string(),
                equipment_slot: EquipmentSlot::Reasoning,
                condition: TriggerCondition::Complexity {
                    min_complexity: 0.7,
                },
                confidence: 0.90,
                frequency: 3,
                last_triggered: now.clone(),
                first_learned: now,
                trigger_count: 1,
                avg_benefit: 90.0,
            }
        ]
    }

    fn should_unequip(&self) -> bool {
        false
    }
}

/// Consensus Equipment - multi-agent agreement
pub struct TripartiteConsensus {
    name: String,
    #[allow(dead_code)]
    agents: Vec<String>,
    cost: EquipmentCost,
}

impl Default for TripartiteConsensus {
    fn default() -> Self {
        Self::new()
    }
}

impl TripartiteConsensus {
    pub fn new() -> Self {
        Self {
            name: "TripartiteConsensus".to_string(),
            agents: Vec::new(),
            cost: EquipmentCost {
                memory_mb: 2.0,
                cpu_percent: 15.0,
                load_time_ms: 10,
                execution_overhead_ms: 30,
            },
        }
    }
}

#[async_trait]
impl Equipment for TripartiteConsensus {
    fn slot(&self) -> EquipmentSlot {
        EquipmentSlot::Consensus
    }

    fn name(&self) -> &str {
        &self.name
    }

    async fn process(&self, _payload: TriggerPayload) -> Result<String> {
        Ok("Consensus reached".to_string())
    }

    fn cost(&self) -> EquipmentCost {
        self.cost.clone()
    }

    fn extract_muscle_memory(&self) -> Vec<MuscleMemoryTrigger> {
        let now: SerializableInstant = std::time::Instant::now().into();
        vec![
            MuscleMemoryTrigger {
                id: "consensus_multi_agent".to_string(),
                equipment_slot: EquipmentSlot::Consensus,
                condition: TriggerCondition::Pattern {
                    pattern: "multi_agent_decision".to_string(),
                    min_frequency: 3,
                },
                confidence: 0.75,
                frequency: 3,
                last_triggered: now.clone(),
                first_learned: now,
                trigger_count: 1,
                avg_benefit: 75.0,
            }
        ]
    }

    fn should_unequip(&self) -> bool {
        false
    }
}

/// Spreadsheet Equipment - cell integration
pub struct TileInterface {
    name: String,
    #[allow(dead_code)]
    cell_refs: Vec<String>,
    cost: EquipmentCost,
}

impl Default for TileInterface {
    fn default() -> Self {
        Self::new()
    }
}

impl TileInterface {
    pub fn new() -> Self {
        Self {
            name: "TileInterface".to_string(),
            cell_refs: Vec::new(),
            cost: EquipmentCost {
                memory_mb: 1.5,
                cpu_percent: 10.0,
                load_time_ms: 8,
                execution_overhead_ms: 5,
            },
        }
    }
}

#[async_trait]
impl Equipment for TileInterface {
    fn slot(&self) -> EquipmentSlot {
        EquipmentSlot::Spreadsheet
    }

    fn name(&self) -> &str {
        &self.name
    }

    async fn process(&self, payload: TriggerPayload) -> Result<String> {
        Ok(format!("Cell updated: {:?}", payload))
    }

    fn cost(&self) -> EquipmentCost {
        self.cost.clone()
    }

    fn extract_muscle_memory(&self) -> Vec<MuscleMemoryTrigger> {
        let now: SerializableInstant = std::time::Instant::now().into();
        vec![
            MuscleMemoryTrigger {
                id: "spreadsheet_cell_update".to_string(),
                equipment_slot: EquipmentSlot::Spreadsheet,
                condition: TriggerCondition::Pattern {
                    pattern: "cell_update".to_string(),
                    min_frequency: 10,
                },
                confidence: 0.95,
                frequency: 10,
                last_triggered: now.clone(),
                first_learned: now,
                trigger_count: 1,
                avg_benefit: 95.0,
            }
        ]
    }

    fn should_unequip(&self) -> bool {
        false
    }
}

/// Distillation Equipment - model compression
pub struct Quantizer {
    name: String,
    #[allow(dead_code)]
    compression_ratio: f32,
    cost: EquipmentCost,
}

impl Default for Quantizer {
    fn default() -> Self {
        Self::new()
    }
}

impl Quantizer {
    pub fn new() -> Self {
        Self {
            name: "Quantizer".to_string(),
            compression_ratio: 0.5,
            cost: EquipmentCost {
                memory_mb: 2.5,
                cpu_percent: 20.0,
                load_time_ms: 15,
                execution_overhead_ms: 25,
            },
        }
    }
}

#[async_trait]
impl Equipment for Quantizer {
    fn slot(&self) -> EquipmentSlot {
        EquipmentSlot::Distillation
    }

    fn name(&self) -> &str {
        &self.name
    }

    async fn process(&self, _payload: TriggerPayload) -> Result<String> {
        Ok("Model distilled".to_string())
    }

    fn cost(&self) -> EquipmentCost {
        self.cost.clone()
    }

    fn extract_muscle_memory(&self) -> Vec<MuscleMemoryTrigger> {
        let now: SerializableInstant = std::time::Instant::now().into();
        vec![
            MuscleMemoryTrigger {
                id: "distillation_model_size".to_string(),
                equipment_slot: EquipmentSlot::Distillation,
                condition: TriggerCondition::Performance {
                    metric: "model_size".to_string(),
                    threshold: 100.0,
                    comparison: ComparisonOp::LessThan,
                },
                confidence: 0.70,
                frequency: 2,
                last_triggered: now.clone(),
                first_learned: now,
                trigger_count: 1,
                avg_benefit: 70.0,
            }
        ]
    }

    fn should_unequip(&self) -> bool {
        false
    }
}

/// Coordination Equipment - multi-agent orchestration
pub struct SwarmCoordinator {
    name: String,
    #[allow(dead_code)]
    swarm_size: usize,
    cost: EquipmentCost,
}

impl Default for SwarmCoordinator {
    fn default() -> Self {
        Self::new()
    }
}

impl SwarmCoordinator {
    pub fn new() -> Self {
        Self {
            name: "SwarmCoordinator".to_string(),
            swarm_size: 10,
            cost: EquipmentCost {
                memory_mb: 2.0,
                cpu_percent: 25.0,
                load_time_ms: 12,
                execution_overhead_ms: 20,
            },
        }
    }
}

#[async_trait]
impl Equipment for SwarmCoordinator {
    fn slot(&self) -> EquipmentSlot {
        EquipmentSlot::Coordination
    }

    fn name(&self) -> &str {
        &self.name
    }

    async fn process(&self, _payload: TriggerPayload) -> Result<String> {
        Ok("Swarm coordinated".to_string())
    }

    fn cost(&self) -> EquipmentCost {
        self.cost.clone()
    }

    fn extract_muscle_memory(&self) -> Vec<MuscleMemoryTrigger> {
        let now: SerializableInstant = std::time::Instant::now().into();
        vec![
            MuscleMemoryTrigger {
                id: "coordination_parallel".to_string(),
                equipment_slot: EquipmentSlot::Coordination,
                condition: TriggerCondition::Pattern {
                    pattern: "parallel_processing".to_string(),
                    min_frequency: 7,
                },
                confidence: 0.82,
                frequency: 7,
                last_triggered: now.clone(),
                first_learned: now,
                trigger_count: 1,
                avg_benefit: 82.0,
            }
        ]
    }

    fn should_unequip(&self) -> bool {
        false
    }
}
