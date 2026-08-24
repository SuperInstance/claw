//! State Machine Logic
//! Manages the execution phase and thermodynamic state of the Claw.

use crate::model::{InferenceResult, ModelClient, ModelError};
use claw_core::{ClawAgent, MoltProtocol, Phase};
use tracing::{info, error};

/// The operational state machine wrapper for a ClawAgent.
pub struct ClawStateMachine {
    agent: ClawAgent,
    model_client: Box<dyn ModelClient>,
}

impl ClawStateMachine {
    /// Creates a new State Machine.
    /// 
    /// # Arguments
    /// * `agent` - The agent configuration and state.
    /// * `model_client` - The client used for LLM inference.
    pub fn new(agent: ClawAgent, model_client: Box<dyn ModelClient>) -> Self {
        Self { agent, model_client }
    }

    /// Access the underlying agent (read-only).
    pub fn agent(&self) -> &ClawAgent {
        &self.agent
    }

    /// Executes a single "tick" of the state machine.
    /// 
    /// This is async because it involves waiting for I/O (Model calls).
    pub async fn tick(&mut self) {
        self.transition(Phase::Thinking);
        
        // Run the core logic (might take time)
        match self.run_thinking_cycle().await {
            Ok(result) => {
                info!("Thinking Cycle completed successfully. Inference: {:?}...", &result.content[0..std::cmp::min(50, result.content.len())]);
            }
            Err(e) => {
                error!("Thinking Cycle failed: {:?}", e);
                self.transition(Phase::Error);
                // Do not transition back to Dormant if in Error state?
                // For now, let's stay in Error.
                return;
            }
        }

        // Check for growth
        if self.check_molt_threshold() {
            self.molt();
        } else {
            self.transition(Phase::Dormant);
        }
    }

    fn transition(&mut self, new_phase: Phase) {
        info!(
            "Claw [{}] transitioning: {:?} -> {:?}",
            self.agent.id, self.agent.state.phase, new_phase
        );
        self.agent.state.phase = new_phase;
    }

    /// The core reasoning loop.
    /// 
    /// 1. Updates Thermodynamic state (Cost of thinking).
    /// 2. Calls the Model.
    async fn run_thinking_cycle(&mut self) -> Result<InferenceResult, ModelError> {
        self.agent.state.cycle_count += 1;

        let gamma = &mut self.agent.state.gamma;
        let eta = &mut self.agent.state.eta;

        // Spend Potential (cost of living)
        let cost = gamma.potential * 0.01;
        gamma.potential -= cost;
        gamma.delta = cost;

        // Increase Entropy (learning/disorder)
        eta.entropy += 0.001;
        eta.delta = 0.001;

        // Clamp values
        if gamma.potential < 0.0 { gamma.potential = 0.0; }
        if eta.entropy > 1.0 { eta.entropy = 1.0; }

        // Actually Think: Call the Model
        // For now, we use the Seed's purpose as the prompt.
        // In a real system, this would be a complex RAG/Chain loop.
        let prompt = &self.agent.seed.purpose;
        
        info!("Claw [{}] invoking Model: {:?}...", self.agent.id, self.model_client.name());
        
        let result = self.model_client.chat_completion(
            prompt, 
            &self.agent.model_config
        ).await?;

        Ok(result)
    }

    fn check_molt_threshold(&self) -> bool {
        self.agent.state.eta.entropy > 0.8 && self.agent.state.gamma.potential > 0.5
    }

    fn molt(&mut self) {
        self.transition(Phase::Molt);

        let exo_phase = self.agent.state.phase;
        let exo_gamma = self.agent.state.gamma.potential;

        // Burn potential to reset entropy
        self.agent.state.gamma.potential *= 0.1; // Retain 10%
        self.agent.state.eta.entropy = 0.0;

        // Increase generation
        self.agent.state.molt.generation += 1;

        // Record history
        self.agent.state.molt.history.push(MoltProtocol {
            generation: self.agent.state.molt.generation,
            exoskeleton: format!("Phase: {:?}, Potential: {:.2}", exo_phase, exo_gamma),
            soft_skeleton: "Newly formed instance (Post-Model Inference)".to_string(),
            hardening_time_ms: 1000,
            is_learning_active: true,
        });

        self.transition(Phase::Dormant);
    }
}
