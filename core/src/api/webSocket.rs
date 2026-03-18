//! WebSocket server for real-time agent updates
//!
//! This module provides WebSocket functionality for real-time
//! communication with connected clients, including authentication,
//! message routing, and connection management.

use crate::api::auth::JwtAuth;
use axum::{
    extract::{
        State,
        ws::{Message, WebSocket, WebSocketUpgrade},
    },
    response::IntoResponse,
    http::HeaderMap,
};
use futures::{SinkExt, StreamExt};
use serde_json::{json, Value};
use std::sync::Arc;
use tokio::sync::Mutex;
use tracing::{info, warn, error, debug};

/// WebSocket connection state
#[derive(Debug, Clone)]
pub struct WsConnection {
    /// Connection ID
    pub id: uuid::Uuid,
    /// Authenticated user ID (if any)
    pub user_id: Option<String>,
    /// Connection timestamp
    pub connected_at: chrono::DateTime<chrono::Utc>,
    /// Subscribed agent IDs
    pub subscribed_agents: Vec<uuid::Uuid>,
}

impl WsConnection {
    /// Create a new WebSocket connection
    pub fn new(user_id: Option<String>) -> Self {
        Self {
            id: uuid::Uuid::new_v4(),
            user_id,
            connected_at: chrono::Utc::now(),
            subscribed_agents: Vec::new(),
        }
    }

    /// Subscribe to an agent's updates
    pub fn subscribe(&mut self, agent_id: uuid::Uuid) {
        if !self.subscribed_agents.contains(&agent_id) {
            self.subscribed_agents.push(agent_id);
            debug!("Connection {} subscribed to agent {}", self.id, agent_id);
        }
    }

    /// Unsubscribe from an agent's updates
    pub fn unsubscribe(&mut self, agent_id: &uuid::Uuid) {
        self.subscribed_agents.retain(|id| id != agent_id);
        debug!("Connection {} unsubscribed from agent {}", self.id, agent_id);
    }

    /// Check if subscribed to an agent
    /// Returns true only if explicitly subscribed to the agent
    pub fn is_subscribed(&self, agent_id: &uuid::Uuid) -> bool {
        self.subscribed_agents.contains(agent_id)
    }
}

/// WebSocket message from client
#[derive(Debug, Clone, serde::Deserialize)]
struct ClientMessage {
    /// Message type
    #[serde(rename = "type")]
    msg_type: String,
    /// Message payload
    payload: Option<Value>,
}

/// WebSocket upgrade handler with optional authentication
pub async fn websocket_handler(
    ws: WebSocketUpgrade,
    State(state): State<super::handlers::AppState>,
    headers: HeaderMap,
) -> impl IntoResponse {
    info!("WebSocket connection attempt");

    // Extract and validate JWT if present
    let user_id = extract_user_id(&headers, &state).await;

    ws.on_upgrade(move |socket| handle_socket(socket, state, user_id))
}

/// Extract user ID from Authorization header
async fn extract_user_id(
    headers: &axum::http::HeaderMap,
    state: &super::handlers::AppState,
) -> Option<String> {
    if let Some(auth_value) = headers.get("authorization") {
        if let Ok(auth_str) = auth_value.to_str() {
            if auth_str.starts_with("Bearer ") {
                let token = &auth_str[7..];
                if let Ok(claims) = state.auth_service.validate_token(token) {
                    return Some(claims.sub);
                }
            }
        }
    }
    None
}

