//! Consensus Engine for Multi-Agent Agreement
//!
//! This module implements consensus mechanisms for multi-agent decision making.

use crate::social::{SocialError, SocialResult};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

/// Consensus result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConsensusResult {
    pub agreed: bool,
    pub agreement_value: Option<serde_json::Value>,
    pub agreement_count: usize,
    pub total_participants: usize,
    pub confidence: f64,
    pub duration_ms: u64,
    pub votes: Vec<VoteRecord>,
}

/// Vote record
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VoteRecord {
    pub agent_id: String,
    pub value: serde_json::Value,
    pub confidence: f64,
    pub timestamp: u64,
}

/// Voting outcome
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VotingOutcome {
    pub strategy: String,
    pub result: ConsensusResult,
    pub breakdown: HashMap<String, usize>,
}

/// Consensus metrics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConsensusMetrics {
    pub total_consensus_attempts: u64,
    pub successful_consensuses: u64,
    pub failed_consensuses: u64,
    pub avg_consensus_time_ms: f64,
    pub avg_agreement_ratio: f64,
}

impl Default for ConsensusMetrics {
    fn default() -> Self {
        Self {
            total_consensus_attempts: 0,
            successful_consensuses: 0,
            failed_consensuses: 0,
            avg_consensus_time_ms: 0.0,
            avg_agreement_ratio: 0.0,
        }
    }
}

/// Consensus engine
pub struct ConsensusEngine {
    metrics: Arc<RwLock<ConsensusMetrics>>,
    timeout_ms: u64,
    agreement_threshold: f64,
}

