//! Tripartite Consensus Engine – Core consensus logic for Claw agents.

use serde::{Deserialize, Serialize};
use schemars::JsonSchema;

/// A normalized score in the range `[0.0, 1.0]`.
///
/// The struct is deliberately tiny – it only stores the inner `f64` value and
/// provides a constructor that clamps to the valid range.  Deriving `Copy` and
/// `Clone` makes it ergonomic to pass around.
#[derive(
    Debug, Serialize, Deserialize, Copy, Clone, PartialEq, PartialOrd, JsonSchema,
)]
pub struct ResonanceScore {
    /// The inner value, always between 0.0 and 1.0 inclusive.
    pub value: f64,
}

impl ResonanceScore {
    /// Create a new `ResonanceScore`, clamping the input to the valid range.
    ///
    /// # Examples
    /// ```
    /// use claw_core::consensus::ResonanceScore;
    /// let s = ResonanceScore::new(1.2);
    /// assert_eq!(s.value, 1.0);
    /// let t = ResonanceScore::new(-0.5);
    /// assert_eq!(t.value, 0.0);
    /// ```
    pub fn new(v: f64) -> Self {
        let clamped = if v < 0.0 {
            0.0
        } else if v > 1.0 {
            1.0
        } else {
            v
        };
        ResonanceScore { value: clamped }
    }
}

/// Core engine that aggregates three perspective scores.
///
/// The engine is deliberately stateless aside from the `threshold`.  The
/// threshold is itself a `ResonanceScore` so callers can reuse the same type for
/// configuration and runtime values.
#[derive(Debug, Serialize, Deserialize, Clone, JsonSchema)]
pub struct TripartiteConsensusEngine {
    /// Minimum average resonance required for a decision to be accepted.
    pub threshold: ResonanceScore,
}

impl TripartiteConsensusEngine {
    /// Create a new consensus engine with the given threshold.
    pub fn new(threshold: ResonanceScore) -> Self {
        Self { threshold }
    }

    /// Compute the average resonance of the three supplied scores.
    ///
    /// The function returns a new `ResonanceScore` whose value is the arithmetic
    /// mean of the three inputs, clamped to `[0.0, 1.0]` (the clamp is a safety net
    /// in case callers provide out‑of‑range values).
    pub fn calculate_resonance(
        &self,
        pathos: ResonanceScore,
        logos: ResonanceScore,
        ethos: ResonanceScore,
    ) -> ResonanceScore {
        let avg = (pathos.value + logos.value + ethos.value) / 3.0;
        ResonanceScore::new(avg)
    }

    /// Resolve a decision based on three perspective scores.
    ///
    /// Returns `true` when the average resonance meets or exceeds the engine's
    /// `threshold`.  This mirrors the simple decision logic used in the test
    /// suite.
    pub fn resolve_decision(
        &self,
        pathos: ResonanceScore,
        logos: ResonanceScore,
        ethos: ResonanceScore,
    ) -> bool {
        let avg = self.calculate_resonance(pathos, logos, ethos);
        avg >= self.threshold
    }

    /// Participate in a multi-claw agreement.
    ///
    /// Each claw contributes a `ResonanceScore`.  The engine averages all
    /// contributions and compares against the configured threshold.  Returns
    /// `ConsensusDecision` with per-claw breakdown.
    pub fn agree(&self, scores: &[ResonanceScore]) -> ConsensusDecision {
        let sum: f64 = scores.iter().map(|s| s.value).sum();
        let count = scores.len().max(1) as f64;
        let resonance = ResonanceScore::new(sum / count);
        let passed = resonance >= self.threshold;
        let mut pathos = ResonanceScore::new(0.0);
        let mut logos = ResonanceScore::new(0.0);
        let mut ethos = ResonanceScore::new(0.0);
        match scores.len() {
            0 => {}
            1 => pathos = scores[0],
            2 => {
                pathos = scores[0];
                logos = scores[1];
            }
            _ => {
                pathos = scores[0];
                logos = scores[1];
                ethos = scores[2];
            }
        }
        ConsensusDecision {
            passed,
            resonance,
            pathos,
            logos,
            ethos,
            threshold: self.threshold,
        }
    }
}

/// Consensus decision result.
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct ConsensusDecision {
    pub passed: bool,
    pub resonance: ResonanceScore,
    pub pathos: ResonanceScore,
    pub logos: ResonanceScore,
    pub ethos: ResonanceScore,
    pub threshold: ResonanceScore,
}

impl TripartiteConsensusEngine {
    /// Resolve a decision and return detailed result.
    pub fn resolve_decision_detailed(
        &self,
        pathos: ResonanceScore,
        logos: ResonanceScore,
        ethos: ResonanceScore,
    ) -> ConsensusDecision {
        let resonance = self.calculate_resonance(pathos, logos, ethos);
        let passed = resonance >= self.threshold;
        ConsensusDecision {
            passed,
            resonance,
            pathos,
            logos,
            ethos,
            threshold: self.threshold,
        }
    }
}

// ---------------------------------------------------------------------------
// Unit tests for this module (run with `cargo test`).  They duplicate the
// expectations from the original test suite but are kept here for
// documentation and quick verification.
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_resonance_logic() {
        let engine = TripartiteConsensusEngine {
            threshold: ResonanceScore::new(0.5),
        };
        let s = ResonanceScore::new(1.0);
        let an = ResonanceScore::new(1.0);
        let ac = ResonanceScore::new(1.0);
        assert_eq!(
            engine.calculate_resonance(s, an, ac),
            ResonanceScore::new(1.0)
        );
    }

    #[test]
    fn test_decision_resolution() {
        let engine = TripartiteConsensusEngine {
            threshold: ResonanceScore::new(0.7),
        };
        // Should pass – average 0.8 >= 0.7
        assert!(engine.resolve_decision(
            ResonanceScore::new(0.8),
            ResonanceScore::new(0.8),
            ResonanceScore::new(0.8)
        ));
        // Should fail – average 0.2 < 0.7
        assert!(!engine.resolve_decision(
            ResonanceScore::new(0.2),
            ResonanceScore::new(0.2),
            ResonanceScore::new(0.2)
        ));
    }

    #[test]
    fn test_detailed_decision() {
        let engine = TripartiteConsensusEngine::new(ResonanceScore::new(0.6));
        let result = engine.resolve_decision_detailed(
            ResonanceScore::new(0.7),
            ResonanceScore::new(0.8),
            ResonanceScore::new(0.9),
        );
        assert!(result.passed);
        assert!((result.resonance.value - 0.8).abs() < 1e-10);
        assert_eq!(result.threshold.value, 0.6);
    }

    #[test]
    fn test_clamping() {
        assert_eq!(ResonanceScore::new(1.5).value, 1.0);
        assert_eq!(ResonanceScore::new(-0.5).value, 0.0);
        assert_eq!(ResonanceScore::new(0.5).value, 0.5);
    }
}