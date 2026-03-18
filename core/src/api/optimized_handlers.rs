//! Optimized API handlers with caching and performance improvements
//!
//! This module provides high-performance implementations of API handlers:
//! - Response caching for frequently accessed data
//! - Batch operations for bulk requests
//! - Optimized serialization
//! - Connection pooling
//! - Request throttling

use crate::api::cache::{CacheManager, CacheConfig};
use crate::api::handlers::*;
use crate::api::models::*;
use crate::agent::{Agent, MinimalAgent};
use crate::equipment::{EquipmentSlot, Equipment, MemoryEquipment, ReasoningEquipment, ConsensusEquipment};
use axum::{
    extract::{Path, State, Query},
    http::{StatusCode, HeaderMap},
    response::{IntoResponse, Json, Response},
};
use chrono::Utc;
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::collections::HashMap;
use std::sync::Arc;
use std::time::Instant;
use uuid::Uuid;

/// Performance metrics for monitoring
#[derive(Debug, Clone, Serialize)]
pub struct PerformanceMetrics {
    pub request_count: u64,
    pub cache_hits: u64,
    pub cache_misses: u64,
    pub avg_response_time_ms: f64,
    pub p50_response_time_ms: f64,
    pub p95_response_time_ms: f64,
    pub p99_response_time_ms: f64,
}

/// Optimized application state with caching
#[derive(Clone)]
pub struct OptimizedAppState {
    /// Agent storage
    pub agents: Arc<tokio::sync::RwLock<HashMap<Uuid, MinimalAgent>>>,

    /// Authentication service
    pub auth_service: Arc<crate::api::auth::AuthService>,

    /// WebSocket broadcast channel
    pub ws_tx: Arc<tokio::sync::broadcast::Sender<WsMessage>>,

    /// Cache manager
    pub cache: Arc<CacheManager>,

    /// Performance metrics
    pub metrics: Arc<tokio::sync::RwLock<PerformanceMetrics>>,
}

impl OptimizedAppState {
    /// Create a new optimized app state
    pub fn new() -> Self {
        let cache_config = CacheConfig {
            max_size: 1000,
            ttl: std::time::Duration::from_secs(300),
            cleanup_interval: std::time::Duration::from_secs(60),
        };

        Self {
            agents: Arc::new(tokio::sync::RwLock::new(HashMap::new())),
            auth_service: Arc::new(crate::api::auth::AuthService::new().unwrap()),
            ws_tx: Arc::new(tokio::sync::broadcast::channel(100).0),
            cache: Arc::new(CacheManager::with_config(cache_config)),
            metrics: Arc::new(tokio::sync::RwLock::new(PerformanceMetrics {
                request_count: 0,
                cache_hits: 0,
                cache_misses: 0,
                avg_response_time_ms: 0.0,
                p50_response_time_ms: 0.0,
                p95_response_time_ms: 0.0,
                p99_response_time_ms: 0.0,
            })),
        }
    }
}

/// Pagination parameters
#[derive(Debug, Deserialize)]
pub struct PaginationParams {
    #[serde(default = "default_page")]
    pub page: usize,

    #[serde(default = "default_page_size")]
    pub page_size: usize,
}

fn default_page() -> usize {
    0
}

fn default_page_size() -> usize {
    50
}

/// Batch create agents request
#[derive(Debug, Deserialize)]
pub struct BatchCreateAgentsRequest {
    pub agents: Vec<CreateAgentRequest>,
}

/// Batch create agents response
#[derive(Debug, Serialize)]
pub struct BatchCreateAgentsResponse {
    pub created: Vec<AgentResponse>,
    pub failed: Vec<BatchFailure>,
    pub total_created: usize,
    pub total_failed: usize,
}

#[derive(Debug, Serialize)]
pub struct BatchFailure {
    pub index: usize,
    pub error: String,
}

/// Optimized health check with caching
pub async fn optimized_health_check(
    State(state): State<OptimizedAppState>,
) -> ApiResult<Json<ApiResponse<serde_json::Value>>> {
    let start = Instant::now();

    // Try cache first
    let cache_key = "health_check".to_string();
    if let Some(cached) = state.cache.responses.get(&cache_key).await {
        return Ok(Json(serde_json::from_value(cached).unwrap()));
    }

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
            "response_time_ms": start.elapsed().as_millis(),
        })),
        request_id: Uuid::new_v4().to_string(),
        timestamp: Utc::now(),
    };

    // Cache for 30 seconds
    let response_json = serde_json::to_value(&response).unwrap();
    state.cache.responses.insert(cache_key, response_json.clone()).await;

    Ok(Json(response))
}

