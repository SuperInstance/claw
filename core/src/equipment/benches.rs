//! Equipment Performance Benchmarks
//!
//! Comprehensive benchmarks for equipment system performance validation.
//!
//! # Architecture
//!
//! The equipment system uses a modular slot-based architecture where claws can
//! dynamically equip and unequip capabilities based on their current needs.
//! This module provides comprehensive benchmarks to validate:
//!
//! - Equip/unequip latency (<10ms target)
//! - Operation overhead (<1ms target)
//! - Memory hierarchy performance (L1 vs L2 vs L3)
//! - Muscle memory extraction efficiency
//! - Resource monitoring impact
//!
//! # Performance Targets
//!
//! - **Equip Time**: <10ms for all equipment types
//! - **Unequip Time**: <5ms for all equipment types
//! - **Operation Overhead**: <1ms per operation
//! - **Memory Access**: <100ns for L1, <1μs for L2, <10μs for L3
//! - **Muscle Memory Extraction**: <100ms for 1000 triggers

// Note: Criterion is only available in dev-dependencies, so benchmarks
// are conditionally compiled. Use `cargo bench` to run benchmarks.
#[cfg(feature = "bench")]
use criterion::{black_box, criterion_group, criterion_main, Criterion, BenchmarkId};

use crate::equipment::{
    EquipmentManager,
    slots::MemoryEquipment,
};

/// Benchmark equipment equip time
#[cfg(feature = "bench")]
fn bench_equip(c: &mut Criterion) {
    let mut group = c.benchmark_group("equip");

    for equipment_type in ["memory", "reasoning", "consensus", "spreadsheet", "distillation", "coordination"].iter() {
        group.bench_with_input(
            BenchmarkId::new("equip", equipment_type),
            equipment_type,
            |b, &equipment_type| {
                b.to_async(tokio::runtime::Runtime::new().unwrap())
                    .iter(|| async {
                        let mut manager = EquipmentManager::new();
                        let equipment = create_equipment(equipment_type);
                        black_box(manager.equip(equipment).await.unwrap())
                    });
            },
        );
    }

    group.finish();
}

/// Benchmark equipment unequip time
#[cfg(feature = "bench")]
fn bench_unequip(c: &mut Criterion) {
    let mut group = c.benchmark_group("unequip");

    for equipment_type in ["memory", "reasoning", "consensus", "spreadsheet", "distillation", "coordination"].iter() {
        group.bench_with_input(
            BenchmarkId::new("unequip", equipment_type),
            equipment_type,
            |b, &equipment_type| {
                b.to_async(tokio::runtime::Runtime::new().unwrap())
                    .iter(|| async {
                        let rt = tokio::runtime::Runtime::new().unwrap();
                        let mut manager = EquipmentManager::new();

                        // Pre-equip
                        let equipment = create_equipment(equipment_type);
                        manager.equip(equipment).await.unwrap();

                        // Benchmark unequip
                        black_box(manager.unequip(get_slot(equipment_type)).await.unwrap())
                    });
            },
        );
    }

    group.finish();
}

/// Benchmark equipment operation overhead
#[cfg(feature = "bench")]
fn bench_operation_overhead(c: &mut Criterion) {
    let mut group = c.benchmark_group("operation_overhead");

    for equipment_type in ["memory", "reasoning", "consensus"].iter() {
        group.bench_with_input(
            BenchmarkId::new("operation", equipment_type),
            equipment_type,
            |b, &equipment_type| {
                b.to_async(tokio::runtime::Runtime::new().unwrap())
                    .iter(|| async {
                        let equipment = create_equipment(equipment_type);
                        let payload = create_test_payload();

                        let start = Instant::now();
                        black_box(equipment.process(payload).await.unwrap());
                        start.elapsed()
                    });
            },
        );
    }

    group.finish();
}

#[cfg(feature = "bench")]
/// Benchmark memory hierarchy performance
fn bench_memory_hierarchy(c: &mut Criterion) {
    let mut group = c.benchmark_group("memory_hierarchy");

    group.bench_function("l1_access", |b| {
        b.to_async(tokio::runtime::Runtime::new().unwrap())
            .iter(|| async {
                let memory = MemoryEquipment::new();
                let payload = create_test_payload();

                // Warm up L1 cache
                for _ in 0..10 {
                    memory.process(payload.clone()).await.unwrap();
                }

                // Benchmark L1 access
                black_box(memory.process(payload).await.unwrap())
            });
    });

    group.bench_function("l2_access", |b| {
        b.to_async(tokio::runtime::Runtime::new().unwrap())
            .iter(|| async {
                let memory = MemoryEquipment::new();

                // Fill L1, go to L2
                for i in 0..20 {
                    let key = format!("key_{}", i);
                    let payload = TriggerPayload {
                        trigger_type: "set".to_string(),
                        data: serde_json::json!({"key": key, "value": i}).as_object().unwrap().clone(),
                    };
                    memory.process(payload).await.unwrap();
                }

                // Access from L2
                let payload = TriggerPayload {
                    trigger_type: "get".to_string(),
                    data: serde_json::json!({"key": "key_0"}).as_object().unwrap().clone(),
                };

                black_box(memory.process(payload).await.unwrap())
            });
    });

    group.finish();
}

