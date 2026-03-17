//! REST API handlers for the Claw API
//!
//! This module contains all HTTP request handlers for agent management,
//! authentication, and health checks.

use crate::agent::{Agent, MinimalAgent, AgentConfig};
use crate::api::auth::{AuthService, JwtAuth};
use crate::api::models::{
    AgentResponse, AgentsListResponse, ApiError, ApiResult, ApiResponse, AuthRequest,
    AuthResponse, CreateAgentRequest, EquipAgentRequest, ErrorDetail, RefreshTokenRequest,
    ResponseData, UnequipAgentRequest, UpdateAgentRequest,
};
use crate::equipment::{EquipmentSlot, MemoryEquipment, ReasoningEquipment, ConsensusEquipment, Equipment};
use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::{IntoResponse, Json, Response},
};
use chrono::Utc;
use serde_json::json;
use std::collections::HashMap;
use std::sync::Arc;
use uuid::Uuid;

/// Application state shared across handlers
#[derive(Clone)]
pub struct AppState {
    /// Agent storage (in-memory for now, should be database in production)
    pub agents: Arc<tokio::sync::RwLock<HashMap<Uuid, MinimalAgent>>>,
    /// Authentication service
    pub auth_service: Arc<AuthService>,
    /// WebSocket broadcast channel
    pub ws_tx: Arc<tokio::sync::broadcast::Sender<WsMessage>>,
}

/// WebSocket message types for internal broadcasting
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub enum WsMessage {
    AgentCreated {
        agent_id: Uuid,
        config: AgentConfig,
        timestamp: chrono::DateTime<chrono::Utc>,
    },
    AgentDeleted {
        agent_id: Uuid,
        timestamp: chrono::DateTime<chrono::Utc>,
    },
    AgentUpdate {
        agent_id: Uuid,
        state: crate::agent::AgentState,
        timestamp: chrono::DateTime<chrono::Utc>,
    },
    EquipmentChanged {
        agent_id: Uuid,
        equipped: Vec<EquipmentSlot>,
        timestamp: chrono::DateTime<chrono::Utc>,
    },
}

/// Health check endpoint
///
/// Check if the API is running and get basic statistics
#[utoipa::path(
    get,
    path = "/health",
    tag = "Health",
    responses(
        (status = 200, description = "Service is healthy", body = ApiResponse)
    )
)]
pub async fn health_check(State(state): State<AppState>) -> ApiResult<Json<ApiResponse<serde_json::Value>>> {
    let agents = state.agents.read().await;
    let active_agents = agents.len();

    let response = ApiResponse {
        success: true,
        data: ResponseData::Ok(json!({
            "status": "healthy",
            "version": env!("CARGO_PKG_VERSION"),
            "uptime": 0,
            "active_agents": active_agents,
            "connected_clients": 0,
        })),
        request_id: uuid::Uuid::new_v4().to_string(),
        timestamp: Utc::now(),
    };

    Ok(Json(response))
}

/// Authenticate user and return JWT token
///
/// Authenticate with username and password to receive JWT token
#[utoipa::path(
    post,
    path = "/api/v1/auth",
    tag = "Authentication",
    request_body = AuthRequest,
    responses(
        (status = 200, description = "Authentication successful", body = ApiResponse<AuthResponse>),
        (status = 401, description = "Invalid credentials")
    )
)]
pub async fn authenticate(
    State(state): State<AppState>,
    Json(req): Json<AuthRequest>,
) -> ApiResult<Json<ApiResponse<AuthResponse>>> {
    let auth_response = state.auth_service.authenticate(req).await?;

    let response = ApiResponse {
        success: true,
        data: ResponseData::Ok(auth_response),
        request_id: uuid::Uuid::new_v4().to_string(),
        timestamp: Utc::now(),
    };

    Ok(Json(response))
}

/// Refresh access token
///
/// Refresh access token using refresh token
#[utoipa::path(
    post,
    path = "/api/v1/auth/refresh",
    tag = "Authentication",
    request_body = RefreshTokenRequest,
    responses(
        (status = 200, description = "Token refreshed successfully", body = ApiResponse<AuthResponse>),
        (status = 401, description = "Invalid refresh token")
    )
)]
pub async fn refresh_token(
    State(state): State<AppState>,
    Json(req): Json<RefreshTokenRequest>,
) -> ApiResult<Json<ApiResponse<AuthResponse>>> {
    let auth_response = state.auth_service.refresh_token(req).await?;

    let response = ApiResponse {
        success: true,
        data: ResponseData::Ok(auth_response),
        request_id: uuid::Uuid::new_v4().to_string(),
        timestamp: Utc::now(),
    };

    Ok(Json(response))
}

