//! Coordination Strategies for Multi-Agent Execution
//!
//! This module implements various strategies for coordinating multiple agents.

use crate::social::{SocialError, SocialResult};
use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use std::time::Duration;
use tokio::time::timeout;

/// Execution strategy for coordinating agents
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum ExecutionStrategy {
    /// Execute all agents in parallel
    Parallel,

    /// Execute agents sequentially
    Sequential,
}

/// Voting strategy for consensus
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum VotingStrategy {
    /// All agents must agree
    Consensus,

    /// Majority wins
    MajorityVote,

    /// Weighted voting by confidence
    Weighted,
}

/// Coordination strategy trait
#[async_trait]
pub trait CoordinationStrategy: Send + Sync {
    /// Get the execution strategy
    fn execution_strategy(&self) -> ExecutionStrategy;

    /// Get the voting strategy
    fn voting_strategy(&self) -> VotingStrategy;

    /// Execute coordination with given agents
    async fn execute(
        &self,
        agents: Vec<String>,
        task: serde_json::Value,
    ) -> SocialResult<CoordinationResult>;

    /// Check if coordination is healthy
    async fn health_check(&self) -> SocialResult<bool>;
}

/// Result of coordination execution
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CoordinationResult {
    pub success: bool,
    pub execution_time_ms: u64,
    pub agent_results: Vec<AgentResult>,
    pub consensus_outcome: Option<ConsensusOutcome>,
    pub aggregated_result: Option<serde_json::Value>,
    pub errors: Vec<String>,
}

/// Result from a single agent
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentResult {
    pub agent_id: String,
    pub success: bool,
    pub result: Option<serde_json::Value>,
    pub execution_time_ms: u64,
    pub error: Option<String>,
}

/// Consensus outcome
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConsensusOutcome {
    pub strategy: VotingStrategy,
    pub agreed: bool,
    pub agreement_count: usize,
    pub total_count: usize,
    pub confidence: f64,
    pub majority_value: Option<serde_json::Value>,
    pub votes: Vec<Vote>,
}

/// Individual vote
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Vote {
    pub agent_id: String,
    pub value: serde_json::Value,
    pub confidence: f64,
    pub weight: f64,
}

/// Parallel coordination strategy
///
/// Executes all agents simultaneously and aggregates results
pub struct ParallelStrategy {
    timeout_ms: u64,
}

impl ParallelStrategy {
    pub fn new() -> Self {
        Self {
            timeout_ms: 5000,
        }
    }

    pub fn with_timeout(mut self, timeout_ms: u64) -> Self {
        self.timeout_ms = timeout_ms;
        self
    }
}

impl Default for ParallelStrategy {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl CoordinationStrategy for ParallelStrategy {
    fn execution_strategy(&self) -> ExecutionStrategy {
        ExecutionStrategy::Parallel
    }

    fn voting_strategy(&self) -> VotingStrategy {
        VotingStrategy::MajorityVote
    }

    async fn execute(
        &self,
        agents: Vec<String>,
        task: serde_json::Value,
    ) -> SocialResult<CoordinationResult> {
        let start = std::time::Instant::now();

        // Spawn all agent tasks in parallel
        let tasks: Vec<_> = agents
            .iter()
            .map(|agent_id| {
                let agent_id = agent_id.clone();
                let task = task.clone();
                tokio::spawn(async move {
                    // Simulate agent execution
                    tokio::time::sleep(Duration::from_millis(100)).await;
                    AgentResult {
                        agent_id,
                        success: true,
                        result: Some(task.clone()),
                        execution_time_ms: 100,
                        error: None,
                    }
                })
            })
            .collect();

        // Wait for all tasks to complete with timeout
        let results = timeout(Duration::from_millis(self.timeout_ms), async {
            let mut agent_results = Vec::new();
            for task in tasks {
                match task.await {
                    Ok(result) => agent_results.push(result),
                    Err(_) => {
                        // Task panicked or was cancelled
                    }
                }
            }
            agent_results
        })
        .await
        .map_err(|_| SocialError::Timeout {
            timeout_ms: self.timeout_ms,
        })?;

        let execution_time_ms = start.elapsed().as_millis() as u64;

        Ok(CoordinationResult {
            success: results.iter().all(|r| r.success),
            execution_time_ms,
            agent_results: results,
            consensus_outcome: None,
            aggregated_result: Some(task),
            errors: Vec::new(),
        })
    }

    async fn health_check(&self) -> SocialResult<bool> {
        Ok(true)
    }
}

/// Sequential coordination strategy
///
/// Executes agents one after another
pub struct SequentialStrategy {
    timeout_ms: u64,
    stop_on_error: bool,
}

impl SequentialStrategy {
    pub fn new() -> Self {
        Self {
            timeout_ms: 5000,
            stop_on_error: true,
        }
    }

