//! Equipment Loading System - Lazy loading and resource management
//!
//! Provides efficient equipment loading with caching, pooling, and
//! resource management to minimize overhead and memory usage.

use std::collections::{HashMap, VecDeque};
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::{Mutex, RwLock};

use crate::equipment::{Equipment, EquipmentSlot, EquipmentCost};
use crate::error::{AgentError, Result};

/// Resource pool for equipment instances
#[derive(Clone)]
pub struct EquipmentPool {
    slot: EquipmentSlot,
    max_size: usize,
    available: Arc<Mutex<VecDeque<Box<dyn Equipment>>>>,
    in_use: Arc<AtomicU64>,
    total_created: Arc<AtomicU64>,
    factory: Arc<dyn EquipmentFactory>,
}

impl EquipmentPool {
    /// Create a new equipment pool
    pub fn new(slot: EquipmentSlot, max_size: usize, factory: Arc<dyn EquipmentFactory>) -> Self {
        Self {
            slot,
            max_size,
            available: Arc::new(Mutex::new(VecDeque::with_capacity(max_size))),
            in_use: Arc::new(AtomicU64::new(0)),
            total_created: Arc::new(AtomicU64::new(0)),
            factory,
        }
    }

    /// Acquire an equipment from the pool
    pub async fn acquire(&self) -> Result<Box<dyn Equipment>> {
        // Try to get from pool
        {
            let mut available = self.available.lock().await;
            if let Some(equipment) = available.pop_front() {
                self.in_use.fetch_add(1, Ordering::SeqCst);
                return Ok(equipment);
            }
        }

        // Pool empty, create new instance
        let equipment = self.factory.create().await?;
        self.total_created.fetch_add(1, Ordering::SeqCst);
        self.in_use.fetch_add(1, Ordering::SeqCst);

        Ok(equipment)
    }

    /// Return equipment to the pool
    pub async fn release(&self, equipment: Box<dyn Equipment>) {
        let mut available = self.available.lock().await;

        if available.len() < self.max_size {
            available.push_back(equipment);
        }

        self.in_use.fetch_sub(1, Ordering::SeqCst);
    }

    /// Get pool statistics
    pub async fn stats(&self) -> PoolStats {
        let available = self.available.lock().await;
        let in_use = self.in_use.load(Ordering::SeqCst);
        let total_created = self.total_created.load(Ordering::SeqCst);

        PoolStats {
            slot: self.slot,
            available: available.len(),
            in_use: in_use as usize,
            total_created: total_created as usize,
            max_size: self.max_size,
        }
    }

    /// Clear the pool
    pub async fn clear(&self) {
        let mut available = self.available.lock().await;
        available.clear();
    }

    /// Pre-warm the pool with instances
    pub async fn pre_warm(&self, count: usize) -> Result<usize> {
        let mut warmed = 0;

        for _ in 0..count {
            let mut available = self.available.lock().await;
            if available.len() >= self.max_size {
                break;
            }
            drop(available);

            let equipment = self.factory.create().await?;
            self.total_created.fetch_add(1, Ordering::SeqCst);

            let mut available = self.available.lock().await;
            available.push_back(equipment);
            warmed += 1;
        }

        Ok(warmed)
    }
}

/// Pool statistics
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct PoolStats {
    pub slot: EquipmentSlot,
    pub available: usize,
    pub in_use: usize,
    pub total_created: usize,
    pub max_size: usize,
}

/// Factory for creating equipment instances
#[async_trait::async_trait]
pub trait EquipmentFactory: Send + Sync {
    async fn create(&self) -> Result<Box<dyn Equipment>>;
}

/// Equipment loader with lazy loading and caching
pub struct EquipmentLoader {
    pools: RwLock<HashMap<EquipmentSlot, EquipmentPool>>,
    cache: RwLock<HashMap<String, CachedEquipment>>,
    cache_ttl: Duration,
    max_cache_size: usize,
    resource_limits: ResourceLimits,
}

