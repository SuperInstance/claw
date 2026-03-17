//! Authentication and authorization layer
//!
//! This module provides JWT-based authentication and authorization
//! for the Claw API, along with API key support for service-to-service
//! communication.

use crate::api::models::{ApiError, ApiResult, AuthRequest, AuthResponse, RefreshTokenRequest};
use chrono::{DateTime, Duration, Utc};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::collections::HashMap;
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

/// API Key scopes/permissions
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum ApiKeyScope {
    /// Read access to agents
    AgentRead,
    /// Write access to agents
    AgentWrite,
    /// Delete agents
    AgentDelete,
    /// Access to equipment management
    EquipmentManage,
    /// WebSocket connections
    WebSocketConnect,
    /// Admin access (all permissions)
    Admin,
}

impl std::fmt::Display for ApiKeyScope {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ApiKeyScope::AgentRead => write!(f, "agent:read"),
            ApiKeyScope::AgentWrite => write!(f, "agent:write"),
            ApiKeyScope::AgentDelete => write!(f, "agent:delete"),
            ApiKeyScope::EquipmentManage => write!(f, "equipment:manage"),
            ApiKeyScope::WebSocketConnect => write!(f, "websocket:connect"),
            ApiKeyScope::Admin => write!(f, "admin"),
        }
    }
}

impl std::str::FromStr for ApiKeyScope {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "agent:read" => Ok(ApiKeyScope::AgentRead),
            "agent:write" => Ok(ApiKeyScope::AgentWrite),
            "agent:delete" => Ok(ApiKeyScope::AgentDelete),
            "equipment:manage" => Ok(ApiKeyScope::EquipmentManage),
            "websocket:connect" => Ok(ApiKeyScope::WebSocketConnect),
            "admin" => Ok(ApiKeyScope::Admin),
            _ => Err(format!("Unknown scope: {}", s)),
        }
    }
}

/// API Key metadata
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApiKey {
    /// Unique key identifier
    pub id: String,
    /// Key name/description
    pub name: String,
    /// Hashed key value (never store raw key)
    pub key_hash: String,
    /// Key prefix for identification (first 8 chars)
    pub key_prefix: String,
    /// User/owner ID
    pub owner_id: String,
    /// Assigned scopes
    pub scopes: Vec<ApiKeyScope>,
    /// Creation timestamp
    pub created_at: DateTime<Utc>,
    /// Expiration timestamp (None = never expires)
    pub expires_at: Option<DateTime<Utc>>,
    /// Last used timestamp
    pub last_used_at: Option<DateTime<Utc>>,
    /// Whether the key is active
    pub is_active: bool,
    /// Rate limit per minute (0 = unlimited)
    pub rate_limit: u32,
}

impl ApiKey {
    /// Create a new API key with the given parameters
    pub fn new(
        name: String,
        owner_id: String,
        scopes: Vec<ApiKeyScope>,
        expires_in_days: Option<i64>,
        rate_limit: u32,
    ) -> (Self, String) {
        let id = Uuid::new_v4().to_string();
        let raw_key = Self::generate_raw_key();
        let key_hash = Self::hash_key(&raw_key);
        let key_prefix = raw_key.chars().take(8).collect();

        let expires_at = expires_in_days.map(|days| Utc::now() + Duration::days(days));

        let key = Self {
            id,
            name,
            key_hash,
            key_prefix,
            owner_id,
            scopes,
            created_at: Utc::now(),
            expires_at,
            last_used_at: None,
            is_active: true,
            rate_limit,
        };

        (key, raw_key)
    }

    /// Generate a secure random API key
    fn generate_raw_key() -> String {
        // Format: claw_live_<random_32_bytes_base64>
        let random_bytes: [u8; 32] = rand::random();
        let encoded = base64::Engine::encode(
            &base64::engine::general_purpose::URL_SAFE_NO_PAD,
            &random_bytes,
        );
        format!("claw_live_{}", encoded)
    }

    /// Hash an API key using SHA-256
    fn hash_key(key: &str) -> String {
        let mut hasher = Sha256::new();
        hasher.update(key.as_bytes());
        let result = hasher.finalize();
        hex::encode(result)
    }

    /// Verify a raw key against the stored hash
    pub fn verify(&self, raw_key: &str) -> bool {
        let hash = Self::hash_key(raw_key);
        // Constant-time comparison to prevent timing attacks
        self.key_hash == hash
    }

    /// Check if the key has a specific scope
    pub fn has_scope(&self, scope: &ApiKeyScope) -> bool {
        self.scopes.contains(scope) || self.scopes.contains(&ApiKeyScope::Admin)
    }

    /// Check if the key is valid (not expired, active)
    pub fn is_valid(&self) -> bool {
        if !self.is_active {
            return false;
        }

        if let Some(expires_at) = self.expires_at {
            if Utc::now() > expires_at {
                return false;
            }
        }

        true
    }

