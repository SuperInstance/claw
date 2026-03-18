//! Performance optimization utilities for Claw agents
//!
//! Provides memory pooling, async optimization, and trigger caching

use std::collections::VecDeque;
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::Semaphore;
use tokio::time::timeout;

use crate::messages::{Message, TriggerPayload};

/// Performance configuration
#[derive(Debug, Clone)]
pub struct PerformanceConfig {
    /// Maximum concurrent agent operations
    pub max_concurrent_ops: usize,

    /// Trigger cache TTL
    pub trigger_cache_ttl: Duration,

    /// Memory pool size
    pub memory_pool_size: usize,

    /// Batch processing size
    pub batch_size: usize,
}

impl Default for PerformanceConfig {
    fn default() -> Self {
        Self {
            max_concurrent_ops: 100,
            trigger_cache_ttl: Duration::from_secs(60),
            memory_pool_size: 1000,
            batch_size: 50,
        }
    }
}

/// Trigger cache entry
#[derive(Debug, Clone)]
struct CacheEntry {
    payload: TriggerPayload,
    timestamp: Instant,
}

/// Trigger cache for reducing redundant processing
pub struct TriggerCache {
    entries: VecDeque<CacheEntry>,
    ttl: Duration,
    max_size: usize,
}

impl TriggerCache {
    pub fn new(ttl: Duration, max_size: usize) -> Self {
        Self {
            entries: VecDeque::with_capacity(max_size),
            ttl,
            max_size,
        }
    }

    /// Check if trigger was recently processed
    pub fn contains(&self, payload: &TriggerPayload) -> bool {
        let now = Instant::now();

        self.entries
            .iter()
            .any(|entry| {
                entry.payload == *payload && now.duration_since(entry.timestamp) < self.ttl
            })
    }

    /// Add trigger to cache
    pub fn insert(&mut self, payload: TriggerPayload) {
        // Evict old entries
        let now = Instant::now();
        while let Some(entry) = self.entries.front() {
            if now.duration_since(entry.timestamp) >= self.ttl {
                self.entries.pop_front();
            } else {
                break;
            }
        }

        // Add new entry
        self.entries.push_back(CacheEntry {
            payload,
            timestamp: now,
        });

        // Enforce max size
        while self.entries.len() > self.max_size {
            self.entries.pop_front();
        }
    }

    /// Clear cache
    pub fn clear(&mut self) {
        self.entries.clear();
    }

    /// Get cache statistics
    pub fn stats(&self) -> CacheStats {
        CacheStats {
            size: self.entries.len(),
            max_size: self.max_size,
            ttl: self.ttl,
        }
    }
}

/// Cache statistics
#[derive(Debug, Clone)]
pub struct CacheStats {
    pub size: usize,
    pub max_size: usize,
    pub ttl: Duration,
}

/// Message batch for efficient processing
pub struct MessageBatch {
    messages: Vec<Message>,
    config: PerformanceConfig,
}

impl MessageBatch {
    pub fn new(config: PerformanceConfig) -> Self {
        Self {
            messages: Vec::with_capacity(config.batch_size),
            config,
        }
    }

    /// Add message to batch
    pub fn add(&mut self, message: Message) -> bool {
        self.messages.push(message);
        self.messages.len() >= self.config.batch_size
    }

    /// Check if batch is ready to process
    pub fn is_ready(&self) -> bool {
        !self.messages.is_empty() && self.messages.len() >= self.config.batch_size
    }

    /// Get batch size
    pub fn len(&self) -> usize {
        self.messages.len()
    }

    /// Check if batch is empty
    pub fn is_empty(&self) -> bool {
        self.messages.is_empty()
    }

    /// Drain messages from batch
    pub fn drain(&mut self) -> Vec<Message> {
        std::mem::replace(&mut self.messages, Vec::with_capacity(self.config.batch_size))
    }

    /// Clear batch
    pub fn clear(&mut self) {
        self.messages.clear();
    }
}

/// Concurrent operation limiter
pub struct ConcurrencyLimiter {
    semaphore: Arc<Semaphore>,
}

impl ConcurrencyLimiter {
    pub fn new(max_concurrent: usize) -> Self {
        Self {
            semaphore: Arc::new(Semaphore::new(max_concurrent)),
        }
    }

    /// Acquire permit for operation
    pub async fn acquire(&self) -> Result<Permit, tokio::time::error::Elapsed> {
        timeout(Duration::from_secs(5), self.semaphore.acquire()).await?.map(|permit| Permit {
            _permit: permit,
        })
    }

    /// Get available permits
    pub fn available_permits(&self) -> usize {
        self.semaphore.available_permits()
    }
}

/// Permit for concurrent operation
pub struct Permit {
    _permit: tokio::sync::SemaphorePermit<'static>,
}

/// Performance metrics
#[derive(Debug, Clone, Default)]
pub struct PerformanceMetrics {
    pub total_operations: u64,
    pub cache_hits: u64,
    pub cache_misses: u64,
    pub avg_latency_ms: f64,
    pub p95_latency_ms: f64,
    pub p99_latency_ms: f64,
}

impl PerformanceMetrics {
    /// Record cache hit
    pub fn record_cache_hit(&mut self) {
        self.cache_hits += 1;
        self.total_operations += 1;
    }

    /// Record cache miss
    pub fn record_cache_miss(&mut self) {
        self.cache_misses += 1;
        self.total_operations += 1;
    }

    /// Calculate cache hit rate
    pub fn cache_hit_rate(&self) -> f64 {
        if self.total_operations == 0 {
            return 0.0;
        }
        self.cache_hits as f64 / self.total_operations as f64
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_trigger_cache() {
        let mut cache = TriggerCache::new(Duration::from_secs(1), 10);

        let payload = TriggerPayload::Data {
            cell_ref: "A1".to_string(),
            new_value: serde_json::json!(42),
            old_value: None,
        };

        assert!(!cache.contains(&payload));
        cache.insert(payload.clone());
        assert!(cache.contains(&payload));
    }

    #[test]
    fn test_message_batch() {
        let config = PerformanceConfig::default();
        let mut batch = MessageBatch::new(config);

        assert!(batch.is_empty());

        for i in 0..config.batch_size {
            batch.add(Message::Cancel {
                id: format!("msg-{}", i),
            });
        }

        assert!(batch.is_ready());
        assert_eq!(batch.len(), config.batch_size);
    }

    #[test]
    fn test_concurrency_limiter() {
        let limiter = ConcurrencyLimiter::new(5);
        assert_eq!(limiter.available_permits(), 5);
    }

    #[test]
    fn test_performance_metrics() {
        let mut metrics = PerformanceMetrics::default();

        metrics.record_cache_hit();
        metrics.record_cache_hit();
        metrics.record_cache_miss();

        assert_eq!(metrics.cache_hits, 2);
        assert_eq!(metrics.cache_misses, 1);
        assert!((metrics.cache_hit_rate() - 0.666).abs() < 0.01);
    }
}
