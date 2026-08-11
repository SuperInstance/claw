use async_trait::async_trait;
use crate::core::lifecycle::AgentState;
use std::error::Error;

#[async_trait]
pub trait Claw {
    async fn equip(&mut self) -> Result<(), Box<dyn Error>>;
    async fn unequip(&mut self) -> Result<(), Box<dyn Error>>;
    async fn execute_cycle(&mut self) -> Result<AgentState, Box<dyn Error>>;
}
