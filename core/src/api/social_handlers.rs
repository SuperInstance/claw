//! Social Coordination REST API handlers
//!
//! This module provides REST endpoints for managing multi-agent social coordination,
//! including relationship management, consensus voting, and coordination patterns.

use crate::api::auth::JwtAuth;
use crate::api::models::{ApiError, ApiResult, ApiResponse, ResponseData};
use crate::social::{
    SocialManager, SocialAgentMetadata, CoordinationConfig, CoordinationMetrics,
};
use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::Json,
};
use chrono::Utc;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use uuid::Uuid;

/// Social coordination state
#[derive(Clone)]
pub struct SocialState {
    /// Social manager for coordination
    pub social_manager: Arc<tokio::sync::RwLock<SocialManager>>,
}

impl SocialState {
    pub fn new() -> Self {
        Self {
            social_manager: Arc::new(tokio::sync::RwLock::new(
                SocialManager::new(CoordinationConfig::default())
            )),
        }
    }
}

impl Default for SocialState {
    fn default() -> Self {
        Self::new()
    }
}

/// Request to register an agent for social coordination
#[derive(Debug, Deserialize, utoipa::ToSchema)]
pub struct RegisterAgentRequest {
    /// Agent ID
    pub id: String,
    /// Agent role
    pub role: String,
    /// Agent capabilities
    #[serde(default)]
    pub capabilities: Vec<String>,
}

/// Request to create a master-slave relationship
#[derive(Debug, Deserialize, utoipa::ToSchema)]
pub struct CreateMasterSlaveRequest {
    /// Master agent ID
    pub master_id: String,
    /// Slave agent IDs
    pub slave_ids: Vec<String>,
}

/// Request to create a co-worker relationship
#[derive(Debug, Deserialize, utoipa::ToSchema)]
pub struct CreateCoWorkerRequest {
    /// Co-worker agent IDs
    pub worker_ids: Vec<String>,
}

/// Request to coordinate agents
#[derive(Debug, Deserialize, utoipa::ToSchema)]
pub struct CoordinateAgentsRequest {
    /// List of agent IDs to coordinate
    pub agent_ids: Vec<String>,
    /// Coordination strategy (parallel, sequential, consensus, majority_vote, weighted)
    pub strategy: String,
    /// Task description
    pub task: String,
}

/// Response for agent coordination
#[derive(Debug, Serialize, utoipa::ToSchema)]
pub struct CoordinationResponse {
    /// Coordination ID
    pub coordination_id: String,
    /// Agents involved
    pub agent_ids: Vec<String>,
    /// Strategy used
    pub strategy: String,
    /// Result of coordination
    pub result: String,
    /// Execution time in milliseconds
    pub execution_time_ms: u64,
    /// Timestamp
    pub timestamp: chrono::DateTime<chrono::Utc>,
}

/// Response for agent relationships
#[derive(Debug, Serialize, utoipa::ToSchema)]
pub struct AgentRelationshipsResponse {
    /// Agent ID
    pub agent_id: String,
    /// Relationships
    pub relationships: Vec<RelationshipInfo>,
    /// Timestamp
    pub timestamp: chrono::DateTime<chrono::Utc>,
}

/// Information about a relationship
#[derive(Debug, Serialize, utoipa::ToSchema)]
pub struct RelationshipInfo {
    /// Relationship ID
    pub id: String,
    /// Participants
    pub participants: Vec<String>,
    /// Relationship type
    pub relationship_type: String,
    /// Relationship state
    pub state: String,
}

/// Active coordination info
#[derive(Debug, Serialize, utoipa::ToSchema)]
pub struct ActiveCoordinationInfo {
    /// Count of active coordinations
    pub count: usize,
    /// Status
    pub status: String,
}

/// Get social coordination metrics
///
/// Retrieve metrics about social coordination operations
#[utoipa::path(
    get,
    path = "/api/v1/social/metrics",
    tag = "Social Coordination",
    responses(
        (status = 200, description = "Metrics retrieved successfully", body = ApiResponse<CoordinationMetrics>),
        (status = 500, description = "Internal server error")
    ),
    security(
        ("bearer_auth" = [])
    )
)]
pub async fn get_social_metrics(
    State(state): State<SocialState>,
    _auth: JwtAuth,
) -> ApiResult<Json<ApiResponse<CoordinationMetrics>>> {
    let manager = state.social_manager.read().await;
    let metrics = manager.get_metrics().await;

    let response = ApiResponse {
        success: true,
        data: ResponseData::Ok(metrics),
        request_id: Uuid::new_v4().to_string(),
        timestamp: Utc::now(),
    };

    Ok(Json(response))
}

