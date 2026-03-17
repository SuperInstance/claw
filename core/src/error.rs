//! Error types for the claw core engine

use thiserror::Error;

/// Result type alias
pub type Result<T> = std::result::Result<T, AgentError>;

/// Core error types for the agent system
#[derive(Error, Debug)]
pub enum AgentError {
    /// Agent not found
    #[error("Agent not found: {0}")]
    AgentNotFound(String),

    /// Agent already exists
    #[error("Agent already exists: {0}")]
    AgentAlreadyExists(String),

    /// Invalid agent state
    #[error("Invalid agent state: {0}")]
    InvalidState(String),

    /// Equipment error
    #[error("Equipment error for slot {0:?}: {1}")]
    EquipmentError(crate::equipment::EquipmentSlot, String),

    /// Equipment already equipped
    #[error("Equipment already equipped: {0:?}")]
    EquipmentAlreadyEquipped(crate::equipment::EquipmentSlot),

    /// Equipment not equipped
    #[error("Equipment not equipped: {0:?}")]
    EquipmentNotEquipped(crate::equipment::EquipmentSlot),

    /// Equipment should be equipped
    #[error("Equipment should be equipped: {0:?}")]
    EquipmentShouldBeEquipped(crate::equipment::EquipmentSlot),

    /// Equipment too expensive
    #[error("Equipment too expensive for slot {0:?}: {1} cost exceeds threshold")]
    EquipmentTooExpensive(crate::equipment::EquipmentSlot, String),

    /// Memory error
    #[error("Memory error: {0}")]
    MemoryError(String),

    /// Equipment not registered
    #[error("Equipment not registered: {0:?}")]
    EquipmentNotRegistered(crate::equipment::EquipmentSlot),

    /// Processing error
    #[error("Processing error: {0}")]
    ProcessingError(String),

    /// Unsupported message type
    #[error("Unsupported message: {0}")]
    UnsupportedMessage(String),

    /// Trigger error
    #[error("Trigger error: {0}")]
    TriggerError(String),

    /// Serialization error
    #[error("Serialization error: {0}")]
    SerializationError(#[from] serde_json::Error),

    /// IO error
    #[error("IO error: {0}")]
    IoError(#[from] std::io::Error),

    /// Timeout error
    #[error("Operation timed out: {0}")]
    Timeout(String),

    /// Configuration error
    #[error("Configuration error: {0}")]
    ConfigurationError(String),

    /// Social coordination error
    #[error("Social coordination error: {0}")]
    SocialError(String),
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_error_display() {
        let err = AgentError::AgentNotFound("test-agent".to_string());
        assert_eq!(err.to_string(), "Agent not found: test-agent");
    }
}
