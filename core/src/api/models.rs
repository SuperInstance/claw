//! API request and response models
//!
//! This module defines all data structures used in the API layer,
//! including requests, responses, and validation schemas.

use crate::agent::{MinimalAgent, AgentState, AgentConfig, Agent};
use crate::equipment::EquipmentSlot;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use validator::Validate;

/// API Result type for all endpoints
pub type ApiResult<T> = Result<T, ApiError>;

/// Standard API response wrapper
#[derive(Debug, Serialize, Deserialize, utoipa::ToSchema)]
pub struct ApiResponse<T> {
    /// Success status
    pub success: bool,
    /// Response data or error details
    #[serde(flatten)]
    pub data: ResponseData<T>,
    /// Request ID for tracing
    pub request_id: String,
    /// Timestamp of response
    pub timestamp: DateTime<Utc>,
}

/// Response data enum
#[derive(Debug, Serialize, Deserialize, utoipa::ToSchema)]
#[serde(untagged)]
pub enum ResponseData<T> {
    /// Success response
    Ok(T),
    /// Error response
    Error(ErrorDetail),
}

/// Error detail structure
#[derive(Debug, Serialize, Deserialize, utoipa::ToSchema)]
pub struct ErrorDetail {
    /// Error code
    pub code: String,
    /// Error message
    pub message: String,
    /// Additional error details
    #[serde(skip_serializing_if = "Option::is_none")]
    pub details: Option<serde_json::Value>,
    /// Stack trace (development only)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub stack_trace: Option<String>,
}

/// API error types
#[derive(Debug, thiserror::Error)]
pub enum ApiError {
    /// Bad request (400)
    #[error("Bad request: {0}")]
    BadRequest(String),

    /// Unauthorized (401)
    #[error("Unauthorized: {0}")]
    Unauthorized(String),

    /// Forbidden (403)
    #[error("Forbidden: {0}")]
    Forbidden(String),

    /// Not found (404)
    #[error("Not found: {0}")]
    NotFound(String),

    /// Conflict (409)
    #[error("Conflict: {0}")]
    Conflict(String),

    /// Validation error (422)
    #[error("Validation error: {0}")]
    ValidationError(String),

    /// Rate limit exceeded (429)
    #[error("Rate limit exceeded")]
    RateLimitExceeded,

    /// Internal server error (500)
    #[error("Internal server error: {0}")]
    InternalError(String),

    /// Service unavailable (503)
    #[error("Service unavailable: {0}")]
    ServiceUnavailable(String),
}

impl ApiError {
    /// Get HTTP status code for error
    pub fn status_code(&self) -> u16 {
        match self {
            ApiError::BadRequest(_) => 400,
            ApiError::Unauthorized(_) => 401,
            ApiError::Forbidden(_) => 403,
            ApiError::NotFound(_) => 404,
            ApiError::Conflict(_) => 409,
            ApiError::ValidationError(_) => 422,
            ApiError::RateLimitExceeded => 429,
            ApiError::InternalError(_) => 500,
            ApiError::ServiceUnavailable(_) => 503,
        }
    }

    /// Get error code string
    pub fn error_code(&self) -> String {
        match self {
            ApiError::BadRequest(_) => "BAD_REQUEST".to_string(),
            ApiError::Unauthorized(_) => "UNAUTHORIZED".to_string(),
            ApiError::Forbidden(_) => "FORBIDDEN".to_string(),
            ApiError::NotFound(_) => "NOT_FOUND".to_string(),
            ApiError::Conflict(_) => "CONFLICT".to_string(),
            ApiError::ValidationError(_) => "VALIDATION_ERROR".to_string(),
            ApiError::RateLimitExceeded => "RATE_LIMIT_EXCEEDED".to_string(),
            ApiError::InternalError(_) => "INTERNAL_ERROR".to_string(),
            ApiError::ServiceUnavailable(_) => "SERVICE_UNAVAILABLE".to_string(),
        }
    }
}

/// Request to create a new agent
#[derive(Debug, Deserialize, Validate, utoipa::ToSchema)]
pub struct CreateAgentRequest {
    /// Unique identifier for the agent (optional, auto-generated if not provided)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<Uuid>,
    /// Agent configuration
    #[serde(flatten)]
    pub config: AgentConfig,
    /// Initial equipment to equip
    #[serde(skip_serializing_if = "Option::is_none")]
    pub equipment: Option<Vec<EquipmentSlot>>,
}

/// Request to update an existing agent
#[derive(Debug, Deserialize, Validate, utoipa::ToSchema)]
pub struct UpdateAgentRequest {
    /// Updated agent configuration
    #[serde(flatten)]
    pub config: AgentConfig,
}

/// Request to equip agent with equipment
#[derive(Debug, Deserialize, Validate, utoipa::ToSchema)]
pub struct EquipAgentRequest {
    /// Equipment slots to equip
    pub equipment: Vec<EquipmentSlot>,
}

