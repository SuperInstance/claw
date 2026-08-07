use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use crate::core::lifecycle::AgentState;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum EquipmentSlot {
    Head,
    Torso,
    Arms,
    Legs,
    Special,
}

#[async_trait]
pub trait Claw {
    async fn equip(&mut self, slots: Vec<EquipmentSlot>);
    async fn unequip(&mut self, slot: EquipmentSlot);
    async fn step(&mut self) -> Result<(), String>;
}

pub struct ClawInstance {
    pub state: AgentState,
    pub equipment: std::collections::HashSet<EquipmentSlot>,
}

impl ClawInstance {
    pub fn new() -> Self {
        Self {
            state: AgentState::Idle,
            equipment: std::collections::HashSet::new(),
        }
    }
}

#[async_trait]
impl Claw for ClawInstance {
    async fn equip(&mut self, slots: Vec<EquipmentSlot>) {
        for slot in slots {
            self.equipment.insert(slot);
        }
        self.state = AgentState::Idle;
    }

    async fn unequip(&mut self, slot: EquipmentSlot) {
        self.equipment.remove(&slot);
        self.state = AgentState::Idle;
    }

    async fn step(&mut self) -> Result<(), String> {
        match self.state {
            AgentState::Idle => {
                self.state = AgentState::Thinking;
                Ok(())
            }
            AgentState::Thinking => {
                self.state = AgentState::Acting;
                Ok(())
            }
            AgentState::Acting => {
                self.state = AgentState::Idle;
                Ok(())
            }
            AgentState::Error(ref e) => Err(e.clone()),
        }
    }
}
