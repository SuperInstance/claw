# Security Hardening Guide - claw
**Repository:** claw
**Version:** 0.1.0
**Date:** 2026-03-18

---

## Critical Security Implementation

### 1. Implement Missing Authentication Module

**File:** `core/src/api/auth/mod.rs`

```rust
//! Authentication service for Claw API
//!
//! Provides JWT-based authentication and authorization.

use anyhow::Result;
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};

/// JWT claims structure
#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    /// Subject (user ID)
    pub sub: String,
    /// Issuer
    pub iss: String,
    /// Issued at
    pub iat: usize,
    /// Expiration time
    pub exp: usize,
    /// JWT ID
    pub jti: String,
}

/// Authentication service
pub struct AuthService {
    /// JWT secret key (from environment)
    jwt_secret: String,
    /// Token expiration time (seconds)
    expiration: usize,
}

impl AuthService {
    /// Create a new authentication service
    pub fn new() -> Result<Self> {
        let jwt_secret = std::env::var("JWT_SECRET")
            .map_err(|_| anyhow::anyhow!("JWT_SECRET environment variable must be set"))?;

        if jwt_secret.len() < 32 {
            anyhow::bail!("JWT_SECRET must be at least 32 characters");
        }

        Ok(Self {
            jwt_secret,
            expiration: 3600, // 1 hour
        })
    }

    /// Generate JWT token for user
    pub fn generate_token(&self, user_id: &str) -> Result<String> {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map_err(|e| anyhow::anyhow!("Time error: {}", e))?;

        let claims = Claims {
            sub: user_id.to_owned(),
            iss: "claw-api".to_owned(),
            iat: now.as_secs() as usize,
            exp: (now.as_secs() + self.expiration as u64) as usize,
            jti: uuid::Uuid::new_v4().to_string(),
        };

        let token = encode(
            &Header::default(),
            &claims,
            &EncodingKey::from_secret(self.jwt_secret.as_ref()),
        )?;

        Ok(token)
    }

    /// Validate JWT token
    pub fn validate_token(&self, token: &str) -> Result<Claims> {
        let token_data = decode::<Claims>(
            token,
            &DecodingKey::from_secret(self.jwt_secret.as_ref()),
            &Validation::default(),
        )?;

        Ok(token_data.claims)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_generate_and_validate_token() {
        std::env::set_var("JWT_SECRET", "test_secret_key_that_is_long_enough_for_testing");

        let auth = AuthService::new().unwrap();
        let token = auth.generate_token("user123").unwrap();
        let claims = auth.validate_token(&token).unwrap();

        assert_eq!(claims.sub, "user123");
    }

    #[test]
    fn test_invalid_token() {
        std::env::set_var("JWT_SECRET", "test_secret_key_that_is_long_enough_for_testing");

        let auth = AuthService::new().unwrap();
        let result = auth.validate_token("invalid_token");

        assert!(result.is_err());
    }
}
```

### 2. Implement Authentication Middleware

**File:** `core/src/api/middleware/mod.rs`

