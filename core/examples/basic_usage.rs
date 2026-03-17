//! Basic usage example for the claw-core engine
//!
//! This example demonstrates how to:
//! 1. Create a core engine
//! 2. Add agents
//! 3. Send messages
//! 4. Handle agent lifecycle

use claw_core::{AgentConfig, ClawCore, Message, SocialRelation};
use std::collections::HashMap;
use tokio::time::{sleep, Duration};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize logging
    tracing_subscriber::fmt::init();

    println!("🦊 Claw Core Engine - Basic Usage Example\n");

    // 1. Create the core engine
    let mut core = ClawCore::new();
    println!("✓ Created core engine");

    // 2. Add agents
    let config1 = AgentConfig {
        id: "agent-A1".to_string(),
        cell_ref: "A1".to_string(),
        model: "gpt-4".to_string(),
        equipment: vec![],
        config: HashMap::new(),
    };

    let config2 = AgentConfig {
        id: "agent-B2".to_string(),
        cell_ref: "B2".to_string(),
        model: "gpt-4".to_string(),
        equipment: vec![],
        config: HashMap::new(),
    };

    core.add_agent(config1).await?;
    core.add_agent(config2).await?;
    println!("✓ Added 2 agents");

    // 3. Add social relationship
    core.add_relationship(
        "agent-A1".to_string(),
        "agent-B2".to_string(),
        SocialRelation::CoWorker,
    ).await?;
    println!("✓ Added co-worker relationship between agents");

    // 4. Register triggers
    core.register_cell_trigger("A1".to_string(), "agent-A1".to_string())
        .await?;
    println!("✓ Registered cell trigger for A1");

    // 5. Start the core engine
    core.start().await?;
    println!("✓ Core engine started\n");

    // 6. Send messages to agents
    println!("Sending messages to agents...\n");

    let trigger_msg = Message::Trigger {
        id: "msg-1".to_string(),
        agent_id: "agent-A1".to_string(),
        payload: claw_core::TriggerPayload::Data {
            cell_ref: "A1".to_string(),
            old_value: serde_json::json!(null),
            new_value: serde_json::json!(42),
        },
    };

    core.send_message(trigger_msg).await?;
    println!("✓ Sent trigger message to agent-A1");

    // Let the engine process
    sleep(Duration::from_millis(500)).await;

    // 7. Query agent state
    let query_msg = Message::Query {
        id: "msg-2".to_string(),
        agent_id: "agent-A1".to_string(),
        query_type: claw_core::QueryType::State,
    };

    core.send_message(query_msg).await?;
    println!("✓ Sent query message to agent-A1");

    // Let the engine process
    sleep(Duration::from_millis(500)).await;

    // 8. Cancel an agent
    let cancel_msg = Message::Cancel {
        id: "msg-3".to_string(),
        agent_id: "agent-A1".to_string(),
        reason: "User requested".to_string(),
    };

    core.send_message(cancel_msg).await?;
    println!("✓ Sent cancel message to agent-A1");

    // Let the engine process
    sleep(Duration::from_millis(500)).await;

    // 9. Stop the core engine
    core.stop().await?;
    println!("\n✓ Core engine stopped");

    println!("\n✅ Example completed successfully!");

    Ok(())
}
