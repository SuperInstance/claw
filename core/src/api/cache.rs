//! In-memory caching layer for performance optimization
//!
//! Provides thread-safe caching for frequently accessed data:
//! - Agent queries
//! - API responses
//! - Authentication results
//! - Spatial query results

use std::collections::HashMap;
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::RwLock;

/// Cache entry with expiration
#[derive(Clone)]
struct CacheEntry<T> {
    value: T,
    expires_at: Instant,
}

impl<T> CacheEntry<T> {
    fn new(value: T, ttl: Duration) -> Self {
        Self {
            value,
            expires_at: Instant::now() + ttl,
        }
    }

    fn is_expired(&self) -> bool {
        Instant::now() > self.expires_at
    }
}

/// Thread-safe in-memory cache
pub struct Cache<K, V>
where
    K: Eq + std::hash::Hash + Clone,
    V: Clone,
{
    entries: Arc<RwLock<HashMap<K, CacheEntry<V>>>>,
    max_size: usize,
    ttl: Duration,
}

impl<K, V> Cache<K, V>
where
    K: Eq + std::hash::Hash + Clone,
    V: Clone,
{
    /// Create a new cache with specified capacity and TTL
    pub fn new(max_size: usize, ttl: Duration) -> Self {
        Self {
            entries: Arc::new(RwLock::new(HashMap::with_capacity(max_size))),
            max_size,
            ttl,
        }
    }

    /// Get a value from the cache
    pub async fn get(&self, key: &K) -> Option<V> {
        let entries = self.entries.read().await;
        entries.get(key).and_then(|entry| {
            if entry.is_expired() {
                None
            } else {
                Some(entry.value.clone())
            }
        })
    }

    /// Insert a value into the cache
    pub async fn insert(&self, key: K, value: V) {
        let mut entries = self.entries.write().await;

        // Remove expired entries first
        if entries.len() >= self.max_size {
            entries.retain(|_, entry| !entry.is_expired());
        }

        // If still at capacity, remove oldest entry
        if entries.len() >= self.max_size {
            // Simple FIFO eviction - in production, use LRU
            if let Some(key_to_remove) = entries.keys().next().cloned() {
                entries.remove(&key_to_remove);
            }
        }

        entries.insert(key, CacheEntry::new(value, self.ttl));
    }

    /// Remove a specific entry
    pub async fn remove(&self, key: &K) {
        let mut entries = self.entries.write().await;
        entries.remove(key);
    }

    /// Clear all entries
    pub async fn clear(&self) {
        let mut entries = self.entries.write().await;
        entries.clear();
    }

    /// Get cache statistics
    pub async fn stats(&self) -> CacheStats {
        let entries = self.entries.read().await;
        let total = entries.len();
        let expired = entries.values().filter(|e| e.is_expired()).count();

        CacheStats {
            total_entries: total,
            expired_entries: expired,
            active_entries: total.saturating_sub(expired),
            max_size: self.max_size,
        }
    }
}

/// Cache statistics
#[derive(Debug, Clone, serde::Serialize)]
pub struct CacheStats {
    pub total_entries: usize,
    pub expired_entries: usize,
    pub active_entries: usize,
    pub max_size: usize,
}

/// Cache configuration
pub struct CacheConfig {
    /// Maximum number of entries per cache
    pub max_size: usize,

    /// Time-to-live for cache entries
    pub ttl: Duration,

    /// Cleanup interval for expired entries
    pub cleanup_interval: Duration,
}

impl Default for CacheConfig {
    fn default() -> Self {
        Self {
            max_size: 1000,
            ttl: Duration::from_secs(300), // 5 minutes
            cleanup_interval: Duration::from_secs(60), // 1 minute
        }
    }
}

/// Multi-cache manager for different data types
pub struct CacheManager {
    /// Agent query cache
    pub agents: Cache<String, serde_json::Value>,

    /// Authentication cache
    pub auth: Cache<String, String>,