```rust
//! Authentication middleware for Claw API
//!
//! Provides JWT validation middleware for protected routes.

use axum::{
    extract::Request,
    http::HeaderMap,
    middleware::Next,
    response::Response,
};
use crate::api::auth::AuthService;

/// Authentication middleware
pub async fn auth_middleware(
    headers: HeaderMap,
    mut request: Request,
    next: Next,
) -> Result<Response, StatusCode> {
    // Get Authorization header
    let auth_header = headers
        .get("Authorization")
        .and_then(|h| h.to_str().ok())
        .ok_or_else(|| StatusCode::UNAUTHORIZED)?;

    // Check Bearer token format
    if !auth_header.starts_with("Bearer ") {
        return Err(StatusCode::UNAUTHORIZED);
    }

    let token = &auth_header[7..]; // Skip "Bearer "

    // Validate token
    let auth_service = AuthService::new()
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let claims = auth_service
        .validate_token(token)
        .map_err(|_| StatusCode::UNAUTHORIZED)?;

    // Add user info to request extensions
    request.extensions_mut().insert(claims);

    Ok(next.run(request).await)
}

/// CORS layer
pub fn cors_layer() -> tower_http::cors::CorsLayer {
    tower_http::cors::CorsLayer::new()
        .allow_origin(tower_http::cors::Any.into())
        .allow_methods([axum::http::Method::GET, axum::http::Method::POST])
        .allow_headers(tower_http::cors::Any)
}

/// Compression layer
pub fn compression_layer() -> tower_http::compression::CompressionLayer {
    tower_http::compression::CompressionLayer::new()
}

/// Trace layer
pub fn trace_layer() -> tower_http::trace::TraceLayer {
    tower_http::trace::TraceLayer::new_for_http()
}

/// Logging middleware
pub async fn logging_middleware(
    req: Request,
    next: Next,
) -> Response {
    let method = req.method().clone();
    let uri = req.uri().clone();
    let start = std::time::Instant::now();

    let response = next.run(req).await;

    let duration = start.elapsed();
    tracing::info!(
        method = %method,
        uri = %uri,
        status = %response.status(),
        duration_ms = duration.as_millis(),
        "Request completed"
    );

    response
}
```

### 3. Add Rate Limiting

**File:** `core/src/api/rate_limit.rs`

```rust
//! Rate limiting for Claw API

use axum::{
    extract::Request,
    middleware::Next,
    response::Response,
};
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::RwLock;

/// Rate limiter configuration
#[derive(Clone)]
pub struct RateLimiter {
    /// Requests per second
    requests_per_second: u32,
    /// Burst size
    burst_size: u32,
    /// Client tracking
    clients: Arc<RwLock<std::collections::HashMap<String, ClientState>>>,
}

/// Client state for rate limiting
struct ClientState {
    /// Token bucket
    tokens: f64,
    /// Last update time
    last_update: Instant,
}

impl RateLimiter {
    /// Create a new rate limiter
    pub fn new(requests_per_second: u32, burst_size: u32) -> Self {
        Self {
            requests_per_second,
            burst_size,
            clients: Arc::new(RwLock::new(std::collections::HashMap::new())),
        }
    }

    /// Check if request is allowed
    pub async fn check_rate_limit(&self, client_id: &str) -> bool {
        let mut clients = self.clients.write().await;
        let now = Instant::now();

        let state = clients.entry(client_id.to_string()).or_insert(ClientState {
            tokens: self.burst_size as f64,
            last_update: now,
        });

        // Calculate tokens to add
        let elapsed = now.duration_since(state.last_update).as_secs_f64();
        let tokens_to_add = elapsed * self.requests_per_second as f64;

        // Update tokens
        state.tokens = (state.tokens + tokens_to_add).min(self.burst_size as f64);
        state.last_update = now;

        // Check if we have enough tokens
        if state.tokens >= 1.0 {
            state.tokens -= 1.0;
            true
        } else {
            false
        }
    }
}

/// Rate limiting middleware
pub async fn rate_limit_middleware(
    rate_limiter: axum::extract::State<RateLimiter>,
    req: Request,
    next: Next,
) -> Result<Response, StatusCode> {
    // Get client IP from headers
    let client_ip = req
        .headers()
        .get("X-Forwarded-For")
        .and_then(|h| h.to_str().ok())
        .or_else(|| {
            req.headers()
                .get("X-Real-IP")
                .and_then(|h| h.to_str().ok())
        })
        .unwrap_or("unknown");

    // Check rate limit
    let allowed = rate_limiter
        .check_rate_limit(client_ip)
        .await;

    if !allowed {
        return Err(StatusCode::TOO_MANY_REQUESTS);
    }

    Ok(next.run(req).await)
}
```

### 4. Add Input Validation

**File:** `core/src/api/validation.rs`

