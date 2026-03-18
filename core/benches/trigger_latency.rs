//! Performance benchmarks for trigger latency optimization
//!
//! Target: <10ms average trigger processing time

use criterion::{black_box, criterion_group, criterion_main, Criterion, BenchmarkId};
use claw_core::{ClawCore, AgentConfig, EquipmentSlot};
use std::time::Duration;

fn bench_trigger_latency(c: &mut Criterion) {
    let mut group = c.benchmark_group("trigger_latency");

    // Benchmark with different numbers of agents
    for num_agents in [1, 10, 100, 1000].iter() {
        group.bench_with_input(BenchmarkId::new("check_trigger", num_agents), num_agents, |b, &num_agents| {
            let rt = tokio::runtime::Runtime::new().unwrap();

            let core = rt.block_on(async {
                let core = ClawCore::new();
                for i in 0..num_agents {
                    let config = AgentConfig {
                        id: format!("agent-{}", i),
                        cell_ref: format!("A{}", i),
                        model: "test-model".to_string(),
                        equipment: vec![EquipmentSlot::Memory],
                        config: Default::default(),
                    };
                    core.add_agent(config).await.unwrap();
                }
                core
            });

            b.to_async(tokio::runtime::Runtime::new().unwrap())
                .iter(|| async {
                    let agent_id = format!("agent-{}", black_box(0));
                    black_box(core.has_agent(&agent_id)).await;
                });
        });
    }

    group.finish();
}

fn bench_message_throughput(c: &mut Criterion) {
    let mut group = c.benchmark_group("message_throughput");

    for num_agents in [10, 100, 1000].iter() {
        group.bench_with_input(BenchmarkId::new("send_message", num_agents), num_agents, |b, &num_agents| {
            let rt = tokio::runtime::Runtime::new().unwrap();

            let core = rt.block_on(async {
                let core = ClawCore::new();
                for i in 0..num_agents {
                    let config = AgentConfig {
                        id: format!("agent-{}", i),
                        cell_ref: format!("A{}", i),
                        model: "test-model".to_string(),
                        equipment: vec![],
                        config: Default::default(),
                    };
                    core.add_agent(config).await.unwrap();
                }
                core.start().await.unwrap();
                core
            });

            b.to_async(tokio::runtime::Runtime::new().unwrap())
                .iter(|| async {
                    use claw_core::Message;

                    let message = Message::Trigger {
                        id: format!("msg-{}", black_box(0)),
                        agent_id: format!("agent-{}", black_box(0)),
                        payload: claw_core::TriggerPayload::Periodic {
                            interval_ms: 1000,
                            timestamp: 0,
                        },
                    };

                    black_box(core.send_message(message)).await;
                });
        });
    }

    group.finish();
}

fn bench_agent_creation(c: &mut Criterion) {
    let mut group = c.benchmark_group("agent_creation");

    group.bench_function("single_agent", |b| {
        let rt = tokio::runtime::Runtime::new().unwrap();

        b.to_async(tokio::runtime::Runtime::new().unwrap())
            .iter(|| async {
                let core = ClawCore::new();
                let config = AgentConfig {
                    id: format!("agent-{}", black_box(0)),
                    cell_ref: "A1".to_string(),
                    model: "test-model".to_string(),
                    equipment: vec![EquipmentSlot::Memory],
                    config: Default::default(),
                };

                black_box(core.add_agent(config)).await.unwrap();
            });
    });

    group.finish();
}

fn bench_concurrent_operations(c: &mut Criterion) {
    let mut group = c.benchmark_group("concurrent_operations");

    group.bench_function("concurrent_add_100", |b| {
        let rt = tokio::runtime::Runtime::new().unwrap();

        b.to_async(rt)
            .iter(|| async {
                let core = std::sync::Arc::new(ClawCore::new());
                let mut handles = vec![];

                for i in 0..100 {
                    let core_clone = core.clone();
                    let handle = tokio::spawn(async move {
                        let config = AgentConfig {
                            id: format!("agent-{}", i),
                            cell_ref: format!("A{}", i),
                            model: "test-model".to_string(),
                            equipment: vec![],
                            config: Default::default(),
                        };
                        core_clone.add_agent(config).await.unwrap();
                    });
                    handles.push(handle);
                }

                for handle in handles {
                    handle.await.unwrap();
                }
            });
    });

    group.finish();
}

criterion_group!(
    benches,
    bench_trigger_latency,
    bench_message_throughput,
    bench_agent_creation,
    bench_concurrent_operations
);
criterion_main!(benches);