/// Create a new agent
///
/// Create a new cellular agent with specified configuration
#[utoipa::path(
    post,
    path = "/api/v1/agents",
    tag = "Agents",
    request_body = CreateAgentRequest,
    responses(
        (status = 201, description = "Agent created successfully", body = ApiResponse<AgentResponse>),
        (status = 400, description = "Invalid request"),
        (status = 409, description = "Agent already exists")
    ),
    security(
        ("bearer_auth" = [])
    )
)]
pub async fn create_agent(
    State(state): State<AppState>,
    _auth: JwtAuth,
    Json(req): Json<CreateAgentRequest>,
) -> ApiResult<(StatusCode, Json<ApiResponse<AgentResponse>>)> {
    let agent_id = req.id.unwrap_or_else(Uuid::new_v4);

    // Create agent config
    let config = crate::agent::AgentConfig {
        id: agent_id.to_string(),
        cell_ref: req.config.cell_ref.clone(),
        model: req.config.model.clone(),
        equipment: req.config.equipment.clone(),
        config: req.config.config.clone(),
    };

    // Create agent
    let mut agent = MinimalAgent::new(config);

    // Equip initial equipment if provided
    if let Some(equipment) = req.equipment {
        for slot in equipment {
            let equip: Box<dyn Equipment> = match slot {
                EquipmentSlot::Memory => Box::new(MemoryEquipment::new()),
                EquipmentSlot::Reasoning => Box::new(ReasoningEquipment::new()),
                EquipmentSlot::Consensus => Box::new(ConsensusEquipment::new()),
                _ => continue, // Skip unsupported equipment for now
            };
            agent.equip(equip).await
                .map_err(|e| ApiError::InternalError(format!("Failed to equip: {}", e)))?;
        }
    }

    // Store agent
    let mut agents = state.agents.write().await;
    if agents.contains_key(&agent_id) {
        return Err(ApiError::Conflict("Agent already exists".to_string()));
    }
    agents.insert(agent_id, agent);

    // Get agent for response
    let agent = agents.get(&agent_id).unwrap();

    // Broadcast agent creation
    let _ = state.ws_tx.send(WsMessage::AgentCreated {
        agent_id,
        config: req.config,
        timestamp: Utc::now(),
    });

    let response = ApiResponse {
        success: true,
        data: ResponseData::Ok(AgentResponse::from(agent)),
        request_id: uuid::Uuid::new_v4().to_string(),
        timestamp: Utc::now(),
    };

    Ok((StatusCode::CREATED, Json(response)))
}

/// Get agent by ID
///
/// Get detailed information about a specific agent
#[utoipa::path(
    get,
    path = "/api/v1/agents/{id}",
    tag = "Agents",
    params(
        ("id" = Uuid, Path, description = "Agent ID")
    ),
    responses(
        (status = 200, description = "Agent found", body = ApiResponse<AgentResponse>),
        (status = 404, description = "Agent not found")
    ),
    security(
        ("bearer_auth" = [])
    )
)]
pub async fn get_agent(
    State(state): State<AppState>,
    _auth: JwtAuth,
    Path(id): Path<Uuid>,
) -> ApiResult<Json<ApiResponse<AgentResponse>>> {
    let agents = state.agents.read().await;
    let agent = agents.get(&id).ok_or_else(|| ApiError::NotFound("Agent not found".to_string()))?;

    let response = ApiResponse {
        success: true,
        data: ResponseData::Ok(AgentResponse::from(agent)),
        request_id: uuid::Uuid::new_v4().to_string(),
        timestamp: Utc::now(),
    };

    Ok(Json(response))
}

