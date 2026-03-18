//! Monitoring and Metrics for Claw
//!
//! This module provides comprehensive monitoring capabilities including:
//! - Prometheus metrics export
//! - Agent lifecycle metrics
//! - Equipment usage metrics
//! - Message throughput metrics
//! - Performance metrics

use prometheus::{
    Counter, CounterVec, Histogram, HistogramVec, IntCounter, IntCounterVec, IntGauge,
    IntGaugeVec, Registry, TextEncoder, __counter_vec_counter,
};
use std::sync::Arc;
use tokio::sync::RwLock;

/// Claw monitoring metrics
#[derive(Clone)]
pub struct ClawMetrics {
    registry: Registry,

    // Agent lifecycle metrics
    pub agents_created: IntCounter,
    pub agents_updated: IntCounter,
    pub agents_deleted: IntCounter,
    pub agents_active: IntGauge,

    // Equipment metrics
    pub equipment_equipped: IntCounterVec,
    pub equipment_unequipped: IntCounterVec,
    pub equipment_active: IntGaugeVec,

    // Message metrics
    pub messages_sent: IntCounterVec,
    pub messages_received: IntCounterVec,
    pub message_latency: HistogramVec,

    // Performance metrics
    pub trigger_processing_time: Histogram,
    pub reasoning_time: Histogram,
    pub memory_usage: IntGauge,

    // Error metrics
    pub errors_total: IntCounterVec,
}

impl ClawMetrics {
    /// Create new metrics instance
    pub fn new() -> Self {
        let registry = Registry::new();

        // Agent lifecycle metrics
        let agents_created = IntCounter::new(
            "claw_agents_created_total",
            "Total number of agents created"
        ).expect("Failed to create agents_created metric");

        let agents_updated = IntCounter::new(
            "claw_agents_updated_total",
            "Total number of agents updated"
        ).expect("Failed to create agents_updated metric");

        let agents_deleted = IntCounter::new(
            "claw_agents_deleted_total",
            "Total number of agents deleted"
        ).expect("Failed to create agents_deleted metric");

        let agents_active = IntGauge::new(
            "claw_agents_active",
            "Current number of active agents"
        ).expect("Failed to create agents_active metric");

        // Equipment metrics
        let equipment_equipped = IntCounterVec::new(
            prometheus::Opts::new(
                "claw_equipment_equipped_total",
                "Total number of times equipment was equipped"
            ),
            &["equipment_type"]
        ).expect("Failed to create equipment_equipped metric");

        let equipment_unequipped = IntCounterVec::new(
            prometheus::Opts::new(
                "claw_equipment_unequipped_total",
                "Total number of times equipment was unequipped"
            ),
            &["equipment_type"]
        ).expect("Failed to create equipment_unequipped metric");

        let equipment_active = IntGaugeVec::new(
            prometheus::Opts::new(
                "claw_equipment_active",
                "Current number of active equipment by type"
            ),
            &["equipment_type"]
        ).expect("Failed to create equipment_active metric");

        // Message metrics
        let messages_sent = IntCounterVec::new(
            prometheus::Opts::new(
                "claw_messages_sent_total",
                "Total number of messages sent"
            ),
            &["message_type", "target"]
        ).expect("Failed to create messages_sent metric");

        let messages_received = IntCounterVec::new(
            prometheus::Opts::new(
                "claw_messages_received_total",
                "Total number of messages received"
            ),
            &["message_type", "source"]
        ).expect("Failed to create messages_received metric");

        let message_latency = HistogramVec::new(
            prometheus::HistogramOpts::new(
                "claw_message_latency_seconds",
                "Message latency in seconds"
            ),
            &["message_type"]
        ).expect("Failed to create message_latency metric");

        // Performance metrics
        let trigger_processing_time = Histogram::new(
            prometheus::HistogramOpts::new(
                "claw_trigger_processing_seconds",
                "Trigger processing time in seconds"
            ).buckets(vec![0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0])
        ).expect("Failed to create trigger_processing_time metric");

        let reasoning_time = Histogram::new(
            prometheus::HistogramOpts::new(
                "claw_reasoning_seconds",
                "Reasoning time in seconds"
            ).buckets(vec![0.01, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0, 30.0, 60.0])
        ).expect("Failed to create reasoning_time metric");

        let memory_usage = IntGauge::new(
            "claw_memory_bytes",
            "Memory usage in bytes"
        ).expect("Failed to create memory_usage metric");

        // Error metrics
        let errors_total = IntCounterVec::new(
            prometheus::Opts::new(
                "claw_errors_total",
                "Total number of errors"
            ),
            &["error_type", "component"]
        ).expect("Failed to create errors_total metric");

        // Register all metrics
        registry.register(Box::new(agents_created.clone())).unwrap();
        registry.register(Box::new(agents_updated.clone())).unwrap();
        registry.register(Box::new(agents_deleted.clone())).unwrap();
        registry.register(Box::new(agents_active.clone())).unwrap();
        registry.register(Box::new(equipment_equipped.clone())).unwrap();
        registry.register(Box::new(equipment_unequipped.clone())).unwrap();
        registry.register(Box::new(equipment_active.clone())).unwrap();
        registry.register(Box::new(messages_sent.clone())).unwrap();
        registry.register(Box::new(messages_received.clone())).unwrap();
        registry.register(Box::new(message_latency.clone())).unwrap();
        registry.register(Box::new(trigger_processing_time.clone())).unwrap();
        registry.register(Box::new(reasoning_time.clone())).unwrap();
        registry.register(Box::new(memory_usage.clone())).unwrap();
        registry.register(Box::new(errors_total.clone())).unwrap();

        Self {
            registry,
            agents_created,
            agents_updated,
            agents_deleted,
            agents_active,
            equipment_equipped,
            equipment_unequipped,
            equipment_active,
            messages_sent,
            messages_received,
            message_latency,
            trigger_processing_time,
            reasoning_time,
            memory_usage,
            errors_total,
        }
    }

