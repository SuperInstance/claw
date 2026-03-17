//! Muscle Memory System - Pattern learning and trigger extraction
//!
//! Extracts and learns patterns from equipment usage to enable intelligent
//! auto-requisition of equipment based on context and history.

use std::collections::{HashMap, HashSet};
use std::time::{Duration, Instant};
use serde::{Deserialize, Serialize};
use tokio::sync::RwLock;

use crate::equipment::EquipmentSlot;
use crate::error::Result;
use crate::agent::SerializableInstant;

/// Muscle memory trigger with confidence scoring
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MuscleMemoryTrigger {
    pub id: String,
    pub equipment_slot: EquipmentSlot,
    pub condition: TriggerCondition,
    pub confidence: f64,
    pub frequency: u32,
    pub last_triggered: SerializableInstant,
    pub first_learned: SerializableInstant,
    pub trigger_count: u32,
    pub avg_benefit: f64,
}

/// Conditions that trigger equipment needs
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum TriggerCondition {
    /// Pattern-based trigger
    Pattern {
        pattern: String,
        min_frequency: u32,
    },

    /// Performance-based trigger
    Performance {
        metric: String,
        threshold: f64,
        comparison: ComparisonOp,
    },

    /// Complexity-based trigger
    Complexity {
        min_complexity: f64,
    },

    /// Time-based trigger
    Time {
        interval_ms: u64,
        last_triggered_ms: u64,
    },

    /// Context-based trigger
    Context {
        context_key: String,
        context_value: String,
    },

    /// Composite trigger (AND/OR)
    Composite {
        operator: LogicalOp,
        conditions: Vec<TriggerCondition>,
    },

    /// Custom trigger
    Custom {
        condition: String,
        params: HashMap<String, String>,
    },
}

/// Comparison operators for performance triggers
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum ComparisonOp {
    GreaterThan,
    LessThan,
    Equal,
    GreaterOrEqual,
    LessOrEqual,
}

/// Logical operators for composite triggers
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum LogicalOp {
    And,
    Or,
}

impl TriggerCondition {
    /// Check if this condition matches the given context
    pub fn matches(&self, context: &TriggerContext) -> bool {
        match self {
            TriggerCondition::Pattern { pattern, min_frequency } => {
                context.patterns.contains(pattern)
                    && context.pattern_frequencies.get(pattern).copied().unwrap_or(0) >= *min_frequency
            }
            TriggerCondition::Performance { metric, threshold, comparison } => {
                if let Some(value) = context.metrics.get(metric) {
                    match comparison {
                        ComparisonOp::GreaterThan => value > threshold,
                        ComparisonOp::LessThan => value < threshold,
                        ComparisonOp::Equal => (value - threshold).abs() < 0.001,
                        ComparisonOp::GreaterOrEqual => value >= threshold,
                        ComparisonOp::LessOrEqual => value <= threshold,
                    }
                } else {
                    false
                }
            }
            TriggerCondition::Complexity { min_complexity } => {
                context.complexity >= *min_complexity
            }
            TriggerCondition::Time { interval_ms, last_triggered_ms } => {
                let now_ms = context.current_time_ms;
                now_ms - last_triggered_ms >= *interval_ms
            }
            TriggerCondition::Context { context_key, context_value } => {
                context.context_data.get(context_key).map(|v| v.as_str()) == Some(context_value.as_str())
            }
            TriggerCondition::Composite { operator, conditions } => {
                match operator {
                    LogicalOp::And => conditions.iter().all(|c| c.matches(context)),
                    LogicalOp::Or => conditions.iter().any(|c| c.matches(context)),
                }
            }
            TriggerCondition::Custom { condition, params } => {
                // Simple pattern matching for custom conditions
                context.custom_conditions.get(condition).map_or(false, |v| {
                    params.iter().all(|(k, val)| v.get(k).map_or(false, |v| v == val))
                })
            }
        }
    }
}

/// Context for evaluating trigger conditions
#[derive(Debug, Clone)]
pub struct TriggerContext {
    pub patterns: HashSet<String>,
    pub pattern_frequencies: HashMap<String, u32>,
    pub metrics: HashMap<String, f64>,
    pub complexity: f64,
    pub current_time_ms: u64,
    pub context_data: HashMap<String, String>,
    pub custom_conditions: HashMap<String, HashMap<String, String>>,
}