/// Update agent
///
/// Update agent configuration
#[utoipa::path(
    put,
    path = "/api/v1/agents/{id}",
    tag = "Agents",
    params(
        ("id" = Uuid, Path, description = "Agent ID")
    ),
    request_body = UpdateAgentRequest,
    responses(
        (status = 200, description = "Agent updated successfully", body = ApiResponse<AgentResponse>),
        (status = 404, description = "Agent not found")
    ),
    security(
        ("bearer_auth" = [])
    )
)]
pub async fn update_agent(
    State(state): State<AppState>,
    _auth: JwtAuth,
    Path(id): Path<Uuid>,
    Json(_req): Json<UpdateAgentRequest>,
) -> ApiResult<Json<ApiResponse<AgentResponse>>> {
    let mut agents = state.agents.write().await;
    let _agent = agents.get_mut(&id).ok_or_else(|| ApiError::NotFound("Agent not found".to_string()))?;

    // For now, just return the agent (full update would require Agent trait update)
    let agent = agents.get(&id).unwrap();

    let response = ApiResponse {
        success: true,
        data: ResponseData::Ok(AgentResponse::from(agent)),
        request_id: uuid::Uuid::new_v4().to_string(),
        timestamp: Utc::now(),
    };

    Ok(Json(response))
}

/// Delete agent
///
/// Delete an agent permanently
#[utoipa::path(
    delete,
    path = "/api/v1/agents/{id}",
    tag = "Agents",
    params(
        ("id" = Uuid, Path, description = "Agent ID")
    ),
    responses(
        (status = 204, description = "Agent deleted successfully"),
        (status = 404, description = "Agent not found")
    ),
    security(
        ("bearer_auth" = [])
    )
)]
pub async fn delete_agent(
    State(state): State<AppState>,
    _auth: JwtAuth,
    Path(id): Path<Uuid>,
) -> ApiResult<StatusCode> {
    let mut agents = state.agents.write().await;
    agents.remove(&id).ok_or_else(|| ApiError::NotFound("Agent not found".to_string()))?;

    // Broadcast agent deletion
    let _ = state.ws_tx.send(WsMessage::AgentDeleted {
        agent_id: id,
        timestamp: Utc::now(),
    });

    Ok(StatusCode::NO_CONTENT)
}

/// List all agents
///
/// Get a list of all agents with pagination
#[utoipa::path(
    get,
    path = "/api/v1/agents",
    tag = "Agents",
    responses(
        (status = 200, description = "List of agents", body = ApiResponse<AgentsListResponse>)
    ),
    security(
        ("bearer_auth" = [])
    )
)]
pub async fn list_agents(
    State(state): State<AppState>,
    _auth: JwtAuth,
) -> ApiResult<Json<ApiResponse<AgentsListResponse>>> {
    let agents = state.agents.read().await;
    let agent_list: Vec<AgentResponse> = agents
        .values()
        .map(AgentResponse::from)
        .collect();

    let total = agent_list.len();

    let list_response = AgentsListResponse {
        agents: agent_list,
        total,
        page: 0,
        page_size: 100,
    };

    let response = ApiResponse {
        success: true,
        data: ResponseData::Ok(list_response),
        request_id: uuid::Uuid::new_v4().to_string(),
        timestamp: Utc::now(),
    };

    Ok(Json(response))
}

/// Equip agent with equipment
///
/// Equip agent with specified equipment
#[utoipa::path(
    post,
    path = "/api/v1/agents/{id}/equip",
    tag = "Agents",
    params(
        ("id" = Uuid, Path, description = "Agent ID")
    ),
    request_body = EquipAgentRequest,
    responses(
        (status = 200, description = "Equipment equipped successfully", body = ApiResponse<AgentResponse>),
        (status = 404, description = "Agent not found")
    ),
    security(
        ("bearer_auth" = [])
    )
)]
pub async fn equip_agent(
    State(state): State<AppState>,
    _auth: JwtAuth,
    Path(id): Path<Uuid>,
    Json(req): Json<EquipAgentRequest>,
) -> ApiResult<Json<ApiResponse<AgentResponse>>> {
    let mut agents = state.agents.write().await;
    let agent = agents.get_mut(&id).ok_or_else(|| ApiError::NotFound("Agent not found".to_string()))?;

    // Equip all requested equipment
    for slot in &req.equipment {
        let equip: Box<dyn Equipment> = match slot {
            EquipmentSlot::Memory => Box::new(MemoryEquipment::new()),
            EquipmentSlot::Reasoning => Box::new(ReasoningEquipment::new()),
            EquipmentSlot::Consensus => Box::new(ConsensusEquipment::new()),
            _ => continue,
        };
        agent.equip(equip).await
            .map_err(|e| ApiError::InternalError(format!("Failed to equip: {}", e)))?;
    }

    let agent = agents.get(&id).unwrap();
    let equipped: Vec<EquipmentSlot> = vec![]; // Would need to track this in agent

    let response = ApiResponse {
        success: true,
        data: ResponseData::Ok(AgentResponse::from(agent)),
        request_id: uuid::Uuid::new_v4().to_string(),
        timestamp: Utc::now(),
    };

    // Broadcast equipment change
    let _ = state.ws_tx.send(WsMessage::EquipmentChanged {
        agent_id: id,
        equipped,
        timestamp: Utc::now(),
    });

    Ok(Json(response))
}

