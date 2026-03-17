//! WebSocket server for real-time agent updates
//!
//! This module provides WebSocket functionality for real-time
//! communication with connected clients.

// WebSocket handler module
use axum::{
    extract::{
        State,
        ws::{Message, WebSocket, WebSocketUpgrade},
    },
    response::IntoResponse,
};
use futures::{SinkExt, StreamExt};
use std::sync::Arc;
use tokio::sync::Mutex;

/// WebSocket upgrade handler
pub async fn websocket_handler(
    ws: WebSocketUpgrade,
    State(state): State<super::handlers::AppState>,
) -> impl IntoResponse {
    ws.on_upgrade(move |socket| handle_socket(socket, state))
}

/// Handle individual WebSocket connection
async fn handle_socket(socket: WebSocket, state: super::handlers::AppState) {
    // Split socket into sender and receiver
    let (sender, mut receiver) = socket.split();

    // Wrap sender in Arc<Mutex> for sharing
    let sender = Arc::new(Mutex::new(sender));

    // Subscribe to broadcast channel
    let mut rx = state.ws_tx.subscribe();

    // Clone sender for the receive task
    let sender_for_recv = sender.clone();

    // Spawn task to handle incoming messages
    let recv_task = tokio::spawn(async move {
        while let Some(Ok(msg)) = receiver.next().await {
            match msg {
                Message::Text(_text) => {
                    // Handle incoming messages if needed
                    // For now, just ignore
                }
                Message::Close(_) => {
                    break;
                }
                _ => {}
            }
        }
    });

    // Spawn task to handle outgoing messages
    let send_task = tokio::spawn(async move {
        while let Ok(msg) = rx.recv().await {
            let json = serde_json::to_string(&msg).unwrap_or_default();
            let mut sender = sender_for_recv.lock().await;
            if sender.send(Message::Text(json)).await.is_err() {
                break;
            }
        }
    });

    // Wait for either task to complete
    tokio::select! {
        _ = recv_task => {}
        _ = send_task => {}
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_websocket_module() {
        // Basic module existence test
        assert!(true);
    }
}
