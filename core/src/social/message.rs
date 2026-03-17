//! Message Protocol for Agent-to-Agent Communication
//!
//! This module defines the message protocol for inter-agent communication.

use crate::social::{SocialError, SocialResult};
use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::{mpsc, RwLock};

/// Message types for agent communication
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum MessageType {
    /// Request message (expects response)
    Request,

    /// Response message (reply to request)
    Response,

    /// Notification message (fire and forget)
    Notification,

    /// Broadcast message (to all agents)
    Broadcast,

    /// Multicast message (to specific group)
    Multicast,
}

/// Message priority
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, PartialOrd, Ord)]
pub enum MessagePriority {
    Low = 0,
    Normal = 1,
    High = 2,
    Urgent = 3,
}

/// Message routing strategy
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum MessageRouting {
    /// Direct routing to specific agent
    Direct { target: String },

    /// Broadcast to all agents
    Broadcast,

    /// Multicast to specific agents
    Multicast { targets: Vec<String> },

    /// Topic-based routing
    Topic { topic: String },
}

/// Social message for agent communication
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SocialMessage {
    pub id: String,
    pub message_type: MessageType,
    pub sender: String,
    pub routing: MessageRouting,
    pub priority: MessagePriority,
    pub payload: serde_json::Value,
    pub timestamp: u64,
    pub correlation_id: Option<String>,
    pub reply_to: Option<String>,
    pub ttl: Option<u64>,
}

impl SocialMessage {
    pub fn new(
        sender: String,
        message_type: MessageType,
        routing: MessageRouting,
        payload: serde_json::Value,
    ) -> Self {
        let id = uuid::Uuid::new_v4().to_string();
        let timestamp = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_millis() as u64;

        Self {
            id,
            message_type,
            sender,
            routing,
            priority: MessagePriority::Normal,
            payload,
            timestamp,
            correlation_id: None,
            reply_to: None,
            ttl: None,
        }
    }

    pub fn with_priority(mut self, priority: MessagePriority) -> Self {
        self.priority = priority;
        self
    }

    pub fn with_correlation_id(mut self, correlation_id: String) -> Self {
        self.correlation_id = Some(correlation_id);
        self
    }

    pub fn with_reply_to(mut self, reply_to: String) -> Self {
        self.reply_to = Some(reply_to);
        self
    }

    pub fn with_ttl(mut self, ttl: u64) -> Self {
        self.ttl = Some(ttl);
        self
    }

    pub fn is_expired(&self) -> bool {
        if let Some(ttl) = self.ttl {
            let now = std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_millis() as u64;
            now > self.timestamp + ttl
        } else {
            false
        }
    }

    pub fn create_reply(&self, sender: String, payload: serde_json::Value) -> Self {
        Self::new(
            sender,
            MessageType::Response,
            MessageRouting::Direct {
                target: self.sender.clone(),
            },
            payload,
        )
        .with_correlation_id(self.id.clone())
        .with_reply_to(self.id.clone())
    }
}

/// Message handler trait
#[async_trait]
pub trait SocialMessageHandler: Send + Sync {
    /// Handle incoming message
    async fn handle_message(&self, message: SocialMessage) -> SocialResult<Option<SocialMessage>>;

    /// Get handler ID
    fn handler_id(&self) -> &str;
}

/// Message broker for routing messages between agents
pub struct MessageBroker {
    handlers: Arc<RwLock<HashMap<String, Box<dyn SocialMessageHandler>>>>,
    message_buffer_size: usize,
    tx: mpsc::UnboundedSender<SocialMessage>,
}

