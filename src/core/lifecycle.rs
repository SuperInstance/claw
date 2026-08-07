use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum AgentState {
    Idle,
    Thinking,
    Acting,
    Error(String),
}
