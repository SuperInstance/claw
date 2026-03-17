//! Equipment Resource Monitoring and Usage Tracking
//!
//! Provides real-time monitoring of equipment resource usage, performance
//! metrics, and health checks for optimal equipment management.

use std::collections::HashMap;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::time::Instant;
use tokio::sync::RwLock;
use serde::{Deserialize, Serialize};

use crate::equipment::{EquipmentSlot, EquipmentCost};
use crate::error::Result;

/// Resource usage metrics for equipment
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResourceMetrics {
    pub slot: EquipmentSlot,
    pub memory_used_mb: f64,
    pub cpu_percent: f64,
    pub active_instances: u64,
    pub total_operations: u64,
    pub avg_latency_ms: f64,
    pub error_rate: f64,
    pub uptime_seconds: f64,
    pub last_updated: chrono::DateTime<chrono::Utc>,
}

impl ResourceMetrics {
    pub fn new(slot: EquipmentSlot) -> Self {
        Self {
            slot,
            memory_used_mb: 0.0,
            cpu_percent: 0.0,
            active_instances: 0,
            total_operations: 0,
            avg_latency_ms: 0.0,
            error_rate: 0.0,
            uptime_seconds: 0.0,
            last_updated: chrono::Utc::now(),
        }
    }
}

/// Performance metrics for equipment
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceMetrics {
    pub slot: EquipmentSlot,
    pub operations_per_second: f64,
    pub avg_execution_time_ms: f64,
    pub p50_latency_ms: f64,
    pub p95_latency_ms: f64,
    pub p99_latency_ms: f64,
    pub throughput_mb_per_sec: f64,
    pub cache_hit_rate: f64,
    pub success_rate: f64,
}

impl PerformanceMetrics {
    pub fn new(slot: EquipmentSlot) -> Self {
        Self {
            slot,
            operations_per_second: 0.0,
            avg_execution_time_ms: 0.0,
            p50_latency_ms: 0.0,
            p95_latency_ms: 0.0,
            p99_latency_ms: 0.0,
            throughput_mb_per_sec: 0.0,
            cache_hit_rate: 0.0,
            success_rate: 0.0,
        }
    }
}

/// Health status for equipment
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum HealthStatus {
    Healthy,
    Degraded,
    Unhealthy,
    Unknown,
}

/// Health check result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HealthCheck {
    pub slot: EquipmentSlot,
    pub status: HealthStatus,
    pub message: String,
    pub last_check: chrono::DateTime<chrono::Utc>,
    pub consecutive_failures: u32,
}

/// Equipment resource monitor
pub struct ResourceMonitor {
    metrics: Arc<RwLock<HashMap<EquipmentSlot, ResourceMetrics>>>,
    performance: Arc<RwLock<HashMap<EquipmentSlot, PerformanceMetrics>>>,
    health: Arc<RwLock<HashMap<EquipmentSlot, HealthCheck>>>,
    costs: Arc<RwLock<HashMap<EquipmentSlot, EquipmentCost>>>,
    monitoring_enabled: Arc<AtomicBool>,
    start_time: Instant,
}

impl ResourceMonitor {
    /// Create a new resource monitor
    pub fn new() -> Self {
        Self {
            metrics: Arc::new(RwLock::new(HashMap::new())),
            performance: Arc::new(RwLock::new(HashMap::new())),
            health: Arc::new(RwLock::new(HashMap::new())),
            costs: Arc::new(RwLock::new(HashMap::new())),
            monitoring_enabled: Arc::new(AtomicBool::new(true)),
            start_time: Instant::now(),
        }
    }

    /// Register equipment slot for monitoring
    pub async fn register_slot(&self, slot: EquipmentSlot, cost: EquipmentCost) {
        let mut metrics = self.metrics.write().await;
        let mut performance = self.performance.write().await;
        let mut health = self.health.write().await;
        let mut costs = self.costs.write().await;

        metrics.entry(slot).or_insert_with(|| ResourceMetrics::new(slot));
        performance.entry(slot).or_insert_with(|| PerformanceMetrics::new(slot));
        health.entry(slot).or_insert_with(|| HealthCheck {
            slot,
            status: HealthStatus::Unknown,
            message: "Registered".to_string(),
            last_check: chrono::Utc::now(),
            consecutive_failures: 0,
        });
        costs.entry(slot).or_insert(cost);
    }

