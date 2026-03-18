//! Monitoring API endpoints
//!
//! Provides HTTP endpoints for metrics and health checks

use axum::{
    extract::State,
    http::StatusCode,
    response::{IntoResponse, Json},
    routing::get,
    Router,
};
use serde::Serialize;
use std::sync::Arc;
use tokio::sync::RwLock;

use crate::monitoring::{HealthStatus, MonitoringState};

/// Monitoring API state
#[derive(Clone)]
pub struct MonitoringApiState {
    pub monitoring: Arc<MonitoringState>,
}

/// Metrics response
#[derive(Serialize)]
struct MetricsResponse {
    metrics: String,
}

/// Create monitoring router
pub fn create_monitoring_router() -> Router<Arc<MonitoringApiState>> {
    Router::new()
        .route("/metrics", get(metrics_handler))
        .route("/health", get(health_handler))
        .route("/health/live", get(liveness_handler))
        .route("/health/ready", get(readiness_handler))
}

/// Metrics handler - Prometheus format
async fn metrics_handler(
    State(state): State<Arc<MonitoringApiState>>,
) -> Result<impl IntoResponse, StatusCode> {
    match state.monitoring.metrics.export() {
        Ok(metrics) => Ok((StatusCode::OK, metrics)),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

/// Health check handler
async fn health_handler(
    State(state): State<Arc<MonitoringApiState>>,
) -> Result<impl IntoResponse, StatusCode> {
    let health = state.monitoring.get_health_status().await;
    Ok(Json(health))
}

/// Liveness probe - is the service running?
async fn liveness_handler() -> impl IntoResponse {
    (StatusCode::OK, "OK")
}

/// Readiness probe - is the service ready to serve traffic?
async fn readiness_handler(
    State(state): State<Arc<MonitoringApiState>>,
) -> impl IntoResponse {
    let health = state.monitoring.get_health_status().await;
    if health.status == "healthy" {
        (StatusCode::OK, "Ready")
    } else {
        (StatusCode::SERVICE_UNAVAILABLE, "Not Ready")
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_liveness_handler() {
        let response = liveness_handler().await;
        let (status, _body) = response.into_response();
        assert_eq!(status, StatusCode::OK);
    }
}