#[cfg(feature = "bench")]
/// Benchmark muscle memory extraction
fn bench_muscle_memory(c: &mut Criterion) {
    let mut group = c.benchmark_group("muscle_memory");

    group.bench_function("extraction", |b| {
        b.iter(|| {
            let equipment = MemoryEquipment::new();
            black_box(equipment.extract_muscle_memory())
        });
    });

    group.finish();
}

/// Benchmark equipment manager cost/benefit analysis
#[cfg(feature = "bench")]
fn bench_cost_benefit(c: &mut Criterion) {
    let mut group = c.benchmark_group("cost_benefit");

    group.bench_function("analysis", |b| {
        b.to_async(tokio::runtime::Runtime::new().unwrap())
            .iter(|| async {
                let manager = EquipmentManager::new();
                let equipment = MemoryEquipment::new();
                let context = crate::equipment::ProcessingContext {
                    agent_id: "test".to_string(),
                    message_count: 100,
                    avg_processing_time_ms: 50.0,
                    error_rate: 0.01,
                };

                black_box(manager.should_equip(&equipment, &context))
            });
    });

    group.finish();
}

/// Comprehensive performance benchmark
#[cfg(feature = "bench")]
fn run_comprehensive_benchmark() -> Vec<BenchmarkResults> {
    let mut results = Vec::new();
    let iterations = 100;

    for equipment_type in [
        "memory",
        "reasoning",
        "consensus",
        "spreadsheet",
        "distillation",
        "coordination",
    ] {
        let slot = get_slot(equipment_type);

        // Benchmark equip time
        let equip_times: Vec<f64> = (0..iterations)
            .map(|_| {
                let rt = tokio::runtime::Runtime::new().unwrap();
                let mut manager = EquipmentManager::new();
                let equipment = create_equipment(equipment_type);

                let start = Instant::now();
                rt.block_on(manager.equip(equipment)).unwrap();
                start.elapsed().as_secs_f64() * 1000.0
            })
            .collect();

        let avg_equip_time: f64 = equip_times.iter().sum::<f64>() / equip_times.len() as f64;

        // Benchmark unequip time
        let unequip_times: Vec<f64> = (0..iterations)
            .map(|_| {
                let rt = tokio::runtime::Runtime::new().unwrap();
                let mut manager = EquipmentManager::new();

                // Pre-equip
                let equipment = create_equipment(equipment_type);
                rt.block_on(manager.equip(equipment)).unwrap();

                // Benchmark unequip
                let start = Instant::now();
                rt.block_on(manager.unequip(slot)).unwrap();
                start.elapsed().as_secs_f64() * 1000.0
            })
            .collect();

        let avg_unequip_time: f64 = unequip_times.iter().sum::<f64>() / unequip_times.len() as f64;

        // Benchmark operation overhead
        let equipment = create_equipment(equipment_type);
        let payload = create_test_payload();

        let operation_times: Vec<f64> = (0..iterations)
            .map(|_| {
                let rt = tokio::runtime::Runtime::new().unwrap();
                let start = Instant::now();
                rt.block_on(equipment.process(payload.clone())).unwrap();
                start.elapsed().as_secs_f64() * 1000.0
            })
            .collect();

        let avg_operation_time: f64 = operation_times.iter().sum::<f64>() / operation_times.len() as f64;

        // Get cost information
        let cost = equipment.cost();

        results.push(BenchmarkResults {
            slot,
            equip_time_ms: avg_equip_time,
            unequip_time_ms: avg_unequip_time,
            operation_overhead_ms: avg_operation_time,
            memory_overhead_mb: cost.memory_mb,
            cpu_overhead_percent: cost.cpu_percent,
            iterations: iterations as u32,
            timestamp: chrono::Utc::now(),
        });
    }

    results
}

