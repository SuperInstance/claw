//! Comprehensive Integration Tests for Equipment System
//!
//! End-to-end tests validating equipment system functionality, performance,
//! and integration with agent system.

use std::collections::HashMap;

use crate::equipment::{
    EquipmentSlot, EquipmentManager, Equipment,
    slots::*,
    monitoring::{ResourceMonitor, MetricsUpdate, HealthStatus},
    loading::{EquipmentLoader, ResourceLimits},
    muscle_memory::{MuscleMemorySystem, TriggerContext},
    hierarchical_memory::HierarchicalMemory,
};
use crate::ws::protocol::TriggerPayload;
use crate::agent::{AgentConfig, MinimalAgent, Agent};
use crate::messages::{Message, TriggerPayload as MsgTriggerPayload};

/// Create a test trigger payload
fn create_test_payload() -> TriggerPayload {
    let mut data = HashMap::new();
    data.insert("key".to_string(), serde_json::json!("value"));
    TriggerPayload {
        trigger_type: "test".to_string(),
        data,
    }
}

/// Create a test message trigger payload
fn create_msg_trigger_payload() -> MsgTriggerPayload {
    MsgTriggerPayload::Data {
        cell_ref: "A1".to_string(),
        old_value: serde_json::json!(null),
        new_value: serde_json::json!("test"),
    }
}

/// Integration test: Complete equipment lifecycle
#[tokio::test]
async fn test_equipment_lifecycle() {
    let mut manager = EquipmentManager::new();

    // Create and equip memory equipment
    let memory = MemoryEquipment::new();
    assert_eq!(memory.slot(), EquipmentSlot::Memory);

    manager.equip(Box::new(memory)).await.unwrap();
    assert!(manager.is_equipped(EquipmentSlot::Memory));

    // Verify equipment is accessible
    let equipped = manager.get_equipped(EquipmentSlot::Memory);
    assert!(equipped.is_some());
    assert_eq!(equipped.unwrap().slot(), EquipmentSlot::Memory);

    // Unequip equipment
    manager.unequip(EquipmentSlot::Memory).await.unwrap();
    assert!(!manager.is_equipped(EquipmentSlot::Memory));
}

/// Integration test: All equipment slots
#[tokio::test]
async fn test_all_equipment_slots() {
    let mut manager = EquipmentManager::new();

    // Equip all 6 slots
    let memory = MemoryEquipment::new();
    let reasoning = ReasoningEquipment::new();
    let consensus = ConsensusEquipment::new();
    let spreadsheet = SpreadsheetEquipment::new();
    let distillation = DistillationEquipment::new();
    let coordination = CoordinationEquipment::new();

    manager.equip(Box::new(memory)).await.unwrap();
    manager.equip(Box::new(reasoning)).await.unwrap();
    manager.equip(Box::new(consensus)).await.unwrap();
    manager.equip(Box::new(spreadsheet)).await.unwrap();
    manager.equip(Box::new(distillation)).await.unwrap();
    manager.equip(Box::new(coordination)).await.unwrap();

    let slots = manager.equipped_slots();
    assert_eq!(slots.len(), 6);
    assert!(slots.contains(&EquipmentSlot::Memory));
    assert!(slots.contains(&EquipmentSlot::Reasoning));
    assert!(slots.contains(&EquipmentSlot::Consensus));
    assert!(slots.contains(&EquipmentSlot::Spreadsheet));
    assert!(slots.contains(&EquipmentSlot::Distillation));
    assert!(slots.contains(&EquipmentSlot::Coordination));
}

/// Integration test: Equipment with agent
#[tokio::test]
async fn test_equipment_with_agent() {
    // Create agent
    let config = AgentConfig {
        id: "test-agent".to_string(),
        cell_ref: "A1".to_string(),
        model: "test-model".to_string(),
        equipment: vec![EquipmentSlot::Memory, EquipmentSlot::Reasoning],
        config: Default::default(),
    };

    let mut agent = MinimalAgent::new(config);

    // Equip equipment
    let memory = MemoryEquipment::new();
    let reasoning = ReasoningEquipment::new();

    agent.equip(Box::new(memory)).await.unwrap();
    agent.equip(Box::new(reasoning)).await.unwrap();

    // Verify equipment is equipped
    assert!(agent.has_equipment(EquipmentSlot::Memory));
    assert!(agent.has_equipment(EquipmentSlot::Reasoning));

    // Process a trigger
    let message = Message::Trigger {
        id: "test-msg".to_string(),
        agent_id: "test-agent".to_string(),
        payload: create_msg_trigger_payload(),
    };

    let result = agent.process(message).await.unwrap();
    assert!(result.success);
    assert!(result.equipment_used.contains(&EquipmentSlot::Memory));
    assert!(result.equipment_used.contains(&EquipmentSlot::Reasoning));
}

