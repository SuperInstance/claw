//! The Claw Runtime.
//!
//! Orchestrates the `ClawStateMachine`, connecting triggers to model calls.

use tracing::{info, error};
use crate::state::{ClawStateMachine, ClawConfig};
use crate::model::{ModelClient, StubModelClient};
use crate::equipment::EquipmentRegistry;
use crate::triggers::TriggerEvent;

/// The main runtime for a Claw instance.
///
/// It holds the state machine, the model client, and the equipment registry.
pub struct ClawRuntime {
    state_machine: ClawStateMachine,
    model_client: Box<dyn ModelClient>,
    equipment_registry: EquipmentRegistry,
}

impl ClawRuntime {
    /// Create a new Runtime with the default Stub client.
    pub fn new(config: ClawConfig) -> Self {
        Self::with_client(config, Box::new(StubModelClient))
    }

    /// Create a new Runtime with a specific client.
    pub fn with_client(config: ClawConfig, model_client: Box<dyn ModelClient>) -> Self {
        let mut state_machine = ClawStateMachine::new(config.clone());

        // Equip initial modules
        for equip_id in &config.initial_equipment {
            state_machine.equip(*equip_id);
        }

        info!("Runtime initialized for Agent: {:?}", config.id);

        Self {
            state_machine,
            model_client,
            equipment_registry: EquipmentRegistry::new(),
        }
    }

    /// Run a single step of the runtime.
    ///
    /// This is usually called in a loop.
    pub async fn run(&mut self) {
        // For now, we just tick with no specific trigger.
        // In a real system, this would listen to a channel of TriggerEvents.
        match self.tick(None).await {
            Ok(res) => {
                info!("Tick Result: {}", res.content);
                if let Some(usage) = res.usage {
                    info!("Usage: {} tokens", usage.total_tokens);
                }
            }
            Err(e) => {
                error!("Tick Error: {}", e);
            }
        }
    }

    /// Handle a specific trigger event.
    pub async fn handle_trigger(&mut self, event: TriggerEvent) {
        let data = match event {
            TriggerEvent::Timer => Some("Timer fired".to_string()),
            TriggerEvent::CellChange(cell_id) => Some(format!("Cell {} changed", cell_id)),
            TriggerEvent::Message(msg) => Some(msg),
            TriggerEvent::Custom(data) => Some(data),
        };

        match self.tick(data.as_deref()).await {
            Ok(res) => {
                info!("Trigger Result: {}", res.content);
                if let Some(usage) = res.usage {
                    info!("Usage: {} tokens", usage.total_tokens);
                }
            }
            Err(e) => {
                error!("Trigger handling failed: {}", e);
            }
        }
    }

    /// Internal tick logic.
    async fn tick(&mut self, trigger_data: Option<&str>) -> Result<crate::model::InferenceResult, String> {
        self.state_machine.tick(
            trigger_data,
            self.model_client.as_ref(),
            &self.equipment_registry,
        ).await
    }
    
    /// Get a reference to the state machine (for inspection).
    pub fn state(&self) -> &ClawStateMachine {
        &self.state_machine
    }
}
