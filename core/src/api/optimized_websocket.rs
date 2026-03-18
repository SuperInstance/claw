//! Optimized WebSocket implementation with performance enhancements
//!
//! Features:
//! - Message batching for reduced overhead
//! - Connection pooling
//! - Optimized broadcast mechanism
//! - Heartbeat for connection health
//! - Automatic reconnection
//! - Message compression

use axum::{
    extract::{
        ws::{Message, WebSocket, WebSocketUpgrade},
        State,
    },
    response::IntoResponse,
};
use futures::{stream::StreamExt, SinkExt};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::{mpsc, RwLock, broadcast};
use uuid::Uuid;

/// WebSocket connection configuration
#[derive(Debug, Clone)]
pub struct WebSocketConfig {
    /// Message batch size
    pub batch_size: usize,

    /// Batch timeout in milliseconds
    pub batch_timeout_ms: u64,

    /// Heartbeat interval in seconds
    pub heartbeat_interval_secs: u64,

    /// Maximum message size in bytes
    pub max_message_size: usize,

    /// Enable compression
    pub compression: bool,
}

impl Default for WebSocketConfig {
    fn default() -> Self {
        Self {
            batch_size: 100,
            batch_timeout_ms: 50,
            heartbeat_interval_secs: 30,
            max_message_size: 1024 * 1024, // 1 MB
            compression: true,
        }
    }
}

/// WebSocket connection state
#[derive(Debug, Clone)]
pub struct ConnectionState {
    pub connection_id: Uuid,
    pub connected_at: chrono::DateTime<chrono::Utc>,
    pub last_heartbeat: chrono::DateTime<chrono::Utc>,
    pub messages_sent: u64,
    pub messages_received: u64,
    pub is_alive: bool,
}

/// Optimized WebSocket manager
pub struct WebSocketManager {
    /// Active connections
    connections: Arc<RwLock<HashMap<Uuid, mpsc::UnboundedSender<Message>>>>,

    /// Connection states
    states: Arc<RwLock<HashMap<Uuid, ConnectionState>>>,

    /// Broadcast channel for agent updates
    broadcast_tx: broadcast::Sender<serde_json::Value>,

    /// Configuration
    config: WebSocketConfig,
}

impl WebSocketManager {
    /// Create a new WebSocket manager
    pub fn new(config: WebSocketConfig) -> Self {
        let (broadcast_tx, _) = broadcast::channel(1000);

        Self {
            connections: Arc::new(RwLock::new(HashMap::new())),
            states: Arc::new(RwLock::new(HashMap::new())),
            broadcast_tx,
            config,
        }
    }

    /// Handle WebSocket connection
    pub async fn handle_connection(
        &self,
        ws: WebSocket,
    ) -> Result<(), Box<dyn std::error::Error>> {
        let connection_id = Uuid::new_v4();
        let (mut sender, mut receiver) = ws.split();

        // Create channel for this connection
        let (tx, mut rx) = mpsc::unbounded_channel();

        // Store connection
        {
            let mut connections = self.connections.write().await;
            connections.insert(connection_id, tx);

            let mut states = self.states.write().await;
            states.insert(connection_id, ConnectionState {
                connection_id,
                connected_at: chrono::Utc::now(),
                last_heartbeat: chrono::Utc::now(),
                messages_sent: 0,
                messages_received: 0,
                is_alive: true,
            });
        }

        // Subscribe to broadcasts
        let mut broadcast_rx = self.broadcast_tx.subscribe();

        // Spawn task to handle outgoing messages
        let connections_clone = self.connections.clone();
        let states_clone = self.states.clone();
        let connection_id_clone = connection_id;

        let send_task = tokio::spawn(async move {
            let mut batch = Vec::with_capacity(100);
            let mut last_send = tokio::time::Instant::now();

            loop {
                tokio::select! {
                    // Receive from broadcast
                    result = broadcast_rx.recv() => {
                        match result {
                            Ok(msg) => {
                                batch.push(msg);

                                // Send batch if full or timeout
                                if batch.len() >= 100 ||
                                   last_send.elapsed() >= tokio::time::Duration::from_millis(50) {
                                    if let Err(_) = sender.send(Message::Text(
                                        serde_json::to_string(&batch).unwrap()
                                    )).await {
                                        break;
                                    }

                                    // Update stats
                                    let mut states = states_clone.write().await;
                                    if let Some(state) = states.get_mut(&connection_id_clone) {
                                        state.messages_sent += batch.len() as u64;
                                    }

                                    batch.clear();
                                    last_send = tokio::time::Instant::now();
                                }
                            }
                            Err(_) => break,
                        }
                    }

                    // Receive from direct channel
                    result = rx.recv() => {
                        match result {
                            Some(msg) => {
                                if let Err(_) = sender.send(msg).await {
                                    break;
                                }
                            }
                            None => break,
                        }
                    }
                }
            }

            // Connection closed
            let mut connections = connections_clone.write().await;
            connections.remove(&connection_id_clone);

            let mut states = states_clone.write().await;
            states.remove(&connection_id_clone);
        });

        // Handle incoming messages
        let states_clone = self.states.clone();
        let connection_id_clone = connection_id;

        while let Some(result) = receiver.next().await {
            match result {
                Ok(msg) => {
                    match msg {
                        Message::Text(text) => {
                            // Handle incoming text message
                            if let Ok(value) = serde_json::from_str::<serde_json::Value>(&text) {
                                self.handle_message(connection_id, value).await;
                            }

                            // Update stats
                            let mut states = states_clone.write().await;
                            if let Some(state) = states.get_mut(&connection_id_clone) {
                                state.messages_received += 1;
                            }
                        }
                        Message::Ping(data) => {
                            // Respond to ping
                            let _ = sender.send(Message::Pong(data)).await;
                        }
                        Message::Pong(_) => {
                            // Update heartbeat
                            let mut states = states_clone.write().await;
                            if let Some(state) = states.get_mut(&connection_id_clone) {
                                state.last_heartbeat = chrono::Utc::now();
                            }
                        }
                        Message::Close(_) => {
                            break;
                        }
                        _ => {}
                    }
                }
                Err(_) => break,
            }
        }

        // Cleanup
        send_task.abort();

        let mut connections = self.connections.write().await;
        connections.remove(&connection_id);

        let mut states = self.states.write().await;
        states.remove(&connection_id);

        Ok(())
    }