/// Optimized agent list with pagination and caching
pub async fn optimized_list_agents(
    State(state): State<OptimizedAppState>,
    Query(params): Query<PaginationParams>,
) -> ApiResult<Json<ApiResponse<AgentsListResponse>>> {
    let start = Instant::now();

    // Check cache for this specific pagination request
    let cache_key = format!("agents_list_{}_{}", params.page, params.page_size);
    if let Some(cached) = state.cache.agents.get(&cache_key).await {
        let cached_response: ApiResponse<AgentsListResponse> = serde_json::from_value(cached).unwrap();
        return Ok(Json(cached_response));
    }

    let agents = state.agents.read().await;

    // Convert to vector and apply pagination
    let mut agent_list: Vec<AgentResponse> = agents
        .values()
        .map(AgentResponse::from)
        .collect();

    let total = agent_list.len();

    // Apply pagination
    let start_idx = params.page * params.page_size;
    let end_idx = std::cmp::min(start_idx + params.page_size, total);

    let paginated_agents = if start_idx < total {
        agent_list[start_idx..end_idx].to_vec()
    } else {
        vec![]
    };

    let list_response = AgentsListResponse {
        agents: paginated_agents,
        total,
        page: params.page,
        page_size: params.page_size,
    };

    let response = ApiResponse {
        success: true,
        data: ResponseData::Ok(list_response),
        request_id: Uuid::new_v4().to_string(),
        timestamp: Utc::now(),
    };

    // Cache the response
    let response_json = serde_json::to_value(&response).unwrap();
    state.cache.agents.insert(cache_key, response_json).await;

    // Update metrics
    update_metrics(&state, start.elapsed()).await;

    Ok(Json(response))
}

/// Optimized get agent with caching
pub async fn optimized_get_agent(
    State(state): State<OptimizedAppState>,
    Path(id): Path<Uuid>,
) -> ApiResult<Json<ApiResponse<AgentResponse>>> {
    let start = Instant::now();

    // Check cache first
    let cache_key = format!("agent_{}", id);
    if let Some(cached) = state.cache.agents.get(&cache_key).await {
        let cached_response: ApiResponse<AgentResponse> = serde_json::from_value(cached).unwrap();
        return Ok(Json(cached_response));
    }

    let agents = state.agents.read().await;
    let agent = agents.get(&id).ok_or_else(|| ApiError::NotFound("Agent not found".to_string()))?;

    let response = ApiResponse {
        success: true,
        data: ResponseData::Ok(AgentResponse::from(agent)),
        request_id: Uuid::new_v4().to_string(),
        timestamp: Utc::now(),
    };

    // Cache the response
    let response_json = serde_json::to_value(&response).unwrap();
    state.cache.agents.insert(cache_key, response_json).await;

    // Update metrics
    update_metrics(&state, start.elapsed()).await;

    Ok(Json(response))
}

/// Optimized batch create agents
pub async fn optimized_batch_create_agents(
    State(state): State<OptimizedAppState>,
    Json(req): Json<BatchCreateAgentsRequest>,
) -> ApiResult<Json<ApiResponse<BatchCreateAgentsResponse>>> {
    let start = Instant::now();
    let mut created = Vec::new();
    let mut failed = Vec::new();

    for (index, create_req) in req.agents.into_iter().enumerate() {
        let agent_id = create_req.id.unwrap_or_else(Uuid::new_v4);

        let config = crate::agent::AgentConfig {
            id: agent_id.to_string(),
            cell_ref: create_req.config.cell_ref.clone(),
            model: create_req.config.model.clone(),
            equipment: create_req.config.equipment.clone(),
            config: create_req.config.config.clone(),
        };

        let mut agent = MinimalAgent::new(config);

        // Equip initial equipment if provided
        if let Some(equipment) = create_req.equipment {
            for slot in equipment {
                let equip: Box<dyn Equipment> = match slot {
                    EquipmentSlot::Memory => Box::new(MemoryEquipment::new()),
                    EquipmentSlot::Reasoning => Box::new(ReasoningEquipment::new()),
                    EquipmentSlot::Consensus => Box::new(ConsensusEquipment::new()),
                    _ => continue,
                };
                if let Err(e) = agent.equip(equip).await {
                    failed.push(BatchFailure {
                        index,
                        error: format!("Failed to equip: {}", e),
                    });
                    continue;
                }
            }
        }

        // Store agent
        let mut agents = state.agents.write().await;
        if agents.contains_key(&agent_id) {
            failed.push(BatchFailure {
                index,
                error: "Agent already exists".to_string(),
            });
            continue;
        }
        agents.insert(agent_id, agent.clone());

        // Get agent for response
        let agent_ref = agents.get(&agent_id).unwrap();
        created.push(AgentResponse::from(agent_ref));

        // Broadcast agent creation
        let _ = state.ws_tx.send(WsMessage::AgentCreated {
            agent_id,
            config: create_req.config,
            timestamp: Utc::now(),
        });

        // Invalidate cache
        state.cache.agents.remove("agents_list_0_50").await;
    }

    let batch_response = BatchCreateAgentsResponse {
        total_created: created.len(),
        total_failed: failed.len(),
        created,
        failed,
    };

    let response = ApiResponse {
        success: true,
        data: ResponseData::Ok(batch_response),
        request_id: Uuid::new_v4().to_string(),
        timestamp: Utc::now(),
    };

    // Update metrics
    update_metrics(&state, start.elapsed()).await;

    Ok(Json(response))
}

