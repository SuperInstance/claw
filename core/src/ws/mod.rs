//! WebSocket module for real-time agent communication
//!
//! This module provides a production-ready WebSocket server for real-time
//! communication between clients and the Claw engine, enabling:
//!
//! - Real-time agent state updates
//! - Streaming reasoning responses
//! - Equipment change notifications
//! - Agent creation and triggering
//! - Query and cancel operations

pub mod protocol;
pub mod server;

#[cfg(test)]
mod tests;

pub use protocol::{WsMessage, AgentCreateConfig, QueryResult, EquipmentAction};
pub use server::{WsServer, WsServerConfig};
