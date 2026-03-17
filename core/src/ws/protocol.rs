//! WebSocket protocol for real-time agent communication
//!
//! Defines the message protocol for WebSocket communication between clients
//! and the Claw engine, enabling real-time agent state updates and reasoning streaming.

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// WebSocket message types
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type", content = "data")]
pub enum WsMessage {
    /// Client authentication request (JWT or API key)
    Authenticate {
        /// JWT token (mutually exclusive with api_key)
        token: Option<String>,
        /// API key (mutually exclusive with token)
        api_key: Option<String>,
    },

    /// Server authentication response
    Authenticated {
        client_id: String,
        user_id: String,
        scopes: Vec<String>,
        expires_at: Option<u64>,
    },

    /// Server authentication failure
    AuthFailed {
        error: String,
        code: u16,
    },

    /// Client request to create a new agent
    CreateAgent {
        id: String,
        config: AgentCreateConfig,
    },

    /// Server notification that an agent was created
    AgentCreated {
        id: String,
        agent_id: String,
        status: String,
    },

    /// Client request to query an agent
    QueryAgent {
        id: String,
        agent_id: String,
        query_type: String,
    },

    /// Server response with agent query results
    AgentQueryResponse {
        id: String,
        agent_id: String,
        result: QueryResult,
    },

    /// Server notification of agent state change
    AgentStateChanged {
        agent_id: String,
        old_status: String,
        new_status: String,
        timestamp: u64,
    },

    /// Server streaming agent reasoning (chunked)
    ReasoningChunk {
        agent_id: String,
        chunk: String,
        is_final: bool,
        timestamp: u64,
    },

    /// Server notification of equipment change
    EquipmentChanged {
        agent_id: String,
        slot: String,
        action: EquipmentAction,
        timestamp: u64,
    },

    /// Client request to trigger an agent
    TriggerAgent {
        id: String,
        agent_id: String,
        payload: TriggerPayload,
    },

    /// Server notification that agent was triggered
    AgentTriggered {
        id: String,
        agent_id: String,
        timestamp: u64,
    },

    /// Client request to cancel agent processing
    CancelAgent {
        id: String,
        agent_id: String,
        reason: String,
    },

    /// Server notification that agent was cancelled
    AgentCancelled {
        id: String,
        agent_id: String,
        timestamp: u64,
    },

    /// Server error notification
    Error {
        id: String,
        error: String,
        code: u16,
    },

    /// Heartbeat ping/pong
    Heartbeat {
        timestamp: u64,
    },

    /// Connection acknowledgment
    Connected {
        server_version: String,
        client_id: String,
    },

    /// Subscribe to agent events
    Subscribe {
        agent_ids: Vec<String>,
        event_types: Vec<String>,
    },

    /// Unsubscribe from agent events
    Unsubscribe {
        agent_ids: Vec<String>,
        event_types: Vec<String>,
    },

    /// Subscription confirmation
    Subscribed {
        agent_ids: Vec<String>,
        event_types: Vec<String>,
    },
}

/// Agent creation configuration
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct AgentCreateConfig {
    pub cell_ref: String,
    pub model: String,
    pub equipment: Vec<String>,
    pub config: HashMap<String, serde_json::Value>,
}

/// Query result types
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "query_type", content = "result")]
pub enum QueryResult {
    State { state: String },
    Reasoning { reasoning: String },
    Learning { metrics: LearningMetrics },
    Equipment { equipment: Vec<EquipmentStatus> },
    Social { relationships: Vec<SocialRelation> },
}

/// Learning metrics
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct LearningMetrics {
    pub iterations: u64,
    pub accuracy: f64,
    pub loss: f64,
    pub last_update: u64,
}

/// Equipment status
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct EquipmentStatus {
    pub slot: String,
    pub name: String,
    pub version: String,
    pub enabled: bool,
}

/// Social relationship
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct SocialRelation {
    pub from_agent: String,
    pub to_agent: String,
    pub relation_type: String,
}

/// Equipment action
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum EquipmentAction {
    Equipped { name: String },
    Unequipped { name: String, muscle_memory_triggers: u32 },
}

/// Trigger payload
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TriggerPayload {
    pub trigger_type: String,
    pub data: HashMap<String, serde_json::Value>,
}

impl WsMessage {
    /// Get message ID
    pub fn id(&self) -> Option<&str> {
        match self {
            WsMessage::Authenticate { .. } => None,
            WsMessage::Authenticated { .. } => None,
            WsMessage::AuthFailed { .. } => None,
            WsMessage::CreateAgent { id, .. } => Some(id),
            WsMessage::AgentCreated { id, .. } => Some(id),
            WsMessage::QueryAgent { id, .. } => Some(id),
            WsMessage::AgentQueryResponse { id, .. } => Some(id),
            WsMessage::AgentStateChanged { .. } => None,
            WsMessage::ReasoningChunk { .. } => None,
            WsMessage::EquipmentChanged { .. } => None,
            WsMessage::TriggerAgent { id, .. } => Some(id),
            WsMessage::AgentTriggered { id, .. } => Some(id),
            WsMessage::CancelAgent { id, .. } => Some(id),
            WsMessage::AgentCancelled { id, .. } => Some(id),
            WsMessage::Error { id, .. } => Some(id),
            WsMessage::Heartbeat { .. } => None,
            WsMessage::Connected { .. } => None,
            WsMessage::Subscribe { .. } => None,
            WsMessage::Unsubscribe { .. } => None,
            WsMessage::Subscribed { .. } => None,
        }
    }

