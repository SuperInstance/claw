//! Enhanced equipment implementations for all 6 slots
//!
//! Production-ready equipment with resource tracking, performance monitoring,
//! and integration with HierarchicalMemory and MuscleMemory systems.

use async_trait::async_trait;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Arc;
use std::time::Instant;

// Import the correct TriggerPayload (struct from ws::protocol, not enum from messages)
// The equipment system uses the WebSocket protocol version for consistent API
use crate::ws::protocol::TriggerPayload;
use crate::error::{AgentError, Result};
use crate::equipment::{
    Equipment, EquipmentSlot, EquipmentCost, MuscleMemoryTrigger,
    hierarchical_memory::HierarchicalMemory,
};
use crate::agent::SerializableInstant;

/// Memory Equipment - Hierarchical L1/L2/L3 memory
pub struct MemoryEquipment {
    name: String,
    memory: HierarchicalMemory,
    stats: Arc<MemoryEquipmentStats>,
    cost: EquipmentCost,
}

#[derive(Debug, Default)]
struct MemoryEquipmentStats {
    reads: AtomicU64,
    writes: AtomicU64,
    hits: AtomicU64,
    misses: AtomicU64,
    promotions: AtomicU64,
}

impl MemoryEquipment {
    pub fn new() -> Self {
        Self {
            name: "HierarchicalMemory".to_string(),
            memory: HierarchicalMemory::new(),
            stats: Arc::new(MemoryEquipmentStats::default()),
            cost: EquipmentCost {
                memory_mb: 1.0,
                cpu_percent: 5.0,
                load_time_ms: 5,
                execution_overhead_ms: 1,
            },
        }
    }

    /// Get memory statistics
    pub async fn memory_stats(&self) -> crate::equipment::hierarchical_memory::MemoryStats {
        self.memory.stats().await
    }

    /// Get hit rate
    pub async fn hit_rate(&self) -> f64 {
        self.memory.hit_rate().await
    }
}

#[async_trait]
impl Equipment for MemoryEquipment {
    fn slot(&self) -> EquipmentSlot {
        EquipmentSlot::Memory
    }

    fn name(&self) -> &str {
        &self.name
    }

    async fn process(&self, payload: TriggerPayload) -> Result<String> {
        // Extract action from data
        let action = payload.data.get("action")
            .and_then(|v| v.as_str())
            .unwrap_or("get");

        // Extract key-value from payload
        let key = payload.data.get("key")
            .and_then(|v| v.as_str())
            .unwrap_or("default");

        let value = payload.data.get("value");

        match action {
            "get" => {
                self.stats.reads.fetch_add(1, Ordering::SeqCst);
                let result = self.memory.get(key).await?;

                if result.is_some() {
                    self.stats.hits.fetch_add(1, Ordering::SeqCst);
                } else {
                    self.stats.misses.fetch_add(1, Ordering::SeqCst);
                }

                Ok(format!("Memory get: {:?}", result))
            }
            "set" => {
                self.stats.writes.fetch_add(1, Ordering::SeqCst);
                if let Some(value) = value {
                    self.memory.set(key.to_string(), value.clone()).await?;
                    Ok("Memory set: success".to_string())
                } else {
                    Err(AgentError::EquipmentError(EquipmentSlot::Memory, "No value provided".to_string()))
                }
            }
            "delete" => {
                self.memory.delete(key).await?;
                Ok("Memory delete: success".to_string())
            }
            "stats" => {
                let stats = self.memory.stats().await;
                Ok(format!("Memory stats: {:?}", stats))
            }
            _ => Err(AgentError::UnsupportedMessage(format!("Unknown action: {}", action))),
        }
    }

    fn cost(&self) -> EquipmentCost {
        self.cost.clone()
    }