/// Handle individual WebSocket connection
async fn handle_socket(
    socket: WebSocket,
    state: super::handlers::AppState,
    user_id: Option<String>,
) {
    let connection_id = uuid::Uuid::new_v4();
    info!(
        "WebSocket connection {} established (user: {:?})",
        connection_id,
        user_id.as_deref().unwrap_or("anonymous")
    );

    // Split socket into sender and receiver
    let (sender, mut receiver) = socket.split();

    // Wrap sender in Arc<Mutex> for sharing
    let sender = Arc::new(Mutex::new(sender));

    // Create connection state wrapped in Arc<Mutex> for sharing
    let conn = Arc::new(Mutex::new(WsConnection::new(user_id.clone())));

    // Subscribe to broadcast channel
    let mut rx = state.ws_tx.subscribe();

    // Clone sender and conn for the receive task
    let sender_for_recv = sender.clone();
    let conn_for_recv = conn.clone();
    let state_for_recv = state.clone();

    // Spawn task to handle incoming messages
    let recv_task = tokio::spawn(async move {
        while let Some(result) = receiver.next().await {
            match result {
                Ok(msg) => {
                    let mut conn_lock = conn_for_recv.lock().await;
                    if let Err(e) = handle_client_message(
                        msg,
                        &sender_for_recv,
                        &state_for_recv,
                        &mut conn_lock,
                        connection_id,
                    ).await {
                        error!("Error handling client message: {}", e);
                    }
                }
                Err(e) => {
                    warn!("WebSocket error: {}", e);
                    break;
                }
            }
        }
        info!("WebSocket receive task ended for connection {}", connection_id);
    });

    // Clone conn for send task
    let conn_for_send = conn.clone();

    // Spawn task to handle outgoing messages
    let send_task = tokio::spawn(async move {
        while let Ok(msg) = rx.recv().await {
            // Filter messages based on subscriptions
            let conn_lock = conn_for_send.lock().await;
            let should_send = should_send_message(&msg, &conn_lock);
            drop(conn_lock); // Release lock before sending

            if should_send {
                let json = serde_json::to_string(&msg).unwrap_or_default();
                let mut sender_lock = sender.lock().await;
                if sender_lock.send(Message::Text(json)).await.is_err() {
                    error!("Failed to send message to connection {}", connection_id);
                    break;
                }
                debug!("Sent message to connection {}", connection_id);
            }
        }
        info!("WebSocket send task ended for connection {}", connection_id);
    });

    // Wait for either task to complete
    tokio::select! {
        _ = recv_task => {
            info!("Receive task completed for connection {}", connection_id);
        }
        _ = send_task => {
            info!("Send task completed for connection {}", connection_id);
        }
    }

    info!(
        "WebSocket connection {} closed (user: {:?})",
        connection_id,
        user_id.as_deref().unwrap_or("anonymous")
    );
}