    /// Update resource metrics
    pub async fn update_metrics(&self, slot: EquipmentSlot, update: MetricsUpdate) -> Result<()> {
        if !self.monitoring_enabled.load(Ordering::SeqCst) {
            return Ok(());
        }

        let mut metrics = self.metrics.write().await;
        let entry = metrics.entry(slot).or_insert_with(|| ResourceMetrics::new(slot));

        match update {
            MetricsUpdate::MemoryUsed { mb } => {
                entry.memory_used_mb = mb;
            }
            MetricsUpdate::CpuPercent { percent } => {
                entry.cpu_percent = percent;
            }
            MetricsUpdate::ActiveInstances { count } => {
                entry.active_instances = count;
            }
            MetricsUpdate::OperationCompleted { latency_ms, success } => {
                entry.total_operations += 1;
                let count = entry.total_operations as f64;
                if success {
                    // Update average latency
                    entry.avg_latency_ms = (entry.avg_latency_ms * (count - 1.0) + latency_ms) / count;
                } else {
                    // Update error rate
                    let total_failures = entry.error_rate * (count - 1.0) + 1.0;
                    entry.error_rate = total_failures / count;
                }
            }
            MetricsUpdate::Batch(updates) => {
                // Process batch updates inline to avoid recursion
                for update in updates {
                    match update {
                        MetricsUpdate::MemoryUsed { mb } => {
                            entry.memory_used_mb = mb;
                        }
                        MetricsUpdate::CpuPercent { percent } => {
                            entry.cpu_percent = percent;
                        }
                        MetricsUpdate::ActiveInstances { count } => {
                            entry.active_instances = count;
                        }
                        MetricsUpdate::OperationCompleted { latency_ms, success } => {
                            entry.total_operations += 1;
                            let count = entry.total_operations as f64;
                            if success {
                                entry.avg_latency_ms = ((entry.avg_latency_ms * (count - 1.0)) + latency_ms) / count;
                            } else {
                                let total_failures = entry.error_rate * (count - 1.0) + 1.0;
                                entry.error_rate = total_failures / count;
                            }
                        }
                        MetricsUpdate::Batch(_) => {
                            // Skip nested batches to avoid infinite loops
                            continue;
                        }
                    }
                }
            }
        }

        entry.last_updated = chrono::Utc::now();
        Ok(())
    }

    /// Get resource metrics for a slot
    pub async fn get_metrics(&self, slot: EquipmentSlot) -> Option<ResourceMetrics> {
        self.metrics.read().await.get(&slot).cloned()
    }

    /// Get all resource metrics
    pub async fn get_all_metrics(&self) -> HashMap<EquipmentSlot, ResourceMetrics> {
        self.metrics.read().await.clone()
    }

    /// Update performance metrics
    pub async fn update_performance(&self, slot: EquipmentSlot, perf: PerformanceMetrics) {
        let mut performance = self.performance.write().await;
        performance.insert(slot, perf);
    }

    /// Get performance metrics for a slot
    pub async fn get_performance(&self, slot: EquipmentSlot) -> Option<PerformanceMetrics> {
        self.performance.read().await.get(&slot).cloned()
    }

    /// Get all performance metrics
    pub async fn get_all_performance(&self) -> HashMap<EquipmentSlot, PerformanceMetrics> {
        self.performance.read().await.clone()
    }

    /// Update health status
    pub async fn update_health(&self, slot: EquipmentSlot, status: HealthStatus, message: String) {
        let mut health = self.health.write().await;
        let entry = health.entry(slot).or_insert_with(|| HealthCheck {
            slot,
            status: HealthStatus::Unknown,
            message: String::new(),
            last_check: chrono::Utc::now(),
            consecutive_failures: 0,
        });

        entry.status = status.clone();
        entry.message = message;
        entry.last_check = chrono::Utc::now();

        match status {
            HealthStatus::Healthy => {
                entry.consecutive_failures = 0;
            }
            HealthStatus::Degraded | HealthStatus::Unhealthy => {
                entry.consecutive_failures += 1;
            }
            HealthStatus::Unknown => {}
        }
    }

