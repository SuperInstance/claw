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
pub mod social_handlers;

// Performance optimization modules
pub mod cache;
pub mod optimized_handlers;
pub mod optimized_websocket;

// Monitoring module
pub mod monitoring;

pub use handlers::AppState;
pub use models::*;
pub use server::{create_default_state, create_router, run_server};
pub use social_handlers::SocialState;

// Performance optimization exports
pub use cache::{Cache, CacheManager, CacheConfig, CacheStats};
pub use optimized_handlers::{OptimizedAppState, PerformanceMetrics};
pub use optimized_websocket::{WebSocketManager, WebSocketConfig, WebSocketStats};

// Monitoring exports
pub use monitoring::{MonitoringApiState, create_monitoring_router};