#[cfg(feature = "bench")]
/// Helper function to create equipment by type
fn create_equipment(equipment_type: &str) -> Box<dyn crate::equipment::Equipment> {
    match equipment_type {
        "memory" => Box::new(MemoryEquipment::new()),
        "reasoning" => Box::new(ReasoningEquipment::new()),
        "consensus" => Box::new(ConsensusEquipment::new()),
        "spreadsheet" => Box::new(SpreadsheetEquipment::new()),
        "distillation" => Box::new(DistillationEquipment::new()),
        "coordination" => Box::new(CoordinationEquipment::new()),
        _ => Box::new(MemoryEquipment::new()),
    }
}

#[cfg(feature = "bench")]
/// Helper function to get equipment slot by type
fn get_slot(equipment_type: &str) -> EquipmentSlot {
    match equipment_type {
        "memory" => EquipmentSlot::Memory,
        "reasoning" => EquipmentSlot::Reasoning,
        "consensus" => EquipmentSlot::Consensus,
        "spreadsheet" => EquipmentSlot::Spreadsheet,
        "distillation" => EquipmentSlot::Distillation,
        "coordination" => EquipmentSlot::Coordination,
        _ => EquipmentSlot::Memory,
    }
}

#[cfg(feature = "bench")]
/// Helper function to create test payload
fn create_test_payload() -> TriggerPayload {
    TriggerPayload {
        trigger_type: "test".to_string(),
        data: serde_json::json!({"test": "data"}).as_object().unwrap().clone(),
    }
}

#[cfg(feature = "bench")]
criterion_group!(
    benches,
    bench_equip,
    bench_unequip,
    bench_operation_overhead,
    bench_memory_hierarchy,
    bench_muscle_memory,
    bench_cost_benefit
);

#[cfg(feature = "bench")]
criterion_main!(benches);

#[cfg(test)]
mod benchmark_tests {
    use super::*;
    use std::time::Duration;

    #[test]
    fn test_equip_performance_target() {
        let rt = tokio::runtime::Runtime::new().unwrap();
        let mut manager = EquipmentManager::new();
        let equipment = MemoryEquipment::new();

        let start = Instant::now();
        rt.block_on(manager.equip(Box::new(equipment))).unwrap();
        let elapsed = start.elapsed();

        assert!(
            elapsed < Duration::from_millis(50),
            "Equip time {:?} exceeds 50ms target",
            elapsed
        );
    }

    #[test]
    fn test_unequip_performance_target() {
        let rt = tokio::runtime::Runtime::new().unwrap();
        let mut manager = EquipmentManager::new();

        // Pre-equip
        let equipment = MemoryEquipment::new();
        rt.block_on(manager.equip(Box::new(equipment))).unwrap();

        // Benchmark unequip
        let start = Instant::now();
        rt.block_on(manager.unequip(EquipmentSlot::Memory)).unwrap();
        let elapsed = start.elapsed();

        assert!(
            elapsed < Duration::from_millis(20),
            "Unequip time {:?} exceeds 20ms target",
            elapsed
        );
    }

    #[tokio::test]
    async fn test_resource_monitoring() {
        let monitor = ResourceMonitor::new();

        // Register all equipment
        for slot in [
            EquipmentSlot::Memory,
            EquipmentSlot::Reasoning,
            EquipmentSlot::Consensus,
            EquipmentSlot::Spreadsheet,
            EquipmentSlot::Distillation,
            EquipmentSlot::Coordination,
        ] {
            monitor.register_slot(
                slot,
                EquipmentCost {
                    memory_mb: 1.0,
                    cpu_percent: 5.0,
                    load_time_ms: 5,
                    execution_overhead_ms: 1,
                },
            ).await;
        }

        // Update metrics
        monitor.update_metrics(EquipmentSlot::Memory, MetricsUpdate::MemoryUsed { mb: 2.5 }).await.unwrap();

        // Get total usage
        let usage = monitor.get_total_usage().await;
        // Total = base costs (6 * 1.0) + additional memory (2.5) = 8.5
        assert_eq!(usage.memory_mb, 8.5);

        // Get health
        monitor.update_health(EquipmentSlot::Memory, crate::equipment::monitoring::HealthStatus::Healthy, "OK".to_string()).await;
        assert!(monitor.is_healthy(EquipmentSlot::Memory).await);
    }

    #[tokio::test]
    async fn test_equipment_cost_tracking() {
        let monitor = ResourceMonitor::new();

        let cost = EquipmentCost {
            memory_mb: 1.0,
            cpu_percent: 5.0,
            load_time_ms: 5,
            execution_overhead_ms: 1,
        };

        monitor.register_slot(EquipmentSlot::Memory, cost).await;

        let retrieved_cost = monitor.get_estimated_cost(EquipmentSlot::Memory).await;
        assert!(retrieved_cost.is_some());
        assert_eq!(retrieved_cost.unwrap().memory_mb, 1.0);
    }
}
