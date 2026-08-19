//! Equipment slot module implementations.
//! Each slot gets a concrete module type with real `can_equip` / `should_unequip` logic
//! plus slot-specific configuration defaults.
//!
//! This module replaces the previous stubs in `equipment.rs` and provides
//! typed constructors for every `EquipmentSlot` variant.

use crate::common::*;
use crate::equipment::{
    Equipment, EquipmentCost, EquipmentBenefit, TriggerThresholds, EquipWhen, UnequipWhen,
    ResourceAvailability, ResourcePressure, CallTeacher,
};

// ---------------------------------------------------------------------------
// Memory slot
// ---------------------------------------------------------------------------

/// Create a Memory-slot equipment module (semantic + working memory persistence).
pub fn memory_module(name: impl Into<String>) -> Equipment {
    Equipment::new(
        name.into(),
        EquipmentSlot::Memory,
        "0.1.0".into(),
        "Semantic and working memory persistence".into(),
        EquipmentCost {
            memory_bytes: 50_000_000,    // ~50 MB per session
            cpu_percent: 2.0,
            latency_ms: 1.0,
            cost_per_use: 0.01,
            energy_joules: Some(0.5),
        },
        EquipmentBenefit {
            accuracy_boost: 0.05,
            speed_multiplier: 1.0,
            confidence_boost: Some(0.1),
            capability_gain: Some(vec!["MemoryPersistence".into()]),
            reliability_improvement: Some(0.2),
        },
        TriggerThresholds {
            equip_when: EquipWhen {
                confidence_below: Some(0.7),
                task_type_matches: Some(vec!["reasoning".into(), "learning".into()]),
                resource_available: Some(ResourceAvailability {
                    memory_bytes: Some(100_000_000),
                    cpu_percent: Some(5.0),
                }),
                user_explicit_request: None,
                frequency_above: Some(10.0),
            },
            unequip_when: UnequipWhen {
                confidence_above: Some(0.95),
                idle_duration_exceeds: Some(600),
                resource_pressure: Some(ResourcePressure {
                    memory_below: Some(20_000_000),
                    cpu_above: Some(90.0),
                }),
                cost_benefit_ratio: Some(5.0),
                user_explicit_request: Some(true),
            },
            call_teacher: None,
        },
        vec![Capability::MemoryPersistence],
        MuscleMemory {
            triggers: vec![],
            last_used: None,
            use_count: None,
            success_rate: None,
        },
    )
}

// ---------------------------------------------------------------------------
// Reasoning slot
// ---------------------------------------------------------------------------

/// Create a Reasoning-slot equipment module (chain-of-thought / escalation).
pub fn reasoning_module(name: impl Into<String>) -> Equipment {
    Equipment::new(
        name.into(),
        EquipmentSlot::Reasoning,
        "0.1.0".into(),
        "Deep reasoning and chain-of-thought".into(),
        EquipmentCost {
            memory_bytes: 200_000_000,
            cpu_percent: 15.0,
            latency_ms: 50.0,
            cost_per_use: 0.05,
            energy_joules: Some(2.0),
        },
        EquipmentBenefit {
            accuracy_boost: 0.2,
            speed_multiplier: 0.8,
            confidence_boost: Some(0.15),
            capability_gain: Some(vec!["Reasoning".into()]),
            reliability_improvement: Some(0.3),
        },
        TriggerThresholds {
            equip_when: EquipWhen {
                confidence_below: Some(0.6),
                task_type_matches: Some(vec!["complex_reasoning".into(), "planning".into()]),
                resource_available: Some(ResourceAvailability {
                    memory_bytes: Some(250_000_000),
                    cpu_percent: Some(20.0),
                }),
                user_explicit_request: None,
                frequency_above: None,
            },
            unequip_when: UnequipWhen {
                confidence_above: Some(0.9),
                idle_duration_exceeds: Some(1800),
                resource_pressure: Some(ResourcePressure {
                    memory_below: Some(50_000_000),
                    cpu_above: Some(85.0),
                }),
                cost_benefit_ratio: Some(3.0),
                user_explicit_request: Some(true),
            },
            call_teacher: Some(CallTeacher {
                min_confidence: 0.3,
                max_confidence: 0.5,
                teacher_equipment: "consensus_module".into(),
            }),
        },
        vec![Capability::Reasoning],
        MuscleMemory {
            triggers: vec![],
            last_used: None,
            use_count: None,
            success_rate: None,
        },
    )
}

// ---------------------------------------------------------------------------
// Consensus slot
// ---------------------------------------------------------------------------

