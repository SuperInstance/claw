//! Simplified Equipment system for claw-core MVP
//!
//! MVP version provides only a single Memory equipment slot for basic state persistence.

use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

use crate::error::{AgentError, Result};

/// Equipment slots - MVP only supports Memory
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq, Hash, utoipa::ToSchema)]
pub enum EquipmentSlot {
    /// Memory - state persistence and retrieval
    Memory,
}

/// Core Equipment trait
#[async_trait]
pub trait Equipment: Send + Sync {
    /// Get the equipment slot
    fn slot(&self) -> EquipmentSlot;

    /// Get equipment name
    fn name(&self) -> &str;

    /// Process data and return result
    async fn process(&self, data: HashMap<String, serde_json::Value>) -> Result<String>;

    /// Get equipment memory
    fn get_memory(&self) -> &HashMap<String, serde_json::Value>;

    /// Set equipment memory
    fn set_memory(&mut self, memory: HashMap<String, serde_json::Value>);
}

/// Simple Memory Equipment - MVP implementation
pub struct SimpleMemoryEquipment {
    name: String,
    memory: HashMap<String, serde_json::Value>,
}

impl Default for SimpleMemoryEquipment {
    fn default() -> Self {
        Self::new()
    }
}

impl SimpleMemoryEquipment {
    pub fn new() -> Self {
        Self {
            name: "SimpleMemory".to_string(),
            memory: HashMap::new(),
        }
    }

    pub fn with_memory(memory: HashMap<String, serde_json::Value>) -> Self {
        Self {
            name: "SimpleMemory".to_string(),
            memory,
        }
    }
}

#[async_trait]
impl Equipment for SimpleMemoryEquipment {
    fn slot(&self) -> EquipmentSlot {
        EquipmentSlot::Memory
    }

    fn name(&self) -> &str {
        &self.name
    }

    async fn process(&self, data: HashMap<String, serde_json::Value>) -> Result<String> {
        // Store data in memory
        let mut result = String::from("Memory processed: ");
        for (key, value) in data {
            result.push_str(&format!("{}={:?} ", key, value));
        }
        Ok(result)
    }

    fn get_memory(&self) -> &HashMap<String, serde_json::Value> {
        &self.memory
    }

    fn set_memory(&mut self, memory: HashMap<String, serde_json::Value>) {
        self.memory = memory;
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_memory_equipment_creation() {
        let memory = SimpleMemoryEquipment::new();
        assert_eq!(memory.slot(), EquipmentSlot::Memory);
        assert_eq!(memory.name(), "SimpleMemory");
    }

    #[test]
    fn test_memory_with_data() {
        let mut data = HashMap::new();
        data.insert("key1".to_string(), serde_json::json!("value1"));

        let memory = SimpleMemoryEquipment::with_memory(data);
        assert_eq!(memory.get_memory().len(), 1);
    }

    #[tokio::test]
    async fn test_memory_process() {
        let memory = SimpleMemoryEquipment::new();
        let mut data = HashMap::new();
        data.insert("test".to_string(), serde_json::json!("data"));

        let result = memory.process(data).await;
        assert!(result.is_ok());
    }
}
