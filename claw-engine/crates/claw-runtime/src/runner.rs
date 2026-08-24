//! The Claw Runtime
//! Orchestrates the agent lifecycle: Trigger -> Think -> Act -> Sleep.

use crate::model::ModelClient;
use crate::state::ClawStateMachine;
use crate::triggers::{create_trigger, TriggerFuture};
use claw_core::ClawAgent;
use std::pin::Pin;
use tracing::{info, error};

/// The main execution environment for a ClawAgent.
pub struct ClawRuntime {
    state_machine: ClawStateMachine,
    trigger: TriggerFuture,
}

impl ClawRuntime {
    /// Creates a new Runtime for a given ClawAgent.
    /// 
    /// # Arguments
    /// * `agent` - The agent configuration.
    /// * `model_client` - The client to use for LLM inference.
    pub fn new(agent: ClawAgent, model_client: Box<dyn ModelClient>) -> Self {
        let trigger = create_trigger(&agent.seed.trigger);
        let state_machine = ClawStateMachine::new(agent, model_client);
        
        info!("Runtime initialized for Agent: {:?}", state_machine.agent().id);
        
        Self {
            state_machine,
            trigger,
        }
    }

    /// Runs the main loop forever (or until energy is depleted).
    pub async fn run(&mut self) {
        loop {
            info!("Runtime: Waiting for trigger...");
            
            // Wait for the trigger to fire.
            Pin::new(&mut self.trigger).await;

            info!("Runtime: Trigger fired. Executing Tick.");
            
            // Execute the state machine logic (Async: calls LLM)
            self.state_machine.tick().await;
            
            // Report status
            let agent = self.state_machine.agent();
            
            // Check for Error state
            if agent.state.phase == claw_core::Phase::Error {
                error!("Runtime: Agent is in Error state. Stopping loop.");
                break;
            }

            info!(
                "Runtime: Tick Complete. Phase: {:?}, Gen: {}, Gamma: {:.2}, Eta: {:.2}",
                agent.state.phase,
                agent.state.molt.generation,
                agent.state.gamma.potential,
                agent.state.eta.entropy
            );
            
            // Shutdown if energy is gone
            if agent.state.gamma.potential <= 0.0 {
                error!("Runtime: Agent Gamma (Potential) depleted. Stopping loop.");
                break;
            }
        }
    }
}