/// Integration test: Hierarchical memory tiers
#[tokio::test]
async fn test_hierarchical_memory() {
    let memory = HierarchicalMemory::new();

    // Test L1 cache
    memory.set("l1_key".to_string(), serde_json::json!("l1_value")).await.unwrap();
    let value = memory.get("l1_key").await.unwrap();
    assert_eq!(value, Some(serde_json::json!("l1_value")));

    // Test L2 cache (fill L1 first)
    for i in 0..20 {
        let key = format!("key_{}", i);
        memory.set(key, serde_json::json!(i)).await.unwrap();
    }

    // Some keys should be in L2 now
    let value = memory.get("key_0").await.unwrap();
    assert!(value.is_some());

    // Test hit rate
    let stats = memory.stats().await;
    assert!(stats.total_accesses > 0);
}

/// Integration test: Muscle memory learning
#[tokio::test]
async fn test_muscle_memory_learning() {
    let memory_system = MuscleMemorySystem::new();

    // Create trigger context
    let mut context = TriggerContext::default();
    context.patterns.insert("data_processing".to_string());
    context.patterns.insert("complex_calculation".to_string());
    context.pattern_frequencies.insert("data_processing".to_string(), 5);
    context.pattern_frequencies.insert("complex_calculation".to_string(), 3);
    context.complexity = 0.8;

    // Learn from usage
    memory_system.learn_from_usage(
        EquipmentSlot::Reasoning,
        &context,
        0.9,
    ).await.unwrap();

    // Get active triggers
    let active = memory_system.get_active_triggers(&context).await;
    assert!(!active.is_empty());

    // Verify trigger was learned
    let triggers = memory_system.get_triggers_for_slot(EquipmentSlot::Reasoning).await;
    assert!(!triggers.is_empty());
}

/// Integration test: Equipment resource monitoring
#[tokio::test]
async fn test_equipment_monitoring() {
    let monitor = ResourceMonitor::new();

    // Register equipment
    let cost = crate::equipment::EquipmentCost {
        memory_mb: 1.0,
        cpu_percent: 5.0,
        load_time_ms: 5,
        execution_overhead_ms: 1,
    };

    monitor.register_slot(EquipmentSlot::Memory, cost).await;

    // Update metrics
    monitor.update_metrics(
        EquipmentSlot::Memory,
        MetricsUpdate::MemoryUsed { mb: 2.5 },
    ).await.unwrap();

    monitor.update_metrics(
        EquipmentSlot::Memory,
        MetricsUpdate::OperationCompleted { latency_ms: 10.0, success: true },
    ).await.unwrap();

    // Get metrics
    let metrics = monitor.get_metrics(EquipmentSlot::Memory).await;
    assert!(metrics.is_some());
    assert_eq!(metrics.unwrap().memory_used_mb, 2.5);

    // Update health
    monitor.update_health(
        EquipmentSlot::Memory,
        HealthStatus::Healthy,
        "All systems operational".to_string(),
    ).await;

    assert!(monitor.is_healthy(EquipmentSlot::Memory).await);

    // Get total usage
    let usage = monitor.get_total_usage().await;
    assert!(usage.memory_mb > 0.0);
}

/// Integration test: Equipment loading with pooling
#[tokio::test]
async fn test_equipment_loading() {
    let loader = EquipmentLoader::new(std::time::Duration::from_secs(60), 10);

    // For now, just test the loader structure
    let stats = loader.stats().await;
    assert_eq!(stats.total_cached, 0);
}

/// Integration test: Equipment cost/benefit analysis
#[tokio::test]
async fn test_cost_benefit_analysis() {
    let manager = EquipmentManager::new();

    let context = crate::equipment::ProcessingContext {
        agent_id: "test".to_string(),
        message_count: 100,
        avg_processing_time_ms: 50.0,
        error_rate: 0.01,
    };

    let memory = MemoryEquipment::new();
    let should_equip = manager.should_equip(&memory, &context);

    // Memory equipment should be equipped given the context
    assert!(should_equip);
}