    /// Get health status for a slot
    pub async fn get_health(&self, slot: EquipmentSlot) -> Option<HealthCheck> {
        self.health.read().await.get(&slot).cloned()
    }

    /// Get all health statuses
    pub async fn get_all_health(&self) -> HashMap<EquipmentSlot, HealthCheck> {
        self.health.read().await.clone()
    }

    /// Check if equipment is healthy
    pub async fn is_healthy(&self, slot: EquipmentSlot) -> bool {
        if let Some(check) = self.get_health(slot).await {
            check.status == HealthStatus::Healthy
        } else {
            false
        }
    }

    /// Get total resource usage across all slots
    pub async fn get_total_usage(&self) -> TotalResourceUsage {
        let metrics = self.metrics.read().await;
        let costs = self.costs.read().await;

        let mut total_memory_mb = 0.0;
        let mut total_cpu_percent = 0.0;
        let mut total_instances = 0;
        let mut total_operations = 0;

        for (slot, metrics) in metrics.iter() {
            total_memory_mb += metrics.memory_used_mb;
            total_cpu_percent += metrics.cpu_percent;
            total_instances += metrics.active_instances;
            total_operations += metrics.total_operations;

            // Add to total if cost is available
            if let Some(cost) = costs.get(slot) {
                total_memory_mb += cost.memory_mb;
                total_cpu_percent += cost.cpu_percent;
            }
        }

        TotalResourceUsage {
            memory_mb: total_memory_mb,
            cpu_percent: total_cpu_percent,
            active_instances: total_instances,
            total_operations,
            uptime_seconds: self.start_time.elapsed().as_secs_f64(),
        }
    }

    /// Get estimated costs for equipment
    pub async fn get_estimated_cost(&self, slot: EquipmentSlot) -> Option<EquipmentCost> {
        self.costs.read().await.get(&slot).cloned()
    }

    /// Perform health check on all equipment
    pub async fn health_check_all(&self) -> HashMap<EquipmentSlot, HealthStatus> {
        let health = self.health.read().await;
        health.iter()
            .map(|(slot, check)| (*slot, check.status.clone()))
            .collect()
    }

    /// Enable or disable monitoring
    pub async fn set_monitoring_enabled(&self, enabled: bool) {
        self.monitoring_enabled.store(enabled, Ordering::SeqCst);
    }

    /// Check if monitoring is enabled
    pub fn is_monitoring_enabled(&self) -> bool {
        self.monitoring_enabled.load(Ordering::SeqCst)
    }

    /// Reset all metrics
    pub async fn reset_metrics(&self) {
        self.metrics.write().await.clear();
        self.performance.write().await.clear();
    }

    /// Get monitoring summary
    pub async fn summary(&self) -> MonitoringSummary {
        let metrics = self.metrics.read().await;
        let health = self.health.read().await;

        let total_slots = metrics.len();
        let healthy_slots = health.values().filter(|h| h.status == HealthStatus::Healthy).count();
        let unhealthy_slots = health.values().filter(|h| h.status == HealthStatus::Unhealthy).count();

        MonitoringSummary {
            total_slots,
            healthy_slots,
            unhealthy_slots,
            uptime_seconds: self.start_time.elapsed().as_secs_f64(),
            monitoring_enabled: self.monitoring_enabled.load(Ordering::SeqCst),
        }
    }
}

impl Default for ResourceMonitor {
    fn default() -> Self {
        Self::new()
    }
}

/// Metrics update types
#[derive(Debug, Clone)]
pub enum MetricsUpdate {
    MemoryUsed { mb: f64 },
    CpuPercent { percent: f64 },
    ActiveInstances { count: u64 },
    OperationCompleted { latency_ms: f64, success: bool },
    Batch(Vec<MetricsUpdate>),
}

/// Total resource usage across all equipment
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TotalResourceUsage {
    pub memory_mb: f64,
    pub cpu_percent: f64,
    pub active_instances: u64,
    pub total_operations: u64,
    pub uptime_seconds: f64,
}

