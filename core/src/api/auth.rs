//! Authentication and authorization layer
//!
//! This module provides JWT-based authentication and authorization
//! for the Claw API.

use crate::api::models::{ApiError, ApiResult, AuthRequest, AuthResponse, RefreshTokenRequest};
use chrono::{Duration, Utc};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use std::env;
use std::sync::Arc;
use tokio::sync::RwLock;
use uuid::Uuid;

/// JWT claims structure
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Claims {
    /// Subject (user ID)
    pub sub: String,
    /// Username
    pub username: String,
    /// Token type (access or refresh)
    pub token_type: String,
    /// Issued at
    pub iat: i64,
    /// Expiration time
    pub exp: i64,
    /// JWT ID
    pub jti: String,
}

/// Authentication service
#[derive(Clone)]
pub struct AuthService {
    /// Encoding key for JWT
    encoding_key: Arc<EncodingKey>,
    /// Decoding key for JWT
    decoding_key: Arc<DecodingKey>,
    /// Access token expiration (seconds)
    access_token_exp: u64,
    /// Refresh token expiration (seconds)
    refresh_token_exp: u64,
    /// Issuer
    issuer: String,
    /// In-memory token blacklist (for logout)
    blacklist: Arc<RwLock<Vec<String>>>,
}

impl AuthService {
    /// Create a new authentication service
    pub fn new() -> ApiResult<Self> {
        let secret = env::var("JWT_SECRET")
            .unwrap_or_else(|_| "your-secret-key-change-in-production".to_string());

        if secret.len() < 32 {
            return Err(ApiError::InternalError(
                "JWT_SECRET must be at least 32 characters".to_string(),
            ));
        }

        let encoding_key = Arc::new(EncodingKey::from_secret(secret.as_ref()));
        let decoding_key = Arc::new(DecodingKey::from_secret(secret.as_ref()));

        Ok(Self {
            encoding_key,
            decoding_key,
            access_token_exp: 3600, // 1 hour
            refresh_token_exp: 86400 * 7, // 7 days
            issuer: env::var("JWT_ISSUER").unwrap_or_else(|_| "claw-api".to_string()),
            blacklist: Arc::new(RwLock::new(Vec::new())),
        })
    }

    /// Authenticate user credentials and generate tokens
    pub async fn authenticate(&self, request: AuthRequest) -> ApiResult<AuthResponse> {
        // TODO: Implement actual user authentication against database
        // For now, accept any credentials (development mode)
        if request.username.is_empty() || request.password.len() < 8 {
            return Err(ApiError::Unauthorized("Invalid credentials".to_string()));
        }

        let user_id = Uuid::new_v4().to_string();
        let access_token = self.generate_access_token(&user_id, &request.username)?;
        let refresh_token = self.generate_refresh_token(&user_id, &request.username)?;

        Ok(AuthResponse {
            access_token,
            token_type: "Bearer".to_string(),
            expires_in: self.access_token_exp,
            refresh_token,
        })
    }

    /// Refresh access token using refresh token
    pub async fn refresh_token(&self, request: RefreshTokenRequest) -> ApiResult<AuthResponse> {
        let token_data = decode::<Claims>(
            &request.refresh_token,
            &self.decoding_key,
            &Validation::default(),
        )
        .map_err(|_| ApiError::Unauthorized("Invalid refresh token".to_string()))?;

        let claims = token_data.claims;

        if claims.token_type != "refresh" {
            return Err(ApiError::BadRequest("Invalid token type".to_string()));
        }

        // Check if token is blacklisted
        let blacklist = self.blacklist.read().await;
        if blacklist.contains(&claims.jti) {
            return Err(ApiError::Unauthorized("Token has been revoked".to_string()));
        }

        let access_token = self.generate_access_token(&claims.sub, &claims.username)?;
        let new_refresh_token =
            self.generate_refresh_token(&claims.sub, &claims.username)?;

        // Add old refresh token to blacklist
        drop(blacklist);
        let mut blacklist = self.blacklist.write().await;
        blacklist.push(claims.jti);

        Ok(AuthResponse {
            access_token,
            token_type: "Bearer".to_string(),
            expires_in: self.access_token_exp,
            refresh_token: new_refresh_token,
        })
    }

    /// Validate access token and return claims
    pub fn validate_token(&self, token: &str) -> ApiResult<Claims> {
        let token_data = decode::<Claims>(
            token,
            &self.decoding_key,
            &Validation::default(),
        )
        .map_err(|_| ApiError::Unauthorized("Invalid access token".to_string()))?;

        let claims = token_data.claims;

        if claims.token_type != "access" {
            return Err(ApiError::BadRequest("Invalid token type".to_string()));
        }

        Ok(claims)
    }