```rust
//! Input validation for Claw API

use validator::{Validate, ValidationError};
use serde::Deserialize;

/// Validate agent ID
pub fn validate_agent_id(id: &str) -> Result<(), ValidationError> {
    if id.len() > 100 {
        return Err(ValidationError::new("Agent ID too long"));
    }

    if !id.chars().all(|c| c.is_alphanumeric() || c == '-' || c == '_') {
        return Err(ValidationError::new("Invalid characters in agent ID"));
    }

    Ok(())
}

/// Validate model name
pub fn validate_model_name(model: &str) -> Result<(), ValidationError> {
    // Check against whitelist of allowed models
    let allowed_models = [
        "gpt-4",
        "gpt-3.5-turbo",
        "claude-3-opus",
        "claude-3-sonnet",
        "deepseek-chat",
    ];

    if !allowed_models.contains(&model) {
        return Err(ValidationError::new("Model not allowed"));
    }

    Ok(())
}

/// Create agent request with validation
#[derive(Debug, Deserialize, Validate)]
pub struct CreateAgentRequest {
    /// Agent name
    #[validate(length(min = 1, max = 100), custom = "validate_agent_name")]
    pub name: String,

    /// Model to use
    #[validate(length(min = 1, max = 100), custom = "validate_model_name")]
    pub model: String,

    /// Agent configuration
    pub config: Option<serde_json::Value>,
}

/// Validate agent name
fn validate_agent_name(name: &str) -> Result<(), ValidationError> {
    if !name.chars().all(|c| c.is_alphanumeric() || c == ' ' || c == '-' || c == '_') {
        return Err(ValidationError::new("Invalid characters in agent name"));
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_agent_id() {
        assert!(validate_agent_id("valid-agent-123").is_ok());
        assert!(validate_agent_id("invalid@agent").is_err());
        assert!(validate_agent_id("a".repeat(101).as_str()).is_err());
    }

    #[test]
    fn test_validate_model_name() {
        assert!(validate_model_name("gpt-4").is_ok());
        assert!(validate_model_name("invalid-model").is_err());
    }
}
```

### 5. Add Security Headers

**File:** `core/src/api/headers.rs`

```rust
//! Security headers for Claw API

use axum::{
    extract::Request,
    middleware::Next,
    response::Response,
};
use http::{HeaderMap, HeaderValue};

/// Add security headers to response
pub async fn security_headers_middleware(
    req: Request,
    next: Next,
) -> Response {
    let mut response = next.run(req).await;

    let headers = response.headers_mut();

    // Content Security Policy
    headers.insert(
        "Content-Security-Policy",
        HeaderValue::from_static("default-src 'self'"),
    );

    // Strict-Transport-Security
    headers.insert(
        "Strict-Transport-Security",
        HeaderValue::from_static("max-age=31536000; includeSubDomains"),
    );

    // X-Content-Type-Options
    headers.insert(
        "X-Content-Type-Options",
        HeaderValue::from_static("nosniff"),
    );

    // X-Frame-Options
    headers.insert(
        "X-Frame-Options",
        HeaderValue::from_static("DENY"),
    );

    // X-XSS-Protection
    headers.insert(
        "X-XSS-Protection",
        HeaderValue::from_static("1; mode=block"),
    );

    // Referrer-Policy
    headers.insert(
        "Referrer-Policy",
        HeaderValue::from_static("strict-origin-when-cross-origin"),
    );

    response
}
```

### 6. Update Server Configuration

**File:** `core/src/api/server.rs`