    pub fn with_timeout(mut self, timeout_ms: u64) -> Self {
        self.timeout_ms = timeout_ms;
        self
    }

    pub fn with_stop_on_error(mut self, stop_on_error: bool) -> Self {
        self.stop_on_error = stop_on_error;
        self
    }
}

impl Default for SequentialStrategy {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl CoordinationStrategy for SequentialStrategy {
    fn execution_strategy(&self) -> ExecutionStrategy {
        ExecutionStrategy::Sequential
    }

    fn voting_strategy(&self) -> VotingStrategy {
        VotingStrategy::MajorityVote
    }

    async fn execute(
        &self,
        agents: Vec<String>,
        task: serde_json::Value,
    ) -> SocialResult<CoordinationResult> {
        let start = std::time::Instant::now();
        let mut agent_results = Vec::new();
        let mut errors = Vec::new();

        for agent_id in agents {
            let agent_start = std::time::Instant::now();

            // Simulate agent execution
            match timeout(
                Duration::from_millis(self.timeout_ms),
                async {
                    tokio::time::sleep(Duration::from_millis(100)).await;
                    Ok::<AgentResult, SocialError>(AgentResult {
                        agent_id: agent_id.clone(),
                        success: true,
                        result: Some(task.clone()),
                        execution_time_ms: agent_start.elapsed().as_millis() as u64,
                        error: None,
                    })
                },
            )
            .await
            {
                Ok(Ok(result)) => {
                    agent_results.push(result);
                }
                Ok(Err(e)) => {
                    errors.push(e.to_string());
                    agent_results.push(AgentResult {
                        agent_id,
                        success: false,
                        result: None,
                        execution_time_ms: agent_start.elapsed().as_millis() as u64,
                        error: Some(e.to_string()),
                    });

                    if self.stop_on_error {
                        break;
                    }
                }
                Err(_) => {
                    let timeout_err = SocialError::Timeout {
                        timeout_ms: self.timeout_ms,
                    };
                    errors.push(timeout_err.to_string());
                    agent_results.push(AgentResult {
                        agent_id,
                        success: false,
                        result: None,
                        execution_time_ms: agent_start.elapsed().as_millis() as u64,
                        error: Some(timeout_err.to_string()),
                    });

                    if self.stop_on_error {
                        break;
                    }
                }
            }
        }

        let execution_time_ms = start.elapsed().as_millis() as u64;

        Ok(CoordinationResult {
            success: agent_results.iter().all(|r| r.success),
            execution_time_ms,
            agent_results,
            consensus_outcome: None,
            aggregated_result: Some(task),
            errors,
        })
    }

    async fn health_check(&self) -> SocialResult<bool> {
        Ok(true)
    }
}

/// Consensus coordination strategy
///
/// All agents must agree on the result
pub struct ConsensusStrategy {
    timeout_ms: u64,
    agreement_threshold: f64,
}

impl ConsensusStrategy {
    pub fn new() -> Self {
        Self {
            timeout_ms: 10000,
            agreement_threshold: 1.0, // 100% agreement required
        }
    }

    pub fn with_timeout(mut self, timeout_ms: u64) -> Self {
        self.timeout_ms = timeout_ms;
        self
    }

    pub fn with_agreement_threshold(mut self, threshold: f64) -> Self {
        self.agreement_threshold = threshold;
        self
    }
}

impl Default for ConsensusStrategy {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl CoordinationStrategy for ConsensusStrategy {
    fn execution_strategy(&self) -> ExecutionStrategy {
        ExecutionStrategy::Parallel
    }

    fn voting_strategy(&self) -> VotingStrategy {
        VotingStrategy::Consensus
    }