impl Default for TriggerContext {
    fn default() -> Self {
        Self {
            patterns: HashSet::new(),
            pattern_frequencies: HashMap::new(),
            metrics: HashMap::new(),
            complexity: 0.0,
            current_time_ms: 0,
            context_data: HashMap::new(),
            custom_conditions: HashMap::new(),
        }
    }
}

/// Muscle Memory System - learns and manages equipment triggers
pub struct MuscleMemorySystem {
    triggers: RwLock<HashMap<String, MuscleMemoryTrigger>>,
    pattern_history: RwLock<HashMap<String, PatternHistory>>,
    learning_enabled: RwLock<bool>,
    confidence_threshold: RwLock<f64>,
}

/// Historical data for pattern learning
#[derive(Debug, Clone)]
struct PatternHistory {
    pattern: String,
    occurrences: Vec<PatternOccurrence>,
    first_seen: Instant,
    last_seen: Instant,
    associated_equipment: HashMap<EquipmentSlot, u32>,
}

#[derive(Debug, Clone)]
struct PatternOccurrence {
    timestamp: Instant,
    equipment_used: Vec<EquipmentSlot>,
    benefit_score: f64,
}

impl MuscleMemorySystem {
    /// Create a new muscle memory system
    pub fn new() -> Self {
        Self {
            triggers: RwLock::new(HashMap::new()),
            pattern_history: RwLock::new(HashMap::new()),
            learning_enabled: RwLock::new(true),
            confidence_threshold: RwLock::new(0.7),
        }
    }

    /// Learn from an equipment usage event
    pub async fn learn_from_usage(
        &self,
        equipment_slot: EquipmentSlot,
        context: &TriggerContext,
        benefit_score: f64,
    ) -> Result<()> {
        if !*self.learning_enabled.read().await {
            return Ok(());
        }

        // Record pattern occurrences
        for pattern in &context.patterns {
            self.record_pattern_occurrence(
                pattern.clone(),
                equipment_slot,
                benefit_score,
            ).await;
        }

        // Update or create triggers
        self.update_triggers(equipment_slot, context, benefit_score).await?;

        Ok(())
    }

    /// Get triggers that should activate in the given context
    pub async fn get_active_triggers(&self, context: &TriggerContext) -> Vec<MuscleMemoryTrigger> {
        let triggers = self.triggers.read().await;
        let threshold = *self.confidence_threshold.read().await;

        triggers
            .values()
            .filter(|t| t.confidence >= threshold && t.condition.matches(context))
            .cloned()
            .collect()
    }

    /// Get all triggers for an equipment slot
    pub async fn get_triggers_for_slot(&self, slot: EquipmentSlot) -> Vec<MuscleMemoryTrigger> {
        let triggers = self.triggers.read().await;
        triggers
            .values()
            .filter(|t| t.equipment_slot == slot)
            .cloned()
            .collect()
    }

    /// Extract muscle memory from equipment usage history
    pub async fn extract_muscle_memory(
        &self,
        equipment_slot: EquipmentSlot,
        usage_history: &[UsageEvent],
    ) -> Vec<MuscleMemoryTrigger> {
        let mut extracted = Vec::new();

        // Analyze usage patterns
        let patterns = self.analyze_patterns(usage_history);

        for (pattern, frequency, confidence) in patterns {
            if confidence >= *self.confidence_threshold.read().await {
                let trigger = MuscleMemoryTrigger {
                    id: format!("trigger-{}-{}", equipment_slot as u8, uuid::Uuid::new_v4()),
                    equipment_slot,
                    condition: TriggerCondition::Pattern {
                        pattern,
                        min_frequency: frequency / 2, // Trigger at half frequency
                    },
                    confidence,
                    frequency,
                    last_triggered: Instant::now().into(),
                    first_learned: Instant::now().into(),
                    trigger_count: frequency,
                    avg_benefit: self.calculate_avg_benefit(usage_history),
                };

                extracted.push(trigger);
            }
        }

        extracted
    }

