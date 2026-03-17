//! WebSocket Server Example
//!
//! Demonstrates how to run the WebSocket server for real-time agent communication.
//!
//! Run with:
//! ```bash
//! cargo run --example websocket_server
//! ```
//!
//! Then connect with a WebSocket client to ws://127.0.0.1:8080

use std::sync::Arc;
use claw_core::{ClawCore, WsServer, WsServerConfig, AgentConfig, EquipmentSlot};
use tracing::{info, Level};
use tracing_subscriber::FmtSubscriber;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize tracing
    let subscriber = FmtSubscriber::builder()
        .with_max_level(Level::DEBUG)
        .finish();
    tracing::subscriber::set_global_default(subscriber)
        .expect("setting default subscriber failed");

    info!("Starting Claw WebSocket Server Example");

    // Create the core engine
    let core = Arc::new(ClawCore::new());

    // Start the core
    core.start().await?;

    // Configure WebSocket server
    let config = WsServerConfig {
        addr: "127.0.0.1:8080".to_string(),
        max_connections: 100,
        client_buffer_size: 1000,
        connection_timeout_secs: 30,
        heartbeat_interval_secs: 10,
        max_message_size: 10 * 1024 * 1024, // 10MB
    };

    // Create WebSocket server
    let server = WsServer::new(config, core.clone());

    info!("WebSocket server configured on {}", "127.0.0.1:8080");
    info!("Connect with: ws://127.0.0.1:8080");

    // Add some example agents
    for i in 1..=3 {
        let config = AgentConfig {
            id: format!("agent-A{}", i),
            cell_ref: format!("A{}", i),
            model: "gpt-4".to_string(),
            equipment: vec![EquipmentSlot::Memory, EquipmentSlot::Reasoning],
            config: Default::default(),
        };

        core.add_agent(config).await?;
        info!("Added agent: agent-A{}", i);
    }

    // Start the WebSocket server
    info!("Starting WebSocket server...");
    tokio::spawn(async move {
        if let Err(e) = server.run().await {
            eprintln!("WebSocket server error: {}", e);
        }
    });

    info!("Server is running!");
    info!("");
    info!("Example WebSocket messages:");
    info!("");
    info!("Create Agent:");
    info!("{{\"type\":\"CreateAgent\",\"data\":{{\"id\":\"1\",\"config\":{{\"cell_ref\":\"B1\",\"model\":\"gpt-4\",\"equipment\":[],\"config\":{{}}}}}}}}");
    info!("");
    info!("Trigger Agent:");
    info!("{{\"type\":\"TriggerAgent\",\"data\":{{\"id\":\"2\",\"agent_id\":\"agent-A1\",\"payload\":{{\"trigger_type\":\"periodic\",\"data\":{{}}}}}}}}");
    info!("");
    info!("Query Agent:");
    info!("{{\"type\":\"QueryAgent\",\"data\":{{\"id\":\"3\",\"agent_id\":\"agent-A1\",\"query_type\":\"state\"}}}}");
    info!("");
    info!("Press Ctrl+C to stop");

    // Wait for Ctrl+C
    tokio::signal::ctrl_c().await?;
    info!("Shutting down...");

    // Stop the server
    // server.stop().await;

    // Stop the core
    core.stop().await?;

    info!("Shutdown complete");
    Ok(())
}