    async fn execute(
        &self,
        agents: Vec<String>,
        task: serde_json::Value,
    ) -> SocialResult<CoordinationResult> {
        let start = std::time::Instant::now();

        // Execute all agents in parallel
        let parallel = ParallelStrategy::new().with_timeout(self.timeout_ms);
        let mut result = parallel.execute(agents.clone(), task.clone()).await?;

        // Analyze results for consensus
        let votes: Vec<Vote> = result
            .agent_results
            .iter()
            .filter_map(|r| {
                r.result.as_ref().map(|value| Vote {
                    agent_id: r.agent_id.clone(),
                    value: value.clone(),
                    confidence: 1.0,
                    weight: 1.0,
                })
            })
            .collect();

        // Count unique values
        let mut value_counts: std::collections::HashMap<String, usize> = std::collections::HashMap::new();
        for vote in &votes {
            let key = serde_json::to_string(&vote.value).unwrap_or_default();
            *value_counts.entry(key).or_insert(0) += 1;
        }

        // Find majority value
        let majority_entry = value_counts
            .into_iter()
            .max_by_key(|(_, count)| *count);

        let (agreed, agreement_count, majority_value) = match majority_entry {
            Some((key, count)) => {
                let agreement_ratio = count as f64 / votes.len() as f64;
                let agreed = agreement_ratio >= self.agreement_threshold;
                let value = serde_json::from_str(&key).ok();

                if !agreed {
                    return Err(SocialError::ConsensusNotReached {
                        agreed: count,
                        total: votes.len(),
                    });
                }

                (true, count, value)
            }
            None => (false, 0, None),
        };

        let consensus_outcome = ConsensusOutcome {
            strategy: VotingStrategy::Consensus,
            agreed,
            agreement_count,
            total_count: votes.len(),
            confidence: if votes.is_empty() {
                0.0
            } else {
                agreement_count as f64 / votes.len() as f64
            },
            majority_value,
            votes,
        };

        result.consensus_outcome = Some(consensus_outcome);
        result.execution_time_ms = start.elapsed().as_millis() as u64;

        Ok(result)
    }

    async fn health_check(&self) -> SocialResult<bool> {
        Ok(true)
    }
}

/// Majority vote coordination strategy
///
/// Majority wins
pub struct MajorityVoteStrategy {
    timeout_ms: u64,
    majority_threshold: f64,
}

impl MajorityVoteStrategy {
    pub fn new() -> Self {
        Self {
            timeout_ms: 5000,
            majority_threshold: 0.5, // 50% + 1 vote
        }
    }

    pub fn with_timeout(mut self, timeout_ms: u64) -> Self {
        self.timeout_ms = timeout_ms;
        self
    }

    pub fn with_majority_threshold(mut self, threshold: f64) -> Self {
        self.majority_threshold = threshold;
        self
    }
}

impl Default for MajorityVoteStrategy {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl CoordinationStrategy for MajorityVoteStrategy {
    fn execution_strategy(&self) -> ExecutionStrategy {
        ExecutionStrategy::Parallel
    }

    fn voting_strategy(&self) -> VotingStrategy {
        VotingStrategy::MajorityVote
    }

    async fn execute(
        &self,
        agents: Vec<String>,
        task: serde_json::Value,
    ) -> SocialResult<CoordinationResult> {
        let start = std::time::Instant::now();

        // Execute all agents in parallel
        let parallel = ParallelStrategy::new().with_timeout(self.timeout_ms);
        let mut result = parallel.execute(agents.clone(), task.clone()).await?;

        // Analyze results for majority vote
        let votes: Vec<Vote> = result
            .agent_results
            .iter()
            .filter_map(|r| {
                r.result.as_ref().map(|value| Vote {
                    agent_id: r.agent_id.clone(),
                    value: value.clone(),
                    confidence: 1.0,
                    weight: 1.0,
                })
            })
            .collect();

        // Count unique values
        let mut value_counts: std::collections::HashMap<String, usize> = std::collections::HashMap::new();
        for vote in &votes {
            let key = serde_json::to_string(&vote.value).unwrap_or_default();
            *value_counts.entry(key).or_insert(0) += 1;
        }

        // Find majority value
        let majority_entry = value_counts
            .into_iter()
            .max_by_key(|(_, count)| *count);

        let (agreed, agreement_count, majority_value) = match majority_entry {
            Some((key, count)) => {
                let agreement_ratio = count as f64 / votes.len() as f64;
                let agreed = agreement_ratio > self.majority_threshold;
                let value = serde_json::from_str(&key).ok();

                (agreed, count, value)
            }
            None => (false, 0, None),
        };

        let consensus_outcome = ConsensusOutcome {
            strategy: VotingStrategy::MajorityVote,
            agreed,
            agreement_count,
            total_count: votes.len(),
            confidence: if votes.is_empty() {
                0.0
            } else {
                agreement_count as f64 / votes.len() as f64
            },
            majority_value,
            votes,
        };

        result.consensus_outcome = Some(consensus_outcome);
        result.execution_time_ms = start.elapsed().as_millis() as u64;

        Ok(result)
    }

    async fn health_check(&self) -> SocialResult<bool> {
        Ok(true)
    }
}

/// Weighted coordination strategy
///
/// Votes are weighted by confidence
pub struct WeightedStrategy {
    timeout_ms: u64,
    threshold: f64,
}

impl WeightedStrategy {
    pub fn new() -> Self {
        Self {
            timeout_ms: 5000,
            threshold: 0.5,
        }
    }

    pub fn with_timeout(mut self, timeout_ms: u64) -> Self {
        self.timeout_ms = timeout_ms;
        self
    }