    /// Record usage of the key
    pub fn record_usage(&mut self) {
        self.last_used_at = Some(Utc::now());
    }
}

/// API Key manager
pub struct ApiKeyManager {
    /// In-memory key storage (key_hash -> ApiKey)
    keys: Arc<RwLock<HashMap<String, ApiKey>>>,
    /// Rate limit tracking (key_id -> (minute, count))
    rate_limits: Arc<RwLock<HashMap<String, (i64, u32)>>>,
}

impl ApiKeyManager {
    /// Create a new API key manager
    pub fn new() -> Self {
        Self {
            keys: Arc::new(RwLock::new(HashMap::new())),
            rate_limits: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    /// Create a new API key
    pub async fn create_key(
        &self,
        name: String,
        owner_id: String,
        scopes: Vec<ApiKeyScope>,
        expires_in_days: Option<i64>,
        rate_limit: u32,
    ) -> ApiResult<String> {
        let (api_key, raw_key) = ApiKey::new(name, owner_id, scopes, expires_in_days, rate_limit);

        let mut keys = self.keys.write().await;
        keys.insert(api_key.key_hash.clone(), api_key);

        Ok(raw_key)
    }

    /// Validate an API key and return its metadata
    pub async fn validate_key(&self, raw_key: &str) -> ApiResult<ApiKey> {
        let key_hash = ApiKey::hash_key(raw_key);

        let mut keys = self.keys.write().await;

        let api_key = keys
            .get(&key_hash)
            .ok_or_else(|| ApiError::Unauthorized("Invalid API key".to_string()))?
            .clone();

        // Check if key is valid
        if !api_key.is_valid() {
            return Err(ApiError::Unauthorized("API key has expired or been revoked".to_string()));
        }

        // Check rate limit
        if api_key.rate_limit > 0 {
            self.check_rate_limit(&api_key).await?;
        }

        // Record usage
        if let Some(key) = keys.get_mut(&key_hash) {
            key.record_usage();
        }

        Ok(api_key)
    }

    /// Check rate limit for a key
    async fn check_rate_limit(&self, api_key: &ApiKey) -> ApiResult<()> {
        let current_minute = Utc::now().timestamp() / 60;

        let mut rate_limits = self.rate_limits.write().await;

        let entry = rate_limits.entry(api_key.id.clone()).or_insert((current_minute, 0));

        if entry.0 != current_minute {
            // New minute, reset counter
            *entry = (current_minute, 1);
        } else {
            // Same minute, increment counter
            entry.1 += 1;

            if entry.1 > api_key.rate_limit {
                return Err(ApiError::RateLimitExceeded);
            }
        }

        Ok(())
    }

    /// Revoke an API key
    pub async fn revoke_key(&self, key_id: &str) -> ApiResult<()> {
        let mut keys = self.keys.write().await;

        for (_, api_key) in keys.iter_mut() {
            if api_key.id == key_id {
                api_key.is_active = false;
                return Ok(());
            }
        }

        Err(ApiError::NotFound("API key not found".to_string()))
    }

    /// List all keys for an owner
    pub async fn list_keys(&self, owner_id: &str) -> Vec<ApiKey> {
        let keys = self.keys.read().await;
        keys.values()
            .filter(|k| k.owner_id == owner_id)
            .cloned()
            .collect()
    }

    /// Delete an API key permanently
    pub async fn delete_key(&self, key_id: &str) -> ApiResult<()> {
        let mut keys = self.keys.write().await;

        let hash_to_remove = keys
            .iter()
            .find(|(_, k)| k.id == key_id)
            .map(|(h, _)| h.clone());

        if let Some(hash) = hash_to_remove {
            keys.remove(&hash);
            Ok(())
        } else {
            Err(ApiError::NotFound("API key not found".to_string()))
        }
    }

    /// Get key count
    pub async fn key_count(&self) -> usize {
        self.keys.read().await.len()
    }
}

impl Default for ApiKeyManager {
    fn default() -> Self {
        Self::new()
    }
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
    /// API Key manager
    api_key_manager: Arc<ApiKeyManager>,
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
            api_key_manager: Arc::new(ApiKeyManager::new()),
        })
    }

    /// Get the API key manager
    pub fn api_key_manager(&self) -> Arc<ApiKeyManager> {
        self.api_key_manager.clone()
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

/// Middleware to extract and validate API key from request
pub struct ApiKeyAuth {
    pub api_key: ApiKey,
}

#[async_trait::async_trait]
impl<S> axum::extract::FromRequestParts<S> for ApiKeyAuth
where
    S: Send + Sync,
{
    type Rejection = ApiError;

    async fn from_request_parts(
        parts: &mut axum::http::request::Parts,
        _state: &S,
    ) -> Result<Self, Self::Rejection> {
        // Try to get API key from X-API-Key header first
        let api_key_header = parts
            .headers
            .get("X-API-Key")
            .and_then(|h| h.to_str().ok())
            .map(|s| s.to_string());

        // Fall back to Authorization header with ApiKey prefix
        let auth_header = parts
            .headers
            .get("Authorization")
            .and_then(|h| h.to_str().ok());

        let raw_key = match (api_key_header, auth_header) {
            (Some(key), _) => key,
            (None, Some(auth)) if auth.starts_with("ApiKey ") => auth[7..].to_string(),
            _ => return Err(ApiError::Unauthorized("Missing API key".to_string())),
        };

        // Validate the API key
        let auth_service = AuthService::new()
            .map_err(|e| ApiError::InternalError(format!("Auth service error: {}", e)))?;

        let api_key = auth_service.api_key_manager().validate_key(&raw_key).await?;

        Ok(ApiKeyAuth { api_key })
    }
}

/// Combined auth - accepts either JWT or API key
pub struct CombinedAuth {
    pub claims: Option<Claims>,
    pub api_key: Option<ApiKey>,
}

#[async_trait::async_trait]
impl<S> axum::extract::FromRequestParts<S> for CombinedAuth
where
    S: Send + Sync,
{
    type Rejection = ApiError;

    async fn from_request_parts(
        parts: &mut axum::http::request::Parts,
        state: &S,
    ) -> Result<Self, Self::Rejection> {
        // Try JWT first
        let jwt_result = JwtAuth::from_request_parts(parts, state).await;

        if let Ok(jwt) = jwt_result {
            return Ok(CombinedAuth {
                claims: Some(jwt.claims),
                api_key: None,
            });
        }

        // Fall back to API key
        let api_key_result = ApiKeyAuth::from_request_parts(parts, state).await;

        if let Ok(api_key) = api_key_result {
            return Ok(CombinedAuth {
                claims: None,
                api_key: Some(api_key.api_key),
            });
        }

        Err(ApiError::Unauthorized("Valid authentication required".to_string()))
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

    #[tokio::test]
    async fn test_api_key_creation() {
        let manager = ApiKeyManager::new();

        let raw_key = manager
            .create_key(
                "Test Key".to_string(),
                "user-1".to_string(),
                vec![ApiKeyScope::AgentRead, ApiKeyScope::AgentWrite],
                Some(30),
                100,
            )
            .await
            .unwrap();

        assert!(raw_key.starts_with("claw_live_"));
        assert!(raw_key.len() > 20);
    }

    #[tokio::test]
    async fn test_api_key_validation() {
        let manager = ApiKeyManager::new();

        let raw_key = manager
            .create_key(
                "Test Key".to_string(),
                "user-1".to_string(),
                vec![ApiKeyScope::AgentRead],
                None,
                0,
            )
            .await
            .unwrap();

        let validated = manager.validate_key(&raw_key).await.unwrap();
        assert_eq!(validated.name, "Test Key");
        assert!(validated.has_scope(&ApiKeyScope::AgentRead));
        assert!(!validated.has_scope(&ApiKeyScope::AgentWrite));
    }

    #[tokio::test]
    async fn test_api_key_revocation() {
        let manager = ApiKeyManager::new();

        let raw_key = manager
            .create_key(
                "Test Key".to_string(),
                "user-1".to_string(),
                vec![ApiKeyScope::AgentRead],
                None,
                0,
            )
            .await
            .unwrap();

        // Get key ID
        let validated = manager.validate_key(&raw_key).await.unwrap();
        let key_id = validated.id.clone();

        // Revoke
        manager.revoke_key(&key_id).await.unwrap();

        // Should fail validation
        let result = manager.validate_key(&raw_key).await;
        assert!(result.is_err());
    }

    #[tokio::test]
    async fn test_api_key_rate_limit() {
        let manager = ApiKeyManager::new();

        let raw_key = manager
            .create_key(
                "Rate Limited Key".to_string(),
                "user-1".to_string(),
                vec![ApiKeyScope::AgentRead],
                None,
                2, // 2 requests per minute
            )
            .await
            .unwrap();

        // First two should succeed
        manager.validate_key(&raw_key).await.unwrap();
        manager.validate_key(&raw_key).await.unwrap();

        // Third should fail
        let result = manager.validate_key(&raw_key).await;
        assert!(matches!(result, Err(ApiError::RateLimitExceeded)));
    }

    #[test]
    fn test_api_key_scopes() {
        let admin_key = ApiKey {
            id: "test".to_string(),
            name: "Admin Key".to_string(),
            key_hash: "hash".to_string(),
            key_prefix: "claw_liv".to_string(),
            owner_id: "user-1".to_string(),
            scopes: vec![ApiKeyScope::Admin],
            created_at: Utc::now(),
            expires_at: None,
            last_used_at: None,
            is_active: true,
            rate_limit: 0,
        };

        // Admin should have all scopes
        assert!(admin_key.has_scope(&ApiKeyScope::AgentRead));
        assert!(admin_key.has_scope(&ApiKeyScope::AgentWrite));
        assert!(admin_key.has_scope(&ApiKeyScope::AgentDelete));
    }
}