```rust
//! Main API server for Claw

use crate::api::middleware::{cors_layer, compression_layer, trace_layer, logging_middleware};
use crate::api::rate_limit::RateLimiter;
use crate::api::headers::security_headers_middleware;

/// Create API router with all routes and security
pub fn create_router(state: AppState) -> Router {
    let rate_limiter = RateLimiter::new(
        10,  // 10 requests per second
        30,  // burst of 30 requests
    );

    Router::new()
        // Public routes
        .route("/health", get(health_check))
        .route("/api/v1/auth", post(authenticate))
        // Protected routes (require authentication)
        .route("/api/v1/agents", post(create_agent))
        .route("/api/v1/agents", get(list_agents))
        .route("/api/v1/agents/:id", get(get_agent))
        .route("/api/v1/agents/:id", put(update_agent))
        .route("/api/v1/agents/:id", delete(delete_agent))
        .route("/api/v1/agents/:id/equip", post(equip_agent))
        .route("/api/v1/agents/:id/unequip", post(unequip_agent))
        .route("/api/v1/agents/:id/state", get(get_agent_state))
        // WebSocket route (authenticated)
        .route("/ws", get(crate::api::webSocket::websocket_handler))
        // Provide state
        .with_state(state)
        // Add middleware in order
        .layer(
            ServiceBuilder::new()
                .layer(trace_layer())
                .layer(cors_layer())
                .layer(compression_layer())
        )
        // Apply security headers to all responses
        .layer(axum::middleware::from_fn(security_headers_middleware))
        // Apply rate limiting
        .layer(axum::middleware::from_fn_with_state(
            rate_limiter,
            rate_limit_middleware,
        ))
        // Apply logging
        .route_layer(axum::middleware::from_fn(logging_middleware))
}
```

---

## Environment Variables

Create `.env` file:

```bash
# JWT Secret (must be at least 32 characters)
JWT_SECRET=your-secret-key-here-at-least-32-characters-long

# API Configuration
API_HOST=127.0.0.1
API_PORT=8080

# Rate Limiting
RATE_LIMIT_REQUESTS_PER_SECOND=10
RATE_LIMIT_BURST_SIZE=30

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

---

## Testing

Add security tests:

```rust
#[cfg(test)]
mod security_tests {
    use super::*;

    #[tokio::test]
    async fn test_authentication_required() {
        // Test that protected routes require authentication
        let app = create_router(create_default_state());

        let response = app
            .oneshot(Request::builder()
                .uri("/api/v1/agents")
                .body(Body::empty())
                .unwrap())
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::UNAUTHORIZED);
    }

    #[tokio::test]
    async fn test_rate_limiting() {
        // Test that rate limiting works
        let app = create_router(create_default_state());

        // Send 100 requests quickly
        for _ in 0..100 {
            let response = app
                .oneshot(Request::builder()
                    .uri("/health")
                    .body(Body::empty())
                    .unwrap())
                .await
                .unwrap();

            if response.status() == StatusCode::TOO_MANY_REQUESTS {
                return; // Success
            }
        }

        panic!("Rate limiting not working");
    }
}
```

---

## Deployment Checklist

- [ ] Set JWT_SECRET environment variable
- [ ] Enable HTTPS/TLS
- [ ] Configure rate limiting
- [ ] Set up logging
- [ ] Configure CORS properly
- [ ] Enable security headers
- [ ] Test authentication flow
- [ ] Test rate limiting
- [ ] Test input validation
- [ ] Run security tests

---

## Monitoring

Add security metrics:

```rust
use prometheus::{IntCounter, IntCounterVec, Registry};

pub struct SecurityMetrics {
    pub failed_auth_attempts: IntCounter,
    pub rate_limit_hits: IntCounter,
    pub invalid_input_attempts: IntCounter,
}

impl SecurityMetrics {
    pub fn new() -> Self {
        Self {
            failed_auth_attempts: IntCounter::new(
                "failed_auth_attempts_total",
                "Total failed authentication attempts"
            ).unwrap(),
            rate_limit_hits: IntCounter::new(
                "rate_limit_hits_total",
                "Total rate limit violations"
            ).unwrap(),
            invalid_input_attempts: IntCounter::new(
                "invalid_input_attempts_total",
                "Total invalid input attempts"
            ).unwrap(),
        }
    }
}
```

---

**Next Steps:**
1. Implement authentication module
2. Add middleware to server
3. Test authentication flow
4. Deploy with environment variables
5. Monitor security metrics
