//! Middleware for the Claw API
//!
//! This module provides custom middleware including logging,
//! request ID tracking, CORS, and compression.

use crate::api::models::ApiError;
use axum::{
    extract::Request,
    middleware::Next,
    response::Response,
    http::{HeaderMap, HeaderValue, StatusCode, self},
};
use std::time::{Duration, Instant};

/// Request ID middleware
pub async fn request_id_middleware(
    mut req: Request,
    next: Next,
) -> Result<Response, ApiError> {
    // Generate request ID if not present
    let request_id = uuid::Uuid::new_v4().to_string();

    // Add request ID to headers
    req.headers_mut().insert(
        "x-request-id",
        HeaderValue::from_str(&request_id)
            .map_err(|e| ApiError::InternalError(format!("Invalid request ID: {}", e)))?,
    );

    // Continue with request
    Ok(next.run(req).await)
}

/// Logging middleware
pub async fn logging_middleware(
    req: Request,
    next: Next,
) -> Response {
    let start = Instant::now();
    let method = req.method().clone();
    let uri = req.uri().clone();
    let request_id = req
        .headers()
        .get("x-request-id")
        .and_then(|h| h.to_str().ok())
        .unwrap_or("unknown")
        .to_string();

    tracing::info!(
        request_id = %request_id,
        method = %method,
        uri = %uri,
        "Incoming request"
    );

    let response = next.run(req).await;

    let duration = start.elapsed();
    let status = response.status();

    tracing::info!(
        request_id = %request_id,
        method = %method,
        uri = %uri,
        status = %status.as_u16(),
        duration_ms = duration.as_millis(),
        "Request completed"
    );

    response
}

/// Simple in-memory rate limiter using token bucket algorithm
#[derive(Debug, Clone)]
pub struct RateLimiter {
    capacity: u32,
    refill_rate: u32,
    tokens: std::sync::Arc<tokio::sync::Mutex<(u32, Instant)>>,
}

impl RateLimiter {
    pub fn new(capacity: u32, refill_rate: u32) -> Self {
        Self {
            capacity,
            refill_rate,
            tokens: std::sync::Arc::new(tokio::sync::Mutex::new((capacity, Instant::now()))),
        }
    }

    pub async fn try_acquire(&self) -> bool {
        let mut state = self.tokens.lock().await;
        let (tokens, last_refill) = *state;

        // Refill tokens based on time elapsed
        let elapsed = last_refill.elapsed();
        let tokens_to_add = (elapsed.as_secs() as u32) * self.refill_rate;
        let new_tokens = (tokens + tokens_to_add).min(self.capacity);

        if new_tokens > 0 {
            *state = (new_tokens - 1, Instant::now());
            true
        } else {
            *state = (0, last_refill);
            false
        }
    }
}

/// CORS configuration
pub fn cors_layer() -> tower_http::cors::CorsLayer {
    tower_http::cors::CorsLayer::new()
        .allow_origin(tower_http::cors::Any)
        .allow_methods(tower_http::cors::Any)
        .allow_headers(tower_http::cors::Any)
        .max_age(Duration::from_secs(3600))
}

/// Compression layer
pub fn compression_layer() -> tower_http::compression::CompressionLayer {
    tower_http::compression::CompressionLayer::new().gzip(true)
}

/// Trace layer for request tracking
pub fn trace_layer() -> tower_http::trace::TraceLayer<
    tower_http::classify::SharedClassifier<tower_http::classify::ServerErrorsAsFailures>,
> {
    tower_http::trace::TraceLayer::new_for_http()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_rate_limiter() {
        let limiter = RateLimiter::new(5, 1);

        // Should allow first 5 requests
        for _ in 0..5 {
            assert!(limiter.try_acquire().await);
        }

        // 6th should be denied
        assert!(!limiter.try_acquire().await);
    }
}