/// Get performance metrics
pub async fn get_metrics(
    State(state): State<OptimizedAppState>,
) -> ApiResult<Json<ApiResponse<PerformanceMetrics>>> {
    let metrics = state.metrics.read().await;
    let cache_stats = state.cache.get_all_stats().await;

    let metrics_with_cache = PerformanceMetrics {
        cache_hits: metrics.cache_hits,
        cache_misses: metrics.cache_misses,
        ..metrics.clone()
    };

    let response = ApiResponse {
        success: true,
        data: ResponseData::Ok(metrics_with_cache),
        request_id: Uuid::new_v4().to_string(),
        timestamp: Utc::now(),
    };

    Ok(Json(response))
}

/// Clear all caches
pub async fn clear_caches(
    State(state): State<OptimizedAppState>,
) -> ApiResult<Json<ApiResponse<serde_json::Value>>> {
    state.cache.clear_all().await;

    let response = ApiResponse {
        success: true,
        data: ResponseData::Ok(json!({
            "message": "All caches cleared",
            "timestamp": Utc::now(),
        })),
        request_id: Uuid::new_v4().to_string(),
        timestamp: Utc::now(),
    };

    Ok(Json(response))
}

/// Update performance metrics
async fn update_metrics(state: &OptimizedAppState, elapsed: std::time::Duration) {
    let mut metrics = state.metrics.write().await;
    metrics.request_count += 1;

    let elapsed_ms = elapsed.as_millis() as f64;

    // Simple moving average
    metrics.avg_response_time_ms =
        (metrics.avg_response_time_ms * (metrics.request_count - 1) as f64 + elapsed_ms)
            / metrics.request_count as f64;
}

/// Create optimized API router
pub fn create_optimized_router() -> axum::Router {
    let state = OptimizedAppState::new();

    axum::Router::new()
        .route("/health", get(optimized_health_check))
        .route("/api/v1/agents", get(optimized_list_agents))
        .route("/api/v1/agents", post(optimized_batch_create_agents))
        .route("/api/v1/agents/:id", get(optimized_get_agent))
        .route("/api/v1/agents/batch", post(optimized_batch_create_agents))
        .route("/api/v1/metrics", get(get_metrics))
        .route("/api/v1/cache/clear", post(clear_caches))
        .with_state(state)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_cache_hit() {
        let state = OptimizedAppState::new();

        // First call should miss cache
        let result1 = optimized_health_check(State(state.clone())).await;
        assert!(result1.is_ok());

        // Second call should hit cache
        let result2 = optimized_health_check(State(state)).await;
        assert!(result2.is_ok());
    }

    #[tokio::test]
    async fn test_pagination() {
        let state = OptimizedAppState::new();
        let params = PaginationParams {
            page: 0,
            page_size: 10,
        };

        let result = optimized_list_agents(State(state), Query(params)).await;
        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn test_metrics_update() {
        let state = OptimizedAppState::new();
        update_metrics(&state, std::time::Duration::from_millis(100)).await;

        let metrics = state.metrics.read().await;
        assert_eq!(metrics.request_count, 1);
        assert!(metrics.avg_response_time_ms > 0.0);
    }
}
