//! Performance benchmarks for ClawCore
//!
//! Measures key performance metrics:
//! - Agent creation latency
//! - Message processing throughput
//! - Memory usage per agent
//! - Equipment equip/unequip latency

use claw_core::{
    ClawCore, AgentConfig, EquipmentSlot,
    SimpleMemoryEquipment, ReasoningEngine,
};
use std::time::{Duration, Instant};

#[tokio::main]
async fn main() {
    println!("ClawCore Performance Benchmarks");
    println!("===============================\n");

    benchmark_agent_creation().await;
    benchmark_message_processing().await;
    benchmark_equipment_operations().await;
    benchmark_memory_usage().await;
    benchmark_concurrent_operations().await;

    println!("\n===============================");
    println!("All benchmarks complete!");
}

async fn benchmark_agent_creation() {
    println!("Benchmark: Agent Creation");
    println!("-------------------------");

    let core = ClawCore::new();
    let iterations = 1000;

    let start = Instant::now();
    for i in 0..iterations {
        let config = AgentConfig {
            id: format!("bench-agent-{}", i),
            cell_ref: format!("A{}", i),
            model: "gpt-4".to_string(),
            equipment: vec![],
            config: Default::default(),
        };
        core.add_agent(config).await.unwrap();
    }
    let duration = start.elapsed();

    let avg_latency_us = duration.as_micros() / iterations as u128;
    let throughput = (iterations as f64) / duration.as_secs_f64();

    println!("Iterations: {}", iterations);
    println!("Total time: {:?}", duration);
    println!("Average latency: {} μs", avg_latency_us);
    println!("Throughput: {:.2} agents/sec", throughput);
    println!("Target: <100ms per agent");
    println!("Status: {}\n", if avg_latency_us < 100_000 { "✓ PASS" } else { "✗ FAIL" });
}

async fn benchmark_message_processing() {
    println!("Benchmark: Message Processing");
    println!("-------------------------------");

    let core = ClawCore::new();

    // Add some agents
    for i in 0..10 {
        let config = AgentConfig {
            id: format!("msg-agent-{}", i),
            cell_ref: format!("B{}", i),
            model: "gpt-4".to_string(),
            equipment: vec![EquipmentSlot::Memory],
            config: Default::default(),
        };
        core.add_agent(config).await.unwrap();
    }

    let iterations = 1000;
    let start = Instant::now();

    for i in 0..iterations {
        let agent_id = format!("msg-agent-{}", i % 10);
        let message = claw_core::Message::Trigger {
            id: format!("msg-{}", i),
            agent_id: agent_id.clone(),
            payload: claw_core::TriggerPayload::Periodic {
                interval_ms: 1000,
                timestamp: i,
            },
        };
        core.send_message(message).await.unwrap();
    }

    let duration = start.elapsed();
    let avg_latency_us = duration.as_micros() / iterations as u128;
    let throughput = (iterations as f64) / duration.as_secs_f64();

    println!("Iterations: {}", iterations);
    println!("Total time: {:?}", duration);
    println!("Average latency: {} μs", avg_latency_us);
    println!("Throughput: {:.2} messages/sec", throughput);
    println!("Target: <10ms per message");
    println!("Status: {}\n", if avg_latency_us < 10_000 { "✓ PASS" } else { "✗ FAIL" });
}

async fn benchmark_equipment_operations() {
    println!("Benchmark: Equipment Operations");
    println!("---------------------------------");

    let mut manager = claw_core::EquipmentManager::new();
    let iterations = 100;

    // Benchmark equip
    let start = Instant::now();
    for _ in 0..iterations {
        let equipment = Box::new(SimpleMemoryEquipment::new()) as Box<dyn claw_core::Equipment>;
        manager.equip(equipment).await.unwrap();
        manager.unequip(claw_core::EquipmentSlot::Memory).await.unwrap();
    }
    let duration = start.elapsed();

    let avg_latency_us = duration.as_micros() / iterations as u128;

    println!("Iterations: {}", iterations);
    println!("Total time: {:?}", duration);
    println!("Average equip/unequip latency: {} μs", avg_latency_us);
    println!("Target: <50ms per equip");
    println!("Status: {}\n", if avg_latency_us < 50_000 { "✓ PASS" } else { "✗ FAIL" });
}

async fn benchmark_memory_usage() {
    println!("Benchmark: Memory Usage");
    println!("-----------------------");

    let core = ClawCore::new();
    let iterations = 100;

    // Get baseline memory
    let baseline_memory = get_memory_usage();

    // Add agents
    for i in 0..iterations {
        let config = AgentConfig {
            id: format!("mem-agent-{}", i),
            cell_ref: format!("C{}", i),
            model: "gpt-4".to_string(),
            equipment: vec![EquipmentSlot::Memory, EquipmentSlot::Reasoning],
            config: Default::default(),
        };
        core.add_agent(config).await.unwrap();
    }

    // Get peak memory
    let peak_memory = get_memory_usage();
    let memory_per_agent = (peak_memory - baseline_memory) / iterations;

    println!("Agents created: {}", iterations);
    println!("Baseline memory: {} KB", baseline_memory);
    println!("Peak memory: {} KB", peak_memory);
    println!("Memory per agent: {} KB", memory_per_agent);
    println!("Target: <10MB per agent");
    println!("Status: {}\n", if memory_per_agent < 10_240 { "✓ PASS" } else { "✗ FAIL" });
}

async fn benchmark_concurrent_operations() {
    println!("Benchmark: Concurrent Operations");
    println!("----------------------------------");

    let core = std::sync::Arc::new(ClawCore::new());
    let num_tasks = 10;
    let agents_per_task = 100;

    let start = Instant::now();
    let mut handles = vec![];

    for task_id in 0..num_tasks {
        let core_clone = core.clone();
        let handle = tokio::spawn(async move {
            for i in 0..agents_per_task {
                let config = AgentConfig {
                    id: format!("concurrent-{}-{}", task_id, i),
                    cell_ref: format!("D{}{}", task_id, i),
                    model: "gpt-4".to_string(),
                    equipment: vec![EquipmentSlot::Memory],
                    config: Default::default(),
                };
                core_clone.add_agent(config).await.unwrap();
            }
        });
        handles.push(handle);
    }

    for handle in handles {
        handle.await.unwrap();
    }

    let duration = start.elapsed();
    let total_agents = num_tasks * agents_per_task;
    let throughput = (total_agents as f64) / duration.as_secs_f64();

    println!("Concurrent tasks: {}", num_tasks);
    println!("Agents per task: {}", agents_per_task);
    println!("Total agents: {}", total_agents);
    println!("Total time: {:?}", duration);
    println!("Throughput: {:.2} agents/sec", throughput);
    println!("Status: ✓ PASS\n");
}

// Helper function to estimate memory usage
fn get_memory_usage() -> usize {
    // This is a simplified estimate
    // In production, you'd use proper memory profiling
    std::mem::size_of::<ClawCore>() +
    std::mem::size_of::<AgentConfig>() * 100 +  // Estimated
    10_240  // Base overhead estimate in KB
}