    /// Record a pattern occurrence
    async fn record_pattern_occurrence(
        &self,
        pattern: String,
        equipment_slot: EquipmentSlot,
        benefit_score: f64,
    ) {
        let mut history = self.pattern_history.write().await;
        let now = Instant::now();

        let entry = history.entry(pattern.clone()).or_insert_with(|| {
            PatternHistory {
                pattern: pattern.clone(),
                occurrences: Vec::new(),
                first_seen: now,
                last_seen: now,
                associated_equipment: HashMap::new(),
            }
        });

        entry.occurrences.push(PatternOccurrence {
            timestamp: now,
            equipment_used: vec![equipment_slot],
            benefit_score,
        });

        entry.last_seen = now;
        *entry.associated_equipment.entry(equipment_slot).or_insert(0) += 1;
    }

    /// Update triggers based on recent usage
    async fn update_triggers(
        &self,
        equipment_slot: EquipmentSlot,
        context: &TriggerContext,
        benefit_score: f64,
    ) -> Result<()> {
        // Update existing triggers or create new ones
        for pattern in &context.patterns {
            let trigger_id = format!("trigger-{}-{}", equipment_slot as u8, pattern);

            let mut triggers = self.triggers.write().await;

            if let Some(trigger) = triggers.get_mut(&trigger_id) {
                // Update existing trigger
                trigger.confidence = (trigger.confidence * 0.7) + (benefit_score * 0.3);
                trigger.frequency += 1;
                trigger.last_triggered = Instant::now().into();
                trigger.avg_benefit = (trigger.avg_benefit * 0.8) + (benefit_score * 0.2);
            } else if benefit_score >= *self.confidence_threshold.read().await {
                // Create new trigger
                let new_trigger = MuscleMemoryTrigger {
                    id: trigger_id.clone(),
                    equipment_slot,
                    condition: TriggerCondition::Pattern {
                        pattern: pattern.clone(),
                        min_frequency: 1,
                    },
                    confidence: benefit_score,
                    frequency: 1,
                    last_triggered: Instant::now().into(),
                    first_learned: Instant::now().into(),
                    trigger_count: 1,
                    avg_benefit: benefit_score, // Initial average benefit is the first benefit score
                };

                triggers.insert(trigger_id, new_trigger);
            }
        }

        Ok(())
    }

    /// Analyze patterns from usage history
    fn analyze_patterns(&self, usage_history: &[UsageEvent]) -> Vec<(String, u32, f64)> {
        let mut pattern_counts: HashMap<String, u32> = HashMap::new();
        let mut pattern_benefits: HashMap<String, f64> = HashMap::new();

        for event in usage_history {
            for pattern in &event.patterns {
                *pattern_counts.entry(pattern.clone()).or_insert(0) += 1;
                *pattern_benefits.entry(pattern.clone()).or_insert(0.0) += event.benefit;
            }
        }

        pattern_counts
            .into_iter()
            .map(|(pattern, count)| {
                let avg_benefit = pattern_benefits.get(&pattern).unwrap_or(&0.0) / count as f64;
                let confidence = (count as f64 / usage_history.len() as f64) * avg_benefit;
                (pattern, count, confidence)
            })
            .collect()
    }

    /// Calculate average benefit from usage history
    fn calculate_avg_benefit(&self, usage_history: &[UsageEvent]) -> f64 {
        if usage_history.is_empty() {
            return 0.0;
        }

        let total: f64 = usage_history.iter().map(|e| e.benefit).sum();
        total / usage_history.len() as f64
    }

    /// Forget old triggers to prevent memory bloat
    pub async fn forget_old_triggers(&self, older_than: Duration) -> Result<usize> {
        let mut triggers = self.triggers.write().await;
        let mut removed = 0;

        // Get current time as SystemTime for comparison
        let now_system = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default();
        let now_secs = now_system.as_secs();

        triggers.retain(|_, trigger| {
            // Calculate age in seconds
            let age_secs = now_secs.saturating_sub(trigger.last_triggered.secs_since_epoch);
            let age = Duration::from_secs(age_secs);

            // Remove if old and low confidence
            if age > older_than && trigger.confidence < 0.5 {
                removed += 1;
                false
            } else {
                true
            }
        });

        Ok(removed)
    }

    /// Enable or disable learning
    pub async fn set_learning_enabled(&self, enabled: bool) {
        *self.learning_enabled.write().await = enabled;
    }

