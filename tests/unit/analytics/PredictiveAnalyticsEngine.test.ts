/**
 * PredictiveAnalyticsEngine Unit Tests
 * Testing predictive analytics, ML models, and forecasting
 */

import { PredictiveAnalyticsEngine, PredictionModel, PredictionResult } from '../../../src/analytics/PredictiveAnalyticsEngine';
import { createMockDatabase } from '../../mocks/database.mock';

describe('PredictiveAnalyticsEngine', () => {
  let engine: PredictiveAnalyticsEngine;
  let mockDb: any;

  beforeEach(() => {
    mockDb = createMockDatabase();
    engine = new PredictiveAnalyticsEngine({
      database: mockDb,
      modelsDir: '/tmp/models',
      cacheSize: 100,
    });
  });

  afterEach(async () => {
    await engine.cleanup();
  });

  describe('Model Loading', () => {
    it('should load default models on init', async () => {
      await engine.initialize();
      const models = engine.getLoadedModels();
      expect(models.length).toBeGreaterThan(0);
    });

    it('should load custom model', async () => {
      await engine.initialize();

      const customModel: PredictionModel = {
        id: 'custom-1',
        name: 'Custom Model',
        type: 'regression',
        version: '1.0.0',
        features: ['feature1', 'feature2'],
        predict: jest.fn().mockResolvedValue({ value: 42, confidence: 0.9 }),
      };

      await engine.loadModel(customModel);
      expect(engine.hasModel('custom-1')).toBe(true);
    });

    it('should throw error for invalid model', async () => {
      await engine.initialize();

      const invalidModel = { id: '', name: '' } as any;

      await expect(engine.loadModel(invalidModel)).rejects.toThrow();
    });

    it('should unload model', async () => {
      await engine.initialize();
      await engine.unloadModel('linear-regression');
      expect(engine.hasModel('linear-regression')).toBe(false);
    });

    it('should reload model on update', async () => {
      await engine.initialize();

      const updatedModel: PredictionModel = {
        id: 'linear-regression',
        name: 'Linear Regression',
        type: 'regression',
        version: '2.0.0',
        features: ['x', 'y'],
        predict: jest.fn().mockResolvedValue({ value: 100, confidence: 0.95 }),
      };

      await engine.updateModel(updatedModel);
      const model = engine.getModel('linear-regression');
      expect(model.version).toBe('2.0.0');
    });
  });

  describe('Predictions', () => {
    beforeEach(async () => {
      await engine.initialize();
    });

    it('should make prediction with valid input', async () => {
      const result = await engine.predict('linear-regression', {
        features: { x: 10, y: 20 },
      });

      expect(result.value).toBeDefined();
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it('should throw error for unknown model', async () => {
      await expect(
        engine.predict('unknown-model', { features: {} })
      ).rejects.toThrow('Model not found');
    });

    it('should validate input features', async () => {
      await expect(
        engine.predict('linear-regression', { features: null })
      ).rejects.toThrow('Invalid features');
    });

    it('should return prediction metadata', async () => {
      const result = await engine.predict('linear-regression', {
        features: { x: 10 },
        metadata: true,
      });

      expect(result.timestamp).toBeDefined();
      expect(result.modelId).toBeDefined();
      expect(result.processingTime).toBeDefined();
    });

    it('should batch predict multiple inputs', async () => {
      const inputs = [
        { features: { x: 1 } },
        { features: { x: 2 } },
        { features: { x: 3 } },
      ];

      const results = await engine.batchPredict('linear-regression', inputs);

      expect(results).toHaveLength(3);
      results.forEach((result) => {
        expect(result.value).toBeDefined();
      });
    });

    it('should handle batch prediction errors gracefully', async () => {
      const inputs = [
        { features: { x: 1 } },
        { features: null as any },
        { features: { x: 3 } },
      ];

      const results = await engine.batchPredict('linear-regression', inputs);

      expect(results[0].value).toBeDefined();
      expect(results[1].error).toBeDefined();
      expect(results[2].value).toBeDefined();
    });
  });

  describe('Time Series Forecasting', () => {
    beforeEach(async () => {
      await engine.initialize();
    });

    it('should forecast future values', async () => {
      const historicalData = [
        { timestamp: Date.now() - 4000, value: 10 },
        { timestamp: Date.now() - 3000, value: 15 },
        { timestamp: Date.now() - 2000, value: 20 },
        { timestamp: Date.now() - 1000, value: 25 },
        { timestamp: Date.now(), value: 30 },
      ];

      const forecast = await engine.forecast('time-series', historicalData, {
        horizon: 5,
        interval: 1000,
      });

      expect(forecast.values).toHaveLength(5);
      expect(forecast.confidenceInterval).toBeDefined();
    });

    it('should validate historical data length', async () => {
      const insufficientData = [{ timestamp: Date.now(), value: 10 }];

      await expect(
        engine.forecast('time-series', insufficientData, { horizon: 5 })
      ).rejects.toThrow('Insufficient data');
    });

    it('should detect seasonality', async () => {
      const seasonalData = Array.from({ length: 100 }, (_, i) => ({
        timestamp: Date.now() - (99 - i) * 1000,
        value: Math.sin(i / 10) * 10 + 50,
      }));

      const analysis = await engine.analyzeSeasonality('time-series', seasonalData);

      expect(analysis.hasSeasonality).toBeDefined();
      expect(analysis.period).toBeDefined();
    });

    it('should detect trends', async () => {
      const trendData = Array.from({ length: 50 }, (_, i) => ({
        timestamp: Date.now() - (49 - i) * 1000,
        value: i * 2,
      }));

      const analysis = await engine.analyzeTrend('time-series', trendData);

      expect(analysis.direction).toBe('upward');
      expect(analysis.strength).toBeGreaterThan(0);
    });

    it('should calculate forecast accuracy', async () => {
      const trainingData = Array.from({ length: 80 }, (_, i) => ({
        timestamp: Date.now() - (99 - i) * 1000,
        value: i + Math.random() * 10,
      }));

      const testData = Array.from({ length: 20 }, (_, i) => ({
        timestamp: Date.now() - (19 - i) * 1000,
        value: 80 + i + Math.random() * 10,
      }));

      const accuracy = await engine.calculateAccuracy('time-series', trainingData, testData);

      expect(accuracy.mae).toBeGreaterThan(0);
      expect(accuracy.rmse).toBeGreaterThan(0);
      expect(accuracy.mape).toBeGreaterThan(0);
    });
  });

  describe('Anomaly Detection', () => {
    beforeEach(async () => {
      await engine.initialize();
    });

    it('should detect anomalies in data', async () => {
      const normalData = Array.from({ length: 50 }, (_, i) => ({
        timestamp: Date.now() - (49 - i) * 1000,
        value: 50 + Math.random() * 10,
      }));

      const anomalousData = [
        ...normalData,
        { timestamp: Date.now(), value: 200 }, // Clear anomaly
      ];

      const anomalies = await engine.detectAnomalies('anomaly-detector', anomalousData, {
        threshold: 3,
      });

      expect(anomalies.length).toBeGreaterThan(0);
      expect(anomalies[0].timestamp).toBeDefined();
      expect(anomalies[0].score).toBeGreaterThan(0);
    });

    it('should adjust sensitivity', async () => {
      const data = Array.from({ length: 50 }, (_, i) => ({
        timestamp: Date.now() - (49 - i) * 1000,
        value: i % 2 === 0 ? 50 : 200, // Alternating anomalies
      }));

      const lowSensitivity = await engine.detectAnomalies('anomaly-detector', data, {
        threshold: 5,
      });

      const highSensitivity = await engine.detectAnomalies('anomaly-detector', data, {
        threshold: 1,
      });

      expect(highSensitivity.length).toBeGreaterThan(lowSensitivity.length);
    });

    it('should provide anomaly explanations', async () => {
      const data = Array.from({ length: 50 }, (_, i) => ({
        timestamp: Date.now() - (49 - i) * 1000,
        value: i === 49 ? 1000 : 50, // Single anomaly at end
      }));

      const anomalies = await engine.detectAnomalies('anomaly-detector', data, {
        explain: true,
      });

      expect(anomalies[0].reason).toBeDefined();
      expect(anomalies[0].expectedValue).toBeDefined();
    });
  });

  describe('Model Training', () => {
    it('should train model with data', async () => {
      await engine.initialize();

      const trainingData = Array.from({ length: 100 }, (_, i) => ({
        features: { x: i, y: i * 2 },
        target: i * 3,
      }));

      const result = await engine.trainModel('linear-regression', trainingData, {
        epochs: 10,
        validationSplit: 0.2,
      });

      expect(result.modelId).toBeDefined();
      expect(result.accuracy).toBeGreaterThan(0);
      expect(result.trainingTime).toBeDefined();
    });

    it('should validate training data', async () => {
      await engine.initialize();

      const invalidData = [{ features: null, target: null }];

      await expect(
        engine.trainModel('linear-regression', invalidData)
      ).rejects.toThrow('Invalid training data');
    });

    it('should support online learning', async () => {
      await engine.initialize();

      const newData = [{ features: { x: 100 }, target: 300 }];

      await engine.updateModelOnline('linear-regression', newData);

      const model = engine.getModel('linear-regression');
      expect(model.version).toContain('updated');
    });

    it('should track model performance', async () => {
      await engine.initialize();

      const performance = await engine.getModelPerformance('linear-regression');

      expect(performance.accuracy).toBeDefined();
      expect(performance.latency).toBeDefined();
      expect(performance.lastTrained).toBeDefined();
    });
  });

  describe('Caching', () => {
    beforeEach(async () => {
      await engine.initialize();
    });

    it('should cache prediction results', async () => {
      const input = { features: { x: 10 } };

      const result1 = await engine.predict('linear-regression', input);
      const result2 = await engine.predict('linear-regression', input);

      expect(result1).toEqual(result2);
    });

    it('should respect cache size limit', async () => {
      const smallCacheEngine = new PredictiveAnalyticsEngine({
        database: mockDb,
        cacheSize: 2,
      });
      await smallCacheEngine.initialize();

      await smallCacheEngine.predict('linear-regression', { features: { x: 1 } });
      await smallCacheEngine.predict('linear-regression', { features: { x: 2 } });
      await smallCacheEngine.predict('linear-regression', { features: { x: 3 } });

      // First prediction should be evicted
      const stats = smallCacheEngine.getCacheStats();
      expect(stats.size).toBe(2);

      await smallCacheEngine.cleanup();
    });

    it('should invalidate cache on model update', async () => {
      await engine.predict('linear-regression', { features: { x: 10 } });

      await engine.updateModel({
        id: 'linear-regression',
        name: 'Updated Model',
        type: 'regression',
        version: '2.0.0',
        features: ['x'],
        predict: jest.fn().mockResolvedValue({ value: 999, confidence: 1 }),
      });

      const result = await engine.predict('linear-regression', { features: { x: 10 } });
      expect(result.value).toBe(999);
    });

    it('should clear cache manually', async () => {
      await engine.predict('linear-regression', { features: { x: 10 } });

      await engine.clearCache();

      const stats = engine.getCacheStats();
      expect(stats.size).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle prediction errors', async () => {
      await engine.initialize();

      const failingModel: PredictionModel = {
        id: 'failing-model',
        name: 'Failing Model',
        type: 'regression',
        version: '1.0.0',
        features: ['x'],
        predict: jest.fn().mockRejectedValue(new Error('Prediction failed')),
      };

      await engine.loadModel(failingModel);

      await expect(
        engine.predict('failing-model', { features: { x: 10 } })
      ).rejects.toThrow('Prediction failed');
    });

    it('should handle model loading errors', async () => {
      await engine.initialize();

      await expect(
        engine.loadModel({ id: '', name: '' } as any)
      ).rejects.toThrow();
    });

    it('should log errors for debugging', async () => {
      const errorSpy = jest.spyOn(console, 'error');

      await engine.initialize();
      await engine.predict('unknown-model', { features: {} }).catch(() => {});

      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe('Performance Monitoring', () => {
    beforeEach(async () => {
      await engine.initialize();
    });

    it('should track prediction latency', async () => {
      await engine.predict('linear-regression', { features: { x: 10 } });

      const stats = engine.getPerformanceStats();
      expect(stats.avgLatency).toBeGreaterThan(0);
    });

    it('should track model usage', async () => {
      await engine.predict('linear-regression', { features: { x: 10 } });
      await engine.predict('time-series', { data: [] });

      const stats = engine.getModelUsageStats();
      expect(stats['linear-regression']).toBeDefined();
      expect(stats['time-series']).toBeDefined();
    });

    it('should provide system health', () => {
      const health = engine.getHealth();
      expect(health.status).toBeDefined();
      expect(health.memory).toBeDefined();
      expect(health.modelsLoaded).toBeDefined();
    });
  });
});