    /// Spatial query cache
    pub spatial: Cache<String, serde_json::Value>,

    /// API response cache
    pub responses: Cache<String, serde_json::Value>,
}

impl CacheManager {
    /// Create a new cache manager with default configuration
    pub fn new() -> Self {
        let config = CacheConfig::default();

        Self {
            agents: Cache::new(config.max_size, config.ttl),
            auth: Cache::new(config.max_size, Duration::from_secs(3600)), // 1 hour for auth
            spatial: Cache::new(config.max_size, Duration::from_secs(60)), // 1 minute for spatial
            responses: Cache::new(config.max_size * 2, config.ttl),
        }
    }

    /// Create a new cache manager with custom configuration
    pub fn with_config(config: CacheConfig) -> Self {
        Self {
            agents: Cache::new(config.max_size, config.ttl),
            auth: Cache::new(config.max_size, Duration::from_secs(3600)),
            spatial: Cache::new(config.max_size, Duration::from_secs(60)),
            responses: Cache::new(config.max_size * 2, config.ttl),
        }
    }

    /// Get statistics for all caches
    pub async fn get_all_stats(&self) -> HashMap<String, CacheStats> {
        let mut stats = HashMap::new();

        stats.insert("agents".to_string(), self.agents.stats().await);
        stats.insert("auth".to_string(), self.auth.stats().await);
        stats.insert("spatial".to_string(), self.spatial.stats().await);
        stats.insert("responses".to_string(), self.responses.stats().await);

        stats
    }

    /// Clear all caches
    pub async fn clear_all(&self) {
        self.agents.clear().await;
        self.auth.clear().await;
        self.spatial.clear().await;
        self.responses.clear().await;
    }
}

impl Default for CacheManager {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tokio::time::sleep;

    #[tokio::test]
    async fn test_cache_insert_get() {
        let cache = Cache::new(10, Duration::from_secs(60));

        cache.insert("key1".to_string(), "value1".to_string()).await;
        let value = cache.get(&"key1".to_string()).await;

        assert_eq!(value, Some("value1".to_string()));
    }

    #[tokio::test]
    async fn test_cache_expiration() {
        let cache = Cache::new(10, Duration::from_millis(100));

        cache.insert("key1".to_string(), "value1".to_string()).await;
        sleep(Duration::from_millis(150)).await;

        let value = cache.get(&"key1".to_string()).await;
        assert_eq!(value, None);
    }

    #[tokio::test]
    async fn test_cache_max_size() {
        let cache = Cache::new(2, Duration::from_secs(60));

        cache.insert("key1".to_string(), "value1".to_string()).await;
        cache.insert("key2".to_string(), "value2".to_string()).await;
        cache.insert("key3".to_string(), "value3".to_string()).await;

        // First key should be evicted
        let value = cache.get(&"key1".to_string()).await;
        assert_eq!(value, None);
    }

    #[tokio::test]
    async fn test_cache_remove() {
        let cache = Cache::new(10, Duration::from_secs(60));

        cache.insert("key1".to_string(), "value1".to_string()).await;
        cache.remove(&"key1".to_string()).await;

        let value = cache.get(&"key1".to_string()).await;
        assert_eq!(value, None);
    }

    #[tokio::test]
    async fn test_cache_stats() {
        let cache = Cache::new(10, Duration::from_secs(60));

        cache.insert("key1".to_string(), "value1".to_string()).await;
        let stats = cache.stats().await;

        assert_eq!(stats.active_entries, 1);
        assert_eq!(stats.total_entries, 1);
    }

    #[tokio::test]
    async fn test_cache_manager() {
        let manager = CacheManager::new();

        manager
            .agents
            .insert("agent1".to_string(), serde_json::json!({"id": "agent1"}))
            .await;

        let value = manager.agents.get(&"agent1".to_string()).await;
        assert!(value.is_some());

        let stats = manager.get_all_stats().await;
        assert_eq!(stats.get("agents").unwrap().active_entries, 1);
    }
}
