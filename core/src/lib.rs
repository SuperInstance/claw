//! # Claw Core - Minimal Cellular Agent Engine (MVP)
//!
//! A minimal, performant cellular agent engine for spreadsheet integration.
//! Built on the Cell-First Actor Model pattern for efficient, scalable agent processing.
//!
//! ## MVP Architecture
//!
//! The MVP core engine provides:
//! - **Agents**: Cellular agents with state and behavior
//! - **Memory Equipment**: Single slot for basic state persistence
//! - **Triggers**: Cell-based activation system
//! - **REST API**: Simple CRUD operations
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
//!         config: std::collections::HashMap::new(),
//!     };
//!
//!     core.add_agent(config).await?;
//!
//!     // Start the core loop
//!     core.start().await?;
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
pub mod api;
pub mod monitoring;

// Re-export commonly used types
pub use agent::{Agent, AgentConfig, AgentState, AgentStatus, MinimalAgent};
pub use core::ClawCore;
pub use equipment::{Equipment, EquipmentSlot, SimpleMemoryEquipment};
pub use error::{AgentError, Result};
pub use messages::{Message, QueryType, TriggerPayload};
pub use api::{create_router, create_default_state, AppState};
pub use monitoring::{ClawMetrics, HealthStatus, MonitoringState};

/// Library version
pub const VERSION: &str = env!("CARGO_PKG_VERSION");

/// Library name
pub const NAME: &str = env!("CARGO_PKG_NAME");
