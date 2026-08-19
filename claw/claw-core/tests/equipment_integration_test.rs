//! Integration tests for the dynamic equipment system.
//! Covers: equip/unequip cycle, muscle-memory registration, duplicate-slot rejection,
//!         reequip trigger scanning, and <1ms latency benchmark.

use claw_core::{
    ClawAgent, Equipment, EquipmentSlot, EquipmentError, MuscleMemory, MuscleMemoryTrigger,
    MuscleMemoryCondition, EquipmentCost, EquipmentBenefit, TriggerThresholds, EquipWhen, UnequipWhen,
    SeedReference,
};
use uuid::Uuid;

fn make_test_equipment(slot: EquipmentSlot) -> Equipment {
    Equipment::new(
        format!("Test {:?}", slot),
        slot,
        "0.1.0".into(),
        "Integration test equipment".into(),
        EquipmentCost {
            memory_bytes: 0,
            cpu_percent: 0.0,
            latency_ms: 0.0,
            cost_per_use: 0.0,
            energy_joules: None,
        },
        EquipmentBenefit {
            accuracy_boost: 0.0,
            speed_multiplier: 1.0,
            confidence_boost: None,
            capability_gain: None,
            reliability_improvement: None,
        },
        TriggerThresholds {
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
        vec![],
        MuscleMemory {
            triggers: vec![],
            last_used: None,
            use_count: None,
            success_rate: None,
        },
    )
}

fn make_seed_ref() -> SeedReference {
    SeedReference {
        seed_id: "test-seed".into(),
        parameters: None,
        version: Some("0.1.0".into()),
    }
}

// ---------------------------------------------------------------------------
// 1. Equip / Unequip happy path + muscle-memory round-trip
// ---------------------------------------------------------------------------
#[test]
fn test_equip_unequip_cycle_registers_muscle_memory() {
    let mut agent = ClawAgent::new(Uuid::new_v4(), Some("tester".into()), Default::default(), make_seed_ref());

    let eq = make_test_equipment(EquipmentSlot::Memory);
    agent.equip(EquipmentSlot::Memory, eq.clone()).unwrap();

    assert!(agent.get_equipment(EquipmentSlot::Memory).is_some());

    let (_removed, memory) = agent.unequip(EquipmentSlot::Memory).unwrap();
    assert!(agent.get_equipment(EquipmentSlot::Memory).is_none());
    assert_eq!(agent.reequip_triggers.len(), 1);
    assert!(memory.triggers.is_empty());
}

// ---------------------------------------------------------------------------
// 2. Duplicate-slot rejection
// ---------------------------------------------------------------------------
#[test]
fn test_equip_rejects_duplicate_slot() {
    let mut agent = ClawAgent::new(Uuid::new_v4(), None, Default::default(), make_seed_ref());

    let eq1 = make_test_equipment(EquipmentSlot::Reasoning);
    agent.equip(EquipmentSlot::Reasoning, eq1).unwrap();

    let eq2 = make_test_equipment(EquipmentSlot::Reasoning);
    let result = agent.equip(EquipmentSlot::Reasoning, eq2);
    assert!(matches!(result, Err(EquipmentError::DuplicateSlot(_))));
}

// ---------------------------------------------------------------------------
// 3. Unequip empty slot error
// ---------------------------------------------------------------------------
#[test]
fn test_unequip_empty_slot_returns_error() {
    let mut agent = ClawAgent::new(Uuid::new_v4(), None, Default::default(), make_seed_ref());

    let result = agent.unequip(EquipmentSlot::Spreadsheet);
    assert!(matches!(result, Err(EquipmentError::SlotEmpty(_))));
}

// ---------------------------------------------------------------------------
// 4. Slot-mismatch on equip
// ---------------------------------------------------------------------------
#[test]
fn test_equip_slot_mismatch() {
    let mut agent = ClawAgent::new(Uuid::new_v4(), None, Default::default(), make_seed_ref());

    let eq = make_test_equipment(EquipmentSlot::Consensus);
    let result = agent.equip(EquipmentSlot::Coordination, eq);
    assert!(matches!(result, Err(EquipmentError::SlotOccupied(_))));
}

// ---------------------------------------------------------------------------
// 5. Multiple equip / full unequip
// ---------------------------------------------------------------------------
#[test]
fn test_multiple_equips_then_full_unequip() {
    let mut agent = ClawAgent::new(Uuid::new_v4(), None, Default::default(), make_seed_ref());

    let slots = vec![
        EquipmentSlot::Memory,
        EquipmentSlot::Reasoning,
        EquipmentSlot::Consensus,
    ];

    for slot in &slots {
        agent.equip(*slot, make_test_equipment(*slot)).unwrap();
    }
    assert_eq!(agent.equipment.len(), 3);

    for slot in &slots {
        let (_, memory) = agent.unequip(*slot).unwrap();
        assert!(memory.triggers.is_empty());
    }
    assert!(agent.equipment.is_empty());
    assert_eq!(agent.reequip_triggers.len(), 3);
}

// ---------------------------------------------------------------------------
// 6. try_reequip with an "always" trigger fires
// ---------------------------------------------------------------------------
#[test]
fn test_try_reequip_returns_stored_memories() {
    let mut agent = ClawAgent::new(Uuid::new_v4(), None, Default::default(), make_seed_ref());

    // Build equipment with an explicit "always" trigger so try_reequip fires
    let mut eq = make_test_equipment(EquipmentSlot::Memory);
    eq.muscle_memory.triggers = vec![MuscleMemoryTrigger {
        condition: MuscleMemoryCondition {
            r#type: "always".into(),
            pattern: None,
            threshold: None,
            metric: None,
            direction: None,
        },
        action: "reequip".into(),
        priority: Some(1),
        cooldown_seconds: None,
    }];
    agent.equip(EquipmentSlot::Memory, eq).unwrap();
    agent.unequip(EquipmentSlot::Memory).unwrap();

    let results = agent.try_reequip();
    assert_eq!(results.len(), 1);
}

// ---------------------------------------------------------------------------
// 7. Latency benchmark (compile-time guard, not a flaky performance test)
// ---------------------------------------------------------------------------
#[test]
fn test_equip_unequip_latency_under_1ms() {
    use std::time::Instant;

    let mut agent = ClawAgent::new(Uuid::new_v4(), None, Default::default(), make_seed_ref());

    let eq = make_test_equipment(EquipmentSlot::Memory);

    let start = Instant::now();
    agent.equip(EquipmentSlot::Memory, eq).unwrap();
    agent.unequip(EquipmentSlot::Memory).unwrap();
    let elapsed = start.elapsed();

    // In debug builds this will almost always pass; if it ever fails in CI
    // it means the equip/unequip path is doing unnecessary work.
    assert!(
        elapsed.as_millis() < 1,
        "equip/unequip cycle took {}ms (target <1ms)",
        elapsed.as_millis()
    );
}