/// Handle incoming message from client
async fn handle_client_message(
    msg: Message,
    sender: &Arc<Mutex<futures::stream::SplitSink<WebSocket, Message>>>,
    state: &super::handlers::AppState,
    conn: &mut tokio::sync::MutexGuard<'_, WsConnection>,
    conn_id: uuid::Uuid,
) -> Result<(), Box<dyn std::error::Error>> {
    match msg {
        Message::Text(text) => {
            debug!("Received text message from connection {}: {}", conn_id, text);

            // Parse client message
            if let Ok(client_msg) = serde_json::from_str::<ClientMessage>(&text) {
                match client_msg.msg_type.as_str() {
                    "ping" => {
                        // Respond to ping with pong
                        let pong = json!({
                            "type": "pong",
                            "timestamp": chrono::Utc::now().to_rfc3339()
                        });
                        let mut s = sender.lock().await;
                        s.send(Message::Text(pong.to_string())).await?;
                    }
                    "subscribe" => {
                        // Subscribe to specific agent updates
                        if let Some(payload) = client_msg.payload {
                            if let Some(agent_id_str) = payload.get("agent_id").and_then(|v| v.as_str()) {
                                if let Ok(agent_id) = uuid::Uuid::parse_str(agent_id_str) {
                                    conn.subscribe(agent_id);
                                    let response = json!({
                                        "type": "subscribed",
                                        "agent_id": agent_id_str,
                                        "timestamp": chrono::Utc::now().to_rfc3339()
                                    });
                                    let mut s = sender.lock().await;
                                    s.send(Message::Text(response.to_string())).await?;
                                }
                            }
                        }
                    }
                    "unsubscribe" => {
                        // Unsubscribe from specific agent updates
                        if let Some(payload) = client_msg.payload {
                            if let Some(agent_id_str) = payload.get("agent_id").and_then(|v| v.as_str()) {
                                if let Ok(agent_id) = uuid::Uuid::parse_str(agent_id_str) {
                                    conn.unsubscribe(&agent_id);
                                    let response = json!({
                                        "type": "unsubscribed",
                                        "agent_id": agent_id_str,
                                        "timestamp": chrono::Utc::now().to_rfc3339()
                                    });
                                    let mut s = sender.lock().await;
                                    s.send(Message::Text(response.to_string())).await?;
                                }
                            }
                        }
                    }
                    "get_state" => {
                        // Get current state of subscribed agents
                        let agents = state.agents.read().await;
                        let agent_states: Vec<Value> = conn.subscribed_agents
                            .iter()
                            .filter_map(|id| agents.get(id).map(|_| id))
                            .map(|id| {
                                json!({
                                    "id": id.to_string(),
                                    "timestamp": chrono::Utc::now().to_rfc3339()
                                })
                            })
                            .collect();

                        let response = json!({
                            "type": "state",
                            "agents": agent_states,
                            "timestamp": chrono::Utc::now().to_rfc3339()
                        });
                        let mut s = sender.lock().await;
                        s.send(Message::Text(response.to_string())).await?;
                    }
                    _ => {
                        warn!("Unknown message type: {}", client_msg.msg_type);
                    }
                }
            }
        }
        Message::Close(_) => {
            debug!("Close frame received from connection {}", conn_id);
        }
        Message::Ping(data) => {
            let mut s = sender.lock().await;
            s.send(Message::Pong(data)).await?;
        }
        _ => {}
    }
    Ok(())
}

/// Check if message should be sent to connection based on subscriptions
fn should_send_message(
    msg: &super::handlers::WsMessage,
    conn: &tokio::sync::MutexGuard<'_, WsConnection>,
) -> bool {
    match msg {
        super::handlers::WsMessage::AgentCreated { agent_id, .. } => {
            conn.is_subscribed(agent_id)
        }
        super::handlers::WsMessage::AgentDeleted { agent_id, .. } => {
            conn.is_subscribed(agent_id)
        }
        super::handlers::WsMessage::AgentUpdate { agent_id, .. } => {
            conn.is_subscribed(agent_id)
        }
        super::handlers::WsMessage::EquipmentChanged { agent_id, .. } => {
            conn.is_subscribed(agent_id)
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_ws_connection_new() {
        let conn = WsConnection::new(Some("user123".to_string()));
        assert_eq!(conn.user_id, Some("user123".to_string()));
        assert_eq!(conn.subscribed_agents.len(), 0);
        assert!(!conn.is_subscribed(&uuid::Uuid::new_v4())); // Empty = not subscribed
    }

    #[test]
    fn test_ws_connection_subscribe() {
        let mut conn = WsConnection::new(None);
        let agent_id = uuid::Uuid::new_v4();

        conn.subscribe(agent_id);
        assert!(conn.subscribed_agents.contains(&agent_id));
        assert!(conn.is_subscribed(&agent_id));

        // Subscribe again (should not duplicate)
        conn.subscribe(agent_id);
        assert_eq!(conn.subscribed_agents.len(), 1);
    }

    #[test]
    fn test_ws_connection_unsubscribe() {
        let mut conn = WsConnection::new(None);
        let agent_id = uuid::Uuid::new_v4();

        conn.subscribe(agent_id);
        assert!(conn.is_subscribed(&agent_id));

        conn.unsubscribe(&agent_id);
        assert!(!conn.subscribed_agents.contains(&agent_id));
        assert!(!conn.is_subscribed(&agent_id));
    }
}