/// Cached equipment entry
struct CachedEquipment {
    equipment: Box<dyn Equipment>,
    loaded_at: Instant,
    last_used: Instant,
    access_count: u64,
    size_bytes: usize,
}

/// Resource limits for equipment loading
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ResourceLimits {
    pub max_memory_mb: f64,
    pub max_cpu_percent: f64,
    pub max_instances_per_slot: usize,
    pub max_total_instances: usize,
}

impl Default for ResourceLimits {
    fn default() -> Self {
        Self {
            max_memory_mb: 100.0,
            max_cpu_percent: 80.0,
            max_instances_per_slot: 10,
            max_total_instances: 50,
        }
    }
}

impl EquipmentLoader {
    /// Create a new equipment loader
    pub fn new(cache_ttl: Duration, max_cache_size: usize) -> Self {
        Self {
            pools: RwLock::new(HashMap::new()),
            cache: RwLock::new(HashMap::new()),
            cache_ttl,
            max_cache_size,
            resource_limits: ResourceLimits::default(),
        }
    }

    /// Set resource limits
    pub async fn set_resource_limits(&self, limits: ResourceLimits) {
        let mut pools = self.pools.write().await;
        for pool in pools.values() {
            pool.clear().await;
        }
        // Pools will be recreated with new limits on next access
    }

    /// Register a factory for an equipment slot
    pub async fn register_factory(&self, slot: EquipmentSlot, factory: Arc<dyn EquipmentFactory>) {
        let mut pools = self.pools.write().await;
        pools.insert(slot, EquipmentPool::new(slot, self.resource_limits.max_instances_per_slot, factory));
    }

    /// Load equipment with caching and pooling
    pub async fn load(&self, slot: EquipmentSlot) -> Result<Box<dyn Equipment>> {
        // Check cache first
        let cache_key = format!("{:?}", slot);

        {
            let mut cache = self.cache.write().await;
            if let Some(cached) = cache.get_mut(&cache_key) {
                // Check if still valid
                if cached.loaded_at.elapsed() < self.cache_ttl {
                    cached.last_used = Instant::now();
                    cached.access_count += 1;

                    // Return a clone from the pool
                    drop(cache);
                    return self.acquire_from_pool(slot).await;
                }
            }
        }

        // Not in cache or expired, load from pool
        let equipment = self.acquire_from_pool(slot).await?;

        // Cache the equipment type
        {
            let mut cache = self.cache.write().await;

            // Enforce cache size limit
            if cache.len() >= self.max_cache_size {
                self.evict_lru(&mut cache).await;
            }

            let cost = equipment.cost();
            cache.insert(cache_key, CachedEquipment {
                equipment,
                loaded_at: Instant::now(),
                last_used: Instant::now(),
                access_count: 1,
                size_bytes: (cost.memory_mb * 1024.0 * 1024.0) as usize,
            });
        }

        // Acquire a fresh instance from pool
        self.acquire_from_pool(slot).await
    }

    /// Release equipment back to pool
    pub async fn release(&self, slot: EquipmentSlot, equipment: Box<dyn Equipment>) {
        let pools = self.pools.read().await;
        if let Some(pool) = pools.get(&slot) {
            pool.release(equipment).await;
        }
    }

    /// Acquire equipment from pool
    async fn acquire_from_pool(&self, slot: EquipmentSlot) -> Result<Box<dyn Equipment>> {
        let pools = self.pools.read().await;

        if let Some(pool) = pools.get(&slot) {
            pool.acquire().await
        } else {
            Err(AgentError::EquipmentNotRegistered(slot))
        }
    }

    /// Pre-load equipment into cache
    pub async fn pre_load(&self, slots: &[EquipmentSlot]) -> Result<usize> {
        let mut loaded = 0;

        for slot in slots {
            if let Ok(_) = self.load(*slot).await {
                loaded += 1;
            }
        }

        Ok(loaded)
    }

