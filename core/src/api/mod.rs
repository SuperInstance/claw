//! Claw API module
//!
//! This module provides a complete REST API and WebSocket server
//! for managing cellular agents.

pub mod auth;
pub mod handlers;
pub mod middleware;
pub mod models;
pub mod server;
pub mod webSocket;

pub use handlers::AppState;
pub use models::*;
pub use server::{create_default_state, create_router, run_server};