/// Create a Consensus-slot equipment module (tripartite voting).
pub fn consensus_module(name: impl Into<String>) -> Equipment {
    Equipment::new(
        name.into(),
        EquipmentSlot::Consensus,
        "0.1.0".into(),
        "Tripartite consensus and voting".into(),
        EquipmentCost {
            memory_bytes: 30_000_000,
            cpu_percent: 10.0,
            latency_ms: 20.0,
            cost_per_use: 0.03,
            energy_joules: Some(1.0),
        },
        EquipmentBenefit {
            accuracy_boost: 0.15,
            speed_multiplier: 0.7,
            confidence_boost: Some(0.2),
            capability_gain: Some(vec!["Consensus".into()]),
            reliability_improvement: Some(0.4),
        },
        TriggerThresholds {
            equip_when: EquipWhen {
                confidence_below: Some(0.65),
                task_type_matches: Some(vec!["decision".into(), "arbitration".into()]),
                resource_available: Some(ResourceAvailability {
                    memory_bytes: Some(50_000_000),
                    cpu_percent: Some(15.0),
                }),
                user_explicit_request: None,
                frequency_above: None,
            },
            unequip_when: UnequipWhen {
                confidence_above: Some(0.92),
                idle_duration_exceeds: Some(900),
                resource_pressure: Some(ResourcePressure {
                    memory_below: Some(10_000_000),
                    cpu_above: Some(80.0),
                }),
                cost_benefit_ratio: Some(4.0),
                user_explicit_request: Some(true),
            },
            call_teacher: None,
        },
        vec![Capability::Consensus],
        MuscleMemory {
            triggers: vec![],
            last_used: None,
            use_count: None,
            success_rate: None,
        },
    )
}

// ---------------------------------------------------------------------------
// Spreadsheet slot
// ---------------------------------------------------------------------------

/// Create a Spreadsheet-slot equipment module (cell monitoring / UI bridge).
pub fn spreadsheet_module(name: impl Into<String>) -> Equipment {
    Equipment::new(
        name.into(),
        EquipmentSlot::Spreadsheet,
        "0.1.0".into(),
        "Spreadsheet cell monitoring and UI integration".into(),
        EquipmentCost {
            memory_bytes: 10_000_000,
            cpu_percent: 5.0,
            latency_ms: 5.0,
            cost_per_use: 0.01,
            energy_joules: Some(0.3),
        },
        EquipmentBenefit {
            accuracy_boost: 0.0,
            speed_multiplier: 1.2,
            confidence_boost: None,
            capability_gain: Some(vec!["SpreadsheetIntegration".into()]),
            reliability_improvement: Some(0.1),
        },
        TriggerThresholds {
            equip_when: EquipWhen {
                confidence_below: None,
                task_type_matches: Some(vec!["cell_update".into(), "sheet_change".into()]),
                resource_available: Some(ResourceAvailability {
                    memory_bytes: Some(20_000_000),
                    cpu_percent: Some(10.0),
                }),
                user_explicit_request: Some(true),
                frequency_above: None,
            },
            unequip_when: UnequipWhen {
                confidence_above: None,
                idle_duration_exceeds: Some(3600),
                resource_pressure: None,
                cost_benefit_ratio: None,
                user_explicit_request: Some(true),
            },
            call_teacher: None,
        },
        vec![Capability::SpreadsheetIntegration],
        MuscleMemory {
            triggers: vec![],
            last_used: None,
            use_count: None,
            success_rate: None,
        },
    )
}

// ---------------------------------------------------------------------------
// Distillation slot
// ---------------------------------------------------------------------------

/// Create a Distillation-slot equipment module (model compression / quantization).
pub fn distillation_module(name: impl Into<String>) -> Equipment {
    Equipment::new(
        name.into(),
        EquipmentSlot::Distillation,
        "0.1.0".into(),
        "Model distillation and quantization".into(),
        EquipmentCost {
            memory_bytes: 500_000_000,
            cpu_percent: 50.0,
            latency_ms: 200.0,
            cost_per_use: 1.0,
            energy_joules: Some(10.0),
        },
        EquipmentBenefit {
            accuracy_boost: -0.05,    // slight accuracy loss acceptable
            speed_multiplier: 3.0,    // 3x faster inference
            confidence_boost: None,
            capability_gain: Some(vec!["ModelDistillation".into()]),
            reliability_improvement: Some(0.1),
        },
        TriggerThresholds {
            equip_when: EquipWhen {
                confidence_below: Some(0.8),
                task_type_matches: Some(vec!["inference".into(), "batch".into()]),
                resource_available: Some(ResourceAvailability {
                    memory_bytes: Some(600_000_000),
                    cpu_percent: Some(60.0),
                }),
                user_explicit_request: None,
                frequency_above: Some(100.0),
            },
            unequip_when: UnequipWhen {
                confidence_above: Some(0.85),
                idle_duration_exceeds: Some(7200),
                resource_pressure: Some(ResourcePressure {
                    memory_below: Some(100_000_000),
                    cpu_above: Some(95.0),
                }),
                cost_benefit_ratio: Some(2.0),
                user_explicit_request: Some(true),
            },
            call_teacher: None,
        },
        vec![Capability::ModelDistillation],
        MuscleMemory {
            triggers: vec![],
            last_used: None,
            use_count: None,
            success_rate: None,
        },
    )
}

