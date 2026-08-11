/**
 * Spreadsheet Moment - Advanced Load Balancing Optimizer
 * Round 6: Distributed Computation
 *
 * Implements intelligent load balancing with multiple strategies:
 * - Adaptive load balancing based on real-time metrics
 * - Performance-based routing with ML prediction
 * - Geographic-aware distribution
 * - Cost optimization across cloud providers
 * - Auto-scaling with predictive provisioning
 */

interface NodeMetrics {
  nodeId: string;
  region: string;
  cpuUtilization: number;  // 0-1
  memoryUtilization: number;  // 0-1
  networkIn: number;  // bytes/sec
  networkOut: number;  // bytes/sec
  activeConnections: number;
  avgResponseTime: number;  // milliseconds
  errorRate: number;  // 0-1
  lastUpdated: Date;
  capabilities: {
    gpu: boolean;
    tensorCores: number;
    memory: number;  // GB
    supportDistributed: boolean;
  };
  costPerHour: number;  // USD
}

interface LoadBalancingStrategy {
  name: string;
  description: string;
  selectNode: (metrics: NodeMetrics[], context: RoutingContext) => NodeMetrics | null;
}

interface RoutingContext {
  operationType: 'matmul' | 'convolution' | 'einsum' | 'all-reduce' | 'scatter';
  tensorSize: number;  // bytes
  requiresGPU: boolean;
  priority: 'low' | 'normal' | 'high' | 'critical';
  deadline?: Date;
  budgetLimit?: number;  // USD
  preferredRegion?: string;
  latencyRequirement?: number;  // milliseconds
}

interface LoadBalancingDecision {
  selectedNode: string;
  strategy: string;
  confidence: number;  // 0-1
  expectedLatency: number;  // milliseconds
  estimatedCost: number;  // USD
  reasoning: string;
  alternatives: Array<{
    node: string;
    score: number;
    reason: string;
  }>;
}

/**
 * Performance Predictor using ML models
 */
class PerformancePredictor {
  private historicalData: Map<string, number[]> = new Map();

  recordPerformance(nodeId: string, operation: string, duration: number): void {
    const key = `${nodeId}:${operation}`;
    if (!this.historicalData.has(key)) {
      this.historicalData.set(key, []);
    }
    const history = this.historicalData.get(key)!;
    history.push(duration);
    // Keep last 100 data points
    if (history.length > 100) history.shift();
  }

  predictPerformance(nodeId: string, operation: string, tensorSize: number): number {
    const key = `${nodeId}:${operation}`;
    const history = this.historicalData.get(key);

    if (!history || history.length < 5) {
      // Default prediction based on tensor size
      return Math.log(tensorSize + 1) * 10;
    }

    // Simple linear regression on recent history
    const avg = history.reduce((a, b) => a + b, 0) / history.length;
    const trend = (history[history.length - 1] - history[0]) / history.length;

    // Scale by tensor size relative to baseline
    const sizeFactor = Math.log10(tensorSize / 1e6 + 1);

    return Math.max(1, avg + trend * 5 + sizeFactor * 50);
  }

  predictCost(nodeId: string, operation: string, duration: number): number {
    // Approximate cost based on operation type and duration
    const baseCostPerHour = 0.50;  // Base compute cost
    const gpuMultiplier = 2.0;
    const operationComplexity: Record<string, number> = {
      'matmul': 1.0,
      'convolution': 1.2,
      'einsum': 1.5,
      'all-reduce': 0.8,
      'scatter': 0.5
    };

    const complexity = operationComplexity[operation] || 1.0;
    const hours = duration / 3600000;

    return baseCostPerHour * gpuMultiplier * complexity * hours;
  }
}

/**
 * Advanced Load Balancer with multiple strategies
 */