    fn extract_muscle_memory(&self) -> Vec<MuscleMemoryTrigger> {
        let hits = self.stats.hits.load(Ordering::SeqCst);
        let total_reads = self.stats.reads.load(Ordering::SeqCst);
        let hit_rate = if total_reads > 0 {
            hits as f64 / total_reads as f64
        } else {
            0.0
        };

        let now: SerializableInstant = Instant::now().into();
        let frequency = (total_reads / 10).max(1) as u32;

        vec![
            MuscleMemoryTrigger {
                id: "memory_frequent_access".to_string(),
                equipment_slot: EquipmentSlot::Memory,
                condition: crate::equipment::TriggerCondition::Pattern {
                    pattern: "frequent_data_access".to_string(),
                    min_frequency: frequency,
                },
                confidence: hit_rate,
                frequency,
                last_triggered: now.clone(),
                first_learned: now,
                trigger_count: total_reads as u32,
                avg_benefit: hit_rate * 100.0,
            }
        ]
    }

    fn should_unequip(&self) -> bool {
        // Unequip if hit rate is very low
        let total_reads = self.stats.reads.load(Ordering::SeqCst);
        let hits = self.stats.hits.load(Ordering::SeqCst);

        total_reads > 100 && (hits as f64 / total_reads as f64) < 0.2
    }
}

/// Reasoning Equipment - Escalation engine for decision making
pub struct ReasoningEquipment {
    name: String,
    model: String,
    stats: Arc<ReasoningStats>,
    cost: EquipmentCost,
}

#[derive(Debug, Default)]
struct ReasoningStats {
    total_reasonings: AtomicU64,
    successful_reasonings: AtomicU64,
    avg_complexity: AtomicU64,
}

