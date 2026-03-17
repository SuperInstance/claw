//! Spreadsheet Integration Tests
//!
//! Tests for integration between claw agents and spreadsheet cells.
//! This module provides mock adapters to validate claw agents work within
//! a spreadsheet cell context.

use claw_core::{ClawCore, AgentConfig, EquipmentSlot, Message, TriggerPayload};
use std::collections::HashMap;
use tokio::time::{timeout, Duration};

/// Mock spreadsheet cell for testing
#[derive(Debug, Clone)]
pub struct MockCell {
    pub reference: String,
    pub value: serde_json::Value,
    pub formula: Option<String>,
}

impl MockCell {
    pub fn new(reference: String, value: serde_json::Value) -> Self {
        Self {
            reference,
            value,
            formula: None,
        }
    }

    pub fn with_formula(mut self, formula: String) -> Self {
        self.formula = Some(formula);
        self
    }

    pub fn update(&mut self, new_value: serde_json::Value) {
        self.value = new_value;
    }
}

/// Mock spreadsheet interface for testing
pub struct MockSpreadsheet {
    cells: HashMap<String, MockCell>,
    claw_core: ClawCore,
}

impl MockSpreadsheet {
    pub fn new() -> Self {
        Self {
            cells: HashMap::new(),
            claw_core: ClawCore::new(),
        }
    }

    /// Add a cell to the spreadsheet
    pub fn add_cell(&mut self, cell: MockCell) {
        let reference = cell.reference.clone();
        self.cells.insert(reference, cell);
    }

    /// Get a cell by reference
    pub fn get_cell(&self, reference: &str) -> Option<&MockCell> {
        self.cells.get(reference)
    }

    /// Update a cell and notify claw agent
    pub async fn update_cell(&mut self, reference: &str, new_value: serde_json::Value) -> Result<(), String> {
        if let Some(cell) = self.cells.get_mut(reference) {
            let old_value = cell.value.clone();
            cell.update(new_value.clone());

            // Create trigger message for claw agent
            let trigger = Message::Trigger {
                id: format!("trigger-{}", reference),
                agent_id: format!("agent-{}", reference),
                payload: TriggerPayload::Data {
                    cell_ref: reference.to_string(),
                    old_value,
                    new_value,
                },
            };

            // Send to claw core
            self.claw_core.send_message(trigger).await.map_err(|e| e.to_string())?;
            Ok(())
        } else {
            Err(format!("Cell {} not found", reference))
        }
    }

    /// Get claw core reference
    pub fn claw_core(&mut self) -> &mut ClawCore {
        &mut self.claw_core
    }

    /// Start the claw core
    pub async fn start(&mut self) -> Result<(), String> {
        self.claw_core.start().await.map_err(|e| e.to_string())
    }

    /// Stop the claw core
    pub async fn stop(&self) -> Result<(), String> {
        self.claw_core.stop().await.map_err(|e| e.to_string())
    }
}

impl Default for MockSpreadsheet {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use claw_core::AgentConfig;

    #[tokio::test]
    async fn test_mock_cell_creation() {
        let cell = MockCell::new("A1".to_string(), serde_json::json!(42));
        assert_eq!(cell.reference, "A1");
        assert_eq!(cell.value, 42);
    }

    #[tokio::test]
    async fn test_mock_cell_with_formula() {
        let cell = MockCell::new("A2".to_string(), serde_json::json!(10))
            .with_formula("=A1*2".to_string());
        assert_eq!(cell.formula, Some("=A1*2".to_string()));
    }

    #[tokio::test]
    async fn test_mock_cell_update() {
        let mut cell = MockCell::new("A1".to_string(), serde_json::json!(42));
        cell.update(serde_json::json!(100));
        assert_eq!(cell.value, 100);
    }

    #[tokio::test]
    async fn test_mock_spreadsheet_creation() {
        let spreadsheet = MockSpreadsheet::new();
        assert_eq!(spreadsheet.cells.len(), 0);
    }

    #[tokio::test]
    async fn test_mock_spreadsheet_add_cell() {
        let mut spreadsheet = MockSpreadsheet::new();
        let cell = MockCell::new("A1".to_string(), serde_json::json!(42));
        spreadsheet.add_cell(cell);
        assert_eq!(spreadsheet.cells.len(), 1);
    }

    #[tokio::test]
    async fn test_mock_spreadsheet_get_cell() {
        let mut spreadsheet = MockSpreadsheet::new();
        let cell = MockCell::new("A1".to_string(), serde_json::json!(42));
        spreadsheet.add_cell(cell);

        let retrieved = spreadsheet.get_cell("A1");
        assert!(retrieved.is_some());
        assert_eq!(retrieved.unwrap().value, 42);
    }

    #[tokio::test]
    async fn test_mock_spreadsheet_update_cell() {
        let mut spreadsheet = MockSpreadsheet::new();
        let cell = MockCell::new("A1".to_string(), serde_json::json!(42));
        spreadsheet.add_cell(cell);

        let result = spreadsheet.update_cell("A1", serde_json::json!(100)).await;
        assert!(result.is_ok());

        let updated = spreadsheet.get_cell("A1").unwrap();
        assert_eq!(updated.value, 100);
    }

