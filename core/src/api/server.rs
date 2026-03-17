//! Main API server for Claw
//!
//! This module sets up the Axum server with all routes, middleware,
//! and OpenAPI documentation.

use crate::api::handlers::*;
use crate::api::middleware::{compression_layer, cors_layer, logging_middleware, trace_layer};
use axum::{
    routing::{get, post, put, delete},
    Router,
};
use std::net::SocketAddr;
use tower::ServiceBuilder;
use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;

/// Claw API OpenAPI documentation
#[derive(OpenApi)]
#[openapi(
    info(
        title = "Claw API",
        version = "0.1.0",
        description = "Minimal cellular agent engine API for spreadsheet integration",
        contact(
            name = "SuperInstance Team",
            email = "team@superinstance.dev"
        ),
        license(
            name = "MIT",
            url = "https://github.com/SuperInstance/claw/blob/main/LICENSE"
        )
    ),
    paths(
        health_check,
        authenticate,
        refresh_token,
        create_agent,
        get_agent,
        update_agent,
        delete_agent,
        list_agents,
        equip_agent,
        unequip_agent,
        get_agent_state,
    ),
    components(
        schemas(
            crate::api::models::CreateAgentRequest,
            crate::api::models::UpdateAgentRequest,
            crate::api::models::EquipAgentRequest,
            crate::api::models::UnequipAgentRequest,
            crate::api::models::AgentResponse,
            crate::api::models::AgentsListResponse,
            crate::api::models::AuthRequest,
            crate::api::models::AuthResponse,
            crate::api::models::RefreshTokenRequest,
            crate::api::models::ApiResponse<serde_json::Value>,
            crate::api::models::ApiResponse<crate::api::models::AgentResponse>,
            crate::api::models::ApiResponse<crate::api::models::AgentsListResponse>,
            crate::api::models::ApiResponse<crate::api::models::AuthResponse>,
            crate::agent::AgentConfig,
            crate::agent::AgentState,
            crate::equipment::EquipmentSlot,
        )
    ),
    tags(
        (name = "Health", description = "Health check endpoints"),
        (name = "Authentication", description = "Authentication & authorization"),
        (name = "Agents", description = "Agent management operations")
    )
)]
pub struct ApiDoc;

/// Create API router with all routes
pub fn create_router(state: AppState) -> Router {
    // Build OpenAPI documentation
    let openapi = ApiDoc::openapi();

    Router::new()
        // Health check
        .route("/health", get(health_check))
        // Authentication routes
        .route("/api/v1/auth", post(authenticate))
        .route("/api/v1/auth/refresh", post(refresh_token))
        // Agent routes
        .route("/api/v1/agents", post(create_agent))
        .route("/api/v1/agents", get(list_agents))
        .route("/api/v1/agents/:id", get(get_agent))
        .route("/api/v1/agents/:id", put(update_agent))
        .route("/api/v1/agents/:id", delete(delete_agent))
        .route("/api/v1/agents/:id/equip", post(equip_agent))
        .route("/api/v1/agents/:id/unequip", post(unequip_agent))
        .route("/api/v1/agents/:id/state", get(get_agent_state))
        // WebSocket route
        .route("/ws", get(crate::api::webSocket::websocket_handler))
        // Swagger UI
        .merge(SwaggerUi::new("/swagger-ui")
            .url("/api-docs/openapi.json", openapi))
        // Provide state to all routes
        .with_state(state)
        // Add middleware
        .layer(
            ServiceBuilder::new()
                .layer(trace_layer())
                .layer(cors_layer())
                .layer(compression_layer())
        )
        .route_layer(axum::middleware::from_fn(logging_middleware))
}

/// Start the API server
pub async fn run_server(addr: SocketAddr, state: AppState) -> anyhow::Result<()> {
    let app = create_router(state);

    // Create TCP listener
    let listener = tokio::net::TcpListener::bind(addr).await?;
    tracing::info!("API server listening on {}", addr);

    // Start server
    axum::serve(listener, app).await?;

    Ok(())
}

/// Create default app state
pub fn create_default_state() -> AppState {
    let auth_service = crate::api::auth::AuthService::new()
        .expect("Failed to create auth service");

    let (ws_tx, _) = tokio::sync::broadcast::channel(100);

    AppState {
        agents: std::sync::Arc::new(tokio::sync::RwLock::new(std::collections::HashMap::new())),
        auth_service: std::sync::Arc::new(auth_service),
        ws_tx: std::sync::Arc::new(ws_tx),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_create_router() {
        let state = create_default_state();
        let router = create_router(state);
        // Should not panic
        assert!(true);
    }

    #[test]
    fn test_openapi_spec() {
        let openapi = ApiDoc::openapi();
        assert_eq!(openapi.info.title, "Claw API");
        assert_eq!(openapi.info.version, "0.1.0");
    }
}
