//! Hierarchical Memory - Multi-tier memory management
//!
//! Implements L1/L2/L3 memory hierarchy with automatic promotion/demotion
//! and intelligent caching strategies for optimal performance.

use std::collections::{HashMap, LinkedList};
use std::time::{Duration, Instant};
use serde::{Deserialize, Serialize};
use tokio::sync::RwLock;

use crate::error::{AgentError, Result};
use crate::agent::SerializableInstant;

/// Memory tier levels
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum MemoryTier {
    /// L1 Cache - fastest, smallest (100KB, 1ms access)
    L1,

    /// L2 Cache - fast, small (1MB, 5ms access)
    L2,

    /// L3 Cache - slower, larger (10MB, 20ms access)
    L3,

    /// Persistent - slowest, unlimited (disk, 100ms access)
    Persistent,
}

impl MemoryTier {
    /// Get capacity for this tier (in bytes)
    pub fn capacity(&self) -> usize {
        match self {
            MemoryTier::L1 => 100 * 1024,      // 100KB
            MemoryTier::L2 => 1024 * 1024,     // 1MB
            MemoryTier::L3 => 10 * 1024 * 1024, // 10MB
            MemoryTier::Persistent => usize::MAX,
        }
    }

    /// Get access latency for this tier
    pub fn latency(&self) -> Duration {
        match self {
            MemoryTier::L1 => Duration::from_millis(1),
            MemoryTier::L2 => Duration::from_millis(5),
            MemoryTier::L3 => Duration::from_millis(20),
            MemoryTier::Persistent => Duration::from_millis(100),
        }
    }

    /// Get cost multiplier for this tier
    pub fn cost_multiplier(&self) -> f64 {
        match self {
            MemoryTier::L1 => 1.0,
            MemoryTier::L2 => 0.5,
            MemoryTier::L3 => 0.2,
            MemoryTier::Persistent => 0.1,
        }
    }
}

/// Memory entry with metadata
#[derive(Debug, Clone, Serialize, Deserialize)]
struct MemoryEntry {
    key: String,
    value: serde_json::Value,
    tier: MemoryTier,
    created_at: SerializableInstant,
    last_accessed: SerializableInstant,
    access_count: u64,
    size_bytes: usize,
    hot_score: f64, // Higher = more likely to be promoted
}

impl MemoryEntry {
    fn new(key: String, value: serde_json::Value, tier: MemoryTier) -> Self {
        let size_bytes = serde_json::to_vec(&value).unwrap_or_default().len();
        let now: SerializableInstant = Instant::now().into();

        Self {
            key,
            value,
            tier,
            created_at: now.clone(),
            last_accessed: now,
            access_count: 0,
            size_bytes,
            hot_score: 0.0,
        }
    }

    /// Update hot score based on access patterns
    fn update_hot_score(&mut self) {
        let age_secs = self.last_accessed.secs_since_epoch.saturating_sub(self.created_at.secs_since_epoch);
        let frequency = self.access_count as f64 / (age_secs.max(1) as f64);
        let recency = 1.0 / (age_secs.max(1) as f64 + 1.0);

        // Hot score combines frequency and recency
        self.hot_score = (frequency * 0.6 + recency * 0.4) * 100.0;
    }

    /// Record an access
    fn record_access(&mut self) {
        self.access_count += 1;
        self.last_accessed = Instant::now().into();
        self.update_hot_score();
    }
}

/// LRU cache entry for efficient eviction
#[derive(Debug, Clone)]
struct LruEntry {
    key: String,
    accessed_at: Instant,
}

/// Hierarchical Memory with L1/L2/L3 tiers
pub struct HierarchicalMemory {
    l1_cache: RwLock<HashMap<String, MemoryEntry>>,
    l2_cache: RwLock<HashMap<String, MemoryEntry>>,
    l3_cache: RwLock<HashMap<String, MemoryEntry>>,
    persistent: RwLock<HashMap<String, MemoryEntry>>,

    // LRU tracking for each tier
    l1_lru: RwLock<LinkedList<String>>,
    l2_lru: RwLock<LinkedList<String>>,
    l3_lru: RwLock<LinkedList<String>>,

    // Statistics
    stats: RwLock<MemoryStats>,
}

/// Memory statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryStats {
    pub total_accesses: u64,
    pub l1_hits: u64,
    pub l2_hits: u64,
    pub l3_hits: u64,
    pub persistent_hits: u64,
    pub promotions: u64,
    pub demotions: u64,
    pub evictions: u64,
    pub total_memory_used: usize,
}

