//! Integration tests for ClawCore

use claw_core::{
    ClawCore, AgentConfig, EquipmentSlot,
    SimpleMemoryEquipment, ReasoningEngine,
    SocialRelation,
};

#[tokio::test]
async fn test_complete_agent_lifecycle() {
    let core = ClawCore::new();

    let config = AgentConfig {
        id: "test-agent-1".to_string(),
        cell_ref: "A1".to_string(),
        model: "gpt-4".to_string(),
        equipment: vec![EquipmentSlot::Memory],
        config: Default::default(),
    };

    core.add_agent(config).await.unwrap();
    assert!(core.has_agent("test-agent-1").await);
    assert_eq!(core.agent_count().await, 1);

    core.remove_agent("test-agent-1").await.unwrap();
    assert!(!core.has_agent("test-agent-1").await);
    assert_eq!(core.agent_count().await, 0);
}

#[tokio::test]
async fn test_social_coordination() {
    let core = ClawCore::new();

    for i in 1..=2 {
        let config = AgentConfig {
            id: format!("agent-{}", i),
            cell_ref: format!("A{}", i),
            model: "gpt-4".to_string(),
            equipment: vec![EquipmentSlot::Memory],
            config: Default::default(),
        };
        core.add_agent(config).await.unwrap();
    }

    core.add_relationship(
        "agent-1".to_string(),
        "agent-2".to_string(),
        SocialRelation::CoWorker,
    ).await.unwrap();
}

#[tokio::test]
async fn test_trigger_registration() {
    let mut core = ClawCore::new();

    core.register_cell_trigger("A1".to_string(), "agent-1".to_string()).await.unwrap();
    core.register_periodic_trigger("agent-2".to_string(), 5000).await.unwrap();
}

#[tokio::test]
async fn test_equipment_manager() {
    let mut manager = claw_core::EquipmentManager::new();

    manager.equip(Box::new(SimpleMemoryEquipment::new())).await.unwrap();
    assert!(manager.is_equipped(claw_core::EquipmentSlot::Memory));

    manager.unequip(claw_core::EquipmentSlot::Memory).await.unwrap();
    assert!(!manager.is_equipped(claw_core::EquipmentSlot::Memory));
}

#[tokio::test]
async fn test_performance_basic() {
    let core = ClawCore::new();
    let start = std::time::Instant::now();

    for i in 0..100 {
        let config = AgentConfig {
            id: format!("perf-agent-{}", i),
            cell_ref: format!("A{}", i),
            model: "gpt-4".to_string(),
            equipment: vec![],
            config: Default::default(),
        };
        core.add_agent(config).await.unwrap();
    }

    let duration = start.elapsed();
    assert!(duration.as_millis() < 1000);
    assert_eq!(core.agent_count().await, 100);
}

#[tokio::test]
async fn test_concurrent_operations() {
    let core = std::sync::Arc::new(ClawCore::new());
    let mut handles = vec![];

    for i in 0..10 {
        let core_clone = core.clone();
        let handle = tokio::spawn(async move {
            let config = AgentConfig {
                id: format!("concurrent-agent-{}", i),
                cell_ref: format!("A{}", i),
                model: "gpt-4".to_string(),
                equipment: vec![EquipmentSlot::Memory],
                config: Default::default(),
            };
            core_clone.add_agent(config).await.unwrap();
        });
        handles.push(handle);
    }

    for handle in handles {
        handle.await.unwrap();
    }

    assert_eq!(core.agent_count().await, 10);
}

#[tokio::test]
async fn test_error_handling() {
    let core = ClawCore::new();

    let config = AgentConfig {
        id: "duplicate-agent".to_string(),
        cell_ref: "A1".to_string(),
        model: "gpt-4".to_string(),
        equipment: vec![],
        config: Default::default(),
    };

    core.add_agent(config.clone()).await.unwrap();
    let result = core.add_agent(config).await;
    assert!(result.is_err());

    let result = core.remove_agent("non-existent").await;
    assert!(result.is_err());
}