impl ConsensusEngine {
    pub fn new() -> Self {
        Self {
            metrics: Arc::new(RwLock::new(ConsensusMetrics::default())),
            timeout_ms: 10000,
            agreement_threshold: 1.0,
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

    /// Achieve consensus through voting
    pub async fn achieve_consensus(
        &self,
        votes: Vec<VoteRecord>,
    ) -> SocialResult<ConsensusResult> {
        let start = std::time::Instant::now();

        // Update metrics
        {
            let mut metrics = self.metrics.write().await;
            metrics.total_consensus_attempts += 1;
        }

        // Count votes by value
        let mut vote_counts: HashMap<String, (usize, f64)> = HashMap::new();
        let mut total_confidence = 0.0;

        for vote in &votes {
            let key = serde_json::to_string(&vote.value).unwrap_or_default();
            let (count, conf) = vote_counts.entry(key).or_insert((0, 0.0));
            *count += 1;
            *conf += vote.confidence;
            total_confidence += vote.confidence;
        }

        // Find majority value
        let majority_entry = vote_counts
            .into_iter()
            .max_by_key(|( _, (count, _))| *count);

        let result = match majority_entry {
            Some((key, (count, conf))) => {
                let agreement_ratio = count as f64 / votes.len() as f64;
                let agreed = agreement_ratio >= self.agreement_threshold;
                let value = serde_json::from_str(&key).ok();
                let confidence = if total_confidence > 0.0 {
                    conf / total_confidence
                } else {
                    0.0
                };

                // Update metrics
                {
                    let mut metrics = self.metrics.write().await;
                    if agreed {
                        metrics.successful_consensuses += 1;
                    } else {
                        metrics.failed_consensuses += 1;
                    }

                    // Update average agreement ratio
                    let total = metrics.total_consensus_attempts as f64;
                    let avg = metrics.avg_agreement_ratio;
                    metrics.avg_agreement_ratio = (avg * (total - 1.0) + agreement_ratio) / total;

                    // Update average consensus time
                    let time = start.elapsed().as_millis() as f64;
                    let avg_time = metrics.avg_consensus_time_ms;
                    metrics.avg_consensus_time_ms = (avg_time * (total - 1.0) + time) / total;
                }

                ConsensusResult {
                    agreed,
                    agreement_value: value,
                    agreement_count: count,
                    total_participants: votes.len(),
                    confidence,
                    duration_ms: start.elapsed().as_millis() as u64,
                    votes,
                }
            }
            None => ConsensusResult {
                agreed: false,
                agreement_value: None,
                agreement_count: 0,
                total_participants: votes.len(),
                confidence: 0.0,
                duration_ms: start.elapsed().as_millis() as u64,
                votes,
            },
        };

        if !result.agreed {
            return Err(SocialError::ConsensusNotReached {
                agreed: result.agreement_count,
                total: result.total_participants,
            });
        }

        Ok(result)
    }

    /// Get consensus metrics
    pub async fn get_metrics(&self) -> ConsensusMetrics {
        self.metrics.read().await.clone()
    }

    /// Reset metrics
    pub async fn reset_metrics(&self) {
        let mut metrics = self.metrics.write().await;
        *metrics = ConsensusMetrics::default();
    }
}

impl Default for ConsensusEngine {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_consensus_unanimous() {
        let engine = ConsensusEngine::new();

        let votes = vec![
            VoteRecord {
                agent_id: "agent-1".to_string(),
                value: serde_json::json!("yes"),
                confidence: 1.0,
                timestamp: 0,
            },
            VoteRecord {
                agent_id: "agent-2".to_string(),
                value: serde_json::json!("yes"),
                confidence: 1.0,
                timestamp: 0,
            },
            VoteRecord {
                agent_id: "agent-3".to_string(),
                value: serde_json::json!("yes"),
                confidence: 1.0,
                timestamp: 0,
            },
        ];

        let result = engine.achieve_consensus(votes).await.unwrap();
        assert!(result.agreed);
        assert_eq!(result.agreement_count, 3);
        assert_eq!(result.total_participants, 3);
    }

    #[tokio::test]
    async fn test_consensus_not_unanimous() {
        let engine = ConsensusEngine::new();

        let votes = vec![
            VoteRecord {
                agent_id: "agent-1".to_string(),
                value: serde_json::json!("yes"),
                confidence: 1.0,
                timestamp: 0,
            },
            VoteRecord {
                agent_id: "agent-2".to_string(),
                value: serde_json::json!("no"),
                confidence: 1.0,
                timestamp: 0,
            },
            VoteRecord {
                agent_id: "agent-3".to_string(),
                value: serde_json::json!("yes"),
                confidence: 1.0,
                timestamp: 0,
            },
        ];

        let result = engine.achieve_consensus(votes).await;
        assert!(result.is_err());
    }

    #[tokio::test]
    async fn test_consensus_with_threshold() {
        let engine = ConsensusEngine::new()
            .with_agreement_threshold(0.7); // 70% agreement required

        let votes = vec![
            VoteRecord {
                agent_id: "agent-1".to_string(),
                value: serde_json::json!("yes"),
                confidence: 1.0,
                timestamp: 0,
            },
            VoteRecord {
                agent_id: "agent-2".to_string(),
                value: serde_json::json!("yes"),
                confidence: 1.0,
                timestamp: 0,
            },
            VoteRecord {
                agent_id: "agent-3".to_string(),
                value: serde_json::json!("yes"),
                confidence: 1.0,
                timestamp: 0,
            },
            VoteRecord {
                agent_id: "agent-4".to_string(),
                value: serde_json::json!("no"),
                confidence: 1.0,
                timestamp: 0,
            },
        ];

        let result = engine.achieve_consensus(votes).await.unwrap();
        assert!(result.agreed);
        assert_eq!(result.agreement_count, 3);
    }

    #[tokio::test]
    async fn test_consensus_metrics() {
        let engine = ConsensusEngine::new();

        let votes = vec![
            VoteRecord {
                agent_id: "agent-1".to_string(),
                value: serde_json::json!("yes"),
                confidence: 1.0,
                timestamp: 0,
            },
        ];

        let _ = engine.achieve_consensus(votes).await;

        let metrics = engine.get_metrics().await;
        assert_eq!(metrics.total_consensus_attempts, 1);
        assert_eq!(metrics.successful_consensuses, 1);
    }
}