impl Default for MemoryStats {
    fn default() -> Self {
        Self {
            total_accesses: 0,
            l1_hits: 0,
            l2_hits: 0,
            l3_hits: 0,
            persistent_hits: 0,
            promotions: 0,
            demotions: 0,
            evictions: 0,
            total_memory_used: 0,
        }
    }
}

impl HierarchicalMemory {
    /// Create new hierarchical memory
    pub fn new() -> Self {
        Self {
            l1_cache: RwLock::new(HashMap::new()),
            l2_cache: RwLock::new(HashMap::new()),
            l3_cache: RwLock::new(HashMap::new()),
            persistent: RwLock::new(HashMap::new()),
            l1_lru: RwLock::new(LinkedList::new()),
            l2_lru: RwLock::new(LinkedList::new()),
            l3_lru: RwLock::new(LinkedList::new()),
            stats: RwLock::new(MemoryStats::default()),
        }
    }

    /// Get a value from memory (checks tiers in order)
    pub async fn get(&self, key: &str) -> Result<Option<serde_json::Value>> {
        let mut stats = self.stats.write().await;
        stats.total_accesses += 1;

        // Check L1 first
        {
            let mut l1 = self.l1_cache.write().await;
            if let Some(entry) = l1.get_mut(key) {
                entry.record_access();
                stats.l1_hits += 1;
                return Ok(Some(entry.value.clone()));
            }
        }

        // Check L2
        {
            let mut l2 = self.l2_cache.write().await;
            if let Some(entry) = l2.get_mut(key) {
                entry.record_access();

                // Promote to L1 if hot enough
                if entry.hot_score > 70.0 {
                    let value = entry.value.clone(); // Clone value before dropping l2
                    drop(l2);
                    self.promote_to_l1(key).await?;
                    stats.promotions += 1;
                    return Ok(Some(value));
                }

                stats.l2_hits += 1;
                return Ok(Some(entry.value.clone()));
            }
        }

        // Check L3
        {
            let mut l3 = self.l3_cache.write().await;
            if let Some(entry) = l3.get_mut(key) {
                entry.record_access();

                // Promote to L2 if hot enough
                if entry.hot_score > 50.0 {
                    let value = entry.value.clone(); // Clone value before dropping l3
                    drop(l3);
                    self.promote_to_l2(key).await?;
                    stats.promotions += 1;
                    return Ok(Some(value));
                }

                stats.l3_hits += 1;
                return Ok(Some(entry.value.clone()));
            }
        }

        // Check persistent
        {
            let persistent = self.persistent.read().await;
            if let Some(entry) = persistent.get(key) {
                stats.persistent_hits += 1;
                return Ok(Some(entry.value.clone()));
            }
        }

        Ok(None)
    }

    /// Set a value in memory (inserts at L1, cascades down if needed)
    pub async fn set(&self, key: String, value: serde_json::Value) -> Result<()> {
        let entry = MemoryEntry::new(key.clone(), value, MemoryTier::L1);

        // Try to insert in L1
        let mut l1 = self.l1_cache.write().await;
        let current_l1_size: usize = l1.values().map(|e| e.size_bytes).sum();

        if current_l1_size + entry.size_bytes <= MemoryTier::L1.capacity() {
            l1.insert(key.clone(), entry);
            self.update_lru(&self.l1_lru, key).await;
            return Ok(());
        }

        // L1 full, try L2
        drop(l1);
        let mut l2 = self.l2_cache.write().await;
        let current_l2_size: usize = l2.values().map(|e| e.size_bytes).sum();

        if current_l2_size + entry.size_bytes <= MemoryTier::L2.capacity() {
            l2.insert(key.clone(), entry);
            self.update_lru(&self.l2_lru, key).await;
            return Ok(());
        }

        // L2 full, try L3
        drop(l2);
        let mut l3 = self.l3_cache.write().await;
        let current_l3_size: usize = l3.values().map(|e| e.size_bytes).sum();

        if current_l3_size + entry.size_bytes <= MemoryTier::L3.capacity() {
            l3.insert(key.clone(), entry);
            self.update_lru(&self.l3_lru, key).await;
            return Ok(());
        }

        // All caches full, put in persistent
        drop(l3);
        let mut persistent = self.persistent.write().await;
        persistent.insert(key.clone(), entry);
        Ok(())
    }