// ---------------------------------------------------------------------------
// Perception slot
// ---------------------------------------------------------------------------

/// Create a Perception-slot equipment module (vision / audio / sensory).
pub fn perception_module(name: impl Into<String>) -> Equipment {
    Equipment::new(
        name.into(),
        EquipmentSlot::Perception,
        "0.1.0".into(),
        "Multi-modal perception (vision, audio, telemetry)".into(),
        EquipmentCost {
            memory_bytes: 300_000_000,
            cpu_percent: 25.0,
            latency_ms: 30.0,
            cost_per_use: 0.1,
            energy_joules: Some(3.0),
        },
        EquipmentBenefit {
            accuracy_boost: 0.1,
            speed_multiplier: 1.0,
            confidence_boost: Some(0.1),
            capability_gain: Some(vec!["SpatialFiltering".into()]),
            reliability_improvement: Some(0.2),
        },
        TriggerThresholds {
            equip_when: EquipWhen {
                confidence_below: Some(0.7),
                task_type_matches: Some(vec!["vision".into(), "audio".into(), "telemetry".into()]),
                resource_available: Some(ResourceAvailability {
                    memory_bytes: Some(400_000_000),
                    cpu_percent: Some(30.0),
                }),
                user_explicit_request: None,
                frequency_above: None,
            },
            unequip_when: UnequipWhen {
                confidence_above: Some(0.88),
                idle_duration_exceeds: Some(1200),
                resource_pressure: Some(ResourcePressure {
                    memory_below: Some(50_000_000),
                    cpu_above: Some(90.0),
                }),
                cost_benefit_ratio: Some(3.5),
                user_explicit_request: Some(true),
            },
            call_teacher: None,
        },
        vec![Capability::SpatialFiltering],
        MuscleMemory {
            triggers: vec![],
            last_used: None,
            use_count: None,
            success_rate: None,
        },
    )
}

// ---------------------------------------------------------------------------
// Coordination slot
// ---------------------------------------------------------------------------

/// Create a Coordination-slot equipment module (multi-agent orchestration).
pub fn coordination_module(name: impl Into<String>) -> Equipment {
    Equipment::new(
        name.into(),
        EquipmentSlot::Coordination,
        "0.1.0".into(),
        "Multi-agent coordination and swarm orchestration".into(),
        EquipmentCost {
            memory_bytes: 80_000_000,
            cpu_percent: 8.0,
            latency_ms: 10.0,
            cost_per_use: 0.02,
            energy_joules: Some(0.8),
        },
        EquipmentBenefit {
            accuracy_boost: 0.08,
            speed_multiplier: 1.1,
            confidence_boost: Some(0.1),
            capability_gain: Some(vec!["MultiAgentCoordination".into()]),
            reliability_improvement: Some(0.25),
        },
        TriggerThresholds {
            equip_when: EquipWhen {
                confidence_below: Some(0.65),
                task_type_matches: Some(vec!["multi_agent".into(), "swarm".into()]),
                resource_available: Some(ResourceAvailability {
                    memory_bytes: Some(100_000_000),
                    cpu_percent: Some(12.0),
                }),
                user_explicit_request: None,
                frequency_above: None,
            },
            unequip_when: UnequipWhen {
                confidence_above: Some(0.9),
                idle_duration_exceeds: Some(1500),
                resource_pressure: Some(ResourcePressure {
                    memory_below: Some(20_000_000),
                    cpu_above: Some(85.0),
                }),
                cost_benefit_ratio: Some(3.0),
                user_explicit_request: Some(true),
            },
            call_teacher: None,
        },
        vec![Capability::MultiAgentCoordination],
        MuscleMemory {
            triggers: vec![],
            last_used: None,
            use_count: None,
            success_rate: None,
        },
    )
}

// ---------------------------------------------------------------------------
// Communication slot
// ---------------------------------------------------------------------------

