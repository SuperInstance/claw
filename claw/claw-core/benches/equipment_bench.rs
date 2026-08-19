use criterion::{criterion_group, criterion_main, Criterion};
use claw_core::{ClawAgent, Equipment, EquipmentSlot};
use claw_core::slot_impls::{
    memory_module, reasoning_module, consensus_module, spreadsheet_module,
    distillation_module, perception_module, coordination_module, communication_module,
    self_improvement_module, monitoring_module,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

fn make_agent() -> ClawAgent {
    ClawAgent::new(
        uuid::Uuid::new_v4(),
        None,
        Default::default(),
        Default::default(),
    )
}

// ---------------------------------------------------------------------------
// Benchmarks
// ---------------------------------------------------------------------------

fn bench_equip(c: &mut Criterion) {
    c.bench_function("equip_memory_slot", |b| {
        b.iter(|| {
            let mut agent = make_agent();
            agent.equip(EquipmentSlot::Memory, memory_module("bench-memory")).unwrap();
        })
    });
}

fn bench_unequip(c: &mut Criterion) {
    c.bench_function("unequip_memory_slot", |b| {
        b.iter(|| {
            let mut agent = make_agent();
            agent.equip(EquipmentSlot::Memory, memory_module("bench-memory")).unwrap();
            agent.unequip(EquipmentSlot::Memory).unwrap();
        })
    });
}

fn bench_equip_unequip_cycle(c: &mut Criterion) {
    c.bench_function("equip_unequip_cycle", |b| {
        b.iter(|| {
            let mut agent = make_agent();
            agent.equip(EquipmentSlot::Memory, memory_module("bench-memory")).unwrap();
            agent.unequip(EquipmentSlot::Memory).unwrap();
        })
    });
}

fn bench_multiple_equips(c: &mut Criterion) {
    c.bench_function("equip_three_slots", |b| {
        b.iter(|| {
            let mut agent = make_agent();
            agent
                .equip(EquipmentSlot::Memory, memory_module("bench-memory"))
                .unwrap();
            agent
                .equip(EquipmentSlot::Reasoning, reasoning_module("bench-reasoning"))
                .unwrap();
            agent
                .equip(EquipmentSlot::Consensus, consensus_module("bench-consensus"))
                .unwrap();
        })
    });
}

fn bench_try_reequip(c: &mut Criterion) {
    c.bench_function("try_reequip", |b| {
        b.iter(|| {
            let mut agent = make_agent();
            agent.equip(EquipmentSlot::Memory, memory_module("bench-memory")).unwrap();
            agent.unequip(EquipmentSlot::Memory).unwrap();
            agent.try_reequip();
        })
    });
}

fn bench_spreadsheet(c: &mut Criterion) {
    c.bench_function("equip_spreadsheet_slot", |b| {
        b.iter(|| {
            let mut agent = make_agent();
            agent
                .equip(EquipmentSlot::Spreadsheet, spreadsheet_module("bench-sheet"))
                .unwrap();
        })
    });
}

fn bench_distillation(c: &mut Criterion) {
    c.bench_function("equip_distillation_slot", |b| {
        b.iter(|| {
            let mut agent = make_agent();
            agent
                .equip(EquipmentSlot::Distillation, distillation_module("bench-distill"))
                .unwrap();
        })
    });
}

fn bench_perception(c: &mut Criterion) {
    c.bench_function("equip_perception_slot", |b| {
        b.iter(|| {
            let mut agent = make_agent();
            agent
                .equip(EquipmentSlot::Perception, perception_module("bench-perception"))
                .unwrap();
        })
    });
}

fn bench_coordination(c: &mut Criterion) {
    c.bench_function("equip_coordination_slot", |b| {
        b.iter(|| {
            let mut agent = make_agent();
            agent
                .equip(EquipmentSlot::Coordination, coordination_module("bench-coordination"))
                .unwrap();
        })
    });
}

fn bench_all_slots(c: &mut Criterion) {
    c.bench_function("equip_all_slots", |b| {
        b.iter(|| {
            let mut agent = make_agent();
            use EquipmentSlot::*;
            let slots = [
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
            ];
            for slot in slots.iter() {
                let name = format!("bench-{:?}", slot).to_lowercase();
                let module: Equipment = match slot {
                    Memory => memory_module(name),
                    Reasoning => reasoning_module(name),
                    Consensus => consensus_module(name),
                    Spreadsheet => spreadsheet_module(name),
                    Distillation => distillation_module(name),
                    Perception => perception_module(name),
                    Coordination => coordination_module(name),
                    Communication => communication_module(name),
                    SelfImprovement => self_improvement_module(name),
                    Monitoring => monitoring_module(name),
                };
                agent.equip(*slot, module).unwrap();
            }
        })
    });
}

// ---------------------------------------------------------------------------
// Group
// ---------------------------------------------------------------------------

criterion_group!(
    equipment_benchmarks,
    bench_equip,
    bench_unequip,
    bench_equip_unequip_cycle,
    bench_multiple_equips,
    bench_try_reequip,
    bench_spreadsheet,
    bench_distillation,
    bench_perception,
    bench_coordination,
    bench_all_slots,
);
criterion_main!(equipment_benchmarks);