    pub fn with_threshold(mut self, threshold: f64) -> Self {
        self.threshold = threshold;
        self
    }
}

impl Default for WeightedStrategy {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl CoordinationStrategy for WeightedStrategy {
    fn execution_strategy(&self) -> ExecutionStrategy {
        ExecutionStrategy::Parallel
    }

    fn voting_strategy(&self) -> VotingStrategy {
        VotingStrategy::Weighted
    }

    async fn execute(
        &self,
        agents: Vec<String>,
        task: serde_json::Value,
    ) -> SocialResult<CoordinationResult> {
        let start = std::time::Instant::now();

        // Execute all agents in parallel
        let parallel = ParallelStrategy::new().with_timeout(self.timeout_ms);
        let mut result = parallel.execute(agents.clone(), task.clone()).await?;

        // Analyze results with weighted voting
        let votes: Vec<Vote> = result
            .agent_results
            .iter()
            .filter_map(|r| {
                r.result.as_ref().map(|value| Vote {
                    agent_id: r.agent_id.clone(),
                    value: value.clone(),
                    confidence: 0.9, // Simulated confidence
                    weight: 1.0,     // Simulated weight
                })
            })
            .collect();

        // Calculate weighted totals
        let mut weighted_values: std::collections::HashMap<String, f64> = std::collections::HashMap::new();
        let mut total_weight = 0.0;

        for vote in &votes {
            let key = serde_json::to_string(&vote.value).unwrap_or_default();
            let weighted_score = vote.confidence * vote.weight;
            *weighted_values.entry(key).or_insert(0.0) += weighted_score;
            total_weight += weighted_score;
        }

        // Find value with highest weight
        let weighted_entry = weighted_values
            .into_iter()
            .max_by(|a, b| a.1.partial_cmp(&b.1).unwrap_or(std::cmp::Ordering::Equal));

        let confidence = weighted_entry.as_ref().map(|(_, w)| {
            if total_weight > 0.0 { w / total_weight } else { 0.0 }
        }).unwrap_or(0.0);

        let (agreed, agreement_count, majority_value) = match weighted_entry {
            Some((key, weight)) => {
                let conf = if total_weight > 0.0 {
                    weight / total_weight
                } else {
                    0.0
                };
                let agreed = conf >= self.threshold;
                let value = serde_json::from_str(&key).ok();
                let count = votes.iter().filter(|v| {
                    serde_json::to_string(&v.value).unwrap_or_default() == key
                }).count();

                (agreed, count, value)
            }
            None => (false, 0, None),
        };

        let consensus_outcome = ConsensusOutcome {
            strategy: VotingStrategy::Weighted,
            agreed,
            agreement_count,
            total_count: votes.len(),
            confidence,
            majority_value,
            votes,
        };

        result.consensus_outcome = Some(consensus_outcome);
        result.execution_time_ms = start.elapsed().as_millis() as u64;

        Ok(result)
    }

    async fn health_check(&self) -> SocialResult<bool> {
        Ok(true)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_parallel_strategy() {
        let strategy = ParallelStrategy::new();
        let agents = vec!["agent-1".to_string(), "agent-2".to_string()];
        let task = serde_json::json!({"action": "test"});

        let result = strategy.execute(agents, task).await.unwrap();
        assert!(result.success);
        assert_eq!(result.agent_results.len(), 2);
    }

    #[tokio::test]
    async fn test_sequential_strategy() {
        let strategy = SequentialStrategy::new();
        let agents = vec!["agent-1".to_string(), "agent-2".to_string()];
        let task = serde_json::json!({"action": "test"});

        let result = strategy.execute(agents, task).await.unwrap();
        assert!(result.success);
        assert_eq!(result.agent_results.len(), 2);
    }

    #[tokio::test]
    async fn test_consensus_strategy() {
        let strategy = ConsensusStrategy::new();
        let agents = vec!["agent-1".to_string(), "agent-2".to_string()];
        let task = serde_json::json!({"action": "test"});

        let result = strategy.execute(agents, task).await.unwrap();
        assert!(result.success);
        assert!(result.consensus_outcome.is_some());
    }

    #[tokio::test]
    async fn test_majority_vote_strategy() {
        let strategy = MajorityVoteStrategy::new();
        let agents = vec!["agent-1".to_string(), "agent-2".to_string()];
        let task = serde_json::json!({"action": "test"});

        let result = strategy.execute(agents, task).await.unwrap();
        assert!(result.success);
        assert!(result.consensus_outcome.is_some());
    }

    #[tokio::test]
    async fn test_weighted_strategy() {
        let strategy = WeightedStrategy::new();
        let agents = vec!["agent-1".to_string(), "agent-2".to_string()];
        let task = serde_json::json!({"action": "test"});

        let result = strategy.execute(agents, task).await.unwrap();
        assert!(result.success);
        assert!(result.consensus_outcome.is_some());
    }
}