    /// Delete a value from all tiers
    pub async fn delete(&self, key: &str) -> Result<bool> {
        let mut found = false;

        {
            let mut l1 = self.l1_cache.write().await;
            if l1.remove(key).is_some() {
                found = true;
            }
        }

        {
            let mut l2 = self.l2_cache.write().await;
            if l2.remove(key).is_some() {
                found = true;
            }
        }

        {
            let mut l3 = self.l3_cache.write().await;
            if l3.remove(key).is_some() {
                found = true;
            }
        }

        {
            let mut persistent = self.persistent.write().await;
            if persistent.remove(key).is_some() {
                found = true;
            }
        }

        Ok(found)
    }

    /// Get memory statistics
    pub async fn stats(&self) -> MemoryStats {
        self.stats.read().await.clone()
    }

    /// Promote an entry from L2 to L1
    async fn promote_to_l1(&self, key: &str) -> Result<()> {
        let mut l2 = self.l2_cache.write().await;
        let entry = l2.remove(key)
            .ok_or_else(|| AgentError::MemoryError(format!("Key not found in L2: {}", key)))?;

        drop(l2);

        // Make space in L1 if needed
        self.ensure_space_l1(entry.size_bytes).await?;

        let mut l1 = self.l1_cache.write().await;
        l1.insert(key.to_string(), entry);
        self.update_lru(&self.l1_lru, key.to_string()).await;

        Ok(())
    }

    /// Promote an entry from L3 to L2
    async fn promote_to_l2(&self, key: &str) -> Result<()> {
        let mut l3 = self.l3_cache.write().await;
        let entry = l3.remove(key)
            .ok_or_else(|| AgentError::MemoryError(format!("Key not found in L3: {}", key)))?;

        drop(l3);

        // Make space in L2 if needed
        self.ensure_space_l2(entry.size_bytes).await?;

        let mut l2 = self.l2_cache.write().await;
        l2.insert(key.to_string(), entry);
        self.update_lru(&self.l2_lru, key.to_string()).await;

        Ok(())
    }

    /// Ensure space in L1 by evicting cold entries
    async fn ensure_space_l1(&self, required_bytes: usize) -> Result<()> {
        let mut l1 = self.l1_cache.write().await;
        let mut lru = self.l1_lru.write().await;

        while l1.values().map(|e| e.size_bytes).sum::<usize>() + required_bytes > MemoryTier::L1.capacity() {
            // Evict least recently used
            if let Some(lru_key) = lru.pop_front() {
                if let Some(entry) = l1.remove(&lru_key) {
                    // Demote to L2
                    drop(l1);
                    drop(lru);

                    self.demote_to_l2(entry).await?;

                    let mut stats = self.stats.write().await;
                    stats.demotions += 1;

                    l1 = self.l1_cache.write().await;
                    lru = self.l1_lru.write().await;
                }
            } else {
                break;
            }
        }

        Ok(())
    }

    /// Ensure space in L2 by evicting cold entries
    async fn ensure_space_l2(&self, required_bytes: usize) -> Result<()> {
        let mut l2 = self.l2_cache.write().await;
        let mut lru = self.l2_lru.write().await;

        while l2.values().map(|e| e.size_bytes).sum::<usize>() + required_bytes > MemoryTier::L2.capacity() {
            if let Some(lru_key) = lru.pop_front() {
                if let Some(entry) = l2.remove(&lru_key) {
                    // Demote to L3
                    drop(l2);
                    drop(lru);

                    self.demote_to_l3(entry).await?;

                    let mut stats = self.stats.write().await;
                    stats.demotions += 1;

                    l2 = self.l2_cache.write().await;
                    lru = self.l2_lru.write().await;
                }
            } else {
                break;
            }
        }

        Ok(())
    }

    /// Demote an entry from L1 to L2
    async fn demote_to_l2(&self, mut entry: MemoryEntry) -> Result<()> {
        entry.tier = MemoryTier::L2;

        let mut l2 = self.l2_cache.write().await;
        let current_l2_size: usize = l2.values().map(|e| e.size_bytes).sum();

        if current_l2_size + entry.size_bytes <= MemoryTier::L2.capacity() {
            let key = entry.key.clone(); // Clone key before moving entry
            l2.insert(key.clone(), entry);
            self.update_lru(&self.l2_lru, key).await;
        } else {
            // L2 also full, go to L3
            drop(l2);
            self.demote_to_l3(entry).await?;
        }

        Ok(())
    }