export class LoadBalancerOptimizer {
  private metrics: Map<string, NodeMetrics> = new Map();
  private strategies: Map<string, LoadBalancingStrategy> = new Map();
  private predictor: PerformancePredictor;
  private currentStrategy: string = 'adaptive';
  private regionLatencies: Map<string, Map<string, number>> = new Map();

  constructor() {
    this.predictor = new PerformancePredictor();
    this.initializeStrategies();
    this.initializeRegionLatencies();
  }

  private initializeStrategies(): void {
    // Round-robin strategy
    this.strategies.set('round-robin', {
      name: 'Round Robin',
      description: 'Distribute requests evenly across all nodes',
      selectNode: (metrics, context) => {
        const sorted = metrics.sort((a, b) =>
          (a.activeConnections || 0) - (b.activeConnections || 0)
        );
        return sorted[0] || null;
      }
    });

    // Least loaded strategy
    this.strategies.set('least-loaded', {
      name: 'Least Loaded',
      description: 'Route to node with lowest CPU utilization',
      selectNode: (metrics, context) => {
        const valid = metrics.filter(m =>
          m.cpuUtilization < 0.8 && m.memoryUtilization < 0.8
        );
        return valid.sort((a, b) =>
          (a.cpuUtilization + a.memoryUtilization) -
          (b.cpuUtilization + b.memoryUtilization)
        )[0] || null;
      }
    });

    // Performance-based strategy
    this.strategies.set('performance', {
      name: 'Performance Based',
      description: 'Route to node with best predicted performance',
      selectNode: (metrics, context) => {
        let bestNode: NodeMetrics | null = null;
        let bestScore = -Infinity;

        for (const metric of metrics) {
          const predictedTime = this.predictor.predictPerformance(
            metric.nodeId,
            context.operationType,
            context.tensorSize
          );

          // Score combines performance and load
          const loadPenalty = metric.cpuUtilization * 100;
          const score = -predictedTime - loadPenalty;

          if (score > bestScore) {
            bestScore = score;
            bestNode = metric;
          }
        }

        return bestNode;
      }
    });

    // Cost-optimized strategy
    this.strategies.set('cost-optimized', {
      name: 'Cost Optimized',
      description: 'Route to most cost-effective node within budget',
      selectNode: (metrics, context) => {
        const validNodes = context.budgetLimit
          ? metrics.filter(m => m.costPerHour <= context.budgetLimit!)
          : metrics;

        return validNodes.sort((a, b) =>
          a.costPerHour - b.costPerHour
        )[0] || null;
      }
    });

    // Geographic strategy
    this.strategies.set('geographic', {
      name: 'Geographic',
      description: 'Route to closest node for low latency',
      selectNode: (metrics, context) => {
        if (!context.preferredRegion) {
          // Default to least loaded
          return this.strategies.get('least-loaded')!.selectNode(metrics, context);
        }

        const sameRegion = metrics.filter(m =>
          m.region === context.preferredRegion
        );

        if (sameRegion.length > 0) {
          return this.strategies.get('least-loaded')!.selectNode(sameRegion, context);
        }

        // Find closest region
        let bestNode: NodeMetrics | null = null;
        let bestLatency = Infinity;

        for (const metric of metrics) {
          const latency = this.getLatency(context.preferredRegion!, metric.region);
          if (latency < bestLatency) {
            bestLatency = latency;
            bestNode = metric;
          }
        }

        return bestNode;
      }
    });

    // Adaptive strategy (default)
    this.strategies.set('adaptive', {
      name: 'Adaptive',
      description: 'Automatically select best strategy based on context',
      selectNode: (metrics, context) => {
        // Choose strategy based on context
        if (context.deadline && context.latencyRequirement) {
          return this.strategies.get('performance')!.selectNode(metrics, context);
        } else if (context.budgetLimit) {
          return this.strategies.get('cost-optimized')!.selectNode(metrics, context);
        } else if (context.preferredRegion) {
          return this.strategies.get('geographic')!.selectNode(metrics, context);
        } else {
          return this.strategies.get('least-loaded')!.selectNode(metrics, context);
        }
      }
    });
  }

