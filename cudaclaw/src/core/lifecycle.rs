use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum AgentState {
    IDLE,
    THINKING,
    ACTING,
    ERROR,
}

impl AgentState {
    pub fn as_str(&self) -> &'static str {
        match self {
            AgentState::IDLE => "IDLE",
            AgentState::THINKING => "THINKING",
            AgentState::ACTING => "ACTING",
            AgentState::ERROR => "ERROR",
        }
    }
}