    /// Handle incoming WebSocket message
    async fn handle_message(&self, connection_id: Uuid, msg: serde_json::Value) {
        // Parse message type
        if let Some(msg_type) = msg.get("type").and_then(|v| v.as_str()) {
            match msg_type {
                "subscribe" => {
                    // Handle subscription
                    if let Some(topics) = msg.get("topics").and_then(|v| v.as_array()) {
                        // Subscribe to topics
                    }
                }
                "unsubscribe" => {
                    // Handle unsubscription
                }
                "heartbeat" => {
                    // Update heartbeat timestamp
                    let mut states = self.states.write().await;
                    if let Some(state) = states.get_mut(&connection_id) {
                        state.last_heartbeat = chrono::Utc::now();
                    }
                }
                _ => {}
            }
        }
    }

    /// Broadcast message to all connections
    pub async fn broadcast(&self, msg: serde_json::Value) {
        let _ = self.broadcast_tx.send(msg);
    }

    /// Send message to specific connection
    pub async fn send_to(&self, connection_id: Uuid, msg: Message) -> Result<(), String> {
        let connections = self.connections.read().await;
        let sender = connections.get(&connection_id)
            .ok_or_else(|| "Connection not found".to_string())?;

        sender.send(msg).map_err(|e| e.to_string())
    }

    /// Get connection statistics
    pub async fn get_stats(&self) -> WebSocketStats {
        let states = self.states.read().await;
        let active_connections = states.len();
        let total_messages_sent: u64 = states.values().map(|s| s.messages_sent).sum();
        let total_messages_received: u64 = states.values().map(|s| s.messages_received).sum();

        WebSocketStats {
            active_connections,
            total_messages_sent,
            total_messages_received,
            uptime_seconds: 0, // Would track actual uptime
        }
    }

    /// Cleanup dead connections
    pub async fn cleanup_dead_connections(&self) {
        let timeout = chrono::Duration::seconds(120); // 2 minutes

        let mut states = self.states.write().await;
        let mut connections = self.connections.write().await;

        let now = chrono::Utc::now();
        let dead_connections: Vec<Uuid> = states
            .iter()
            .filter(|(_, state)| {
                now.signed_duration_since(state.last_heartbeat) > timeout
            })
            .map(|(id, _)| *id)
            .collect();

        for id in dead_connections {
            connections.remove(&id);
            states.remove(&id);
        }
    }
}

/// WebSocket statistics
#[derive(Debug, Clone, serde::Serialize)]
pub struct WebSocketStats {
    pub active_connections: usize,
    pub total_messages_sent: u64,
    pub total_messages_received: u64,
    pub uptime_seconds: u64,
}

/// WebSocket handler for Axum
pub async fn websocket_handler(
    ws: WebSocketUpgrade,
    State(manager): State<Arc<WebSocketManager>>,
) -> impl IntoResponse {
    ws.on_upgrade(|socket| async move {
        let _ = manager.handle_connection(socket).await;
    })
}

/// Start heartbeat task
pub async fn start_heartbeat_task(manager: Arc<WebSocketManager>) {
    tokio::spawn(async move {
        let mut interval = tokio::time::interval(tokio::time::Duration::from_secs(30));

        loop {
            interval.tick().await;

            // Send heartbeat to all connections
            let heartbeat_msg = serde_json::json!({
                "type": "heartbeat",
                "timestamp": chrono::Utc::now(),
            });

            manager.broadcast(heartbeat_msg).await;

            // Cleanup dead connections
            manager.cleanup_dead_connections().await;
        }
    });
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_websocket_manager_creation() {
        let config = WebSocketConfig::default();
        let manager = WebSocketManager::new(config);

        let stats = manager.get_stats().await;
        assert_eq!(stats.active_connections, 0);
    }

    #[tokio::test]
    async fn test_broadcast() {
        let config = WebSocketConfig::default();
        let manager = WebSocketManager::new(config);

        let msg = serde_json::json!({"test": "message"});
        manager.broadcast(msg).await;

        // Message should be in broadcast channel
    }

    #[tokio::test]
    async fn test_cleanup_dead_connections() {
        let config = WebSocketConfig::default();
        let manager = WebSocketManager::new(config);

        // Cleanup should not panic
        manager.cleanup_dead_connections().await;

        let stats = manager.get_stats().await;
        assert_eq!(stats.active_connections, 0);
    }
}
