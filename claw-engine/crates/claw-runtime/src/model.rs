//! Model Integration
//! Traits and clients for interacting with LLMs.

use async_trait::async_trait;
use claw_core::ModelConfiguration;

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

/// A trait defining how a Claw interacts with a model.
/// This allows swapping out implementations (OpenAI, Anthropic, Local, Stub).
#[async_trait]
pub trait ModelClient: Send + Sync {
    /// The name of the client/provider.
    fn name(&self) -> &str;

    /// Executes a chat completion inference.
    /// 
    /// # Arguments
    /// * `prompt` - The user/system prompt to send.
    /// * `config` - The specific model configuration (temperature, etc.).
    async fn chat_completion(
        &self, 
        prompt: &str, 
        config: &ModelConfiguration
    ) -> Result<InferenceResult, ModelError>;
}

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
/// Used for local testing without API keys.
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
        // Simulate network delay
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