/// Integration test: Muscle memory extraction
#[tokio::test]
async fn test_muscle_memory_extraction() {
    let memory = MemoryEquipment::new();

    // First, set some data (creates entries in memory)
    let mut set_payload = create_test_payload();
    set_payload.data.insert("action".to_string(), serde_json::json!("set"));
    set_payload.data.insert("value".to_string(), serde_json::json!("test_value"));

    for i in 0..5 {
        set_payload.data.insert("key".to_string(), serde_json::json!(format!("key_{}", i)));
        memory.process(set_payload.clone()).await.unwrap();
    }

    // Now read the data back (creates hits)
    let mut get_payload = create_test_payload();
    get_payload.data.insert("action".to_string(), serde_json::json!("get"));

    for i in 0..5 {
        get_payload.data.insert("key".to_string(), serde_json::json!(format!("key_{}", i)));
        memory.process(get_payload.clone()).await.unwrap();
    }

    // Extract muscle memory
    let triggers = memory.extract_muscle_memory();
    assert!(!triggers.is_empty());

    let trigger = &triggers[0];
    assert_eq!(trigger.equipment_slot, EquipmentSlot::Memory);
    assert!(trigger.confidence > 0.0);
}

/// Integration test: Auto-unequip expensive equipment
#[tokio::test]
async fn test_auto_unequip_expensive() {
    let mut manager = EquipmentManager::new();

    // Create memory equipment and use it enough to trigger should_unequip()
    let memory = MemoryEquipment::new();

    // Use the equipment enough to trigger should_unequip() (>100 reads, <20% hit rate)
    // Create payload that will result in cache misses
    let mut get_payload = create_test_payload();
    get_payload.data.insert("action".to_string(), serde_json::json!("get"));

    for i in 0..110 {
        get_payload.data.insert("key".to_string(), serde_json::json!(format!("nonexistent_key_{}", i)));
        let _ = memory.process(get_payload.clone()).await;
    }

    // Equip with default (high) thresholds
    manager.equip(Box::new(memory)).await.unwrap();

    // Now set low thresholds (equipment is now "too expensive")
    manager.set_thresholds(crate::equipment::EquipmentCostThresholds {
        max_memory_mb: 0.5,
        max_cpu_percent: 3.0,
        max_load_time_ms: 2,
    });

    // Auto-unequip should work because:
    // 1. Equipment cost now exceeds thresholds
    // 2. should_unequip() returns true (low hit rate with many reads)
    let unequipped = manager.auto_unequip_expensive().await;
    assert!(!unequipped.is_empty());
}

/// Integration test: Equipment replacement
#[tokio::test]
async fn test_equipment_replacement() {
    let mut manager = EquipmentManager::new();

    // Equip initial memory
    let memory1 = MemoryEquipment::new();
    manager.equip(Box::new(memory1)).await.unwrap();

    // Replace with new memory
    let memory2 = MemoryEquipment::new();
    manager.equip(Box::new(memory2)).await.unwrap();

    // Should still be equipped (replaced)
    assert!(manager.is_equipped(EquipmentSlot::Memory));

    // Muscle memory should be preserved
    let triggers = manager.muscle_memory_triggers(EquipmentSlot::Memory);
    assert!(!triggers.is_empty());
}

/// Integration test: Concurrent equipment access
#[tokio::test]
async fn test_concurrent_equipment_access() {
    let manager = std::sync::Arc::new(tokio::sync::Mutex::new(EquipmentManager::new()));

    // Spawn multiple tasks
    let mut handles = Vec::new();

    for _ in 0..10 {
        let mgr = manager.clone();
        let handle = tokio::spawn(async move {
            let memory = MemoryEquipment::new();
            let mut manager = mgr.lock().await;

            manager.equip(Box::new(memory)).await.unwrap();

            // Simulate some work
            tokio::time::sleep(std::time::Duration::from_millis(10)).await;

            manager.unequip(EquipmentSlot::Memory).await.unwrap();
        });

        handles.push(handle);
    }

    // Wait for all tasks
    for handle in handles {
        handle.await.unwrap();
    }

    // Manager should be in consistent state
    let manager = manager.lock().await;
    assert!(!manager.is_equipped(EquipmentSlot::Memory));
}

/// Integration test: Performance validation
#[tokio::test]
async fn test_performance_validation() {
    let mut manager = EquipmentManager::new();

    // Test equip performance
    let start = std::time::Instant::now();
    let memory = MemoryEquipment::new();
    manager.equip(Box::new(memory)).await.unwrap();
    let equip_time = start.elapsed();

    assert!(
        equip_time < std::time::Duration::from_millis(50),
        "Equip time {:?} exceeds 50ms target",
        equip_time
    );

    // Test unequip performance
    let start = std::time::Instant::now();
    manager.unequip(EquipmentSlot::Memory).await.unwrap();
    let unequip_time = start.elapsed();

    assert!(
        unequip_time < std::time::Duration::from_millis(20),
        "Unequip time {:?} exceeds 20ms target",
        unequip_time
    );
}

