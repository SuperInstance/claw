/**
 * Cache Manager Tests
 * Testing various caching strategies and cache management
 */

import { CacheManager, CacheStrategy } from '../../src/utils/cacheManager';

describe('CacheManager', () => {
  let cacheManager: CacheManager;

  beforeEach(() => {
    cacheManager = new CacheManager();
    jest.clearAllMocks();
  });

  describe('LRU Cache Strategy', () => {
    it('should evict least recently used items', () => {
      const lru = cacheManager.createLRU(3);

      lru.set('key1', 'value1');
      lru.set('key2', 'value2');
      lru.set('key3', 'value3');

      expect(lru.get('key1')).toBe('value1');
      expect(lru.get('key2')).toBe('value2');
      expect(lru.get('key3')).toBe('value3');

      // Add one more item, should evict key1
      lru.set('key4', 'value4');

      expect(lru.get('key1')).toBeUndefined();
      expect(lru.get('key4')).toBe('value4');
    });

    it('should update LRU order on access', () => {
      const lru = cacheManager.createLRU(3);

      lru.set('key1', 'value1');
      lru.set('key2', 'value2');
      lru.set('key3', 'value3');

      // Access key1 to make it recently used
      lru.get('key1');

      // Add key4, should evict key2
      lru.set('key4', 'value4');

      expect(lru.get('key2')).toBeUndefined();
      expect(lru.get('key1')).toBe('value1');
    });

    it('should track cache size', () => {
      const lru = cacheManager.createLRU(5);

      lru.set('key1', 'value1');
      lru.set('key2', 'value2');
      lru.set('key3', 'value3');

      expect(lru.size).toBe(3);
    });

    it('should clear all items', () => {
      const lru = cacheManager.createLRU(3);

      lru.set('key1', 'value1');
      lru.set('key2', 'value2');

      lru.clear();

      expect(lru.size).toBe(0);
      expect(lru.get('key1')).toBeUndefined();
    });
  });

  describe('TTL Cache Strategy', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should expire items after TTL', async () => {
      const ttl = cacheManager.createTTL(1000);

      ttl.set('key1', 'value1');

      expect(ttl.get('key1')).toBe('value1');

      jest.advanceTimersByTime(1001);

      expect(ttl.get('key1')).toBeUndefined();
    });

    it('should refresh TTL on access', async () => {
      const ttl = cacheManager.createTTL(1000);

      ttl.set('key1', 'value1');

      jest.advanceTimersByTime(500);

      expect(ttl.get('key1')).toBe('value1');

      jest.advanceTimersByTime(600);

      // Should still exist because TTL was refreshed
      expect(ttl.get('key1')).toBe('value1');

      jest.advanceTimersByTime(501);

      expect(ttl.get('key1')).toBeUndefined();
    });

    it('should handle multiple TTL periods', async () => {
      const ttl = cacheManager.createTTL(500);

      ttl.set('key1', 'value1', 500);
      ttl.set('key2', 'value2', 1000);
      ttl.set('key3', 'value3', 1500);

      jest.advanceTimersByTime(501);

      expect(ttl.get('key1')).toBeUndefined();
      expect(ttl.get('key2')).toBe('value2');
      expect(ttl.get('key3')).toBe('value3');

      jest.advanceTimersByTime(501);

      expect(ttl.get('key2')).toBeUndefined();
      expect(ttl.get('key3')).toBe('value3');

      jest.advanceTimersByTime(501);

      expect(ttl.get('key3')).toBeUndefined();
    });
  });

  describe('LFU Cache Strategy', () => {
    it('should evict least frequently used items', () => {
      const lfu = cacheManager.createLFU(3);

      lfu.set('key1', 'value1');
      lfu.set('key2', 'value2');
      lfu.set('key3', 'value3');

      // Access key1 and key2 multiple times
      lfu.get('key1');
      lfu.get('key1');
      lfu.get('key2');

      // Add key4, should evict key3 (least frequently used)
      lfu.set('key4', 'value4');

      expect(lfu.get('key3')).toBeUndefined();
      expect(lfu.get('key1')).toBe('value1');
      expect(lfu.get('key2')).toBe('value2');
    });

    it('should track access frequency', () => {
      const lfu = cacheManager.createLFU(3);

      lfu.set('key1', 'value1');
      lfu.set('key2', 'value2');

      lfu.get('key1');
      lfu.get('key1');
      lfu.get('key1');
      lfu.get('key2');

      const freq1 = lfu.getFrequency('key1');
      const freq2 = lfu.getFrequency('key2');

      expect(freq1).toBe(3);
      expect(freq2).toBe(1);
    });
  });

  describe('ARC Cache Strategy', () => {
    it('should adapt between recency and frequency', () => {
      const arc = cacheManager.createARC(10);

      // Add items
      for (let i = 0; i < 20; i++) {
        arc.set(`key${i}`, `value${i}`);
      }

      // Should have adapted cache size
      expect(arc.size).toBeLessThanOrEqual(10);
    });

    it('should handle scan resistance', () => {
      const arc = cacheManager.createARC(5);

      // Populate cache
      for (let i = 0; i < 5; i++) {
        arc.set(`key${i}`, `value${i}`);
      }

      // Single scan through all items
      for (let i = 0; i < 5; i++) {
        arc.get(`key${i}`);
      }

      // Add new item, should not evict all scanned items
      arc.set('key5', 'value5');

      expect(arc.get('key0')).toBeDefined();
    });
  });

  describe('Multi-Layer Caching', () => {
    it('should check memory cache before disk cache', async () => {
      const multiCache = cacheManager.createMultiLayer([
        cacheManager.createLRU(10),
        cacheManager.createTTL(5000)
      ]);

      // Set in first layer
      multiCache.set('key1', 'value1');

      const value = multiCache.get('key1');
      expect(value).toBe('value1');

      // Should only be in first layer
      const stats = multiCache.getStats();
      expect(stats.hits).toBe(1);
    });

    it('should fall through to next layer on miss', async () => {
      const firstLayer = cacheManager.createLRU(2);
      const secondLayer = cacheManager.createLRU(5);

      const multiCache = cacheManager.createMultiLayer([
        firstLayer,
        secondLayer
      ]);

      // Fill first layer
      firstLayer.set('key1', 'value1');
      firstLayer.set('key2', 'value2');

      // Add to second layer
      secondLayer.set('key3', 'value3');

      // Get key3, should be in second layer
      const value = multiCache.get('key3');
      expect(value).toBe('value3');

      // Should promote to first layer
      expect(firstLayer.get('key3')).toBe('value3');
    });
  });

  describe('Distributed Caching', () => {
    it('should sync across multiple instances', async () => {
      const cache1 = cacheManager.createDistributed('cache1');
      const cache2 = cacheManager.createDistributed('cache2');

      await cache1.set('key1', 'value1');
      await cache1.sync();

      const value = await cache2.get('key1');
      expect(value).toBe('value1');
    });

    it('should handle concurrent writes', async () => {
      const cache = cacheManager.createDistributed('cache1');

      await Promise.all([
        cache.set('key1', 'value1'),
        cache.set('key1', 'value2'),
        cache.set('key1', 'value3')
      ]);

      const value = await cache.get('key1');
      expect(['value1', 'value2', 'value3']).toContain(value);
    });
  });

  describe('Cache Statistics', () => {
    it('should track hits and misses', () => {
      const cache = cacheManager.createLRU(5);

      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      cache.get('key1'); // hit
      cache.get('key2'); // hit
      cache.get('key3'); // miss

      const stats = cache.getStats();

      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBeCloseTo(0.667, 1);
    });

    it('should track evictions', () => {
      const cache = cacheManager.createLRU(2);

      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3'); // evicts key1

      const stats = cache.getStats();

      expect(stats.evictions).toBe(1);
    });

    it('should calculate memory usage', () => {
      const cache = cacheManager.createLRU(10);

      cache.set('key1', 'x'.repeat(100));
      cache.set('key2', 'y'.repeat(200));

      const stats = cache.getStats();

      expect(stats.memoryUsage).toBeGreaterThan(0);
    });
  });

  describe('Cache Warming', () => {
    it('should preload cache with data', async () => {
      const cache = cacheManager.createLRU(10);
      const data = {
        key1: 'value1',
        key2: 'value2',
        key3: 'value3'
      };

      await cache.warm(data);

      expect(cache.get('key1')).toBe('value1');
      expect(cache.get('key2')).toBe('value2');
      expect(cache.get('key3')).toBe('value3');
    });

    it('should warm cache from async source', async () => {
      const cache = cacheManager.createLRU(10);

      const dataSource = async () => ({
        key1: 'value1',
        key2: 'value2'
      });

      await cache.warmAsync(dataSource);

      expect(cache.get('key1')).toBe('value1');
      expect(cache.get('key2')).toBe('value2');
    });
  });

  describe('Cache Invalidation', () => {
    it('should invalidate by pattern', () => {
      const cache = cacheManager.createLRU(10);

      cache.set('user:1', 'user1');
      cache.set('user:2', 'user2');
      cache.set('post:1', 'post1');

      cache.invalidatePattern('user:*');

      expect(cache.get('user:1')).toBeUndefined();
      expect(cache.get('user:2')).toBeUndefined();
      expect(cache.get('post:1')).toBe('post1');
    });

    it('should invalidate by tag', () => {
      const cache = cacheManager.createLRU(10);

      cache.set('key1', 'value1', ['user']);
      cache.set('key2', 'value2', ['user']);
      cache.set('key3', 'value3', ['post']);

      cache.invalidateTag('user');

      expect(cache.get('key1')).toBeUndefined();
      expect(cache.get('key2')).toBeUndefined();
      expect(cache.get('key3')).toBe('value3');
    });

    it('should invalidate by time', async () => {
      jest.useFakeTimers();

      const cache = cacheManager.createLRU(10);

      cache.set('key1', 'value1');

      jest.advanceTimersByTime(1000);

      cache.invalidateOlderThan(500);

      expect(cache.get('key1')).toBeUndefined();

      jest.useRealTimers();
    });
  });

  describe('Cache Persistence', () => {
    it('should save cache to storage', async () => {
      const cache = cacheManager.createLRU(10);

      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      await cache.persist();

      const saved = await cache.load();

      expect(saved.get('key1')).toBe('value1');
      expect(saved.get('key2')).toBe('value2');
    });

    it('should load cache from storage', async () => {
      const cache = cacheManager.createLRU(10);

      const data = new Map([
        ['key1', 'value1'],
        ['key2', 'value2']
      ]);

      await cache.load(data);

      expect(cache.get('key1')).toBe('value1');
      expect(cache.get('key2')).toBe('value2');
    });
  });

  describe('Cache Compression', () => {
    it('should compress large values', () => {
      const cache = cacheManager.createLRU(10, { compress: true });

      const largeValue = 'x'.repeat(1000);
      cache.set('key1', largeValue);

      const stats = cache.getStats();

      expect(stats.compressedSize).toBeLessThan(stats.uncompressedSize);
    });

    it('should decompress on retrieval', () => {
      const cache = cacheManager.createLRU(10, { compress: true });

      const originalValue = 'x'.repeat(1000);
      cache.set('key1', originalValue);

      const retrievedValue = cache.get('key1');

      expect(retrievedValue).toBe(originalValue);
    });
  });

  describe('Cache Security', () => {
    it('should encrypt sensitive data', () => {
      const cache = cacheManager.createLRU(10, { encrypt: true, secret: 'test-secret' });

      cache.set('password', 'secret123');

      const encrypted = cache.getRaw('password');
      expect(encrypted).not.toBe('secret123');

      const decrypted = cache.get('password');
      expect(decrypted).toBe('secret123');
    });

    it('should sign cache entries', () => {
      const cache = cacheManager.createLRU(10, { sign: true, secret: 'test-secret' });

      cache.set('key1', 'value1');

      const signature = cache.getSignature('key1');
      expect(signature).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle cache errors gracefully', () => {
      const cache = cacheManager.createLRU(10);

      expect(() => {
        cache.set(null as any, 'value');
      }).not.toThrow();
    });

    it('should retry failed operations', async () => {
      const cache = cacheManager.createLRU(10);

      let attempts = 0;
      const failingOperation = jest.fn().mockImplementation(() => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Failed');
        }
        return 'success';
      });

      const result = await cache.retry(failingOperation, 3);

      expect(result).toBe('success');
      expect(attempts).toBe(3);
    });
  });

  describe('Performance', () => {
    it('should have O(1) get and set operations', () => {
      const cache = cacheManager.createLRU(1000);

      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        cache.set(`key${i}`, `value${i}`);
      }

      for (let i = 0; i < 1000; i++) {
        cache.get(`key${i}`);
      }

      const duration = performance.now() - start;

      expect(duration).toBeLessThan(100);
    });

    it('should handle concurrent access', async () => {
      const cache = cacheManager.createLRU(100);

      const promises = [];

      for (let i = 0; i < 100; i++) {
        promises.push(cache.set(`key${i}`, `value${i}`));
        promises.push(cache.get(`key${i}`));
      }

      await Promise.all(promises);

      expect(cache.size).toBe(100);
    });
  });
});
