//! Example: Basic Claw Lifecycle
//! Demonstrates the Thermodynamic State Machine in action.

use claw_runtime::{ClawRuntime, ClawConfig, EquipmentId, StubModelClient};
use std::time::Duration;
use tracing_subscriber;

#[tokio::main]
async fn main() {
    // Initialize logging
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::INFO)
        .init();

    // 1. Configuration
    let config = ClawConfig {
        id: "demo-lookout".to_string(),
        model_id: "stub-debug".to_string(),
        initial_equipment: vec![EquipmentId::Memory, EquipmentId::Reasoning],
        system_prompt: "You are a lookout on a fishing vessel. You are vigilant and precise. You report what you see.".to_string(),
    };

    // 2. Start the Runtime
    println!("=================================================================");
    println!("🚀 Starting Claw Engine Demo (with Stub Model)");
    println!("=================================================================");
    println!("Agent ID: {}", config.id);
    println!("Model: StubModelClient (Echoes Prompt)");
    println!("Equipped: Memory, Reasoning");
    println!("=================================================================");

    // Create runtime with the stub client
    let mut runtime = ClawRuntime::new(config);

    // 3. Run Demo
    // First tick: Initial state, trigger provided
    println!("\n[Tick 1] Sending initial trigger: 'Horizon is clear. No ships visible.'");
    runtime.handle_trigger(claw_runtime::TriggerEvent::Message(
        "Horizon is clear. No ships visible.".to_string()
    )).await;

    // Wait a bit
    tokio::time::sleep(Duration::from_millis(100)).await;

    // Second tick: Check idle state
    println!("\n[Tick 2] Running idle tick (no trigger)...");
    runtime.run().await;

    // Third tick: High entropy trigger
    println!("\n[Tick 3] Sending critical trigger: 'REMEMBER: Radar blip detected at 045 degrees.'");
    runtime.handle_trigger(claw_runtime::TriggerEvent::Message(
        "REMEMBER: Radar blip detected at 045 degrees.".to_string()
    )).await;

    println!("\n=================================================================");
    println!("🛑 Demo Complete.");
    println!("=================================================================");
}