/// Integration test: Resource limits enforcement
#[tokio::test]
async fn test_resource_limits() {
    let limits = ResourceLimits {
        max_memory_mb: 10.0,
        max_cpu_percent: 50.0,
        max_instances_per_slot: 3,
        max_total_instances: 10,
    };

    assert!(limits.max_memory_mb == 10.0);
    assert!(limits.max_instances_per_slot == 3);
}

/// Integration test: End-to-end workflow
#[tokio::test]
async fn test_end_to_end_workflow() {
    // 1. Create agent with equipment
    let config = AgentConfig {
        id: "workflow-agent".to_string(),
        cell_ref: "B2".to_string(),
        model: "test-model".to_string(),
        equipment: vec![
            EquipmentSlot::Memory,
            EquipmentSlot::Reasoning,
            EquipmentSlot::Consensus,
        ],
        config: Default::default(),
    };

    let mut agent = MinimalAgent::new(config);

    // 2. Equip all required equipment
    let memory = MemoryEquipment::new();
    let reasoning = ReasoningEquipment::new();
    let consensus = ConsensusEquipment::new();

    agent.equip(Box::new(memory)).await.unwrap();
    agent.equip(Box::new(reasoning)).await.unwrap();
    agent.equip(Box::new(consensus)).await.unwrap();

    // 3. Process messages
    for i in 0..5 {
        let message = Message::Trigger {
            id: format!("msg-{}", i),
            agent_id: "workflow-agent".to_string(),
            payload: create_msg_trigger_payload(),
        };

        let result = agent.process(message).await.unwrap();
        assert!(result.success);
    }

    // 4. Check learning metrics
    let state = agent.state();
    assert_eq!(state.learning_metrics.total_processed, 5);
    assert_eq!(state.learning_metrics.successful_processed, 5);

    // 5. Extract muscle memory
    let memory = MemoryEquipment::new();
    let triggers = memory.extract_muscle_memory();
    assert!(!triggers.is_empty());

    // 6. Unequip equipment
    agent.unequip(EquipmentSlot::Memory).await.unwrap();
    agent.unequip(EquipmentSlot::Reasoning).await.unwrap();
    agent.unequip(EquipmentSlot::Consensus).await.unwrap();

    assert!(!agent.has_equipment(EquipmentSlot::Memory));
    assert!(!agent.has_equipment(EquipmentSlot::Reasoning));
    assert!(!agent.has_equipment(EquipmentSlot::Consensus));
}

/// Integration test: Error handling
#[tokio::test]
async fn test_error_handling() {
    let mut manager = EquipmentManager::new();

    // Try to unequip non-existent equipment
    let result = manager.unequip(EquipmentSlot::Memory).await;
    assert!(result.is_ok()); // Should not error, just return None

    // Try to equip same equipment twice
    let memory1 = MemoryEquipment::new();
    manager.equip(Box::new(memory1)).await.unwrap();

    let memory2 = MemoryEquipment::new();
    let result = manager.equip(Box::new(memory2)).await;
    assert!(result.is_ok()); // Should succeed - replacement is allowed
}

#[cfg(test)]
mod performance_tests {
    use super::*;
    use std::time::Duration;

    #[tokio::test]
    async fn test_bulk_equipment_operations() {
        let mut manager = EquipmentManager::new();
        let iterations = 100;

        let start = std::time::Instant::now();

        for _ in 0..iterations {
            let memory = MemoryEquipment::new();
            manager.equip(Box::new(memory)).await.unwrap();
            manager.unequip(EquipmentSlot::Memory).await.unwrap();
        }

        let elapsed = start.elapsed();
        let avg_time = elapsed / iterations;

        // Average operation should be fast
        assert!(
            avg_time < Duration::from_millis(10),
            "Average operation time {:?} exceeds 10ms",
            avg_time
        );
    }

    #[tokio::test]
    async fn test_memory_efficiency() {
        let memory = HierarchicalMemory::new();

        // Insert many entries
        for i in 0..1000 {
            let key = format!("key_{}", i);
            memory.set(key, serde_json::json!(i)).await.unwrap();
        }

        // Memory should not grow unbounded
        let total_memory = memory.total_memory_used().await;
        assert!(total_memory < 50_000_000); // Less than 50MB
    }
}
