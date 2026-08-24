//! Example: Basic Claw Lifecycle
//! Demonstrates the Thermodynamic State Machine in action.

use chrono::Utc;
use claw_core::{
    ClawAgent, EquipmentSlot, EquipmentType, GammaState, LearningStrategy, MoltState,
    ModelConfiguration, Phase, Seed, ThermodynamicState, Trigger,
};
use claw_runtime::{ClawRuntime, StubModelClient};
use std::time::Duration;
use tracing_subscriber;
use uuid::Uuid;

#[tokio::main]
async fn main() {
    // Initialize logging to see the engine's internal state
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::INFO)
        .init();

    // 1. Construct a ClawAgent manually
    let agent = ClawAgent {
        id: Uuid::new_v4(),
        version: "0.1.0".to_string(),
        name: "Demo Claw - The Lookout".to_string(),
        model_config: ModelConfiguration {
            provider: "stub".to_string(),
            model_id: "local-debug".to_string(),
            temperature: Some(0.7),
            deterministic: Some(false),
            context_window: Some(4096),
        },
        state: ThermodynamicState {
            phase: Phase::Dormant,
            cycle_count: 0,
            gamma: GammaState {
                potential: 1.0,
                delta: 0.0,
            },
            eta: claw_core::EtaState {
                entropy: 0.0,
                delta: 0.0,
            },
            molt: MoltState {
                generation: 0,
                history: vec![],
            },
        },
        temperature: 0.7,
        semantic_distance: 0.0,
        last_validation: Utc::now(),
        molt_count: 0,
        capability: Some(0.9),
        equipment: vec![EquipmentSlot {
            slot_type: EquipmentType::Memory,
            active: true,
            module: None,
            activation_condition: None,
            cost: None,
        }],
        seed: Seed {
            id: Some(Uuid::new_v4()),
            purpose: "Monitor the horizon. Report what you see.".to_string(),
            trigger: Trigger::Periodic { interval: 1000 }, // Tick every 1 second
            learning_strategy: LearningStrategy::Reinforcement,
            default_equipment: vec!["MEMORY".to_string()],
        },
        shell: claw_core::Shell {
            id: "Demo-Shell-001".to_string(),
            molt_count: Some(0),
            last_molt: None,
            identity_hash: None,
            history: None,
        },
        execution_context: None,
        origin: None,
    };

    // 2. Start the Runtime
    println!("=================================================================");
    println!("🚀 Starting Claw Engine Demo (with Stub Model)");
    println!("=================================================================");
    println!("Agent ID: {:?}", agent.id);
    println!("Initial Potential (Gamma): {:.2}", agent.state.gamma.potential);
    println!("Model: StubModelClient (Echoes Prompt)");
    println!("=================================================================");

    // Inject the Stub Client
    let model_client = Box::new(StubModelClient);
    let mut runtime = ClawRuntime::new(agent, model_client);
    
    // Run for 10 seconds
    let demo_duration = Duration::from_secs(10);
    match tokio::time::timeout(demo_duration, runtime.run()).await {
        Ok(_) => println!("Runtime completed naturally."),
        Err(_) => println!("Demo timed out after 10 seconds (as expected)."),
    }

    println!("=================================================================");
    println!("🛑 Engine Stopped.");
    println!("=================================================================");
}