impl MessageBroker {
    pub fn new() -> Self {
        let (tx, mut rx) = mpsc::unbounded_channel::<SocialMessage>();
        let handlers: Arc<RwLock<HashMap<String, Box<dyn SocialMessageHandler>>>> =
            Arc::new(RwLock::new(HashMap::new()));

        // Start message processing loop
        let handlers_clone = handlers.clone();
        tokio::spawn(async move {
            while let Some(message) = rx.recv().await {
                if message.is_expired() {
                    continue;
                }

                let handlers = handlers_clone.read().await;
                match &message.routing {
                    MessageRouting::Direct { target } => {
                        if let Some(handler) = handlers.get(target) {
                            if let Ok(reply) = handler.handle_message(message.clone()).await {
                                // Handle reply if needed
                                if let Some(reply_msg) = reply {
                                    // Send reply
                                }
                            }
                        }
                    }
                    MessageRouting::Broadcast => {
                        for handler in handlers.values() {
                            let _ = handler.handle_message(message.clone()).await;
                        }
                    }
                    MessageRouting::Multicast { targets } => {
                        for target in targets {
                            if let Some(handler) = handlers.get(target) {
                                let _ = handler.handle_message(message.clone()).await;
                            }
                        }
                    }
                    MessageRouting::Topic { topic } => {
                        // Find handlers subscribed to topic
                        for handler in handlers.values() {
                            let _ = handler.handle_message(message.clone()).await;
                        }
                    }
                }
            }
        });

        Self {
            handlers,
            message_buffer_size: 1000,
            tx,
        }
    }

    pub fn with_buffer_size(mut self, buffer_size: usize) -> Self {
        self.message_buffer_size = buffer_size;
        self
    }

    /// Register a message handler
    pub async fn register_handler(&self, handler: Box<dyn SocialMessageHandler>) -> SocialResult<()> {
        let mut handlers = self.handlers.write().await;
        let handler_id = handler.handler_id().to_string();
        handlers.insert(handler_id, handler);
        Ok(())
    }

    /// Unregister a message handler
    pub async fn unregister_handler(&self, handler_id: &str) -> SocialResult<()> {
        let mut handlers = self.handlers.write().await;
        handlers
            .remove(handler_id)
            .ok_or_else(|| SocialError::AgentNotFound(handler_id.to_string()))?;
        Ok(())
    }

    /// Send a message
    pub async fn send_message(&self, message: SocialMessage) -> SocialResult<()> {
        self.tx
            .send(message)
            .map_err(|_| SocialError::RoutingFailed("Channel closed".to_string()))?;
        Ok(())
    }

    /// Send direct message
    pub async fn send_direct(
        &self,
        sender: String,
        target: String,
        payload: serde_json::Value,
    ) -> SocialResult<()> {
        let message = SocialMessage::new(
            sender,
            MessageType::Request,
            MessageRouting::Direct { target },
            payload,
        );
        self.send_message(message).await
    }

    /// Send broadcast message
    pub async fn send_broadcast(
        &self,
        sender: String,
        payload: serde_json::Value,
    ) -> SocialResult<()> {
        let message = SocialMessage::new(
            sender,
            MessageType::Broadcast,
            MessageRouting::Broadcast,
            payload,
        );
        self.send_message(message).await
    }

    /// Send multicast message
    pub async fn send_multicast(
        &self,
        sender: String,
        targets: Vec<String>,
        payload: serde_json::Value,
    ) -> SocialResult<()> {
        let message = SocialMessage::new(
            sender,
            MessageType::Multicast,
            MessageRouting::Multicast { targets },
            payload,
        );
        self.send_message(message).await
    }

    /// Get handler count
    pub async fn handler_count(&self) -> usize {
        self.handlers.read().await.len()
    }

    /// Get all handler IDs
    pub async fn get_handler_ids(&self) -> Vec<String> {
        self.handlers
            .read()
            .await
            .keys()
            .cloned()
            .collect()
    }
}

impl Default for MessageBroker {
    fn default() -> Self {
        Self::new()
    }
}

/// Simple message handler implementation
pub struct SimpleMessageHandler {
    id: String,
    handler: Arc<dyn Fn(SocialMessage) -> SocialResult<Option<SocialMessage>> + Send + Sync>,
}

impl SimpleMessageHandler {
    pub fn new<F>(id: String, handler: F) -> Self
    where
        F: Fn(SocialMessage) -> SocialResult<Option<SocialMessage>> + Send + Sync + 'static,
    {
        Self {
            id,
            handler: Arc::new(handler),
        }
    }
}