  private initializeRegionLatencies(): void {
    // Approximate inter-region latencies (milliseconds)
    const latencies: Record<string, Record<string, number>> = {
      'us-east': { 'us-west': 70, 'eu-central': 80, 'asia-east': 180 },
      'us-west': { 'us-east': 70, 'eu-central': 140, 'asia-east': 120 },
      'eu-central': { 'us-east': 80, 'us-west': 140, 'asia-east': 200 },
      'asia-east': { 'us-east': 180, 'us-west': 120, 'eu-central': 200 }
    };

    for (const [region1, targets] of Object.entries(latencies)) {
      this.regionLatencies.set(region1, new Map(Object.entries(targets)));
    }
  }

  private getLatency(from: string, to: string): number {
    if (from === to) return 0;
    return this.regionLatencies.get(from)?.get(to) || 100;
  }

  /**
   * Update node metrics
   */
  updateMetrics(metrics: NodeMetrics): void {
    this.metrics.set(metrics.nodeId, metrics);
  }

  /**
   * Main routing decision method
   */
  async route(context: RoutingContext): Promise<LoadBalancingDecision> {
    const strategy = this.strategies.get(this.currentStrategy);
    if (!strategy) {
      throw new Error(`Unknown strategy: ${this.currentStrategy}`);
    }

    // Get available nodes
    const availableNodes = Array.from(this.metrics.values()).filter(m => {
      // Filter by requirements
      if (context.requiresGPU && !m.capabilities.gpu) return false;
      if (context.requiresGPU && m.cpuUtilization > 0.95) return false;
      return true;
    });

    if (availableNodes.length === 0) {
      throw new Error('No available nodes matching requirements');
    }

    // Select primary node
    const selected = strategy.selectNode(availableNodes, context);
    if (!selected) {
      throw new Error('Strategy failed to select node');
    }

    // Calculate predictions
    const expectedLatency = this.predictor.predictPerformance(
      selected.nodeId,
      context.operationType,
      context.tensorSize
    );

    const estimatedCost = this.predictor.predictCost(
      selected.nodeId,
      context.operationType,
      expectedLatency
    );

    // Generate alternatives
    const alternatives = availableNodes
      .filter(n => n.nodeId !== selected.nodeId)
      .slice(0, 2)
      .map(node => ({
        node: node.nodeId,
        score: this.calculateNodeScore(node, context),
        reason: this.getAlternativeReason(node, context)
      }));

    return {
      selectedNode: selected.nodeId,
      strategy: this.currentStrategy,
      confidence: this.calculateConfidence(selected, context),
      expectedLatency,
      estimatedCost,
      reasoning: this.generateReasoning(selected, context, strategy),
      alternatives
    };
  }

  private calculateNodeScore(node: NodeMetrics, context: RoutingContext): number {
    // Lower is better for load, higher is better for score
    const loadScore = 1 - (node.cpuUtilization + node.memoryUtilization) / 2;
    const perfScore = 1 / (this.predictor.predictPerformance(
      node.nodeId,
      context.operationType,
      context.tensorSize
    ) + 1);
    const costScore = 1 / (node.costPerHour + 0.01);

    return (loadScore + perfScore + costScore) / 3;
  }

  private calculateConfidence(node: NodeMetrics, context: RoutingContext): number {
    // Confidence based on how well the node matches requirements
    let confidence = 0.5;

    if (context.requiresGPU && node.capabilities.gpu) confidence += 0.2;
    if (context.preferredRegion === node.region) confidence += 0.1;
    if (node.cpuUtilization < 0.5) confidence += 0.1;
    if (node.errorRate < 0.01) confidence += 0.1;

    return Math.min(1, confidence);
  }