    /// Generate access token
    fn generate_access_token(&self, user_id: &str, username: &str) -> ApiResult<String> {
        let now = Utc::now();
        let exp = now + Duration::seconds(self.access_token_exp as i64);

        let claims = Claims {
            sub: user_id.to_string(),
            username: username.to_string(),
            token_type: "access".to_string(),
            iat: now.timestamp(),
            exp: exp.timestamp(),
            jti: Uuid::new_v4().to_string(),
        };

        encode(
            &Header::default(),
            &claims,
            &self.encoding_key,
        )
        .map_err(|e| ApiError::InternalError(format!("Failed to encode token: {}", e)))
    }

    /// Generate refresh token
    fn generate_refresh_token(&self, user_id: &str, username: &str) -> ApiResult<String> {
        let now = Utc::now();
        let exp = now + Duration::seconds(self.refresh_token_exp as i64);

        let claims = Claims {
            sub: user_id.to_string(),
            username: username.to_string(),
            token_type: "refresh".to_string(),
            iat: now.timestamp(),
            exp: exp.timestamp(),
            jti: Uuid::new_v4().to_string(),
        };

        encode(
            &Header::default(),
            &claims,
            &self.encoding_key,
        )
        .map_err(|e| ApiError::InternalError(format!("Failed to encode token: {}", e)))
    }

    /// Logout user (add token to blacklist)
    pub async fn logout(&self, token: &str) -> ApiResult<()> {
        let token_data = decode::<Claims>(
            token,
            &self.decoding_key,
            &Validation::default(),
        )
        .map_err(|_| ApiError::Unauthorized("Invalid token".to_string()))?;

        let mut blacklist = self.blacklist.write().await;
        blacklist.push(token_data.claims.jti);

        Ok(())
    }
}

/// Middleware to extract JWT claims from request
pub struct JwtAuth {
    pub claims: Claims,
}

#[async_trait::async_trait]
impl<S> axum::extract::FromRequestParts<S> for JwtAuth
where
    S: Send + Sync,
{
    type Rejection = ApiError;

    async fn from_request_parts(
        parts: &mut axum::http::request::Parts,
        _state: &S,
    ) -> Result<Self, Self::Rejection> {
        // Extract Authorization header
        let auth_header = parts
            .headers
            .get("Authorization")
            .and_then(|h| h.to_str().ok())
            .ok_or_else(|| ApiError::Unauthorized("Missing Authorization header".to_string()))?;

        // Check Bearer token format
        if !auth_header.starts_with("Bearer ") {
            return Err(ApiError::Unauthorized(
                "Invalid Authorization header format".to_string(),
            ));
        }

        let token = &auth_header[7..];

        // Get auth service from state (will be added in main.rs)
        // For now, create a new instance (not ideal but works)
        let auth_service = AuthService::new()
            .map_err(|e| ApiError::InternalError(format!("Auth service error: {}", e)))?;

        let claims = auth_service.validate_token(token)?;

        Ok(JwtAuth { claims })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_authenticate() {
        let auth_service = AuthService::new().unwrap();
        let request = AuthRequest {
            username: "testuser".to_string(),
            password: "password123".to_string(),
        };

        let response = auth_service.authenticate(request).await.unwrap();
        assert_eq!(response.token_type, "Bearer");
        assert_eq!(response.expires_in, 3600);
        assert!(!response.access_token.is_empty());
        assert!(!response.refresh_token.is_empty());
    }

    #[tokio::test]
    async fn test_refresh_token() {
        let auth_service = AuthService::new().unwrap();
        let auth_request = AuthRequest {
            username: "testuser".to_string(),
            password: "password123".to_string(),
        };

        let auth_response = auth_service.authenticate(auth_request).await.unwrap();

        let refresh_request = RefreshTokenRequest {
            refresh_token: auth_response.refresh_token.clone(),
        };

        let new_response = auth_service.refresh_token(refresh_request).await.unwrap();
        assert!(!new_response.access_token.is_empty());
        assert_ne!(new_response.access_token, auth_response.access_token);
    }

    #[test]
    fn test_validate_token() {
        let auth_service = AuthService::new().unwrap();
        let token = auth_service
            .generate_access_token(&Uuid::new_v4().to_string(), "testuser")
            .unwrap();

        let claims = auth_service.validate_token(&token).unwrap();
        assert_eq!(claims.username, "testuser");
        assert_eq!(claims.token_type, "access");
    }
}