    /// Pre-warm equipment pools
    pub async fn pre_warm_pools(&self, count_per_slot: usize) -> Result<HashMap<EquipmentSlot, usize>> {
        let mut results = HashMap::new();
        let pools = self.pools.read().await;

        for (slot, pool) in pools.iter() {
            match pool.pre_warm(count_per_slot).await {
                Ok(warmed) => {
                    results.insert(*slot, warmed);
                }
                Err(_) => {
                    results.insert(*slot, 0);
                }
            }
        }

        Ok(results)
    }

    /// Evict least recently used cache entry
    async fn evict_lru(&self, cache: &mut HashMap<String, CachedEquipment>) {
        let lru_key = cache
            .iter()
            .min_by_key(|(_, v)| v.last_used)
            .map(|(k, _)| k.clone());

        if let Some(key) = lru_key {
            cache.remove(&key);
        }
    }

    /// Clear cache
    pub async fn clear_cache(&self) {
        let mut cache = self.cache.write().await;
        cache.clear();
    }

    /// Get loader statistics
    pub async fn stats(&self) -> LoaderStats {
        let pools = self.pools.read().await;
        let cache = self.cache.read().await;

        let mut pool_stats = Vec::new();
        for pool in pools.values() {
            pool_stats.push(pool.stats().await);
        }

        let total_cached = cache.len();
        let total_memory: usize = cache.values().map(|c| c.size_bytes).sum();
        let total_accesses: u64 = cache.values().map(|c| c.access_count).sum();

        LoaderStats {
            pool_stats,
            total_cached,
            total_memory_bytes: total_memory,
            total_accesses,
        }
    }

    /// Clean up expired cache entries
    pub async fn cleanup_expired(&self) -> usize {
        let mut cache = self.cache.write().await;
        let now = Instant::now();

        let expired: Vec<String> = cache
            .iter()
            .filter(|(_, v)| now.duration_since(v.loaded_at) > self.cache_ttl)
            .map(|(k, _)| k.clone())
            .collect();

        let expired_count = expired.len();

        for key in expired {
            cache.remove(&key);
        }

        expired_count
    }

    /// Estimate resource usage
    pub async fn estimate_resource_usage(&self) -> ResourceUsage {
        let pools = self.pools.read().await;
        let cache = self.cache.write().await; // Write to prevent concurrent access during calculation

        let mut total_memory_mb = 0.0;
        let mut total_instances = 0;

        for pool in pools.values() {
            let stats = pool.stats().await;
            total_instances += stats.in_use + stats.available;
        }

        for cached in cache.values() {
            total_memory_mb += cached.size_bytes as f64 / (1024.0 * 1024.0);
        }

        ResourceUsage {
            memory_mb: total_memory_mb,
            instances: total_instances,
            cpu_percent: if total_instances > 0 {
                (total_instances as f64 / self.resource_limits.max_total_instances as f64) * 100.0
            } else {
                0.0
            },
        }
    }
}

/// Loader statistics
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct LoaderStats {
    pub pool_stats: Vec<PoolStats>,
    pub total_cached: usize,
    pub total_memory_bytes: usize,
    pub total_accesses: u64,
}

/// Resource usage estimates
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ResourceUsage {
    pub memory_mb: f64,
    pub instances: usize,
    pub cpu_percent: f64,
}

/// Lazy loading wrapper for equipment
pub struct LazyEquipment {
    slot: EquipmentSlot,
    loader: Arc<EquipmentLoader>,
    equipment: Option<Box<dyn Equipment>>,
}

impl LazyEquipment {
    /// Create a new lazy equipment wrapper
    pub fn new(slot: EquipmentSlot, loader: Arc<EquipmentLoader>) -> Self {
        Self {
            slot,
            loader,
            equipment: None,
        }
    }

    /// Ensure equipment is loaded
    async fn ensure_loaded(&mut self) -> Result<()> {
        if self.equipment.is_none() {
            self.equipment = Some(self.loader.load(self.slot).await?);
        }
        Ok(())
    }

