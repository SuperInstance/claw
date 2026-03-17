//! Core message types for cellular agent communication
//!
//! Messages are the primary communication mechanism in the Cell-First Actor Model.
//! Each message represents an event that triggers agent processing.

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Core message types for agent communication
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum Message {
    /// Trigger message - activates an agent
    Trigger {
        id: String,
        agent_id: String,
        payload: TriggerPayload,
    },

    /// Cancel message - stops agent processing
    Cancel {
        id: String,
        agent_id: String,
        reason: String,
    },

    /// Query message - requests agent state
    Query {
        id: String,
        agent_id: String,
        query_type: QueryType,
    },

    /// Response message - result of agent processing
    Response {
        id: String,
        agent_id: String,
        result: Result<String, String>,
    },

    /// Event message - general event notification
    Event {
        id: String,
        event_type: String,
        data: HashMap<String, serde_json::Value>,
    },
}

impl Message {
    /// Get the message ID
    pub fn id(&self) -> &str {
        match self {
            Message::Trigger { id, .. } => id,
            Message::Cancel { id, .. } => id,
            Message::Query { id, .. } => id,
            Message::Response { id, .. } => id,
            Message::Event { id, .. } => id,
        }
    }

    /// Get the target agent ID
    pub fn agent_id(&self) -> Option<&str> {
        match self {
            Message::Trigger { agent_id, .. } => Some(agent_id),
            Message::Cancel { agent_id, .. } => Some(agent_id),
            Message::Query { agent_id, .. } => Some(agent_id),
            Message::Response { agent_id, .. } => Some(agent_id),
            Message::Event { .. } => None,
        }
    }
}

/// Trigger payload types
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum TriggerPayload {
    /// Data trigger - fired when cell data changes
    Data {
        cell_ref: String,
        old_value: serde_json::Value,
        new_value: serde_json::Value,
    },

    /// Periodic trigger - fired on time interval
    Periodic {
        interval_ms: u64,
        timestamp: u64,
    },

    /// Formula trigger - fired when formula result changes
    Formula {
        formula: String,
        result: serde_json::Value,
    },

    /// External trigger - fired from external source
    External {
        source: String,
        event_data: HashMap<String, serde_json::Value>,
    },
}

/// Query types for agent state queries
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum QueryType {
    /// Query current state
    State,

    /// Query reasoning process
    Reasoning,

    /// Query learning metrics
    Learning,

    /// Query equipment status
    Equipment,

    /// Query social relationships
    Social,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_message_id() {
        let msg = Message::Trigger {
            id: "test-1".to_string(),
            agent_id: "agent-A".to_string(),
            payload: TriggerPayload::Data {
                cell_ref: "A1".to_string(),
                old_value: serde_json::json!(1),
                new_value: serde_json::json!(2),
            },
        };

        assert_eq!(msg.id(), "test-1");
        assert_eq!(msg.agent_id(), Some("agent-A"));
    }

    #[test]
    fn test_trigger_payload_serialization() {
        let payload = TriggerPayload::Data {
            cell_ref: "A1".to_string(),
            old_value: serde_json::json!(1),
            new_value: serde_json::json!(2),
        };

        let serialized = serde_json::to_string(&payload).unwrap();
        let deserialized: TriggerPayload = serde_json::from_str(&serialized).unwrap();

        assert_eq!(payload, deserialized);
    }
}
