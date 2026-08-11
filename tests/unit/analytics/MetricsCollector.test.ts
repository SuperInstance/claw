/**
 * MetricsCollector Unit Tests
 * Testing metrics collection, aggregation, and storage
 */

import { MetricsCollector, MetricType, MetricData } from '../../../src/analytics/MetricsCollector';
import { createMockDatabase } from '../../mocks/database.mock';
import { generateMockMetrics, createMockUser } from '../../helpers/test-helpers';

describe('MetricsCollector', () => {
  let collector: MetricsCollector;
  let mockDb: any;

  beforeEach(() => {
    mockDb = createMockDatabase();
    collector = new MetricsCollector({
      database: mockDb,
      bufferSize: 100,
      flushInterval: 1000,
    });
  });

  afterEach(async () => {
    await collector.shutdown();
  });

  describe('Initialization', () => {
    it('should initialize with default config', () => {
      const defaultCollector = new MetricsCollector();
      expect(defaultCollector).toBeInstanceOf(MetricsCollector);
    });

    it('should initialize with custom config', () => {
      const customCollector = new MetricsCollector({
        bufferSize: 50,
        flushInterval: 500,
      });
      expect(customCollector).toBeInstanceOf(MetricsCollector);
      customCollector.shutdown();
    });

    it('should connect to database on init', async () => {
      await collector.initialize();
      expect(mockDb.connect).toHaveBeenCalled();
    });

    it('should throw error if database connection fails', async () => {
      mockDb.connect.mockRejectedValueOnce(new Error('Connection failed'));
      await expect(collector.initialize()).rejects.toThrow('Connection failed');
    });
  });

  describe('Metric Collection', () => {
    beforeEach(async () => {
      await collector.initialize();
    });

    it('should collect counter metric', () => {
      const metric: MetricData = {
        type: MetricType.Counter,
        name: 'user.actions',
        value: 1,
        timestamp: Date.now(),
        labels: { action: 'click' },
      };

      collector.collect(metric);
      expect(collector.getBufferLength()).toBe(1);
    });

    it('should collect gauge metric', () => {
      const metric: MetricData = {
        type: MetricType.Gauge,
        name: 'memory.usage',
        value: 1024,
        timestamp: Date.now(),
        labels: { unit: 'mb' },
      };

      collector.collect(metric);
      expect(collector.getBufferLength()).toBe(1);
    });

    it('should collect histogram metric', () => {
      const metric: MetricData = {
        type: MetricType.Histogram,
        name: 'request.duration',
        value: 150,
        timestamp: Date.now(),
        labels: { endpoint: '/api/users' },
      };

      collector.collect(metric);
      expect(collector.getBufferLength()).toBe(1);
    });

    it('should collect summary metric', () => {
      const metric: MetricData = {
        type: MetricType.Summary,
        name: 'response.size',
        value: 2048,
        timestamp: Date.now(),
        labels: { unit: 'bytes' },
      };

      collector.collect(metric);
      expect(collector.getBufferLength()).toBe(1);
    });

    it('should collect multiple metrics', () => {
      const metrics = generateMockMetrics(10);

      metrics.forEach((metric) => {
        collector.collect({
          type: MetricType.Counter,
          name: metric.label,
          value: metric.value,
          timestamp: metric.timestamp,
          labels: {},
        });
      });

      expect(collector.getBufferLength()).toBe(10);
    });

    it('should validate metric type', () => {
      const invalidMetric = {
        type: 'invalid',
        name: 'test',
        value: 1,
        timestamp: Date.now(),
        labels: {},
      };

      expect(() => collector.collect(invalidMetric as any)).toThrow();
    });

    it('should validate metric name is not empty', () => {
      const invalidMetric = {
        type: MetricType.Counter,
        name: '',
        value: 1,
        timestamp: Date.now(),
        labels: {},
      };

      expect(() => collector.collect(invalidMetric)).toThrow();
    });

    it('should validate metric value is number', () => {
      const invalidMetric = {
        type: MetricType.Counter,
        name: 'test',
        value: 'not a number' as any,
        timestamp: Date.now(),
        labels: {},
      };

      expect(() => collector.collect(invalidMetric)).toThrow();
    });

    it('should validate timestamp is provided', () => {
      const invalidMetric = {
        type: MetricType.Counter,
        name: 'test',
        value: 1,
        timestamp: undefined as any,
        labels: {},
      };

      expect(() => collector.collect(invalidMetric)).toThrow();
    });

    it('should add default timestamp if missing', () => {
      const metric = {
        type: MetricType.Counter,
        name: 'test',
        value: 1,
        labels: {},
      };

      collector.collect(metric as any);
      expect(collector.getBufferLength()).toBe(1);
    });
  });

  describe('Metric Aggregation', () => {
    beforeEach(async () => {
      await collector.initialize();
    });

    it('should aggregate counter metrics by sum', () => {
      for (let i = 0; i < 5; i++) {
        collector.collect({
          type: MetricType.Counter,
          name: 'requests.total',
          value: 1,
          timestamp: Date.now(),
          labels: {},
        });
      }

      const aggregated = collector.aggregate('requests.total');
      expect(aggregated.sum).toBe(5);
      expect(aggregated.count).toBe(5);
    });

    it('should aggregate gauge metrics by latest value', () => {
      collector.collect({
        type: MetricType.Gauge,
        name: 'temperature',
        value: 20,
        timestamp: Date.now(),
        labels: {},
      });

      collector.collect({
        type: MetricType.Gauge,
        name: 'temperature',
        value: 25,
        timestamp: Date.now(),
        labels: {},
      });

      const aggregated = collector.aggregate('temperature');
      expect(aggregated.latest).toBe(25);
    });

    it('should calculate histogram statistics', () => {
      const values = [10, 20, 30, 40, 50];
      values.forEach((value) => {
        collector.collect({
          type: MetricType.Histogram,
          name: 'latency',
          value,
          timestamp: Date.now(),
          labels: {},
        });
      });

      const aggregated = collector.aggregate('latency');
      expect(aggregated.min).toBe(10);
      expect(aggregated.max).toBe(50);
      expect(aggregated.avg).toBe(30);
      expect(aggregated.count).toBe(5);
    });

    it('should calculate percentiles for histogram', () => {
      const values = Array.from({ length: 100 }, (_, i) => i + 1);
      values.forEach((value) => {
        collector.collect({
          type: MetricType.Histogram,
          name: 'response_time',
          value,
          timestamp: Date.now(),
          labels: {},
        });
      });

      const aggregated = collector.aggregate('response_time');
      expect(aggregated.p50).toBeCloseTo(50, 0);
      expect(aggregated.p90).toBeCloseTo(90, 0);
      expect(aggregated.p95).toBeCloseTo(95, 0);
      expect(aggregated.p99).toBeCloseTo(99, 0);
    });

    it('should aggregate by labels', () => {
      collector.collect({
        type: MetricType.Counter,
        name: 'requests',
        value: 1,
        timestamp: Date.now(),
        labels: { method: 'GET', status: '200' },
      });

      collector.collect({
        type: MetricType.Counter,
        name: 'requests',
        value: 1,
        timestamp: Date.now(),
        labels: { method: 'POST', status: '200' },
      });

      const aggregated = collector.aggregateByLabel('requests', 'method');
      expect(aggregated['GET']).toBeDefined();
      expect(aggregated['POST']).toBeDefined();
    });
  });

  describe('Buffer Management', () => {
    beforeEach(async () => {
      await collector.initialize();
    });

    it('should flush buffer when size limit reached', async () => {
      const smallCollector = new MetricsCollector({
        database: mockDb,
        bufferSize: 5,
        flushInterval: 10000,
      });
      await smallCollector.initialize();

      const flushSpy = jest.spyOn(smallCollector as any, 'flush');

      for (let i = 0; i < 6; i++) {
        smallCollector.collect({
          type: MetricType.Counter,
          name: 'test',
          value: 1,
          timestamp: Date.now(),
          labels: {},
        });
      }

      // Wait for async flush
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(flushSpy).toHaveBeenCalled();
      await smallCollector.shutdown();
    });

    it('should flush buffer on interval', async () => {
      jest.useFakeTimers();

      const flushSpy = jest.spyOn(collector as any, 'flush');

      collector.collect({
        type: MetricType.Counter,
        name: 'test',
        value: 1,
        timestamp: Date.now(),
        labels: {},
      });

      jest.advanceTimersByTime(1000);
      await Promise.resolve();

      expect(flushSpy).toHaveBeenCalled();

      jest.useRealTimers();
    });

    it('should clear buffer after flush', async () => {
      for (let i = 0; i < 3; i++) {
        collector.collect({
          type: MetricType.Counter,
          name: 'test',
          value: 1,
          timestamp: Date.now(),
          labels: {},
        });
      }

      await collector.flush();
      expect(collector.getBufferLength()).toBe(0);
    });

    it('should persist metrics to database on flush', async () => {
      const metric = {
        type: MetricType.Counter,
        name: 'test.metric',
        value: 42,
        timestamp: Date.now(),
        labels: { key: 'value' },
      };

      collector.collect(metric);
      await collector.flush();

      expect(mockDb.insert).toHaveBeenCalledWith(
        'analytics',
        expect.objectContaining({
          name: 'test.metric',
          value: 42,
        })
      );
    });
  });

  describe('Query Operations', () => {
    beforeEach(async () => {
      await collector.initialize();
    });

    it('should query metrics by name', async () => {
      mockDb.query.mockResolvedValue([
        { name: 'test.metric', value: 10, timestamp: Date.now() },
        { name: 'test.metric', value: 20, timestamp: Date.now() },
      ]);

      const results = await collector.query({ name: 'test.metric' });
      expect(results).toHaveLength(2);
    });

    it('should query metrics by type', async () => {
      mockDb.query.mockResolvedValue([
        { type: 'counter', name: 'counter1', value: 1 },
        { type: 'counter', name: 'counter2', value: 2 },
      ]);

      const results = await collector.query({ type: MetricType.Counter });
      expect(results).toHaveLength(2);
    });

    it('should query metrics by time range', async () => {
      const now = Date.now();
      mockDb.query.mockResolvedValue([
        { timestamp: now - 1000, value: 10 },
        { timestamp: now - 2000, value: 20 },
      ]);

      const results = await collector.query({
        startTime: now - 5000,
        endTime: now,
      });

      expect(results).toHaveLength(2);
    });

    it('should query metrics by labels', async () => {
      mockDb.query.mockResolvedValue([
        { labels: { env: 'production' }, value: 100 },
      ]);

      const results = await collector.query({ labels: { env: 'production' } });
      expect(results).toHaveLength(1);
    });

    it('should support pagination', async () => {
      mockDb.query.mockResolvedValue(
        Array.from({ length: 20 }, (_, i) => ({ id: i, value: i }))
      );

      const results = await collector.query({ limit: 10, offset: 0 });
      expect(results).toHaveLength(10);
    });

    it('should sort results', async () => {
      mockDb.query.mockResolvedValue([
        { timestamp: 1000, value: 10 },
        { timestamp: 2000, value: 20 },
        { timestamp: 3000, value: 30 },
      ]);

      const results = await collector.query({ sortBy: 'timestamp', order: 'desc' });
      expect(results[0].timestamp).toBe(3000);
    });
  });

  describe('Real-time Monitoring', () => {
    beforeEach(async () => {
      await collector.initialize();
    });

    it('should emit events on metric collection', (done) => {
      collector.on('metric', (metric: MetricData) => {
        expect(metric.name).toBe('test.event');
        done();
      });

      collector.collect({
        type: MetricType.Counter,
        name: 'test.event',
        value: 1,
        timestamp: Date.now(),
        labels: {},
      });
    });

    it('should emit events on buffer flush', (done) => {
      collector.on('flush', (count: number) => {
        expect(count).toBeGreaterThan(0);
        done();
      });

      collector.collect({
        type: MetricType.Counter,
        name: 'test',
        value: 1,
        timestamp: Date.now(),
        labels: {},
      });

      collector.flush();
    });

    it('should emit events on error', (done) => {
      collector.on('error', (error: Error) => {
        expect(error).toBeInstanceOf(Error);
        done();
      });

      mockDb.insert.mockRejectedValueOnce(new Error('Database error'));
      collector.collect({
        type: MetricType.Counter,
        name: 'test',
        value: 1,
        timestamp: Date.now(),
        labels: {},
      });

      collector.flush().catch(() => {});
    });

    it('should support multiple listeners', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      collector.on('metric', listener1);
      collector.on('metric', listener2);

      collector.collect({
        type: MetricType.Counter,
        name: 'test',
        value: 1,
        timestamp: Date.now(),
        labels: {},
      });

      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });

    it('should remove event listeners', () => {
      const listener = jest.fn();

      collector.on('metric', listener);
      collector.off('metric', listener);

      collector.collect({
        type: MetricType.Counter,
        name: 'test',
        value: 1,
        timestamp: Date.now(),
        labels: {},
      });

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      mockDb.connect.mockRejectedValueOnce(new Error('DB Error'));

      await expect(collector.initialize()).rejects.toThrow('DB Error');
      expect(collector.getStatus()).toBe('error');
    });

    it('should handle invalid metric data', () => {
      expect(() => {
        collector.collect(null as any);
      }).toThrow();
    });

    it('should handle flush errors', async () => {
      await collector.initialize();
      mockDb.insert.mockRejectedValueOnce(new Error('Insert failed'));

      collector.collect({
        type: MetricType.Counter,
        name: 'test',
        value: 1,
        timestamp: Date.now(),
        labels: {},
      });

      await expect(collector.flush()).rejects.toThrow('Insert failed');
    });

    it('should handle query errors', async () => {
      await collector.initialize();
      mockDb.query.mockRejectedValueOnce(new Error('Query failed'));

      await expect(collector.query({ name: 'test' })).rejects.toThrow('Query failed');
    });
  });

  describe('Lifecycle Management', () => {
    it('should shutdown gracefully', async () => {
      await collector.initialize();
      await collector.shutdown();

      expect(collector.getStatus()).toBe('shutdown');
    });

    it('should flush buffer on shutdown', async () => {
      await collector.initialize();

      collector.collect({
        type: MetricType.Counter,
        name: 'test',
        value: 1,
        timestamp: Date.now(),
        labels: {},
      });

      await collector.shutdown();

      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('should reject new metrics after shutdown', async () => {
      await collector.initialize();
      await collector.shutdown();

      expect(() => {
        collector.collect({
          type: MetricType.Counter,
          name: 'test',
          value: 1,
          timestamp: Date.now(),
          labels: {},
        });
      }).toThrow();
    });

    it('should support restart', async () => {
      await collector.initialize();
      await collector.shutdown();
      await collector.initialize();

      expect(collector.getStatus()).toBe('ready');
    });
  });

  describe('Performance Optimization', () => {
    it('should use bulk inserts', async () => {
      await collector.initialize();

      for (let i = 0; i < 50; i++) {
        collector.collect({
          type: MetricType.Counter,
          name: 'bulk_test',
          value: 1,
          timestamp: Date.now(),
          labels: {},
        });
      }

      await collector.flush();

      // Should use single bulk insert rather than 50 individual inserts
      expect(mockDb.insert).toHaveBeenCalledTimes(1);
    });

    it('should compress metrics before storage', async () => {
      const compressedCollector = new MetricsCollector({
        database: mockDb,
        compression: true,
      });
      await compressedCollector.initialize();

      for (let i = 0; i < 100; i++) {
        compressedCollector.collect({
          type: MetricType.Counter,
          name: 'compress_test',
          value: 1,
          timestamp: Date.now(),
          labels: {},
        });
      }

      await compressedCollector.flush();
      await compressedCollector.shutdown();

      // Verify compression was applied
      expect(mockDb.insert).toHaveBeenCalledWith(
        'analytics',
        expect.objectContaining({
          compressed: true,
        })
      );
    });

    it('should cache aggregations', async () => {
      await collector.initialize();

      collector.collect({
        type: MetricType.Counter,
        name: 'cache_test',
        value: 1,
        timestamp: Date.now(),
        labels: {},
      });

      const agg1 = collector.aggregate('cache_test');
      const agg2 = collector.aggregate('cache_test');

      // Should return cached result
      expect(agg1).toEqual(agg2);
    });
  });

  describe('Metrics Metadata', () => {
    beforeEach(async () => {
      await collector.initialize();
    });

    it('should track metric collection count', () => {
      const initialCount = collector.getTotalMetricsCollected();

      collector.collect({
        type: MetricType.Counter,
        name: 'test',
        value: 1,
        timestamp: Date.now(),
        labels: {},
      });

      expect(collector.getTotalMetricsCollected()).toBe(initialCount + 1);
    });

    it('should track metric types', () => {
      collector.collect({
        type: MetricType.Counter,
        name: 'counter',
        value: 1,
        timestamp: Date.now(),
        labels: {},
      });

      collector.collect({
        type: MetricType.Gauge,
        name: 'gauge',
        value: 1,
        timestamp: Date.now(),
        labels: {},
      });

      const stats = collector.getStats();
      expect(stats.byType.counter).toBe(1);
      expect(stats.byType.gauge).toBe(1);
    });

    it('should provide health status', () => {
      const health = collector.getHealth();
      expect(health.status).toBeDefined();
      expect(health.bufferSize).toBeDefined();
      expect(health.uptime).toBeDefined();
    });
  });
});