/// Create a Communication-slot equipment module (USCP / WebSocket / REST bridge).
pub fn communication_module(name: impl Into<String>) -> Equipment {
    Equipment::new(
        name.into(),
        EquipmentSlot::Communication,
        "0.1.0".into(),
        "USCP/WebSocket/REST communication bridge".into(),
        EquipmentCost {
            memory_bytes: 15_000_000,
            cpu_percent: 3.0,
            latency_ms: 2.0,
            cost_per_use: 0.005,
            energy_joules: Some(0.2),
        },
        EquipmentBenefit {
            accuracy_boost: 0.0,
            speed_multiplier: 1.0,
            confidence_boost: None,
            capability_gain: None,
            reliability_improvement: Some(0.15),
        },
        TriggerThresholds {
            equip_when: EquipWhen {
                confidence_below: None,
                task_type_matches: Some(vec!["message".into(), "dispatch".into()]),
                resource_available: Some(ResourceAvailability {
                    memory_bytes: Some(20_000_000),
                    cpu_percent: Some(5.0),
                }),
                user_explicit_request: Some(true),
                frequency_above: None,
            },
            unequip_when: UnequipWhen {
                confidence_above: None,
                idle_duration_exceeds: Some(1800),
                resource_pressure: None,
                cost_benefit_ratio: None,
                user_explicit_request: Some(true),
            },
            call_teacher: None,
        },
        vec![], // no specific capability gain
        MuscleMemory {
            triggers: vec![],
            last_used: None,
            use_count: None,
            success_rate: None,
        },
    )
}

// ---------------------------------------------------------------------------
// SelfImprovement slot
// ---------------------------------------------------------------------------

/// Create a SelfImprovement-slot equipment module (seed learning / feedback loop).
pub fn self_improvement_module(name: impl Into<String>) -> Equipment {
    Equipment::new(
        name.into(),
        EquipmentSlot::SelfImprovement,
        "0.1.0".into(),
        "Self-improvement and seed learning feedback loop".into(),
        EquipmentCost {
            memory_bytes: 100_000_000,
            cpu_percent: 20.0,
            latency_ms: 100.0,
            cost_per_use: 0.2,
            energy_joules: Some(5.0),
        },
        EquipmentBenefit {
            accuracy_boost: 0.1,
            speed_multiplier: 0.9,
            confidence_boost: Some(0.1),
            capability_gain: Some(vec!["SelfImprovement".into(), "SeedLearning".into()]),
            reliability_improvement: Some(0.2),
        },
        TriggerThresholds {
            equip_when: EquipWhen {
                confidence_below: Some(0.6),
                task_type_matches: Some(vec!["learning".into(), "adaptation".into()]),
                resource_available: Some(ResourceAvailability {
                    memory_bytes: Some(150_000_000),
                    cpu_percent: Some(25.0),
                }),
                user_explicit_request: None,
                frequency_above: None,
            },
            unequip_when: UnequipWhen {
                confidence_above: Some(0.85),
                idle_duration_exceeds: Some(3600),
                resource_pressure: Some(ResourcePressure {
                    memory_below: Some(30_000_000),
                    cpu_above: Some(90.0),
                }),
                cost_benefit_ratio: Some(4.0),
                user_explicit_request: Some(true),
            },
            call_teacher: None,
        },
        vec![Capability::SelfImprovement, Capability::SeedLearning],
        MuscleMemory {
            triggers: vec![],
            last_used: None,
            use_count: None,
            success_rate: None,
        },
    )
}

// ---------------------------------------------------------------------------
// Monitoring slot
// ---------------------------------------------------------------------------

/// Create a Monitoring-slot equipment module (health / telemetry / watchdog).
pub fn monitoring_module(name: impl Into<String>) -> Equipment {
    Equipment::new(
        name.into(),
        EquipmentSlot::Monitoring,
        "0.1.0".into(),
        "Health monitoring, telemetry, and watchdog".into(),
        EquipmentCost {
            memory_bytes: 5_000_000,
            cpu_percent: 1.0,
            latency_ms: 1.0,
            cost_per_use: 0.001,
            energy_joules: Some(0.1),
        },
        EquipmentBenefit {
            accuracy_boost: 0.0,
            speed_multiplier: 1.0,
            confidence_boost: None,
            capability_gain: Some(vec!["Monitoring".into()]),
            reliability_improvement: Some(0.5),
        },
        TriggerThresholds {
            equip_when: EquipWhen {
                confidence_below: None,
                task_type_matches: Some(vec!["health".into(), "watchdog".into()]),
                resource_available: Some(ResourceAvailability {
                    memory_bytes: Some(10_000_000),
                    cpu_percent: Some(2.0),
                }),
                user_explicit_request: Some(true),
                frequency_above: None,
            },
            unequip_when: UnequipWhen {
                confidence_above: None,
                idle_duration_exceeds: Some(7200),
                resource_pressure: None,
                cost_benefit_ratio: None,
                user_explicit_request: Some(true),
            },
            call_teacher: None,
        },
        vec![Capability::Monitoring],
        MuscleMemory {
            triggers: vec![],
            last_used: None,
            use_count: None,
            success_rate: None,
        },
    )
}
