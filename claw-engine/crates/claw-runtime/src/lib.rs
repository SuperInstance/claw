//! Claw Runtime
//! The async event loop and execution environment.

pub mod state;
pub mod triggers;
pub mod equipment;
pub mod runner;
pub mod model;

// Re-export key types for easy access
pub use crate::runner::ClawRuntime;
pub use crate::state::{ClawStateMachine, ClawConfig, StateModifiers};
pub use crate::triggers::{TriggerEvent, TriggerFuture};
pub use crate::equipment::{EquipmentId, EquipmentRegistry, EquipmentModule, EquipmentOutput};
pub use crate::model::{ModelClient, StubModelClient, DeepInfraClient, InferenceResult, ModelError};
