import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { ClawService } from '../src/services/ClawService';
import { GeoService } from '../src/services/GeoService';
import type { Agent } from '../src/types';

describe('Analytics Dashboard E2E Tests', () => {
  beforeAll(async () => {
    await ClawService.initialize();
    await GeoService.initialize();
  });

  afterAll(() => {
    ClawService.disconnect();
    GeoService.disconnect();
  });

  describe('Agent Management', () => {
    it('should create a single agent', async () => {
      const agent = await ClawService.createAgent({
        id: 'test-agent-1',
        model: 'deepseek-chat',
        seed: {
          purpose: 'Test agent',
          trigger: { type: 'data', source: 'test' }
        },
        equipment: ['MEMORY'],
        state: 'IDLE'
      });

      expect(agent).toBeDefined();
      expect(agent.id).toBe('test-agent-1');
      expect(agent.state).toBe('IDLE');
    });

    it('should create multiple agents in batch', async () => {
      const configs = Array.from({ length: 100 }, (_, i) => ({
        id: `batch-agent-${i}`,
        model: 'deepseek-chat',
        seed: {
          purpose: 'Batch test agent',
          trigger: { type: 'data', source: 'test' }
        },
        equipment: ['MEMORY'],
        state: 'IDLE'
      }));

      const agents = await ClawService.createAgents(configs);

      expect(agents).toHaveLength(100);
      expect(agents[0].id).toBe('batch-agent-0');
    });

    it('should retrieve all agents', async () => {
      const agents = await ClawService.getAllAgents();
      expect(agents.length).toBeGreaterThan(0);
    });

    it('should delete an agent', async () => {
      const agent = await ClawService.createAgent({
        id: 'delete-test-agent',
        model: 'deepseek-chat',
        seed: {
          purpose: 'Test deletion',
          trigger: { type: 'data', source: 'test' }
        },
        equipment: ['MEMORY'],
        state: 'IDLE'
      });

      await ClawService.deleteAgent(agent.id);

      const retrieved = await ClawService.getAgent(agent.id);
      expect(retrieved).toBeUndefined();
    });
  });

  describe('Agent Triggering', () => {
    let testAgent: Agent;

    beforeAll(async () => {
      testAgent = await ClawService.createAgent({
        id: 'trigger-test-agent',
        model: 'deepseek-chat',
        seed: {
          purpose: 'Test triggering',
          trigger: { type: 'data', source: 'test' }
        },
        equipment: ['MEMORY', 'REASONING'],
        state: 'IDLE'
      });
    });

    it('should trigger an agent with data', async () => {
      const result = await ClawService.triggerAgent(testAgent.id, {
        value: 42,
        timestamp: Date.now()
      });

      expect(result).toBeDefined();
      expect(result.latency).toBeGreaterThan(0);
      expect(result.latency).toBeLessThan(100); // Should be fast
    });

    it('should update agent stats after trigger', async () => {
      const agent = await ClawService.getAgent(testAgent.id);
      expect(agent?.stats.triggers).toBeGreaterThan(0);
      expect(agent?.stats.lastTrigger).toBeDefined();
    });

    it('should handle rapid sequential triggers', async () => {
      const triggers = Array.from({ length: 10 }, (_, i) => ({
        value: i,
        timestamp: Date.now()
      }));

      const results = await Promise.all(
        triggers.map((data) => ClawService.triggerAgent(testAgent.id, data))
      );

      expect(results).toHaveLength(10);
      results.forEach((result) => {
        expect(result.latency).toBeLessThan(100);
      });
    });
  });

  describe('Spatial Queries', () => {
    let agents: Agent[];

    beforeAll(async () => {
      // Create agents at different positions
      const configs = Array.from({ length: 50 }, (_, i) => ({
        id: `spatial-agent-${i}`,
        model: 'deepseek-chat',
        seed: {
          purpose: 'Spatial test',
          trigger: { type: 'data', source: 'test' }
        },
        equipment: ['MEMORY'],
        state: 'IDLE',
        position: {
          x: Math.random() * 1000,
          y: Math.random() * 1000,
          z: Math.random() * 1000
        }
      }));

      agents = await ClawService.createAgents(configs);

      // Register with GeoService
      await Promise.all(agents.map((agent) => GeoService.createAgent(agent)));
    });

    it('should create agents with spatial positions', async () => {
      expect(agents).toHaveLength(50);
      agents.forEach((agent) => {
        expect(agent.position).toBeDefined();
        expect(agent.position.x).toBeGreaterThanOrEqual(0);
        expect(agent.position.x).toBeLessThanOrEqual(1000);
      });
    });

    it('should query agents within radius', async () => {
      const centerAgent = agents[0];
      const nearby = await GeoService.queryNearby(centerAgent.id, 100);

      expect(nearby).toBeDefined();
      expect(nearby.length).toBeGreaterThanOrEqual(0);
    });

    it('should query from agent perspective', async () => {
      const agent = agents[0];
      const visible = await GeoService.queryFromPerspective(agent.id, {
        radius: 200,
        fieldOfView: Math.PI / 2
      });

      expect(visible).toBeDefined();
      expect(visible.length).toBeLessThanOrEqual(agents.length);
    });
  });

  describe('Performance Tests', () => {
    it('should handle 1000 agents', async () => {
      const startTime = Date.now();

      const configs = Array.from({ length: 1000 }, (_, i) => ({
        id: `perf-agent-${i}`,
        model: 'deepseek-chat',
        seed: {
          purpose: 'Performance test',
          trigger: { type: 'data', source: 'test' }
        },
        equipment: ['MEMORY'],
        state: 'IDLE'
      }));

      const agents = await ClawService.createAgents(configs);
      const duration = Date.now() - startTime;

      expect(agents).toHaveLength(1000);
      expect(duration).toBeLessThan(5000); // Should complete in <5s
    });

    it('should maintain sub-10ms trigger latency', async () => {
      const agent = await ClawService.createAgent({
        id: 'latency-test-agent',
        model: 'deepseek-chat',
        seed: {
          purpose: 'Latency test',
          trigger: { type: 'data', source: 'test' }
        },
        equipment: ['MEMORY'],
        state: 'IDLE'
      });

      const latencies: number[] = [];

      for (let i = 0; i < 100; i++) {
        const result = await ClawService.triggerAgent(agent.id, { value: i });
        latencies.push(result.latency);
      }

      const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;

      expect(avgLatency).toBeLessThan(10); // Average < 10ms
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid agent ID', async () => {
      await expect(
        ClawService.triggerAgent('non-existent-agent', {})
      ).rejects.toThrow();
    });

    it('should handle invalid configuration', async () => {
      await expect(
        ClawService.createAgent({
          id: '', // Invalid ID
          model: '',
          seed: null as any
        })
      ).rejects.toThrow();
    });
  });
});
