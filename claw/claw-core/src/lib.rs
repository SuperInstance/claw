//! claw-core - Core domain models for the Claw cellular agent engine.
//!
//! This crate provides the fundamental data structures for Claw agents, Bots, Seeds,
//! Equipment, and the Tripartite Consensus engine.

pub mod common;
pub mod claw;
pub mod equipment;
pub mod seed;
pub mod consensus;

// Re-export all public types for convenience
pub use common::*;
pub use claw::*;
pub use equipment::*;
pub use seed::*;
pub use consensus::*;

#[cfg(test)]
mod integration_tests {
    use super::*;
    use uuid::Uuid;

    #[test]
    fn test_claw_agent_creation() {
        let id = Uuid::new_v4();
        let model = ModelConfiguration {
            provider: ModelProvider::OpenAI,
            model_name: "gpt-4".to_string(),
            endpoint: None,
            api_key: None,
            temperature: None,
            max_tokens: None,
        };
        let seed = SeedReference {
            seed_id: "test-seed".to_string(),
            parameters: None,
            version: None,
        };
        let claw = ClawAgent::new(id, Some("Test Claw".to_string()), model, seed);
        assert_eq!(claw.id, id);
        assert_eq!(claw.name, Some("Test Claw".to_string()));
        assert_eq!(claw.state, ClawState::Dormant);
        assert!(claw.equipment.is_empty());
    }

    #[test]
    fn test_claw_agent_equip_unequip() {
        let id = Uuid::new_v4();
        let model = ModelConfiguration {
            provider: ModelProvider::OpenAI,
            model_name: "gpt-4".to_string(),
            endpoint: None,
            api_key: None,
            temperature: None,
            max_tokens: None,
        };
        let seed = SeedReference {
            seed_id: "test-seed".to_string(),
            parameters: None,
            version: None,
        };
        let mut claw = ClawAgent::new(id, Some("Test Claw".to_string()), model, seed);

        let equipment = Equipment {
            name: "test-memory".to_string(),
            slot: EquipmentSlot::Memory,
            version: "1.0.0".to_string(),
            description: "test".to_string(),
            cost: EquipmentCost {
                memory_bytes: 1024,
                cpu_percent: 1.0,
                latency_ms: 10.0,
                cost_per_use: 0.001,
                energy_joules: None,
            },
            benefit: EquipmentBenefit {
                accuracy_boost: 0.1,
                speed_multiplier: 1.2,
                confidence_boost: None,
                capability_gain: None,
                reliability_improvement: None,
            },
            trigger_thresholds: TriggerThresholds {
                equip_when: EquipWhen {
                    confidence_below: None,
                    task_type_matches: None,
                    resource_available: None,
                    user_explicit_request: None,
                    frequency_above: None,
                },
                unequip_when: UnequipWhen {
                    confidence_above: None,
                    idle_duration_exceeds: None,
                    resource_pressure: None,
                    cost_benefit_ratio: None,
                    user_explicit_request: None,
                },
                call_teacher: None,
            },
            capabilities: vec![],
            dependencies: None,
            conflicts: None,
            muscle_memory: MuscleMemory {
                triggers: vec![],
                last_used: None,
                use_count: None,
                success_rate: None,
            },
            implementation: None,
            metadata: None,
        };

        claw.equip(EquipmentSlot::Memory, equipment).unwrap();
        assert_eq!(claw.equipment.len(), 1);
        assert!(claw.get_equipment(EquipmentSlot::Memory).is_some());

        let _removed = claw.unequip(EquipmentSlot::Memory).unwrap();
        assert_eq!(claw.equipment.len(), 0);
        assert!(claw.get_equipment(EquipmentSlot::Memory).is_none());
    }

    #[test]
    fn test_consensus_engine() {
        let engine = TripartiteConsensusEngine::new(ResonanceScore::new(0.7));
        let result = engine.resolve_decision_detailed(
            ResonanceScore::new(0.8),
            ResonanceScore::new(0.8),
            ResonanceScore::new(0.8),
        );
        assert!(result.passed);
        assert!((result.resonance.value - 0.8).abs() < 1e-10);

        let result = engine.resolve_decision_detailed(
            ResonanceScore::new(0.5),
            ResonanceScore::new(0.5),
            ResonanceScore::new(0.5),
        );
        assert!(!result.passed);
    }

    #[test]
    fn test_seed_creation() {
        let seed = ClawSeed::new(
            "test-seed".to_string(),
            "Test purpose".to_string(),
            TriggerCondition {
                r#type: "manual".to_string(),
                config: None,
            },
            LearningStrategy {
                r#type: "supervised".to_string(),
                config: None,
            },
            vec![EquipmentSlot::Memory, EquipmentSlot::Reasoning],
        );
        assert_eq!(seed.id, "test-seed");
        assert_eq!(seed.purpose, "Test purpose");
        assert_eq!(seed.default_equipment.len(), 2);
        assert!(!seed.is_stabilized());
    }

    #[test]
    fn test_equipment_creation() {
        let equipment = Equipment::new(
            "Test Equipment".to_string(),
            EquipmentSlot::Memory,
            "1.0.0".to_string(),
            "Test description".to_string(),
            EquipmentCost {
                memory_bytes: 1024 * 1024,
                cpu_percent: 1.0,
                latency_ms: 10.0,
                cost_per_use: 0.001,
                energy_joules: Some(0.5),
            },
            EquipmentBenefit {
                accuracy_boost: 0.1,
                speed_multiplier: 1.2,
                confidence_boost: Some(0.05),
                capability_gain: Some(vec!["recall".to_string()]),
                reliability_improvement: Some(0.02),
            },
            TriggerThresholds {
                equip_when: EquipWhen {
                    confidence_below: Some(0.7),
                    task_type_matches: Some(vec!["memory".to_string()]),
                    resource_available: None,
                    user_explicit_request: Some(true),
                    frequency_above: None,
                },
                unequip_when: UnequipWhen {
                    confidence_above: Some(0.9),
                    idle_duration_exceeds: Some(3600),
                    resource_pressure: None,
                    cost_benefit_ratio: None,
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
        );
        assert_eq!(equipment.name, "Test Equipment");
        assert_eq!(equipment.slot, EquipmentSlot::Memory);
    }
}