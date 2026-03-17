//! # Claw Core - Minimal Cellular Agent Engine
//!
//! A minimal, performant cellular agent engine for spreadsheet integration.
//! Built on the Cell-First Actor Model pattern for efficient, scalable agent processing.
//!
//! ## Architecture
//!
//! The core engine is built around the Actor Model pattern where:
//! - Each spreadsheet cell = one actor (agent)
//! - Message-driven communication
//! - Isolated execution with no shared state
//! - Dynamic equipment system for modular capabilities
//!
//! ## Core Components
//!
//! - **Core Loop**: ~500-line event loop for processing
//! - **Agents**: Cellular agents with state and behavior
//! - **Equipment**: Dynamic modular capabilities
//! - **Triggers**: Cell-based activation system
//! - **Social**: Multi-agent coordination patterns
//!
//! ## Quick Start
//!
//! ```rust,no_run
//! use claw_core::{ClawCore, AgentConfig};
//!
//! #[tokio::main]
//! async fn main() -> Result<(), Box<dyn std::error::Error>> {
//!     let mut core = ClawCore::new();
//!
//!     // Add an agent
//!     let config = AgentConfig {
//!         id: "my-agent".to_string(),
//!         cell_ref: "A1".to_string(),
//!         model: "gpt-4".to_string(),
//!         equipment: vec![],
//!         config: std::collections::HashMap::new(),
//!     };
//!
//!     core.add_agent(config).await?;
//!
//!     // Start the core loop
//!     core.start().await?;
//!
//!     // Send messages
//!     // ...
//!
//!     // Stop
//!     core.stop().await?;
//!
//!     Ok(())
//! }
//! ```

pub mod agent;
pub mod core;
pub mod equipment;
pub mod error;
pub mod messages;
pub mod ws;
pub mod api;
pub mod social;

// Re-export commonly used types
pub use agent::{Agent, AgentConfig, AgentState, AgentStatus, MinimalAgent};
pub use core::{ClawCore, SocialRelation, SocialRelationship};
pub use equipment::{
    Equipment, EquipmentManager, EquipmentSlot, MuscleMemoryTrigger,
    SimpleMemoryEquipment, ReasoningEngine, TripartiteConsensus,
    TileInterface, Quantizer, SwarmCoordinator,
    EquipmentCost, EquipmentCostThresholds, ProcessingContext,
};
pub use error::{AgentError, Result};
pub use messages::{Message, QueryType, TriggerPayload};
pub use ws::{WsServer, WsServerConfig, WsMessage};
pub use api::{create_router, create_default_state, AppState};

/// Library version
pub const VERSION: &str = env!("CARGO_PKG_VERSION");

/// Library name
pub const NAME: &str = env!("CARGO_PKG_NAME");