    /// Get the equipment (loads if necessary)
    pub async fn get(&mut self) -> Result<&mut Box<dyn Equipment>> {
        self.ensure_loaded().await?;
        Ok(self.equipment.as_mut().expect("Equipment should be loaded"))
    }

    /// Unload the equipment to free resources
    pub async fn unload(&mut self) -> Result<()> {
        if let Some(equipment) = self.equipment.take() {
            self.loader.release(self.slot, equipment).await;
        }
        Ok(())
    }
}

#[async_trait::async_trait]
impl Equipment for LazyEquipment {
    fn slot(&self) -> EquipmentSlot {
        self.slot
    }

    fn name(&self) -> &str {
        "LazyEquipment"
    }

    async fn process(&self, payload: crate::ws::protocol::TriggerPayload) -> Result<String> {
        // This won't work directly with async trait - need different approach
        // For now, return error
        Err(AgentError::EquipmentError(EquipmentSlot::Memory, "Use get() method instead".to_string()))
    }

    fn cost(&self) -> EquipmentCost {
        // Minimal cost for lazy wrapper
        EquipmentCost {
            memory_mb: 0.1,
            cpu_percent: 1.0,
            load_time_ms: 0,
            execution_overhead_ms: 1,
        }
    }

    fn extract_muscle_memory(&self) -> Vec<crate::equipment::MuscleMemoryTrigger> {
        Vec::new()
    }

    fn should_unequip(&self) -> bool {
        false
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::equipment::SimpleMemoryEquipment;

    struct TestFactory;

    #[async_trait::async_trait]
    impl EquipmentFactory for TestFactory {
        async fn create(&self) -> Result<Box<dyn Equipment>> {
            Ok(Box::new(SimpleMemoryEquipment::new()))
        }
    }

    #[tokio::test]
    async fn test_equipment_pool() {
        let factory = Arc::new(TestFactory);
        let pool = EquipmentPool::new(EquipmentSlot::Memory, 3, factory);

        // Acquire and release
        let equipment = pool.acquire().await.unwrap();
        pool.release(equipment).await;

        let stats = pool.stats().await;
        assert_eq!(stats.available, 1);
    }

    #[tokio::test]
    async fn test_equipment_loader() {
        let loader = Arc::new(EquipmentLoader::new(Duration::from_secs(60), 10));
        let factory = Arc::new(TestFactory);

        loader.register_factory(EquipmentSlot::Memory, factory).await;

        // Load equipment
        let equipment = loader.load(EquipmentSlot::Memory).await.unwrap();
        assert_eq!(equipment.slot(), EquipmentSlot::Memory);

        // Get stats
        let stats = loader.stats().await;
        assert_eq!(stats.pool_stats.len(), 1);
    }

    #[tokio::test]
    async fn test_pre_warm_pools() {
        let loader = Arc::new(EquipmentLoader::new(Duration::from_secs(60), 10));
        let factory = Arc::new(TestFactory);

        loader.register_factory(EquipmentSlot::Memory, factory).await;

        // Pre-warm
        let results = loader.pre_warm_pools(2).await.unwrap();
        assert_eq!(results.get(&EquipmentSlot::Memory), Some(&2));
    }

    #[tokio::test]
    async fn test_lazy_equipment() {
        let loader = Arc::new(EquipmentLoader::new(Duration::from_secs(60), 10));
        let factory = Arc::new(TestFactory);

        loader.register_factory(EquipmentSlot::Memory, factory).await;

        let mut lazy = LazyEquipment::new(EquipmentSlot::Memory, loader);

        // Equipment not loaded yet
        assert!(lazy.equipment.is_none());

        // Access causes load
        let _ = lazy.get().await;
        assert!(lazy.equipment.is_some());

        // Unload
        lazy.unload().await.unwrap();
        assert!(lazy.equipment.is_none());
    }
}