#[async_trait]
impl SocialMessageHandler for SimpleMessageHandler {
    async fn handle_message(&self, message: SocialMessage) -> SocialResult<Option<SocialMessage>> {
        (self.handler)(message)
    }

    fn handler_id(&self) -> &str {
        &self.id
    }
}

/// Message queue for prioritized message handling
pub struct MessageQueue {
    high_priority: mpsc::UnboundedSender<SocialMessage>,
    normal_priority: mpsc::UnboundedSender<SocialMessage>,
    low_priority: mpsc::UnboundedSender<SocialMessage>,
}

impl MessageQueue {
    pub fn new() -> Self {
        let (high_tx, mut high_rx) = mpsc::unbounded_channel::<SocialMessage>();
        let (normal_tx, mut normal_rx) = mpsc::unbounded_channel::<SocialMessage>();
        let (low_tx, mut low_rx) = mpsc::unbounded_channel::<SocialMessage>();

        // Process high priority messages first
        tokio::spawn(async move {
            while let Some(message) = high_rx.recv().await {
                // Process high priority message
            }
        });

        // Process normal priority messages
        tokio::spawn(async move {
            while let Some(message) = normal_rx.recv().await {
                // Process normal priority message
            }
        });

        // Process low priority messages
        tokio::spawn(async move {
            while let Some(message) = low_rx.recv().await {
                // Process low priority message
            }
        });

        Self {
            high_priority: high_tx,
            normal_priority: normal_tx,
            low_priority: low_tx,
        }
    }

    pub async fn enqueue(&self, message: SocialMessage) -> SocialResult<()> {
        let tx = match message.priority {
            MessagePriority::Urgent | MessagePriority::High => &self.high_priority,
            MessagePriority::Normal => &self.normal_priority,
            MessagePriority::Low => &self.low_priority,
        };

        tx.send(message)
            .map_err(|_| SocialError::RoutingFailed("Queue full".to_string()))?;

        Ok(())
    }
}

impl Default for MessageQueue {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_social_message_creation() {
        let message = SocialMessage::new(
            "agent-1".to_string(),
            MessageType::Request,
            MessageRouting::Direct {
                target: "agent-2".to_string(),
            },
            serde_json::json!({"test": "data"}),
        );

        assert_eq!(message.sender, "agent-1");
        assert_eq!(message.message_type, MessageType::Request);
    }

    #[test]
    fn test_message_priority() {
        assert!(MessagePriority::Urgent > MessagePriority::High);
        assert!(MessagePriority::High > MessagePriority::Normal);
        assert!(MessagePriority::Normal > MessagePriority::Low);
    }

    #[test]
    fn test_message_reply() {
        let original = SocialMessage::new(
            "agent-1".to_string(),
            MessageType::Request,
            MessageRouting::Direct {
                target: "agent-2".to_string(),
            },
            serde_json::json!({"test": "data"}),
        );

        let reply = original.create_reply(
            "agent-2".to_string(),
            serde_json::json!({"reply": "ok"}),
        );

        assert_eq!(reply.sender, "agent-2");
        assert_eq!(reply.reply_to, Some(original.id));
    }

    #[tokio::test]
    async fn test_message_broker() {
        let broker = MessageBroker::new();

        // Register a simple handler
        let handler = SimpleMessageHandler::new("test-handler".to_string(), |msg| {
            Ok(None)
        });

        broker.register_handler(Box::new(handler)).await.unwrap();
        assert_eq!(broker.handler_count().await, 1);
    }

    #[test]
    fn test_message_expiration() {
        let mut message = SocialMessage::new(
            "agent-1".to_string(),
            MessageType::Request,
            MessageRouting::Direct {
                target: "agent-2".to_string(),
            },
            serde_json::json!({}),
        );
        message.ttl = Some(1000); // 1 second TTL

        assert!(!message.is_expired());
    }
}
