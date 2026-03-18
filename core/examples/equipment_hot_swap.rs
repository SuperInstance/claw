//! Equipment Hot-Swapping Example
//!
//! This example demonstrates the dynamic equipment system where agents can
//! equip and unequip modules based on their needs. The system performs
//! cost/benefit analysis and extracts muscle memory triggers for future use.

use claw_core::{
    agent::{MinimalAgent, AgentConfig, Agent},
    equipment::{
        EquipmentSlot, EquipmentManager, MuscleMemoryTrigger,
        SimpleMemoryEquipment, ReasoningEngine, TripartiteConsensus,
        TileInterface, Quantizer, SwarmCoordinator,
    },
};
use std::collections::HashMap;
use tokio::time::{sleep, Duration};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize logging
    tracing_subscriber::fmt::init();

    println!("=== Equipment Hot-Swapping Example ===\n");

    // Create an agent with minimal equipment
    let config = AgentConfig {
        id: uuid::Uuid::new_v4().to_string(),
        cell_ref: "A1".to_string(),
        model: "deepseek-chat".to_string(),
        equipment: vec![EquipmentSlot::Memory],
        config: HashMap::new(),
    };

    let mut agent = MinimalAgent::new(config.clone());
    let mut manager = EquipmentManager::new();

    let agent_state = Agent::state(&agent);
    println!("Created agent {} with initial equipment: {:?}", config.id, agent_state.equipment);

    // Equip initial memory equipment
    let memory_equipment = Box::new(SimpleMemoryEquipment::new());
    manager.equip(memory_equipment).await?;
    println!("Equipment manager equipped: {:?}\n", manager.equipped_slots());

    // Simulate processing different types of tasks
    println!("--- Processing Tasks ---\n");

    // Task 1: Simple data monitoring (no additional equipment needed)
    println!("Task 1: Simple data monitoring");
    let result = process_task(&mut agent, "monitor_temperature", 25.5).await?;
    println!("Result: {:?}\n", result);

    // Task 2: Complex decision making (requires reasoning)
    println!("Task 2: Complex decision making");
    if !manager.is_equipped(EquipmentSlot::Reasoning) {
        println!("Equipping Reasoning module...");
        let reasoning_equipment = Box::new(ReasoningEngine::new());
        manager.equip(reasoning_equipment).await?;
        println!("Current equipment: {:?}", manager.equipped_slots());
    }
    let result = process_task(&mut agent, "anomaly_detection", vec![1, 2, 3, 100, 5]).await?;
    println!("Result: {:?}\n", result);

    // Task 3: Multi-agent consensus (requires consensus module)
    println!("Task 3: Multi-agent consensus");
    if !manager.is_equipped(EquipmentSlot::Consensus) {
        println!("Equipping Consensus module...");
        let consensus_equipment = Box::new(TripartiteConsensus::new());
        manager.equip(consensus_equipment).await?;
        println!("Current equipment: {:?}", manager.equipped_slots());
    }
    let result = process_task(&mut agent, "consensus_vote", "Should we proceed?").await?;
    println!("Result: {:?}\n", result);

    // Task 4: Back to simple task (unequip unnecessary equipment)
    println!("Task 4: Back to simple monitoring");
    println!("Analyzing equipment usage...");

    // Unequip consensus module (least frequently used)
    if manager.is_equipped(EquipmentSlot::Consensus) {
        println!("Unequipping Consensus module...");
        if let Some(consensus) = manager.unequip(EquipmentSlot::Consensus).await? {
            let muscle_memory = consensus.extract_muscle_memory();
            println!("Extracted muscle memory triggers:");
            for trigger in muscle_memory {
                println!("  - {:?} when: {:?}", trigger.equipment_slot, trigger.condition);
            }
        }
        println!("Current equipment: {:?}", manager.equipped_slots());
    }

    // Task 5: Demonstrate all equipment types
    println!("\nTask 5: Demonstrating all equipment types");

    // Spreadsheet equipment
    println!("  → Equipping Spreadsheet module...");
    let spreadsheet_equipment = Box::new(TileInterface::new());
    manager.equip(spreadsheet_equipment).await?;

    // Distillation equipment
    println!("  → Equipping Distillation module...");
    let distillation_equipment = Box::new(Quantizer::new());
    manager.equip(distillation_equipment).await?;

    // Coordination equipment
    println!("  → Equipping Coordination module...");
    let coordination_equipment = Box::new(SwarmCoordinator::new());
    manager.equip(coordination_equipment).await?;

    println!("All equipment equipped: {:?}", manager.equipped_slots());

    // Task 6: Cost/benefit analysis
    println!("\nTask 6: Cost/Benefit Analysis");
    for slot in manager.equipped_slots() {
        if let Some(equipment) = manager.get_equipped(slot) {
            let cost = equipment.cost();
            println!("  {:?}: Memory={:.1}MB, CPU={:.1}%, Load={}ms",
                slot, cost.memory_mb, cost.cpu_percent, cost.load_time_ms);
        }
    }

    println!("\n=== Equipment Hot-Swapping Complete ===");
    Ok(())
}

/// Process a task with the agent
async fn process_task<T: serde::Serialize>(
    _agent: &mut MinimalAgent,
    task_type: &str,
    input: T,
) -> Result<String, Box<dyn std::error::Error>> {
    // Simulate task processing
    sleep(Duration::from_millis(100)).await;

    // Create a simple result
    let result = format!("Processed '{}' with input: {}", task_type, serde_json::to_string(&input)?);

    Ok(result)
}
