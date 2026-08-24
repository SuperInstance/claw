//! Equipment System
//! Traits and types for dynamic module loading and interaction.

use async_trait::async_trait;
use claw_core::EquipmentType;
use std::any::Any;
use uuid::Uuid;

/// A unique identifier for an Equipment Module instance.
pub type ModuleId = Uuid;

/// The result of an Equipment action.
#[derive(Debug, Clone)]
pub enum EquipmentResult {
    Success(serde_json::Value),
    Failed(String),
}

/// The core trait that all dynamic equipment modules must implement.
/// 
/// This trait uses `async_trait` to allow async methods in trait objects.
#[async_trait]
pub trait EquipmentModule: Send + Sync {
    /// Returns the unique ID of this module instance.
    fn id(&self) -> ModuleId;
    
    /// Returns the slot type this module occupies (MEMORY, REASONING, etc.).
    fn slot_type(&self) -> EquipmentType;

    /// A human-readable name for the module.
    fn name(&self) -> &str;

    /// Executes the module's primary function with the given input.
    /// 
    /// # Arguments
    /// * `input` - A JSON value representing the input to the module.
    /// 
    /// # Returns
    /// An `EquipmentResult` indicating success or failure.
    async fn execute(&self, input: serde_json::Value) -> EquipmentResult;

    /// Allows downcasting to a specific type for modules that need direct method calls.
    /// This is useful for "static" modules that are always compiled in (like a basic Memory module).
    fn as_any(&self) -> &dyn Any;
}