    /// Record agent creation
    pub fn record_agent_created(&self) {
        self.agents_created.inc();
        self.agents_active.inc();
    }

    /// Record agent update
    pub fn record_agent_updated(&self) {
        self.agents_updated.inc();
    }

    /// Record agent deletion
    pub fn record_agent_deleted(&self) {
        self.agents_deleted.inc();
        self.agents_active.dec();
    }

    /// Record equipment equipped
    pub fn record_equipment_equipped(&self, equipment_type: &str) {
        self.equipment_equipped
            .with_label_values(&[equipment_type])
            .inc();
        self.equipment_active
            .with_label_values(&[equipment_type])
            .inc();
    }

    /// Record equipment unequipped
    pub fn record_equipment_unequipped(&self, equipment_type: &str) {
        self.equipment_unequipped
            .with_label_values(&[equipment_type])
            .inc();
        self.equipment_active
            .with_label_values(&[equipment_type])
            .dec();
    }

    /// Record message sent
    pub fn record_message_sent(&self, message_type: &str, target: &str, latency_secs: f64) {
        self.messages_sent
            .with_label_values(&[message_type, target])
            .inc();
        self.message_latency
            .with_label_values(&[message_type])
            .observe(latency_secs);
    }

    /// Record message received
    pub fn record_message_received(&self, message_type: &str, source: &str) {
        self.messages_received
            .with_label_values(&[message_type, source])
            .inc();
    }

    /// Record trigger processing
    pub fn record_trigger_processing(&self, duration_secs: f64) {
        self.trigger_processing_time.observe(duration_secs);
    }

    /// Record reasoning time
    pub fn record_reasoning(&self, duration_secs: f64) {
        self.reasoning_time.observe(duration_secs);
    }

    /// Update memory usage
    pub fn update_memory_usage(&self, bytes: i64) {
        self.memory_usage.set(bytes);
    }

    /// Record error
    pub fn record_error(&self, error_type: &str, component: &str) {
        self.errors_total
            .with_label_values(&[error_type, component])
            .inc();
    }

    /// Export metrics as Prometheus text format
    pub fn export(&self) -> Result<String, prometheus::Error> {
        let encoder = TextEncoder::new();
        let metric_families = self.registry.gather();
        encoder.encode_to_string(&metric_families)
    }
}

impl Default for ClawMetrics {
    fn default() -> Self {
        Self::new()
    }
}

/// Health check status
#[derive(Debug, Clone, serde::Serialize)]
pub struct HealthStatus {
    pub status: String,
    pub version: String,
    pub uptime_seconds: u64,
    pub agents_active: i64,
    pub memory_usage_mb: f64,
}

/// Monitoring state
#[derive(Clone)]
pub struct MonitoringState {
    pub metrics: ClawMetrics,
    pub start_time: std::time::Instant,
    pub health_status: Arc<RwLock<HealthStatus>>,
}

impl MonitoringState {
    /// Create new monitoring state
    pub fn new() -> Self {
        let metrics = ClawMetrics::new();
        let start_time = std::time::Instant::now();

        let health_status = Arc::new(RwLock::new(HealthStatus {
            status: "healthy".to_string(),
            version: env!("CARGO_PKG_VERSION").to_string(),
            uptime_seconds: 0,
            agents_active: 0,
            memory_usage_mb: 0.0,
        }));

        Self {
            metrics,
            start_time,
            health_status,
        }
    }

    /// Update health status
    pub async fn update_health_status(&self, status: HealthStatus) {
        let mut health = self.health_status.write().await;
        *health = status;
    }

    /// Get current health status
    pub async fn get_health_status(&self) -> HealthStatus {
        let health = self.health_status.read().await;
        health.clone()
    }

    /// Get uptime in seconds
    pub fn uptime_seconds(&self) -> u64 {
        self.start_time.elapsed().as_secs()
    }
}

impl Default for MonitoringState {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_metrics_creation() {
        let metrics = ClawMetrics::new();
        metrics.record_agent_created();
        assert_eq!(metrics.agents_created.get(), 1);
        assert_eq!(metrics.agents_active.get(), 1);
    }

    #[test]
    fn test_equipment_metrics() {
        let metrics = ClawMetrics::new();
        metrics.record_equipment_equipped("MEMORY");
        assert_eq!(metrics.equipment_equipped.with_label_values(&["MEMORY"]).get(), 1);
        assert_eq!(metrics.equipment_active.with_label_values(&["MEMORY"]).get(), 1);

        metrics.record_equipment_unequipped("MEMORY");
        assert_eq!(metrics.equipment_active.with_label_values(&["MEMORY"]).get(), 0);
    }

    #[test]
    fn test_message_metrics() {
        let metrics = ClawMetrics::new();
        metrics.record_message_sent("TRIGGER", "agent-1", 0.05);
        assert_eq!(metrics.messages_sent.with_label_values(&["TRIGGER", "agent-1"]).get(), 1);
    }

    #[test]
    fn test_metrics_export() {
        let metrics = ClawMetrics::new();
        metrics.record_agent_created();
        let exported = metrics.export().unwrap();
        assert!(exported.contains("claw_agents_created_total"));
    }
}
