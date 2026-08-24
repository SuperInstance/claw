//! The State Machine for the Claw.
//!
//! This module defines the core `Claw` struct and its lifecycle.
//! It follows the Thermodynamic Model defined in `claw-core`.

use claw_core::{ThermodynamicState, Entropy, Potential, Gamma, ModelConfiguration};
use crate::model::{ModelClient, InferenceResult};
use crate::equipment::{EquipmentRegistry, EquipmentId, EquipmentContext};

/// The configuration for a Claw instance.
#[derive(Debug, Clone)]
pub struct ClawConfig {
    /// Unique identifier.
    pub id: String,
    /// The model ID to use (e.g., "deepseek-chat").
    pub model_id: String,
    /// The initial list of equipped modules.
    pub initial_equipment: Vec<EquipmentId>,
    /// The system prompt that defines the claw's personality.
    pub system_prompt: String,
}

/// Represents modifications to the ThermodynamicState returned by Equipment or Triggers.
#[derive(Debug, Clone, Default)]
pub struct StateModifiers {
    pub potential_delta: Option<f64>,
    pub entropy_delta: Option<f64>,
}

/// Represents the internal state of a Claw.
pub struct ClawStateMachine {
    /// The configuration.
    pub config: ClawConfig,
    /// The thermodynamic state (Union of Gamma and Eta).
    pub state: ThermodynamicState,
    /// The list of currently equipped module IDs.
    equipped: Vec<EquipmentId>,
}

impl ClawStateMachine {
    /// Create a new Claw with default thermodynamic properties.
    pub fn new(config: ClawConfig) -> Self {
        Self {
            config,
            state: ThermodynamicState::new(),
            equipped: Vec::new(),
        }
    }

    /// Equip a module.
    pub fn equip(&mut self, id: EquipmentId) {
        if !self.equipped.contains(&id) {
            self.equipped.push(id);
            // Equipping increases organization (potential)
            let current = self.state.gamma.potential.value();
            self.state.gamma.potential = Potential::new(current + 5.0);
        }
    }

    /// Unequip a module.
    pub fn unequip(&mut self, id: EquipmentId) {
        if let Some(pos) = self.equipped.iter().position(|x| *x == id) {
            self.equipped.remove(pos);
            // Unequipping frees resources, decreasing potential
            let current = self.state.gamma.potential.value();
            self.state.gamma.potential = Potential::new(current - 5.0);
        }
    }

    /// Get the list of equipped IDs.
    pub fn equipped_ids(&self) -> &[EquipmentId] {
        &self.equipped
    }