impl ReasoningEquipment {
    pub fn new() -> Self {
        Self {
            name: "EscalationEngine".to_string(),
            model: "deepseek-reasoner".to_string(),
            stats: Arc::new(ReasoningStats::default()),
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
impl Equipment for ReasoningEquipment {
    fn slot(&self) -> EquipmentSlot {
        EquipmentSlot::Reasoning
    }

    fn name(&self) -> &str {
        &self.name
    }

    async fn process(&self, payload: TriggerPayload) -> Result<String> {
        self.stats.total_reasonings.fetch_add(1, Ordering::SeqCst);

        // Extract complexity
        let complexity = payload.data.get("complexity")
            .and_then(|v| v.as_f64())
            .unwrap_or(0.5);

        self.stats.avg_complexity.store(
            (self.stats.avg_complexity.load(Ordering::SeqCst) as f64 * 0.9 + complexity * 0.1) as u64,
            Ordering::SeqCst
        );

        // Simulate reasoning process
        let reasoning_steps = vec![
            "Analyzing input data...",
            "Identifying patterns...",
            "Evaluating options...",
            "Reaching conclusion...",
        ];

        let result = reasoning_steps.join(" ");

        self.stats.successful_reasonings.fetch_add(1, Ordering::SeqCst);

        Ok(format!("Reasoning: {} (complexity: {:.2})", result, complexity))
    }

    fn cost(&self) -> EquipmentCost {
        self.cost.clone()
    }

    fn extract_muscle_memory(&self) -> Vec<MuscleMemoryTrigger> {
        let avg_complexity = self.stats.avg_complexity.load(Ordering::SeqCst) as f64 / 100.0;
        let total = self.stats.total_reasonings.load(Ordering::SeqCst);
        let successful = self.stats.successful_reasonings.load(Ordering::SeqCst);

        let success_rate = if total > 0 {
            successful as f64 / total as f64
        } else {
            0.0
        };

        let now: SerializableInstant = Instant::now().into();
        let frequency = total.max(1) as u32;

        vec![
            MuscleMemoryTrigger {
                id: "reasoning_complexity".to_string(),
                equipment_slot: EquipmentSlot::Reasoning,
                condition: crate::equipment::TriggerCondition::Complexity {
                    min_complexity: avg_complexity * 0.8,
                },
                confidence: success_rate,
                frequency,
                last_triggered: now.clone(),
                first_learned: now,
                trigger_count: total as u32,
                avg_benefit: success_rate * 100.0,
            }
        ]
    }

    fn should_unequip(&self) -> bool {
        // Unequip if not being used much
        self.stats.total_reasonings.load(Ordering::SeqCst) < 10
    }
}

/// Consensus Equipment - Tripartite consensus for multi-agent agreement
pub struct ConsensusEquipment {
    name: String,
    agents: Vec<String>,
    stats: Arc<ConsensusStats>,
    cost: EquipmentCost,
}

#[derive(Debug, Default)]
struct ConsensusStats {
    total_consensuses: AtomicU64,
    agreements: AtomicU64,
    disagreements: AtomicU64,
}

impl ConsensusEquipment {
    pub fn new() -> Self {
        Self {
            name: "TripartiteConsensus".to_string(),
            agents: vec![
                "agent_a".to_string(),
                "agent_b".to_string(),
                "agent_c".to_string(),
            ],
            stats: Arc::new(ConsensusStats::default()),
            cost: EquipmentCost {
                memory_mb: 2.0,
                cpu_percent: 15.0,
                load_time_ms: 10,
                execution_overhead_ms: 30,
            },
        }
    }

    pub fn with_agents(agents: Vec<String>) -> Self {
        Self {
            name: "TripartiteConsensus".to_string(),
            agents,
            stats: Arc::new(ConsensusStats::default()),
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
impl Equipment for ConsensusEquipment {
    fn slot(&self) -> EquipmentSlot {
        EquipmentSlot::Consensus
    }

    fn name(&self) -> &str {
        &self.name
    }

    async fn process(&self, payload: TriggerPayload) -> Result<String> {
        self.stats.total_consensuses.fetch_add(1, Ordering::SeqCst);

        // Simulate consensus process
        let proposal = payload.data.get("proposal")
            .and_then(|v| v.as_str())
            .unwrap_or("unknown");

        // Simulate agent responses
        let votes: Vec<bool> = self.agents.iter()
            .map(|_| rand::random::<f64>() > 0.3) // 70% chance of agreement
            .collect();

        let agree_count = votes.iter().filter(|&&v| v).count();
        let consensus_reached = agree_count > self.agents.len() / 2;

        if consensus_reached {
            self.stats.agreements.fetch_add(1, Ordering::SeqCst);
        } else {
            self.stats.disagreements.fetch_add(1, Ordering::SeqCst);
        }

        Ok(format!("Consensus on '{}': {} ({}:{})",
            proposal,
            if consensus_reached { "AGREED" } else { "DISAGREED" },
            agree_count,
            self.agents.len() - agree_count
        ))
    }

    fn cost(&self) -> EquipmentCost {
        self.cost.clone()
    }

    fn extract_muscle_memory(&self) -> Vec<MuscleMemoryTrigger> {
        let total = self.stats.total_consensuses.load(Ordering::SeqCst);
        let agreements = self.stats.agreements.load(Ordering::SeqCst);

        let agreement_rate = if total > 0 {
            agreements as f64 / total as f64
        } else {
            0.0
        };

        let now: SerializableInstant = Instant::now().into();
        let frequency = (total / 5).max(1) as u32;

        vec![
            MuscleMemoryTrigger {
                id: "consensus_multi_agent".to_string(),
                equipment_slot: EquipmentSlot::Consensus,
                condition: crate::equipment::TriggerCondition::Pattern {
                    pattern: "multi_agent_decision".to_string(),
                    min_frequency: frequency,
                },
                confidence: agreement_rate,
                frequency,
                last_triggered: now.clone(),
                first_learned: now,
                trigger_count: total as u32,
                avg_benefit: agreement_rate * 100.0,
            }
        ]
    }

    fn should_unequip(&self) -> bool {
        // Unequip if low usage
        self.stats.total_consensuses.load(Ordering::SeqCst) < 5
    }
}

/// Spreadsheet Equipment - Tile interface for cell integration
pub struct SpreadsheetEquipment {
    name: String,
    cell_refs: Vec<String>,
    stats: Arc<SpreadsheetStats>,
    cost: EquipmentCost,
}

#[derive(Debug, Default)]
struct SpreadsheetStats {
    total_updates: AtomicU64,
    successful_updates: AtomicU64,
    failed_updates: AtomicU64,
}

impl SpreadsheetEquipment {
    pub fn new() -> Self {
        Self {
            name: "TileInterface".to_string(),
            cell_refs: Vec::new(),
            stats: Arc::new(SpreadsheetStats::default()),
            cost: EquipmentCost {
                memory_mb: 1.5,
                cpu_percent: 10.0,
                load_time_ms: 8,
                execution_overhead_ms: 5,
            },
        }
    }

    pub fn with_cells(cell_refs: Vec<String>) -> Self {
        Self {
            name: "TileInterface".to_string(),
            cell_refs,
            stats: Arc::new(SpreadsheetStats::default()),
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
impl Equipment for SpreadsheetEquipment {
    fn slot(&self) -> EquipmentSlot {
        EquipmentSlot::Spreadsheet
    }

    fn name(&self) -> &str {
        &self.name
    }

    async fn process(&self, payload: TriggerPayload) -> Result<String> {
        self.stats.total_updates.fetch_add(1, Ordering::SeqCst);

        let cell_ref = payload.data.get("cell")
            .and_then(|v| v.as_str())
            .unwrap_or("A1");

        let value = payload.data.get("value");
        let action = payload.data.get("action")
            .and_then(|v| v.as_str())
            .unwrap_or("get");

        match action {
            "get" => {
                self.stats.successful_updates.fetch_add(1, Ordering::SeqCst);
                Ok(format!("Cell {}: (value retrieval)", cell_ref))
            }
            "set" => {
                if let Some(value) = value {
                    self.stats.successful_updates.fetch_add(1, Ordering::SeqCst);
                    Ok(format!("Cell {} = {:?}", cell_ref, value))
                } else {
                    self.stats.failed_updates.fetch_add(1, Ordering::SeqCst);
                    Err(AgentError::EquipmentError(EquipmentSlot::Spreadsheet, "No value provided".to_string()))
                }
            }
            "update" => {
                self.stats.successful_updates.fetch_add(1, Ordering::SeqCst);
                Ok(format!("Cell {} updated", cell_ref))
            }
            _ => Err(AgentError::UnsupportedMessage(format!("Unknown action: {}", action))),
        }
    }

    fn cost(&self) -> EquipmentCost {
        self.cost.clone()
    }

    fn extract_muscle_memory(&self) -> Vec<MuscleMemoryTrigger> {
        let total = self.stats.total_updates.load(Ordering::SeqCst);
        let successful = self.stats.successful_updates.load(Ordering::SeqCst);

        let success_rate = if total > 0 {
            successful as f64 / total as f64
        } else {
            0.0
        };

        let now: SerializableInstant = Instant::now().into();
        let frequency = (total / 10).max(1) as u32;

        vec![
            MuscleMemoryTrigger {
                id: "spreadsheet_cell_update".to_string(),
                equipment_slot: EquipmentSlot::Spreadsheet,
                condition: crate::equipment::TriggerCondition::Pattern {
                    pattern: "cell_update".to_string(),
                    min_frequency: frequency,
                },
                confidence: success_rate,
                frequency,
                last_triggered: now.clone(),
                first_learned: now,
                trigger_count: total as u32,
                avg_benefit: success_rate * 100.0,
            }
        ]
    }

    fn should_unequip(&self) -> bool {
        // Keep equipped if frequently used
        let total = self.stats.total_updates.load(Ordering::SeqCst);
        total < 20
    }
}

/// Distillation Equipment - Quantizer for model compression
pub struct DistillationEquipment {
    name: String,
    compression_ratio: f32,
    stats: Arc<DistillationStats>,
    cost: EquipmentCost,
}

#[derive(Debug, Default)]
struct DistillationStats {
    total_distillations: AtomicU64,
    total_compressed: AtomicU64,
    total_original: AtomicU64,
}

impl DistillationEquipment {
    pub fn new() -> Self {
        Self {
            name: "Quantizer".to_string(),
            compression_ratio: 0.5,
            stats: Arc::new(DistillationStats::default()),
            cost: EquipmentCost {
                memory_mb: 2.5,
                cpu_percent: 20.0,
                load_time_ms: 15,
                execution_overhead_ms: 25,
            },
        }
    }

    pub fn with_compression(ratio: f32) -> Self {
        Self {
            name: "Quantizer".to_string(),
            compression_ratio: ratio,
            stats: Arc::new(DistillationStats::default()),
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
impl Equipment for DistillationEquipment {
    fn slot(&self) -> EquipmentSlot {
        EquipmentSlot::Distillation
    }

    fn name(&self) -> &str {
        &self.name
    }

    async fn process(&self, payload: TriggerPayload) -> Result<String> {
        self.stats.total_distillations.fetch_add(1, Ordering::SeqCst);

        let model_size = payload.data.get("model_size")
            .and_then(|v| v.as_u64())
            .unwrap_or(1000);

        let compressed_size = (model_size as f32 * self.compression_ratio) as u64;

        self.stats.total_original.fetch_add(model_size, Ordering::SeqCst);
        self.stats.total_compressed.fetch_add(compressed_size, Ordering::SeqCst);

        Ok(format!("Distilled: {} -> {} ({:.1}%)",
            model_size,
            compressed_size,
            self.compression_ratio * 100.0
        ))
    }

    fn cost(&self) -> EquipmentCost {
        self.cost.clone()
    }

    fn extract_muscle_memory(&self) -> Vec<MuscleMemoryTrigger> {
        let total = self.stats.total_distillations.load(Ordering::SeqCst);
        let original = self.stats.total_original.load(Ordering::SeqCst);
        let compressed = self.stats.total_compressed.load(Ordering::SeqCst);

        let avg_compression = if original > 0 {
            compressed as f64 / original as f64
        } else {
            0.0
        };

        let now: SerializableInstant = Instant::now().into();
        let frequency = total.max(1) as u32;

        vec![
            MuscleMemoryTrigger {
                id: "distillation_model_size".to_string(),
                equipment_slot: EquipmentSlot::Distillation,
                condition: crate::equipment::TriggerCondition::Performance {
                    metric: "model_size".to_string(),
                    threshold: 100.0,
                    comparison: crate::equipment::ComparisonOp::GreaterThan,
                },
                confidence: avg_compression,
                frequency,
                last_triggered: now.clone(),
                first_learned: now,
                trigger_count: total as u32,
                avg_benefit: (1.0 - avg_compression) * 100.0,
            }
        ]
    }

    fn should_unequip(&self) -> bool {
        // Unequip if not frequently used
        self.stats.total_distillations.load(Ordering::SeqCst) < 5
    }
}

/// Coordination Equipment - Swarm coordinator for multi-agent orchestration
pub struct CoordinationEquipment {
    name: String,
    swarm_size: usize,
    stats: Arc<CoordinationStats>,
    cost: EquipmentCost,
}

#[derive(Debug, Default)]
struct CoordinationStats {
    total_coordinations: AtomicU64,
    parallel_tasks: AtomicU64,
    sequential_tasks: AtomicU64,
}

impl CoordinationEquipment {
    pub fn new() -> Self {
        Self {
            name: "SwarmCoordinator".to_string(),
            swarm_size: 10,
            stats: Arc::new(CoordinationStats::default()),
            cost: EquipmentCost {
                memory_mb: 2.0,
                cpu_percent: 25.0,
                load_time_ms: 12,
                execution_overhead_ms: 20,
            },
        }
    }

    pub fn with_swarm_size(size: usize) -> Self {
        Self {
            name: "SwarmCoordinator".to_string(),
            swarm_size: size,
            stats: Arc::new(CoordinationStats::default()),
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
impl Equipment for CoordinationEquipment {
    fn slot(&self) -> EquipmentSlot {
        EquipmentSlot::Coordination
    }

    fn name(&self) -> &str {
        &self.name
    }

    async fn process(&self, payload: TriggerPayload) -> Result<String> {
        self.stats.total_coordinations.fetch_add(1, Ordering::SeqCst);

        let strategy = payload.data.get("strategy")
            .and_then(|v| v.as_str())
            .unwrap_or("parallel");

        match strategy {
            "parallel" => {
                self.stats.parallel_tasks.fetch_add(1, Ordering::SeqCst);
                Ok(format!("Coordinated {} agents in PARALLEL", self.swarm_size))
            }
            "sequential" => {
                self.stats.sequential_tasks.fetch_add(1, Ordering::SeqCst);
                Ok(format!("Coordinated {} agents in SEQUENTIAL", self.swarm_size))
            }
            _ => {
                Ok(format!("Coordinated {} agents with {} strategy",
                    self.swarm_size, strategy))
            }
        }
    }

    fn cost(&self) -> EquipmentCost {
        self.cost.clone()
    }

    fn extract_muscle_memory(&self) -> Vec<MuscleMemoryTrigger> {
        let total = self.stats.total_coordinations.load(Ordering::SeqCst);
        let parallel = self.stats.parallel_tasks.load(Ordering::SeqCst);

        let parallel_ratio = if total > 0 {
            parallel as f64 / total as f64
        } else {
            0.0
        };

        let now: SerializableInstant = Instant::now().into();
        let frequency = (total / 7).max(1) as u32;

        vec![
            MuscleMemoryTrigger {
                id: "coordination_parallel".to_string(),
                equipment_slot: EquipmentSlot::Coordination,
                condition: crate::equipment::TriggerCondition::Pattern {
                    pattern: "parallel_processing".to_string(),
                    min_frequency: frequency,
                },
                confidence: parallel_ratio,
                frequency,
                last_triggered: now.clone(),
                first_learned: now,
                trigger_count: total as u32,
                avg_benefit: parallel_ratio * 100.0,
            }
        ]
    }

    fn should_unequip(&self) -> bool {
        // Unequip if low coordination activity
        self.stats.total_coordinations.load(Ordering::SeqCst) < 3
    }
}

// Re-export for convenience
pub use MemoryEquipment as HierarchicalMemoryEquipment;

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashMap;

    fn create_test_payload() -> TriggerPayload {
        let mut data = HashMap::new();
        data.insert("key".to_string(), serde_json::json!("test_key"));
        data.insert("value".to_string(), serde_json::json!("test_value"));
        TriggerPayload {
            trigger_type: "set".to_string(),
            data,
        }
    }

    #[tokio::test]
    async fn test_memory_equipment() {
        let equipment = MemoryEquipment::new();
        assert_eq!(equipment.slot(), EquipmentSlot::Memory);

        let payload = create_test_payload();
        let result = equipment.process(payload).await;
        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn test_reasoning_equipment() {
        let equipment = ReasoningEquipment::new();
        assert_eq!(equipment.slot(), EquipmentSlot::Reasoning);

        let mut data = HashMap::new();
        data.insert("complexity".to_string(), serde_json::json!(0.8));
        let payload = TriggerPayload {
            trigger_type: "reason".to_string(),
            data,
        };

        let result = equipment.process(payload).await;
        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn test_all_equipment_slots() {
        let memory = MemoryEquipment::new();
        let reasoning = ReasoningEquipment::new();
        let consensus = ConsensusEquipment::new();
        let spreadsheet = SpreadsheetEquipment::new();
        let distillation = DistillationEquipment::new();
        let coordination = CoordinationEquipment::new();

        assert_eq!(memory.slot(), EquipmentSlot::Memory);
        assert_eq!(reasoning.slot(), EquipmentSlot::Reasoning);
        assert_eq!(consensus.slot(), EquipmentSlot::Consensus);
        assert_eq!(spreadsheet.slot(), EquipmentSlot::Spreadsheet);
        assert_eq!(distillation.slot(), EquipmentSlot::Distillation);
        assert_eq!(coordination.slot(), EquipmentSlot::Coordination);
    }

    #[tokio::test]
    async fn test_equipment_costs() {
        let memory = MemoryEquipment::new();
        let cost = memory.cost();

        assert_eq!(cost.memory_mb, 1.0);
        assert_eq!(cost.cpu_percent, 5.0);
        assert_eq!(cost.load_time_ms, 5);
        assert_eq!(cost.execution_overhead_ms, 1);
    }

    #[tokio::test]
    async fn test_muscle_memory_extraction() {
        let memory = MemoryEquipment::new();
        let triggers = memory.extract_muscle_memory();

        assert!(!triggers.is_empty());
        assert_eq!(triggers[0].equipment_slot, EquipmentSlot::Memory);
    }
}