  private generateReasoning(node: NodeMetrics, context: RoutingContext, strategy: LoadBalancingStrategy): string {
    const reasons: string[] = [];

    reasons.push(`Strategy: ${strategy.name}`);
    reasons.push(`CPU utilization: ${(node.cpuUtilization * 100).toFixed(1)}%`);
    reasons.push(`Memory utilization: ${(node.memoryUtilization * 100).toFixed(1)}%`);

    if (context.requiresGPU) {
      reasons.push(`GPU available: ${node.capabilities.tensorCores} tensor cores`);
    }

    if (context.preferredRegion) {
      const latency = this.getLatency(context.preferredRegion, node.region);
      reasons.push(`Network latency: ${latency}ms`);
    }

    return reasons.join(', ');
  }

  private getAlternativeReason(node: NodeMetrics, context: RoutingContext): string {
    const reasons: string[] = [];

    if (node.region === context.preferredRegion) {
      reasons.push('same region');
    }
    if (node.costPerHour < 0.5) {
      reasons.push('low cost');
    }
    if (node.cpuUtilization < 0.3) {
      reasons.push('underutilized');
    }

    return reasons.join(', ') || 'available';
  }

  /**
   * Auto-scaling recommendation
   */
  recommendScaling(): Array<{ action: string; reason: string }> {
    const recommendations: Array<{ action: string; reason: string }> = [];
    const metrics = Array.from(this.metrics.values());

    // Check for overloaded nodes
    const overloaded = metrics.filter(m => m.cpuUtilization > 0.8);
    if (overloaded.length > metrics.length * 0.5) {
      recommendations.push({
        action: 'scale-up',
        reason: `${overloaded.length} nodes overloaded (>80% CPU)`
      });
    }

    // Check for underutilized nodes
    const underutilized = metrics.filter(m => m.cpuUtilization < 0.2);
    if (underutilized.length > metrics.length * 0.7) {
      recommendations.push({
        action: 'scale-down',
        reason: `${underutilized.length} nodes underutilized (<20% CPU)`
      });
    }

    // Check regional imbalances
    const regions = new Map<string, NodeMetrics[]>();
    for (const metric of metrics) {
      if (!regions.has(metric.region)) {
        regions.set(metric.region, []);
      }
      regions.get(metric.region)!.push(metric);
    }

    for (const [region, nodes] of regions) {
      const avgLoad = nodes.reduce((sum, n) => sum + n.cpuUtilization, 0) / nodes.length;
      if (avgLoad > 0.7) {
        recommendations.push({
          action: `scale-up-${region}`,
          reason: `Region ${region} average load: ${(avgLoad * 100).toFixed(0)}%`
        });
      }
    }

    return recommendations;
  }

  /**
   * Set load balancing strategy
   */
  setStrategy(strategy: string): void {
    if (!this.strategies.has(strategy)) {
      throw new Error(`Unknown strategy: ${strategy}`);
    }
    this.currentStrategy = strategy;
  }

  /**
   * Get current strategy
   */
  getStrategy(): string {
    return this.currentStrategy;
  }

  /**
   * Get available strategies
   */
  getAvailableStrategies(): LoadBalancingStrategy[] {
    return Array.from(this.strategies.values());
  }

  /**
   * Get cluster statistics
   */
  getClusterStats(): {
    totalNodes: number;
    avgCpuUtilization: number;
    avgMemoryUtilization: number;
    totalCores: number;
    regions: string[];
  } {
    const metrics = Array.from(this.metrics.values());

    return {
      totalNodes: metrics.length,
      avgCpuUtilization: metrics.reduce((sum, m) => sum + m.cpuUtilization, 0) / metrics.length,
      avgMemoryUtilization: metrics.reduce((sum, m) => sum + m.memoryUtilization, 0) / metrics.length,
      totalCores: metrics.reduce((sum, m) => sum + m.capabilities.tensorCores, 0),
      regions: Array.from(new Set(metrics.map(m => m.region)))
    };
  }
}