    /// Set confidence threshold for trigger activation
    pub async fn set_confidence_threshold(&self, threshold: f64) {
        *self.confidence_threshold.write().await = threshold.max(0.0).min(1.0);
    }

    /// Get statistics about learned triggers
    pub async fn stats(&self) -> MuscleMemoryStats {
        let triggers = self.triggers.read().await;
        let history = self.pattern_history.read().await;

        let total_triggers = triggers.len();
        let high_confidence = triggers.values().filter(|t| t.confidence >= 0.8).count();
        let total_patterns = history.len();

        MuscleMemoryStats {
            total_triggers,
            high_confidence_triggers: high_confidence,
            total_patterns_learned: total_patterns,
        }
    }
}

impl Default for MuscleMemorySystem {
    fn default() -> Self {
        Self::new()
    }
}

/// Usage event for learning
#[derive(Debug, Clone)]
pub struct UsageEvent {
    pub patterns: Vec<String>,
    pub benefit: f64,
    pub timestamp: Instant,
}

/// Statistics for muscle memory system
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MuscleMemoryStats {
    pub total_triggers: usize,
    pub high_confidence_triggers: usize,
    pub total_patterns_learned: usize,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_muscle_memory_learning() {
        let memory = MuscleMemorySystem::new();

        let mut context = TriggerContext::default();
        context.patterns.insert("data_processing".to_string());
        context.patterns.insert("complex_calculation".to_string());

        // Learn from usage
        memory.learn_from_usage(
            EquipmentSlot::Reasoning,
            &context,
            0.9,
        ).await.unwrap();

        let stats = memory.stats().await;
        assert_eq!(stats.total_patterns_learned, 2);
    }

    #[tokio::test]
    async fn test_trigger_activation() {
        let memory = MuscleMemorySystem::new();

        // Create a trigger
        let trigger = MuscleMemoryTrigger {
            id: "test-trigger".to_string(),
            equipment_slot: EquipmentSlot::Memory,
            condition: TriggerCondition::Pattern {
                pattern: "frequent_access".to_string(),
                min_frequency: 5,
            },
            confidence: 0.9,
            frequency: 10,
            last_triggered: SerializableInstant::default(),
            first_learned: SerializableInstant::default(),
            trigger_count: 10,
            avg_benefit: 8.5,
        };

        {
            let mut triggers = memory.triggers.write().await;
            triggers.insert(trigger.id.clone(), trigger);
        }

        // Test context matching
        let mut context = TriggerContext::default();
        context.patterns.insert("frequent_access".to_string());
        context.pattern_frequencies.insert("frequent_access".to_string(), 10);

        let active = memory.get_active_triggers(&context).await;
        assert_eq!(active.len(), 1);
        assert_eq!(active[0].equipment_slot, EquipmentSlot::Memory);
    }

    #[tokio::test]
    async fn test_pattern_extraction() {
        let memory = MuscleMemorySystem::new();

        let usage_history = vec![
            UsageEvent {
                patterns: vec!["pattern_a".to_string(), "pattern_b".to_string()],
                benefit: 0.9,
                timestamp: Instant::now(),
            },
            UsageEvent {
                patterns: vec!["pattern_a".to_string()],
                benefit: 0.8,
                timestamp: Instant::now(),
            },
        ];

        let triggers = memory.extract_muscle_memory(EquipmentSlot::Memory, &usage_history).await;
        assert!(!triggers.is_empty());
    }

    #[tokio::test]
    async fn test_forget_old_triggers() {
        let memory = MuscleMemorySystem::new();

        // Create old trigger
        let old_trigger = MuscleMemoryTrigger {
            id: "old-trigger".to_string(),
            equipment_slot: EquipmentSlot::Memory,
            condition: TriggerCondition::Pattern {
                pattern: "old_pattern".to_string(),
                min_frequency: 1,
            },
            confidence: 0.3, // Low confidence
            frequency: 1,
            last_triggered: SerializableInstant::default(),
            first_learned: SerializableInstant::default(),
            trigger_count: 1,
            avg_benefit: 0.2,
        };

        {
            let mut triggers = memory.triggers.write().await;
            triggers.insert(old_trigger.id.clone(), old_trigger);
        }

        // Forget old triggers
        let removed = memory.forget_old_triggers(Duration::from_secs(3600)).await.unwrap();
        assert!(removed > 0);
    }
}
