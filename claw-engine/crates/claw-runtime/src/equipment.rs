//! The Equipment System.
//! 
//! Claws are defined by what they equip. Equipment is dynamic and can be 
//! unequipped (with "muscle memory" retained) to free up resources.

use std::collections::HashMap;
use serde::{Deserialize, Serialize};

/// The unique identifier for a piece of Equipment.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum EquipmentId {
    /// Hierarchical Memory System.
    Memory,
    /// Reasoning / Decision Engine.
    Reasoning,
    /// Multi-Agent Consensus.
    Consensus,
    /// Spreadsheet Cell Interface.
    Spreadsheet,
    /// Model Compression / Distillation.
    Distillation,
    /// Coordination / Swarm logic.
    Coordination,
}

/// Context passed to an Equipment Module during operation.
pub struct EquipmentContext<'a> {
    pub state_snapshot: &'a claw_core::ThermodynamicState,
    pub trigger_data: Option<&'a str>,
}

/// The result of an Equipment module's operation.
#[derive(Debug, Clone)]
pub struct EquipmentOutput {
    /// The primary output string (e.g., reasoning conclusion, memory retrieval).
    pub content: String,
    /// Optional modified state values (e.g., updated potential after memory retrieval).
    pub state_modifiers: Option<super::state::StateModifiers>,
}

/// A trait defining the behavior of an Equipment Module.
/// This is the "Muscle" of the Claw.
pub trait EquipmentModule: Send + Sync {
    /// Get the unique ID for this equipment.
    fn id(&self) -> EquipmentId;
    
    /// Get the "Muscle Memory" trigger.
    /// When unequipped, this trigger pattern tells the Claw when to re-equip this module.
    fn muscle_memory_trigger(&self) -> &'static str;
    
    /// Execute the equipment's logic.
    fn execute(&self, ctx: EquipmentContext) -> EquipmentOutput;
}

// -----------------------------------------------------------------------------
// IMPLEMENTATIONS
// -----------------------------------------------------------------------------

/// A simple In-Memory Hierarchical Memory module.
pub struct MemoryEquipment {
    /// Short-term memory (L1 cache).
    short_term: Vec<String>,
    /// Long-term memory (L2 cache).
    long_term: HashMap<String, String>, 
}

impl MemoryEquipment {
    pub fn new() -> Self {
        Self {
            short_term: Vec::new(),
            long_term: HashMap::new(),
        }
    }
}

impl EquipmentModule for MemoryEquipment {
    fn id(&self) -> EquipmentId { EquipmentId::Memory }
    
    fn muscle_memory_trigger(&self) -> &'static str {
        "I need to remember something|What was that?|Retrieve context"
    }
    
    fn execute(&self, ctx: EquipmentContext) -> EquipmentOutput {
        // Simple logic: if trigger contains "remember", store it in short term.
        // If trigger contains "recall", retrieve from short term.
        
        let trigger = ctx.trigger_data.unwrap_or("");
        
        if trigger.to_lowercase().contains("remember") {
            let content = trigger.replace("remember", "").trim().to_string();
            // In a real system, we'd mutate self, but since &self is immutable
            // in this simple trait design (for concurrency safety), we'd use
            // interior mutability (Arc<Mutex>) or return StateModifiers.
            
            // For this stub, we just acknowledge.
            EquipmentOutput {
                content: format!("Memory module registered intent to store: {}", content),
                state_modifiers: Some(super::state::StateModifiers {
                    potential_delta: Some(5.0), // Storing memory increases potential (organization)
                    entropy_delta: Some(-1.0),   // Decreases entropy
                }),
            }
        } else if trigger.to_lowercase().contains("recall") || trigger.to_lowercase().contains("what was") {
            // Retrieve latest from short term (simulated)
            let last_item = self.short_term.last().cloned().unwrap_or_else(|| "No recent memory found.".to_string());
            
            EquipmentOutput {
                content: format!("Memory retrieval: {}", last_item),
                state_modifiers: None,
            }
        } else {
            EquipmentOutput {
                content: "Memory module idle. Use 'remember X' or 'recall'.".to_string(),
                state_modifiers: None,
            }
        }
    }
}

/// A simple Reasoning module that wraps model calls or logical deductions.
pub struct ReasoningEquipment;

impl ReasoningEquipment {
    pub fn new() -> Self { ReasoningEquipment }
}

impl EquipmentModule for ReasoningEquipment {
    fn id(&self) -> EquipmentId { EquipmentId::Reasoning }
    
    fn muscle_memory_trigger(&self) -> &'static str {
        "Analyze this|What do you think?|Decide"
    }
    
    fn execute(&self, ctx: EquipmentContext) -> EquipmentOutput {
        // In a real system, this might call a specific reasoning sub-model
        // or apply logical rules.
        
        let input = ctx.trigger_data.unwrap_or("No input provided");
        
        EquipmentOutput {
            content: format!("Reasoning Engine processing: '{}'. Conclusion pending LLM validation.", input),
            state_modifiers: Some(super::state::StateModifiers {
                potential_delta: Some(10.0), // Reasoning builds significant potential
                entropy_delta: Some(-5.0),   // Reduces uncertainty
            }),
        }
    }
}


// -----------------------------------------------------------------------------
// REGISTRY
// -----------------------------------------------------------------------------

/// A registry to hold all available equipment modules.
pub struct EquipmentRegistry {
    modules: HashMap<EquipmentId, Box<dyn EquipmentModule>>,
}

impl EquipmentRegistry {
    /// Create a new registry with the default set of equipment.
    pub fn new() -> Self {
        // Explicitly type to ensure dynamic dispatch works
        let mut modules: HashMap<EquipmentId, Box<dyn EquipmentModule>> = HashMap::new();

        // Register default equipment
        modules.insert(EquipmentId::Memory, Box::new(MemoryEquipment::new()));
        modules.insert(EquipmentId::Reasoning, Box::new(ReasoningEquipment));

        Self { modules }
    }
    
    /// Get a reference to an equipment module by ID.
    pub fn get(&self, id: EquipmentId) -> Option<&dyn EquipmentModule> {
        self.modules.get(&id).map(|b| b.as_ref())
    }
}

impl Default for EquipmentRegistry {
    fn default() -> Self { Self::new() }
}