/// Request to unequip equipment from agent
#[derive(Debug, Deserialize, Validate, utoipa::ToSchema)]
pub struct UnequipAgentRequest {
    /// Equipment slots to unequip
    pub equipment: Vec<EquipmentSlot>,
}

/// Response containing agent information
#[derive(Debug, Serialize, utoipa::ToSchema)]
pub struct AgentResponse {
    /// Agent ID
    pub id: String,
    /// Agent state
    pub state: AgentState,
    /// Agent configuration
    pub config: AgentConfig,
    /// Currently equipped equipment
    pub equipped: Vec<EquipmentSlot>,
    /// Agent creation timestamp
    pub created_at: DateTime<Utc>,
    /// Last updated timestamp
    pub updated_at: DateTime<Utc>,
}

/// Response containing multiple agents
#[derive(Debug, Serialize, utoipa::ToSchema)]
pub struct AgentsListResponse {
    /// List of agents
    pub agents: Vec<AgentResponse>,
    /// Total count
    pub total: usize,
    /// Page number
    pub page: usize,
    /// Page size
    pub page_size: usize,
}

/// Authentication request
#[derive(Debug, Deserialize, Validate, utoipa::ToSchema)]
pub struct AuthRequest {
    /// Username or email
    #[validate(length(min = 1, max = 100))]
    pub username: String,
    /// Password
    #[validate(length(min = 8, max = 100))]
    pub password: String,
}

/// Authentication response
#[derive(Debug, Serialize, utoipa::ToSchema)]
pub struct AuthResponse {
    /// JWT access token
    pub access_token: String,
    /// Token type (always "Bearer")
    pub token_type: String,
    /// Token expiration time (seconds)
    pub expires_in: u64,
    /// Refresh token
    pub refresh_token: String,
}

/// Token refresh request
#[derive(Debug, Deserialize, Validate, utoipa::ToSchema)]
pub struct RefreshTokenRequest {
    /// Refresh token
    #[validate(length(min = 1))]
    pub refresh_token: String,
}

/// Health check response
#[derive(Debug, Serialize, utoipa::ToSchema)]
pub struct HealthResponse {
    /// Service health status
    pub status: String,
    /// Version
    pub version: String,
    /// Uptime in seconds
    pub uptime: u64,
    /// Number of active agents
    pub active_agents: usize,
    /// Number of connected WebSocket clients
    pub connected_clients: usize,
}

/// WebSocket message types
#[derive(Debug, Serialize, Deserialize, utoipa::ToSchema)]
#[serde(tag = "type", content = "data")]
pub enum WebSocketMessage {
    /// Agent state update
    #[serde(rename = "agent_update")]
    AgentUpdate {
        agent_id: String,
        state: AgentState,
        timestamp: DateTime<Utc>,
    },
    /// Agent created
    #[serde(rename = "agent_created")]
    AgentCreated {
        agent_id: String,
        config: AgentConfig,
        timestamp: DateTime<Utc>,
    },
    /// Agent deleted
    #[serde(rename = "agent_deleted")]
    AgentDeleted {
        agent_id: String,
        timestamp: DateTime<Utc>,
    },
    /// Equipment change
    #[serde(rename = "equipment_changed")]
    EquipmentChanged {
        agent_id: String,
        equipped: Vec<EquipmentSlot>,
        timestamp: DateTime<Utc>,
    },
    /// Error message
    #[serde(rename = "error")]
    Error {
        code: String,
        message: String,
    },
    /// Ping message
    #[serde(rename = "ping")]
    Ping {
        timestamp: DateTime<Utc>,
    },
    /// Pong message
    #[serde(rename = "pong")]
    Pong {
        timestamp: DateTime<Utc>,
    },
}

impl From<&MinimalAgent> for AgentResponse {
    fn from(agent: &MinimalAgent) -> Self {
        let state = agent.state();
        let config = agent.config().clone();
        AgentResponse {
            id: agent.id().to_string(),
            state,
            config,
            equipped: vec![],
            created_at: Utc::now(),
            updated_at: Utc::now(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_api_error_status_codes() {
        assert_eq!(ApiError::BadRequest("test".to_string()).status_code(), 400);
        assert_eq!(ApiError::Unauthorized("test".to_string()).status_code(), 401);
        assert_eq!(ApiError::NotFound("test".to_string()).status_code(), 404);
        assert_eq!(ApiError::RateLimitExceeded.status_code(), 429);
    }

    #[test]
    fn test_websocket_message_serialization() {
        let msg = WebSocketMessage::Ping {
            timestamp: Utc::now(),
        };
        let json = serde_json::to_string(&msg).unwrap();
        assert!(json.contains(r#""type":"ping""#));
    }
}