/// Monitoring summary
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MonitoringSummary {
    pub total_slots: usize,
    pub healthy_slots: usize,
    pub unhealthy_slots: usize,
    pub uptime_seconds: f64,
    pub monitoring_enabled: bool,
}

/// Performance benchmark results
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BenchmarkResults {
    pub slot: EquipmentSlot,
    pub equip_time_ms: f64,
    pub unequip_time_ms: f64,
    pub operation_overhead_ms: f64,
    pub memory_overhead_mb: f64,
    pub cpu_overhead_percent: f64,
    pub iterations: u32,
    pub timestamp: chrono::DateTime<chrono::Utc>,
}

impl BenchmarkResults {
    pub fn new(slot: EquipmentSlot) -> Self {
        Self {
            slot,
            equip_time_ms: 0.0,
            unequip_time_ms: 0.0,
            operation_overhead_ms: 0.0,
            memory_overhead_mb: 0.0,
            cpu_overhead_percent: 0.0,
            iterations: 0,
            timestamp: chrono::Utc::now(),
        }
    }

    /// Check if results meet performance targets
    pub fn meets_targets(&self) -> bool {
        self.equip_time_ms < 50.0
            && self.unequip_time_ms < 20.0
            && self.operation_overhead_ms < 5.0
            && self.memory_overhead_mb < 1.0
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_resource_monitor() {
        let monitor = ResourceMonitor::new();

        let cost = EquipmentCost {
            memory_mb: 1.0,
            cpu_percent: 5.0,
            load_time_ms: 5,
            execution_overhead_ms: 1,
        };

        monitor.register_slot(EquipmentSlot::Memory, cost).await;

        let metrics = monitor.get_metrics(EquipmentSlot::Memory).await;
        assert!(metrics.is_some());
    }

    #[tokio::test]
    async fn test_metrics_update() {
        let monitor = ResourceMonitor::new();

        monitor.register_slot(
            EquipmentSlot::Memory,
            EquipmentCost {
                memory_mb: 1.0,
                cpu_percent: 5.0,
                load_time_ms: 5,
                execution_overhead_ms: 1,
            },
        ).await;

        monitor.update_metrics(
            EquipmentSlot::Memory,
            MetricsUpdate::MemoryUsed { mb: 2.5 },
        ).await.unwrap();

        let metrics = monitor.get_metrics(EquipmentSlot::Memory).await;
        assert_eq!(metrics.unwrap().memory_used_mb, 2.5);
    }

    #[tokio::test]
    async fn test_health_checks() {
        let monitor = ResourceMonitor::new();

        monitor.register_slot(
            EquipmentSlot::Memory,
            EquipmentCost {
                memory_mb: 1.0,
                cpu_percent: 5.0,
                load_time_ms: 5,
                execution_overhead_ms: 1,
            },
        ).await;

        monitor.update_health(
            EquipmentSlot::Memory,
            HealthStatus::Healthy,
            "All systems operational".to_string(),
        ).await;

        assert!(monitor.is_healthy(EquipmentSlot::Memory).await);
    }

    #[tokio::test]
    async fn test_total_usage() {
        let monitor = ResourceMonitor::new();

        for slot in [
            EquipmentSlot::Memory,
            EquipmentSlot::Reasoning,
            EquipmentSlot::Consensus,
        ] {
            monitor.register_slot(
                slot,
                EquipmentCost {
                    memory_mb: 1.0,
                    cpu_percent: 5.0,
                    load_time_ms: 5,
                    execution_overhead_ms: 1,
                },
            ).await;
        }

        let usage = monitor.get_total_usage().await;
        assert_eq!(usage.memory_mb, 3.0);
        assert_eq!(usage.cpu_percent, 15.0);
    }

    #[tokio::test]
    async fn test_benchmark_results() {
        let results = BenchmarkResults {
            slot: EquipmentSlot::Memory,
            equip_time_ms: 25.0,
            unequip_time_ms: 10.0,
            operation_overhead_ms: 2.0,
            memory_overhead_mb: 0.5,
            cpu_overhead_percent: 2.0,
            iterations: 100,
            timestamp: chrono::Utc::now(),
        };

        assert!(results.meets_targets());
    }
}