    /// Check if message is a request (client -> server)
    pub fn is_request(&self) -> bool {
        matches!(self,
            WsMessage::Authenticate { .. } |
            WsMessage::CreateAgent { .. } |
            WsMessage::QueryAgent { .. } |
            WsMessage::TriggerAgent { .. } |
            WsMessage::CancelAgent { .. } |
            WsMessage::Subscribe { .. } |
            WsMessage::Unsubscribe { .. }
        )
    }

    /// Check if message is a notification (server -> client)
    pub fn is_notification(&self) -> bool {
        matches!(self,
            WsMessage::Authenticated { .. } |
            WsMessage::AuthFailed { .. } |
            WsMessage::AgentCreated { .. } |
            WsMessage::AgentStateChanged { .. } |
            WsMessage::ReasoningChunk { .. } |
            WsMessage::EquipmentChanged { .. } |
            WsMessage::AgentTriggered { .. } |
            WsMessage::AgentCancelled { .. } |
            WsMessage::Connected { .. } |
            WsMessage::Subscribed { .. }
        )
    }

    /// Check if message is an authentication message
    pub fn is_auth(&self) -> bool {
        matches!(self,
            WsMessage::Authenticate { .. } |
            WsMessage::Authenticated { .. } |
            WsMessage::AuthFailed { .. }
        )
    }

    /// Serialize to JSON
    pub fn to_json(&self) -> Result<String, serde_json::Error> {
        serde_json::to_string(self)
    }

    /// Deserialize from JSON
    pub fn from_json(json: &str) -> Result<Self, serde_json::Error> {
        serde_json::from_str(json)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_message_serialization() {
        let msg = WsMessage::CreateAgent {
            id: "test-1".to_string(),
            config: AgentCreateConfig {
                cell_ref: "A1".to_string(),
                model: "gpt-4".to_string(),
                equipment: vec!["MEMORY".to_string()],
                config: HashMap::new(),
            },
        };

        let json = msg.to_json().unwrap();
        let deserialized = WsMessage::from_json(&json).unwrap();

        assert_eq!(msg, deserialized);
    }

    #[test]
    fn test_message_types() {
        let create_msg = WsMessage::CreateAgent {
            id: "test-1".to_string(),
            config: AgentCreateConfig {
                cell_ref: "A1".to_string(),
                model: "gpt-4".to_string(),
                equipment: vec![],
                config: HashMap::new(),
            },
        };

        assert!(create_msg.is_request());
        assert!(!create_msg.is_notification());
        assert_eq!(create_msg.id(), Some("test-1"));
    }

    #[test]
    fn test_heartbeat_message() {
        let msg = WsMessage::Heartbeat {
            timestamp: 1234567890,
        };

        assert!(!msg.is_request());
        assert!(!msg.is_notification());
        assert!(msg.id().is_none());
    }

    #[test]
    fn test_authenticate_message() {
        let msg = WsMessage::Authenticate {
            token: Some("test.jwt.token".to_string()),
            api_key: None,
        };

        assert!(msg.is_request());
        assert!(msg.is_auth());
        assert!(msg.id().is_none());

        let json = msg.to_json().unwrap();
        assert!(json.contains(r#""type":"Authenticate"#));
    }

    #[test]
    fn test_authenticate_with_api_key() {
        let msg = WsMessage::Authenticate {
            token: None,
            api_key: Some("claw_live_test123".to_string()),
        };

        let json = msg.to_json().unwrap();
        let deserialized = WsMessage::from_json(&json).unwrap();

        assert_eq!(msg, deserialized);
    }

    #[test]
    fn test_authenticated_response() {
        let msg = WsMessage::Authenticated {
            client_id: "client-123".to_string(),
            user_id: "user-456".to_string(),
            scopes: vec!["agent:read".to_string(), "agent:write".to_string()],
            expires_at: Some(1234567890),
        };

        assert!(msg.is_notification());
        assert!(msg.is_auth());
    }

    #[test]
    fn test_auth_failed_response() {
        let msg = WsMessage::AuthFailed {
            error: "Invalid credentials".to_string(),
            code: 401,
        };

        assert!(msg.is_notification());
        assert!(msg.is_auth());

        let json = msg.to_json().unwrap();
        assert!(json.contains(r#""type":"AuthFailed"#));
        assert!(json.contains("401"));
    }

    #[test]
    fn test_subscribe_message() {
        let msg = WsMessage::Subscribe {
            agent_ids: vec!["agent-1".to_string(), "agent-2".to_string()],
            event_types: vec!["state_change".to_string(), "reasoning".to_string()],
        };

        assert!(msg.is_request());
        let json = msg.to_json().unwrap();
        let deserialized = WsMessage::from_json(&json).unwrap();
        assert_eq!(msg, deserialized);
    }

    #[test]
    fn test_subscribed_response() {
        let msg = WsMessage::Subscribed {
            agent_ids: vec!["agent-1".to_string()],
            event_types: vec!["state_change".to_string()],
        };

        assert!(msg.is_notification());
    }
}