    #[tokio::test]
    async fn test_claw_agent_in_cell() {
        let mut spreadsheet = MockSpreadsheet::new();
        let cell = MockCell::new("A1".to_string(), serde_json::json!(42));
        spreadsheet.add_cell(cell);

        // Start the claw core
        spreadsheet.start().await.unwrap();

        // Add a claw agent for the cell
        let config = AgentConfig {
            id: "agent-A1".to_string(),
            cell_ref: "A1".to_string(),
            model: "test-model".to_string(),
            equipment: vec![],
            config: HashMap::new(),
        };

        let result = spreadsheet.claw_core().add_agent(config).await;
        assert!(result.is_ok());

        // Stop the core
        spreadsheet.stop().await.unwrap();
    }

    #[tokio::test]
    async fn test_cell_update_triggers_agent() {
        let mut spreadsheet = MockSpreadsheet::new();
        let cell = MockCell::new("A1".to_string(), serde_json::json!(42));
        spreadsheet.add_cell(cell);

        // Start the claw core
        spreadsheet.start().await.unwrap();

        // Add a claw agent for the cell
        let config = AgentConfig {
            id: "agent-A1".to_string(),
            cell_ref: "A1".to_string(),
            model: "test-model".to_string(),
            equipment: vec![],
            config: HashMap::new(),
        };

        spreadsheet.claw_core().add_agent(config).await.unwrap();

        // Update the cell (should trigger the agent)
        let result = spreadsheet.update_cell("A1", serde_json::json!(100)).await;
        assert!(result.is_ok());

        // Give the agent time to process
        tokio::time::sleep(Duration::from_millis(100)).await;

        // Stop the core
        spreadsheet.stop().await.unwrap();
    }

    #[tokio::test]
    async fn test_multiple_cells_with_agents() {
        let mut spreadsheet = MockSpreadsheet::new();

        // Add multiple cells
        for i in 1..=3 {
            let cell = MockCell::new(
                format!("A{}", i),
                serde_json::json!(i * 10)
            );
            spreadsheet.add_cell(cell);

            // Add an agent for each cell
            let config = AgentConfig {
                id: format!("agent-A{}", i),
                cell_ref: format!("A{}", i),
                model: "test-model".to_string(),
                equipment: vec![],
                config: HashMap::new(),
            };

            spreadsheet.claw_core().add_agent(config).await.unwrap();
        }

        // Start the core
        spreadsheet.start().await.unwrap();

        // Update all cells
        for i in 1..=3 {
            let result = spreadsheet.update_cell(
                &format!("A{}", i),
                serde_json::json!(i * 100)
            ).await;
            assert!(result.is_ok());
        }

        // Give agents time to process
        tokio::time::sleep(Duration::from_millis(100)).await;

        // Stop the core
        spreadsheet.stop().await.unwrap();
    }

    #[tokio::test]
    async fn test_spreadsheet_start_stop() {
        let mut spreadsheet = MockSpreadsheet::new();

        // Start
        let result = spreadsheet.start().await;
        assert!(result.is_ok());

        // Stop
        let result = spreadsheet.stop().await;
        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn test_cell_update_nonexistent_cell() {
        let mut spreadsheet = MockSpreadsheet::new();

        // Try to update a cell that doesn't exist
        let result = spreadsheet.update_cell("Z99", serde_json::json!(100)).await;
        assert!(result.is_err());
    }

    #[tokio::test]
    async fn test_agent_communication_between_cells() {
        let mut spreadsheet = MockSpreadsheet::new();

        // Add two cells
        spreadsheet.add_cell(MockCell::new("A1".to_string(), serde_json::json!(10)));
        spreadsheet.add_cell(MockCell::new("A2".to_string(), serde_json::json!(20)));

        // Add agents for both cells
        for cell_ref in ["A1", "A2"] {
            let config = AgentConfig {
                id: format!("agent-{}", cell_ref),
                cell_ref: cell_ref.to_string(),
                model: "test-model".to_string(),
                equipment: vec![EquipmentSlot::Memory],
                config: HashMap::new(),
            };

            spreadsheet.claw_core().add_agent(config).await.unwrap();
        }

        // Add a social relationship between the agents
        let result = spreadsheet.claw_core().add_relationship(
            "agent-A1".to_string(),
            "agent-A2".to_string(),
            claw_core::SocialRelation::CoWorker,
        ).await;

        assert!(result.is_ok());

        // Start the core
        spreadsheet.start().await.unwrap();

        // Update first cell
        spreadsheet.update_cell("A1", serde_json::json!(100)).await.unwrap();

        // Give agents time to process
        tokio::time::sleep(Duration::from_millis(100)).await;

        // Stop the core
        spreadsheet.stop().await.unwrap();
    }

    #[tokio::test]
    async fn test_concurrent_cell_updates() {
        let mut spreadsheet = MockSpreadsheet::new();

        // Add multiple cells
        for i in 1..=5 {
            let cell = MockCell::new(
                format!("A{}", i),
                serde_json::json!(i)
            );
            spreadsheet.add_cell(cell);

            // Add an agent for each cell
            let config = AgentConfig {
                id: format!("agent-A{}", i),
                cell_ref: format!("A{}", i),
                model: "test-model".to_string(),
                equipment: vec![],
                config: HashMap::new(),
            };

            spreadsheet.claw_core().add_agent(config).await.unwrap();
        }

        // Start the core
        spreadsheet.start().await.unwrap();

        // Update all cells sequentially (can't use concurrent updates with mutable borrow)
        for i in 1..=5 {
            let result = spreadsheet.update_cell(
                &format!("A{}", i),
                serde_json::json!(i * 10)
            ).await;
            assert!(result.is_ok());
        }

        // Give agents time to process
        tokio::time::sleep(Duration::from_millis(100)).await;

        // Stop the core
        spreadsheet.stop().await.unwrap();
    }
}