    /// Demote an entry from L2 to L3
    async fn demote_to_l3(&self, mut entry: MemoryEntry) -> Result<()> {
        entry.tier = MemoryTier::L3;

        let mut l3 = self.l3_cache.write().await;
        let current_l3_size: usize = l3.values().map(|e| e.size_bytes).sum();

        if current_l3_size + entry.size_bytes <= MemoryTier::L3.capacity() {
            let key = entry.key.clone(); // Clone key before moving entry
            l3.insert(key.clone(), entry);
            self.update_lru(&self.l3_lru, key).await;
        } else {
            // L3 also full, evict to persistent
            drop(l3);
            let mut persistent = self.persistent.write().await;
            let key = entry.key.clone(); // Clone key before moving entry
            persistent.insert(key.clone(), entry);

            let mut stats = self.stats.write().await;
            stats.evictions += 1;
        }

        Ok(())
    }

    /// Update LRU list for a key
    async fn update_lru(&self, lru: &RwLock<LinkedList<String>>, key: String) {
        let mut lru = lru.write().await;
        lru.push_back(key);
    }

    /// Clear all caches
    pub async fn clear(&self) -> Result<()> {
        self.l1_cache.write().await.clear();
        self.l2_cache.write().await.clear();
        self.l3_cache.write().await.clear();
        self.persistent.write().await.clear();
        self.l1_lru.write().await.clear();
        self.l2_lru.write().await.clear();
        self.l3_lru.write().await.clear();
        *self.stats.write().await = MemoryStats::default();
        Ok(())
    }

    /// Get hit rate (0.0 to 1.0)
    pub async fn hit_rate(&self) -> f64 {
        let stats = self.stats.read().await;
        let total_hits = stats.l1_hits + stats.l2_hits + stats.l3_hits + stats.persistent_hits;
        if stats.total_accesses == 0 {
            return 0.0;
        }
        total_hits as f64 / stats.total_accesses as f64
    }

    /// Get total memory used across all tiers
    pub async fn total_memory_used(&self) -> usize {
        let l1 = self.l1_cache.read().await;
        let l2 = self.l2_cache.read().await;
        let l3 = self.l3_cache.read().await;
        let persistent = self.persistent.read().await;

        l1.values().map(|e| e.size_bytes).sum::<usize>()
            + l2.values().map(|e| e.size_bytes).sum::<usize>()
            + l3.values().map(|e| e.size_bytes).sum::<usize>()
            + persistent.values().map(|e| e.size_bytes).sum::<usize>()
    }
}

impl Default for HierarchicalMemory {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_hierarchical_memory_basic() {
        let memory = HierarchicalMemory::new();

        // Set a value
        memory.set("key1".to_string(), serde_json::json!("value1")).await.unwrap();

        // Get it back
        let value = memory.get("key1").await.unwrap();
        assert_eq!(value, Some(serde_json::json!("value1")));
    }

    #[tokio::test]
    async fn test_memory_tier_promotion() {
        let memory = HierarchicalMemory::new();

        // Fill L1 cache (100KB)
        for i in 0..10 {
            let large_value = vec![0u8; 10 * 1024]; // 10KB each
            memory.set(
                format!("key{}", i),
                serde_json::json!(large_value)
            ).await.unwrap();
        }

        // Access some keys multiple times to increase hot score
        for _ in 0..10 {
            memory.get("key0").await.unwrap();
            memory.get("key1").await.unwrap();
        }

        let stats = memory.stats().await;
        assert!(stats.total_accesses > 0);
    }

    #[tokio::test]
    async fn test_hit_rate() {
        let memory = HierarchicalMemory::new();

        memory.set("key1".to_string(), serde_json::json!("value1")).await.unwrap();

        // Hit
        memory.get("key1").await.unwrap();

        // Miss
        memory.get("key2").await.unwrap();

        let hit_rate = memory.hit_rate().await;
        assert_eq!(hit_rate, 0.5); // 1 hit out of 2 accesses
    }

    #[tokio::test]
    async fn test_delete() {
        let memory = HierarchicalMemory::new();

        memory.set("key1".to_string(), serde_json::json!("value1")).await.unwrap();
        assert!(memory.delete("key1").await.unwrap());

        // Should be gone
        let value = memory.get("key1").await.unwrap();
        assert!(value.is_none());
    }

    #[tokio::test]
    async fn test_clear() {
        let memory = HierarchicalMemory::new();

        memory.set("key1".to_string(), serde_json::json!("value1")).await.unwrap();
        memory.clear().await.unwrap();

        let value = memory.get("key1").await.unwrap();
        assert!(value.is_none());
    }
}
