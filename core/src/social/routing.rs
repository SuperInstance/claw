//! Message Routing for Agent Communication
//!
//! This module provides routing strategies for messages between agents.

use crate::social::{SocialError, SocialResult, SocialMessage};
use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use std::collections::HashSet;

/// Routing strategy trait
#[async_trait]
pub trait MessageRouter: Send + Sync {
    /// Route message to appropriate agents
    async fn route(&self, message: &SocialMessage, available_agents: &[String]) -> SocialResult<Vec<String>>;

    /// Get router type
    fn router_type(&self) -> RouterType;
}

/// Router type
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum RouterType {
    Direct,
    Broadcast,
    Multicast,
    TopicBased,
}

/// Direct message router
pub struct DirectRouter;

impl DirectRouter {
    pub fn new() -> Self {
        Self
    }
}

impl Default for DirectRouter {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl MessageRouter for DirectRouter {
    async fn route(&self, message: &SocialMessage, _available_agents: &[String]) -> SocialResult<Vec<String>> {
        match &message.routing {
            crate::social::message::MessageRouting::Direct { target } => {
                Ok(vec![target.clone()])
            }
            _ => Err(SocialError::RoutingFailed(
                "DirectRouter only supports Direct routing".to_string()
            )),
        }
    }

    fn router_type(&self) -> RouterType {
        RouterType::Direct
    }
}

/// Broadcast router
pub struct BroadcastRouter;

impl BroadcastRouter {
    pub fn new() -> Self {
        Self
    }
}

impl Default for BroadcastRouter {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl MessageRouter for BroadcastRouter {
    async fn route(&self, _message: &SocialMessage, available_agents: &[String]) -> SocialResult<Vec<String>> {
        Ok(available_agents.to_vec())
    }

    fn router_type(&self) -> RouterType {
        RouterType::Broadcast
    }
}

/// Multicast router
pub struct MulticastRouter {
    excluded_agents: HashSet<String>,
}

impl MulticastRouter {
    pub fn new() -> Self {
        Self {
            excluded_agents: HashSet::new(),
        }
    }

    pub fn with_excluded(mut self, agents: Vec<String>) -> Self {
        self.excluded_agents = agents.into_iter().collect();
        self
    }

    pub fn exclude_agent(&mut self, agent_id: String) {
        self.excluded_agents.insert(agent_id);
    }

    pub fn remove_exclusion(&mut self, agent_id: &str) {
        self.excluded_agents.remove(agent_id);
    }
}

impl Default for MulticastRouter {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl MessageRouter for MulticastRouter {
    async fn route(&self, message: &SocialMessage, available_agents: &[String]) -> SocialResult<Vec<String>> {
        let targets = match &message.routing {
            crate::social::message::MessageRouting::Multicast { targets } => {
                targets.clone()
            }
            crate::social::message::MessageRouting::Broadcast => {
                available_agents.to_vec()
            }
            _ => {
                return Err(SocialError::RoutingFailed(
                    "MulticastRouter requires Multicast or Broadcast routing".to_string()
                ))
            }
        };

        // Filter out excluded agents
        let filtered: Vec<String> = targets
            .into_iter()
            .filter(|agent| !self.excluded_agents.contains(agent))
            .collect();

        Ok(filtered)
    }

    fn router_type(&self) -> RouterType {
        RouterType::Multicast
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::social::message::{MessageRouting, MessageType};

    #[tokio::test]
    async fn test_direct_router() {
        let router = DirectRouter::new();
        let message = SocialMessage::new(
            "sender".to_string(),
            MessageType::Request,
            MessageRouting::Direct {
                target: "target-agent".to_string(),
            },
            serde_json::json!({}),
        );

        let available = vec!["agent-1".to_string(), "target-agent".to_string()];
        let targets = router.route(&message, &available).await.unwrap();

        assert_eq!(targets.len(), 1);
        assert_eq!(targets[0], "target-agent");
    }

    #[tokio::test]
    async fn test_broadcast_router() {
        let router = BroadcastRouter::new();
        let message = SocialMessage::new(
            "sender".to_string(),
            MessageType::Broadcast,
            MessageRouting::Broadcast,
            serde_json::json!({}),
        );

        let available = vec![
            "agent-1".to_string(),
            "agent-2".to_string(),
            "agent-3".to_string(),
        ];
        let targets = router.route(&message, &available).await.unwrap();

        assert_eq!(targets.len(), 3);
    }

    #[tokio::test]
    async fn test_multicast_router() {
        let router = MulticastRouter::new()
            .with_excluded(vec!["agent-2".to_string()]);

        let message = SocialMessage::new(
            "sender".to_string(),
            MessageType::Multicast,
            MessageRouting::Multicast {
                targets: vec![
                    "agent-1".to_string(),
                    "agent-2".to_string(),
                    "agent-3".to_string(),
                ],
            },
            serde_json::json!({}),
        );

        let available = vec![
            "agent-1".to_string(),
            "agent-2".to_string(),
            "agent-3".to_string(),
        ];
        let targets = router.route(&message, &available).await.unwrap();

        assert_eq!(targets.len(), 2);
        assert!(!targets.contains(&"agent-2".to_string()));
    }
}