/// Register agent for social coordination
///
/// Register an agent with the social manager for coordination
#[utoipa::path(
    post,
    path = "/api/v1/social/agents/register",
    tag = "Social Coordination",
    request_body = RegisterAgentRequest,
    responses(
        (status = 201, description = "Agent registered successfully", body = ApiResponse<serde_json::Value>),
        (status = 400, description = "Invalid request")
    ),
    security(
        ("bearer_auth" = [])
    )
)]
pub async fn register_social_agent(
    State(state): State<SocialState>,
    _auth: JwtAuth,
    Json(req): Json<RegisterAgentRequest>,
) -> ApiResult<(StatusCode, Json<ApiResponse<serde_json::Value>>)> {
    let manager = state.social_manager.read().await;

    // Parse role
    let role = match req.role.as_str() {
        "master" => crate::social::SocialRole::Master,
        "slave" => crate::social::SocialRole::Slave,
        "co_worker" => crate::social::SocialRole::CoWorker,
        "peer" => crate::social::SocialRole::Peer,
        "delegate" => crate::social::SocialRole::Delegate,
        "observer" => crate::social::SocialRole::Observer,
        _ => return Err(ApiError::BadRequest(format!("Invalid role: {}", req.role))),
    };

    let agent_metadata = SocialAgentMetadata::new(req.id.clone(), role)
        .with_capabilities(req.capabilities);

    manager
        .register_agent(agent_metadata)
        .await
        .map_err(|e| ApiError::InternalError(format!("Failed to register agent: {}", e)))?;

    let response = ApiResponse {
        success: true,
        data: ResponseData::Ok(serde_json::json!({"agent_id": req.id, "status": "registered"})),
        request_id: Uuid::new_v4().to_string(),
        timestamp: Utc::now(),
    };

    Ok((StatusCode::CREATED, Json(response)))
}

/// Create master-slave relationship
///
/// Establish a master-slave relationship between agents
#[utoipa::path(
    post,
    path = "/api/v1/social/relationships/master-slave",
    tag = "Social Coordination",
    request_body = CreateMasterSlaveRequest,
    responses(
        (status = 201, description = "Relationship created successfully", body = ApiResponse<serde_json::Value>),
        (status = 400, description = "Invalid request")
    ),
    security(
        ("bearer_auth" = [])
    )
)]
pub async fn create_master_slave(
    State(state): State<SocialState>,
    _auth: JwtAuth,
    Json(req): Json<CreateMasterSlaveRequest>,
) -> ApiResult<(StatusCode, Json<ApiResponse<serde_json::Value>>)> {
    let manager = state.social_manager.read().await;

    let relationship_id = manager
        .create_master_slave(req.master_id.clone(), req.slave_ids.clone())
        .await
        .map_err(|e| ApiError::InternalError(format!("Failed to create relationship: {}", e)))?;

    let response = ApiResponse {
        success: true,
        data: ResponseData::Ok(serde_json::json!({
            "relationship_id": relationship_id,
            "type": "master_slave",
            "master_id": req.master_id,
            "slave_ids": req.slave_ids
        })),
        request_id: Uuid::new_v4().to_string(),
        timestamp: Utc::now(),
    };

    Ok((StatusCode::CREATED, Json(response)))
}

/// Create co-worker relationship
///
/// Establish a co-worker relationship between agents
#[utoipa::path(
    post,
    path = "/api/v1/social/relationships/co-worker",
    tag = "Social Coordination",
    request_body = CreateCoWorkerRequest,
    responses(
        (status = 201, description = "Relationship created successfully", body = ApiResponse<serde_json::Value>),
        (status = 400, description = "Invalid request")
    ),
    security(
        ("bearer_auth" = [])
    )
)]
pub async fn create_co_worker(
    State(state): State<SocialState>,
    _auth: JwtAuth,
    Json(req): Json<CreateCoWorkerRequest>,
) -> ApiResult<(StatusCode, Json<ApiResponse<serde_json::Value>>)> {
    let manager = state.social_manager.read().await;

    let relationship_id = manager
        .create_co_worker(req.worker_ids.clone())
        .await
        .map_err(|e| ApiError::InternalError(format!("Failed to create relationship: {}", e)))?;

    let response = ApiResponse {
        success: true,
        data: ResponseData::Ok(serde_json::json!({
            "relationship_id": relationship_id,
            "type": "co_worker",
            "worker_ids": req.worker_ids
        })),
        request_id: Uuid::new_v4().to_string(),
        timestamp: Utc::now(),
    };

    Ok((StatusCode::CREATED, Json(response)))
}