/// Unequip equipment from agent
///
/// Unequip specified equipment from agent
#[utoipa::path(
    post,
    path = "/api/v1/agents/{id}/unequip",
    tag = "Agents",
    params(
        ("id" = Uuid, Path, description = "Agent ID")
    ),
    request_body = UnequipAgentRequest,
    responses(
        (status = 200, description = "Equipment unequipped successfully", body = ApiResponse<AgentResponse>),
        (status = 404, description = "Agent not found")
    ),
    security(
        ("bearer_auth" = [])
    )
)]
pub async fn unequip_agent(
    State(state): State<AppState>,
    _auth: JwtAuth,
    Path(id): Path<Uuid>,
    Json(req): Json<UnequipAgentRequest>,
) -> ApiResult<Json<ApiResponse<AgentResponse>>> {
    let mut agents = state.agents.write().await;
    let agent = agents.get_mut(&id).ok_or_else(|| ApiError::NotFound("Agent not found".to_string()))?;

    // Unequip all requested equipment
    for slot in &req.equipment {
        agent.unequip(*slot).await
            .map_err(|e| ApiError::InternalError(format!("Failed to unequip: {}", e)))?;
    }

    let agent = agents.get(&id).unwrap();
    let equipped: Vec<EquipmentSlot> = vec![];

    let response = ApiResponse {
        success: true,
        data: ResponseData::Ok(AgentResponse::from(agent)),
        request_id: uuid::Uuid::new_v4().to_string(),
        timestamp: Utc::now(),
    };

    // Broadcast equipment change
    let _ = state.ws_tx.send(WsMessage::EquipmentChanged {
        agent_id: id,
        equipped,
        timestamp: Utc::now(),
    });

    Ok(Json(response))
}

/// Get agent state
///
/// Get current state of the agent
#[utoipa::path(
    get,
    path = "/api/v1/agents/{id}/state",
    tag = "Agents",
    params(
        ("id" = Uuid, Path, description = "Agent ID")
    ),
    responses(
        (status = 200, description = "Agent state retrieved successfully", body = ApiResponse<serde_json::Value>),
        (status = 404, description = "Agent not found")
    ),
    security(
        ("bearer_auth" = [])
    )
)]
pub async fn get_agent_state(
    State(state): State<AppState>,
    _auth: JwtAuth,
    Path(id): Path<Uuid>,
) -> ApiResult<Json<ApiResponse<serde_json::Value>>> {
    let agents = state.agents.read().await;
    let agent = agents.get(&id).ok_or_else(|| ApiError::NotFound("Agent not found".to_string()))?;

    let agent_state = agent.state();
    let state_json = json!({
        "id": agent.id(),
        "state": agent_state.status,
        "equipped": agent_state.equipment,
    });

    let response = ApiResponse {
        success: true,
        data: ResponseData::Ok(state_json),
        request_id: uuid::Uuid::new_v4().to_string(),
        timestamp: Utc::now(),
    };

    Ok(Json(response))
}

/// Implement IntoResponse for ApiError
impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        let status = StatusCode::from_u16(self.status_code()).unwrap_or(StatusCode::INTERNAL_SERVER_ERROR);
        let error_detail = ErrorDetail {
            code: self.error_code(),
            message: self.to_string(),
            details: None,
            stack_trace: None,
        };

        let response: ApiResponse<serde_json::Value> = ApiResponse {
            success: false,
            data: ResponseData::Error(error_detail),
            request_id: uuid::Uuid::new_v4().to_string(),
            timestamp: Utc::now(),
        };

        (status, Json(response)).into_response()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_health_check() {
        let state = AppState {
            agents: Arc::new(tokio::sync::RwLock::new(HashMap::new())),
            auth_service: Arc::new(AuthService::new().unwrap()),
            ws_tx: Arc::new(tokio::sync::broadcast::channel(100).0),
        };

        let response = health_check(State(state)).await.unwrap();
        assert!(response.0.success);
    }
}
