//! The Core Thermodynamic Model for Claw.
//! 
//! This module defines the fundamental types that drive the Claw state machine:
//! - `Potential` (ψ): The organized energy available to the system.
//! - `Entropy` (η): The chaos/disorder in the system.
//! - `Gamma` (Γ): The structural form/potential container.
//! - `Eta` (Η): The iteration/entropy tracker.
//! - `ThermodynamicState`: The combination of Gamma and Eta.

use serde::{Deserialize, Serialize};

// -----------------------------------------------------------------------------
// UNIT TYPES (Newtype Pattern)
// -----------------------------------------------------------------------------

/// Potential (ψ). The measure of organized energy in the system.
/// High Potential means the Claw is "charged" and capable of complex action.
#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
pub struct Potential(pub f64);

impl Potential {
    /// Create a new Potential value.
    pub fn new(val: f64) -> Self {
        Potential(val)
    }
    
    /// Get the raw f64 value.
    pub fn value(&self) -> f64 {
        self.0
    }
}

/// Entropy (η). The measure of chaos/disorder in the system.
/// High Entropy triggers "Thinking" to restore order.
#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
pub struct Entropy(pub f64);

impl Entropy {
    /// Create a new Entropy value.
    pub fn new(val: f64) -> Self {
        Entropy(val)
    }
    
    /// Get the raw f64 value.
    pub fn value(&self) -> f64 {
        self.0
    }
}

// -----------------------------------------------------------------------------
// CONTAINER TYPES
// -----------------------------------------------------------------------------

/// Gamma (Γ). The "Form" or "Structure" of the Claw.
/// It holds the Potential.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Gamma {
    pub potential: Potential,
}

impl Gamma {
    pub fn new() -> Self {
        // Start with a default potential of 50.0 (neutral)
        Gamma { potential: Potential(50.0) }
    }
}

impl Default for Gamma {
    fn default() -> Self { Self::new() }
}

/// Eta (Η). The "Iteration" or "Chaos" of the Claw.
/// It tracks the Entropy.
/// Note: Eta is also the symbol for iteration count (η = 0, 1, 2...).
/// In this model, we use it primarily for Entropy tracking.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Eta {
    pub entropy: Entropy,
}

impl Eta {
    pub fn new() -> Self {
        // Start with low entropy (highly ordered)
        Eta { entropy: Entropy(0.1) }
    }
}

impl Default for Eta {
    fn default() -> Self { Self::new() }
}

// -----------------------------------------------------------------------------
// STATE
// -----------------------------------------------------------------------------

/// The complete Thermodynamic State of a Claw.
/// 
/// It is the union of Gamma (Form/Potential) and Eta (Iteration/Entropy).
/// 
/// **The Cycle:**
/// 1. Entropy (η) naturally increases (chaos).
/// 2. If η is high enough, the Claw "Thinks".
/// 3. Thinking consumes Potential (ψ) and reduces Entropy (creates order).
/// 4. If ψ is very high and η is very low, the Claw "Molts" (evolves).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThermodynamicState {
    pub gamma: Gamma,
    pub eta: Eta,
}

impl ThermodynamicState {
    /// Create a new Thermodynamic State with default values.
    pub fn new() -> Self {
        ThermodynamicState {
            gamma: Gamma::new(),
            eta: Eta::new(),
        }
    }
}

impl Default for ThermodynamicState {
    fn default() -> Self { Self::new() }
}

// -----------------------------------------------------------------------------
// MOLT PROTOCOL
// -----------------------------------------------------------------------------

/// The Molt Protocol.
///
/// When a Claw reaches a state of high order (low η) and high energy (high ψ),
/// it is "crystallized" and must undergo Molt to grow.
///
/// Molt introduces controlled chaos (spikes η) and resets potential, allowing
/// the Claw to restructure itself at a higher level of complexity.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MoltProtocol;

// -----------------------------------------------------------------------------
// MODEL CONFIGURATION
// -----------------------------------------------------------------------------

/// Configuration for a specific model interaction.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelConfiguration {
    /// The model ID to use (e.g., "deepseek-chat", "claude-sonnet").
    pub model_id: String,
    /// Temperature for sampling (0.0 = deterministic, 2.0 = random).
    pub temperature: Option<f64>,
    /// Maximum tokens to generate.
    pub max_tokens: Option<u32>,
    /// Stop sequences.
    pub stop: Option<Vec<String>>,
}

impl Default for ModelConfiguration {
    fn default() -> Self {
        Self {
            model_id: "default".to_string(),
            temperature: Some(0.7),
            max_tokens: Some(1024),
            stop: None,
        }
    }
}