    /// Run a single tick of the state machine.
    ///
    /// 1. Run Equipment Modules.
    /// 2. Update Gamma/Eta (State).
    /// 3. Check if Entropy (η) is high enough to trigger Thinking.
    /// 4. If triggered, call Model and update State (decrease Entropy, increase Potential).
    /// 5. Check Molt condition.
    pub async fn tick(
        &mut self,
        trigger_data: Option<&str>,
        model_client: &dyn ModelClient,
        equipment_registry: &EquipmentRegistry,
    ) -> Result<InferenceResult, String> {

        // ---------------------------------------------------------
        // 1. The Muscle: Execute Equipment
        // ---------------------------------------------------------
        let mut equipment_outputs = Vec::new();
        let mut cumulative_modifiers = StateModifiers::default();

        for id in self.equipped_ids() {
            if let Some(equipment) = equipment_registry.get(*id) {
                let ctx = EquipmentContext {
                    state_snapshot: &self.state,
                    trigger_data,
                };

                let output = equipment.execute(ctx);
                equipment_outputs.push(output.content.clone());

                // Apply modifiers
                if let Some(mods) = output.state_modifiers {
                    if let Some(delta) = mods.potential_delta {
                        cumulative_modifiers.potential_delta = Some(
                            cumulative_modifiers.potential_delta.unwrap_or(0.0) + delta
                        );
                    }
                    if let Some(delta) = mods.entropy_delta {
                        cumulative_modifiers.entropy_delta = Some(
                            cumulative_modifiers.entropy_delta.unwrap_or(0.0) + delta
                        );
                    }
                }
            }
        }

        // Apply equipment state changes
        if let Some(delta) = cumulative_modifiers.potential_delta {
            let current = self.state.gamma.potential.value();
            self.state.gamma.potential = Potential::new(current + delta);
        }
        if let Some(delta) = cumulative_modifiers.entropy_delta {
            let current = self.state.eta.entropy.value();
            self.state.eta.entropy = Entropy::new(current + delta);
        }

        // ---------------------------------------------------------
        // 2. The Physics: Natural Entropy Increase
        // ---------------------------------------------------------
        let eta_increase = if trigger_data.is_some() { 0.3 } else { 0.05 };
        let current_eta = self.state.eta.entropy.value();
        self.state.eta.entropy = Entropy::new(current_eta + eta_increase);

        // Potential decays slightly over time if not maintained
        let current_psi = self.state.gamma.potential.value();
        self.state.gamma.potential = Potential::new(current_psi * 0.99);

        // ---------------------------------------------------------
        // 3. The Logic: Trigger Check
        // ---------------------------------------------------------
        let eta_threshold = 0.7;
        let potential_threshold = 10.0;

        let should_think = (self.state.eta.entropy.value() > eta_threshold || trigger_data.is_some())
            && self.state.gamma.potential.value() > potential_threshold;

        if !should_think {
            return Ok(InferenceResult {
                content: "System idle. Insufficient entropy or potential to trigger thinking.".to_string(),
                usage: None,
            });
        }

        // ---------------------------------------------------------
        // 4. The Nerve Center: Model Call (Thinking)
        // ---------------------------------------------------------
        let mut full_prompt = self.config.system_prompt.clone();
        full_prompt.push_str("\n\n--- Equipment Context ---\n");
        for output in &equipment_outputs {
            full_prompt.push_str(&format!("- {}\n", output));
        }

        if let Some(data) = trigger_data {
            full_prompt.push_str(&format!("\n--- Input Trigger ---\n{}", data));
        }

        // Cost of thinking
        let thinking_cost = 15.0;
        let psi_current = self.state.gamma.potential.value();
        self.state.gamma.potential = Potential::new(psi_current - thinking_cost);

        // Model Config
        let model_config = ModelConfiguration {
            model_id: self.config.model_id.clone(),
            ..Default::default()
        };

        let result = model_client.chat_completion(&full_prompt, &model_config)
            .await
            .map_err(|e| format!("Model call failed: {}", e))?;

        // Result of thinking: Entropy decreases
        let entropy_reduction = result.content.len() as f64 / 100.0;
        let eta_current = self.state.eta.entropy.value();
        self.state.eta.entropy = Entropy::new((eta_current - entropy_reduction).max(0.0));

        // ---------------------------------------------------------
        // 5. The Cycle: Molt Check
        // ---------------------------------------------------------
        if self.state.eta.entropy.value() < 0.1 && self.state.gamma.potential.value() > 100.0 {
            // Trigger Molt Logic
            self.state.eta.entropy = Entropy::new(0.8);
            self.state.gamma.potential = Potential::new(20.0);

            return Ok(InferenceResult {
                content: format!("MOLT TRIGGERED. System has reached critical order. Evolving.\n\nPrevious Output: {}", result.content),
                usage: result.usage,
            });
        }

        Ok(result)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_equip_unequip() {
        let config = ClawConfig {
            id: "test-claw".to_string(),
            model_id: "test-model".to_string(),
            initial_equipment: vec![],
            system_prompt: "Test prompt".to_string(),
        };
        let mut claw = ClawStateMachine::new(config);

        assert!(claw.equipped_ids().is_empty());

        claw.equip(EquipmentId::Memory);
        assert_eq!(claw.equipped_ids(), &[EquipmentId::Memory]);

        claw.equip(EquipmentId::Memory);
        assert_eq!(claw.equipped_ids().len(), 1);

        claw.unequip(EquipmentId::Memory);
        assert!(claw.equipped_ids().is_empty());
    }
}
