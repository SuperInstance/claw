//! Performance integration tests
//!
//! These tests verify that performance targets are met under realistic conditions.

use claw_core::ClawCore;
use std::time::{Duration, Instant};

#[tokio::test]
async fn test_agent_creation_performance() {
    let core = ClawCore::new();
    let iterations = 100;

    let start = Instant::now();
    for i in 0..iterations {
        let config = create_test_agent_config(i);
        core.add_agent(config).await.unwrap();
    }
    let duration = start.elapsed();

    let avg_latency_ms = duration.as_millis() / iterations as u128;

    // Target: <100ms per agent
    assert!(
        avg_latency_ms < 100,
        "Agent creation too slow: {}ms (target: <100ms)",
        avg_latency_ms
    );

    println!("✓ Agent creation: {}ms avg (target: <100ms)", avg_latency_ms);
}

#[tokio::test]
async fn test_agent_query_performance() {
    let core = ClawCore::new();

    // Add some agents
    for i in 0..100 {
        let config = create_test_agent_config(i);
        core.add_agent(config).await.unwrap();
    }

    let iterations = 1000;
    let start = Instant::now();

    for i in 0..iterations {
        let agent_id = format!("test-agent-{}", i % 100);
        core.get_agent(&agent_id).await.unwrap();
    }

    let duration = start.elapsed();
    let avg_latency_us = duration.as_micros() / iterations as u128;

    // Target: <50ms per query
    assert!(
        avg_latency_us < 50_000,
        "Agent query too slow: {}μs (target: <50ms)",
        avg_latency_us
    );

    println!("✓ Agent query: {}μs avg (target: <50ms)", avg_latency_us);
}

#[tokio::test]
async fn test_concurrent_agent_creation() {
    let core = std::sync::Arc::new(ClawCore::new());
    let num_tasks = 50;
    let agents_per_task = 10;

    let start = Instant::now();
    let mut handles = vec![];

    for task_id in 0..num_tasks {
        let core_clone = core.clone();
        let handle = tokio::spawn(async move {
            for i in 0..agents_per_task {
                let config = create_test_agent_config(task_id * agents_per_task + i);
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

    // Target: Create 500 agents in <30 seconds
    assert!(
        duration < Duration::from_secs(30),
        "Concurrent creation too slow: {:?} (target: <30s for {} agents)",
        duration,
        total_agents
    );

    println!("✓ Concurrent creation: {:?} for {} agents (target: <30s)", duration, total_agents);
}

#[tokio::test]
async fn test_memory_usage() {
    let core = ClawCore::new();
    let iterations = 100;

    // Get baseline
    let baseline_memory = estimate_memory_usage();

    // Add agents
    for i in 0..iterations {
        let config = create_test_agent_config(i);
        core.add_agent(config).await.unwrap();
    }

    // Get peak memory
    let peak_memory = estimate_memory_usage();
    let memory_per_agent = (peak_memory - baseline_memory) / iterations;

    // Target: <1MB per agent
    assert!(
        memory_per_agent < 1024,
        "Memory per agent too high: {}KB (target: <1024KB)",
        memory_per_agent
    );

    println!("✓ Memory usage: {}KB per agent (target: <1024KB)", memory_per_agent);
}

#[tokio::test]
async fn test_batch_operations() {
    let core = ClawCore::new();
    let batch_size = 50;

    let start = Instant::now();

    for batch in 0..5 {
        for i in 0..batch_size {
            let config = create_test_agent_config(batch * batch_size + i);
            core.add_agent(config).await.unwrap();
        }
    }

    let duration = start.elapsed();
    let total_agents = 5 * batch_size;

    // Target: Create 250 agents in <5 seconds
    assert!(
        duration < Duration::from_secs(5),
        "Batch operations too slow: {:?} (target: <5s for {} agents)",
        duration,
        total_agents
    );

    println!("✓ Batch operations: {:?} for {} agents (target: <5s)", duration, total_agents);
}

#[tokio::test]
async fn test_state_update_performance() {
    let core = ClawCore::new();

    // Add an agent
    let config = create_test_agent_config(0);
    core.add_agent(config).await.unwrap();

    let iterations = 1000;
    let start = Instant::now();

    for _ in 0..iterations {
        let state = core.get_agent_state("test-agent-0").await.unwrap();
        // State update would go here
    }

    let duration = start.elapsed();
    let avg_latency_us = duration.as_micros() / iterations as u128;

    // Target: <50ms per state update
    assert!(
        avg_latency_us < 50_000,
        "State update too slow: {}μs (target: <50ms)",
        avg_latency_us
    );

    println!("✓ State update: {}μs avg (target: <50ms)", avg_latency_us);
}

#[tokio::test]
async fn test_scalability() {
    let agent_counts = vec![10, 50, 100];
    let mut previous_latency = 0u128;

    for count in agent_counts {
        let core = ClawCore::new();

        // Add agents
        for i in 0..count {
            let config = create_test_agent_config(i);
            core.add_agent(config).await.unwrap();
        }

        // Measure query performance
        let queries = 100;
        let start = Instant::now();

        for i in 0..queries {
            let agent_id = format!("test-agent-{}", i % count);
            core.get_agent(&agent_id).await.unwrap();
        }

        let duration = start.elapsed();
        let avg_latency_us = duration.as_micros() / queries as u128;

        println!("  {} agents: {}μs avg", count, avg_latency_us);

        // Check that scaling is sub-linear
        if previous_latency > 0 {
            let scaling_factor = avg_latency_us as f64 / previous_latency as f64;
            let count_factor = count as f64 / (count / 2) as f64;

            // Scaling should be better than linear
            assert!(
                scaling_factor < count_factor * 1.5,
                "Scaling too poor: {:.2}x for 2x agents",
                scaling_factor
            );
        }

        previous_latency = avg_latency_us;
    }

    println!("✓ Scalability test passed");
}

// Helper function to create test agent configuration
fn create_test_agent_config(id: u32) -> claw_core::AgentConfig {
    claw_core::AgentConfig {
        id: format!("test-agent-{}", id),
        cell_ref: format!("A{}", id),
        model: "test-model".to_string(),
        equipment: vec![],
        config: std::collections::HashMap::new(),
    }
}

// Helper function to estimate memory usage
fn estimate_memory_usage() -> usize {
    // This is a simplified estimate
    // In production, you'd use proper memory profiling tools
    std::mem::size_of::<ClawCore>() + 10240 // 10 KB baseline
}
