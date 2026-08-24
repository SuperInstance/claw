//! Model Integration
//! Traits and clients for interacting with LLMs.

use async_trait::async_trait;
use claw_core::ModelConfiguration;
use reqwest::Client;
use serde_json::json;

// -----------------------------------------------------------------------------
// Core Types
// -----------------------------------------------------------------------------

/// The result of a model inference.
#[derive(Debug, Clone)]
pub struct InferenceResult {
    pub content: String,
    pub usage: Option<TokenUsage>,
}

#[derive(Debug, Clone, Default)]
pub struct TokenUsage {
    pub prompt_tokens: u32,
    pub completion_tokens: u32,
    pub total_tokens: u32,
}

// -----------------------------------------------------------------------------
// Trait
// -----------------------------------------------------------------------------

/// A trait defining how a Claw interacts with a model.
/// This allows swapping out implementations (OpenAI, Anthropic, Local, Stub).
#[async_trait]
pub trait ModelClient: Send + Sync {
    /// The name of the client/provider.
    fn name(&self) -> &str;

    /// Executes a chat completion inference.
    async fn chat_completion(
        &self,
        prompt: &str,
        config: &ModelConfiguration
    ) -> Result<InferenceResult, ModelError>;
}

// -----------------------------------------------------------------------------
// Errors
// -----------------------------------------------------------------------------

/// Errors that can occur during model interaction.
#[derive(Debug, thiserror::Error)]
pub enum ModelError {
    #[error("Network error: {0}")]
    Network(String),

    #[error("API error: {0}")]
    Api(String),

    #[error("Configuration error: {0}")]
    Config(String),

    #[error("Provider not supported: {0}")]
    UnsupportedProvider(String),
}

// -----------------------------------------------------------------------------
// Stub Implementation (for Testing)
// -----------------------------------------------------------------------------

/// A stub client that echoes the prompt or returns predefined text.
pub struct StubModelClient;

#[async_trait]
impl ModelClient for StubModelClient {
    fn name(&self) -> &str {
        "StubModelClient"
    }

    async fn chat_completion(
        &self,
        prompt: &str,
        _config: &ModelConfiguration
    ) -> Result<InferenceResult, ModelError> {
        tokio::time::sleep(tokio::time::Duration::from_millis(50)).await;
        
        Ok(InferenceResult {
            content: format!("Stub Response: I have processed your request regarding '{}'.", prompt),
            usage: Some(TokenUsage {
                prompt_tokens: 10,
                completion_tokens: 20,
                total_tokens: 30,
            }),
        })
    }
}

// -----------------------------------------------------------------------------
// DeepInfra Implementation (Real API)
// -----------------------------------------------------------------------------

/// Client for Api.deepinfra.com.
/// Uses the OpenAI-compatible API endpoint.
pub struct DeepInfraClient {
    client: Client,
    api_key: String,
}

impl DeepInfraClient {
    /// Create a new client from the `DEEPINFRA_API_TOKEN` environment variable.
    pub fn from_env() -> Result<Self, ModelError> {
        let api_key = std::env::var("DEEPINFRA_API_TOKEN")
            .map_err(|_| ModelError::Config("DEEPINFRA_API_TOKEN environment variable not set.".to_string()))?;
        
        Ok(Self {
            client: Client::new(),
            api_key,
        })
    }
}

#[async_trait]
impl ModelClient for DeepInfraClient {
    fn name(&self) -> &str {
        "DeepInfraClient"
    }

    async fn chat_completion(
        &self,
        prompt: &str,
        config: &ModelConfiguration
    ) -> Result<InferenceResult, ModelError> {
        let url = "https://api.deepinfra.com/v1/openai/chat/completions";
        
        let body = json!({
            "model": config.model_id,
            "messages": [
                { "role": "user", "content": prompt }
            ],
            "temperature": config.temperature.unwrap_or(0.7),
            "max_tokens": config.max_tokens.unwrap_or(1024),
        });

        let response = self.client.post(url)
            .header("Authorization", format!("Bearer {}", self.api_key))
            .header("Content-Type", "application/json")
            .json(&body)
            .send()
            .await
            .map_err(|e| ModelError::Network(format!("Request failed: {}", e)))?;

        let status = response.status();
        if !status.is_success() {
            let error_text = response.text().await.unwrap_or_else(|_| "No body".to_string());
            return Err(ModelError::Api(format!("API Error {}: {}", status, error_text)));
        }

        let json: serde_json::Value = response.json().await
            .map_err(|e| ModelError::Network(format!("Failed to parse response: {}", e)))?;

        let content = json["choices"][0]["message"]["content"]
            .as_str()
            .unwrap_or("")
            .to_string();
        
        let usage = json.get("usage").and_then(|u| {
            let prompt = u["prompt_tokens"].as_u64().map(|v| v as u32);
            let completion = u["completion_tokens"].as_u64().map(|v| v as u32);
            let total = u["total_tokens"].as_u64().map(|v| v as u32);
            
            Some(TokenUsage {
                prompt_tokens: prompt.unwrap_or(0),
                completion_tokens: completion.unwrap_or(0),
                total_tokens: total.unwrap_or(0),
            })
        });

        Ok(InferenceResult { content, usage })
    }
}