/// Coordinate agents
///
/// Execute a coordination task across multiple agents
#[utoipa::path(
    post,
    path = "/api/v1/social/coordinate",
    tag = "Social Coordination",
    request_body = CoordinateAgentsRequest,
    responses(
        (status = 200, description = "Coordination completed successfully", body = ApiResponse<CoordinationResponse>),
        (status = 400, description = "Invalid request")
    ),
    security(
        ("bearer_auth" = [])
    )
)]
pub async fn coordinate_agents(
    State(state): State<SocialState>,
    _auth: JwtAuth,
    Json(req): Json<CoordinateAgentsRequest>,
) -> ApiResult<Json<ApiResponse<CoordinationResponse>>> {
    let manager = state.social_manager.read().await;

    // Execute coordination based on strategy
    let start = std::time::Instant::now();
    let task_value = serde_json::json!(req.task);
    let result = match req.strategy.as_str() {
        "parallel" => {
            manager.coordinate_parallel(req.agent_ids.clone(), task_value).await
        }
        "sequential" => {
            manager.coordinate_sequential(req.agent_ids.clone(), task_value).await
        }
        "consensus" => {
            manager.coordinate_consensus(req.agent_ids.clone(), task_value).await
        }
        "majority_vote" => {
            manager.coordinate_majority_vote(req.agent_ids.clone(), task_value).await
        }
        "weighted" => {
            manager.coordinate_weighted(req.agent_ids.clone(), task_value).await
        }
        _ => return Err(ApiError::BadRequest(format!("Invalid strategy: {}", req.strategy))),
    };

    let result = result.map_err(|e| ApiError::InternalError(format!("Coordination failed: {}", e)))?;
    let execution_time_ms = start.elapsed().as_millis() as u64;

    let response = CoordinationResponse {
        coordination_id: Uuid::new_v4().to_string(),
        agent_ids: req.agent_ids,
        strategy: req.strategy,
        result: format!("{:?}", result),
        execution_time_ms,
        timestamp: Utc::now(),
    };

    let api_response = ApiResponse {
        success: true,
        data: ResponseData::Ok(response),
        request_id: Uuid::new_v4().to_string(),
        timestamp: Utc::now(),
    };

    Ok(Json(api_response))
}

/// Get agent relationships
///
/// Get all relationships for a specific agent
#[utoipa::path(
    get,
    path = "/api/v1/social/agents/{agent_id}/relationships",
    tag = "Social Coordination",
    params(
        ("agent_id" = String, Path, description = "Agent ID")
    ),
    responses(
        (status = 200, description = "Relationships retrieved successfully", body = ApiResponse<AgentRelationshipsResponse>),
        (status = 404, description = "Agent not found")
    ),
    security(
        ("bearer_auth" = [])
    )
)]
pub async fn get_agent_relationships(
    State(state): State<SocialState>,
    _auth: JwtAuth,
    Path(agent_id): Path<String>,
) -> ApiResult<Json<ApiResponse<AgentRelationshipsResponse>>> {
    let manager = state.social_manager.read().await;

    let relationships = manager.get_agent_relationships(&agent_id).await;

    let relationship_infos: Vec<RelationshipInfo> = relationships
        .into_iter()
        .map(|r| RelationshipInfo {
            id: r.id,
            participants: r.participants,
            relationship_type: format!("{:?}", r.relationship_type),
            state: format!("{:?}", r.state),
        })
        .collect();

    let response = AgentRelationshipsResponse {
        agent_id: agent_id.clone(),
        relationships: relationship_infos,
        timestamp: Utc::now(),
    };

    let api_response = ApiResponse {
        success: true,
        data: ResponseData::Ok(response),
        request_id: Uuid::new_v4().to_string(),
        timestamp: Utc::now(),
    };

    Ok(Json(api_response))
}

/// Get active coordinations
///
/// Get all currently active coordinations
#[utoipa::path(
    get,
    path = "/api/v1/social/coordinations/active",
    tag = "Social Coordination",
    responses(
        (status = 200, description = "Active coordinations retrieved successfully", body = ApiResponse<ActiveCoordinationInfo>)
    ),
    security(
        ("bearer_auth" = [])
    )
)]
pub async fn get_active_coordinations(
    State(_state): State<SocialState>,
    _auth: JwtAuth,
) -> ApiResult<Json<ApiResponse<ActiveCoordinationInfo>>> {
    // Return a simple status response
    // In a full implementation, this would query the actual active coordinations
    let info = ActiveCoordinationInfo {
        count: 0,
        status: "idle".to_string(),
    };

    let api_response = ApiResponse {
        success: true,
        data: ResponseData::Ok(info),
        request_id: Uuid::new_v4().to_string(),
        timestamp: Utc::now(),
    };

    Ok(Json(api_response))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_social_state_creation() {
        let state = SocialState::new();
        assert!(Arc::strong_count(&state.social_manager) >= 1);
    }
}
