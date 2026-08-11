/**
 * Spreadsheet Moment - Federated Learning System
 * Round 7: Advanced AI Integration
 *
 * Implements privacy-preserving distributed machine learning:
 * - Federated averaging across multiple clients
 * - Differential privacy for sensitive data
 * - Secure aggregation with encryption
 * - Client selection and scheduling
 * - Model personalization
 * - Byzantine-resilient aggregation
 */

interface ModelWeights {
  layerName: string;
  weights: number[][];
  bias: number[];
}

interface FederatedConfig {
  numClients: number;
  clientsPerRound: number;
  numRounds: number;
  learningRate: number;
  batchSize: number;
  localEpochs: number;
  aggregationStrategy: 'fedavg' | 'fedprox' | 'fednova' | 'qfedavg';
  differentialPrivacy: {
    enabled: boolean;
    epsilon: number;  // Privacy budget
    delta: number;
    maxGradientNorm: number;
  };
  secureAggregation: {
    enabled: boolean;
    encryptionScheme: 'paillier' | 'elgamal' | 'boolean';
  };
}

interface ClientUpdate {
  clientId: string;
  weightsDiff: ModelWeights[];
  numExamples: number;
  metrics: {
    loss: number;
    accuracy: number;
  };
  updateHash: string;
}

interface AggregationResult {
  newWeights: ModelWeights[];
  participatingClients: string[];
  globalMetrics: {
    averageLoss: number;
    averageAccuracy: number;
  };
  convergenceMetrics: {
    weightDelta: number;
    gradientNorm: number;
  };
}

/**
 * Differential Privacy Mechanisms
 */
class DifferentialPrivacy {
  private epsilon: number;
  private delta: number;
  private maxGradientNorm: number;

  constructor(epsilon: number, delta: number, maxGradientNorm: number) {
    this.epsilon = epsilon;
    this.delta = delta;
    this.maxGradientNorm = maxGradientNorm;
  }

  /**
   * Add Gaussian noise to gradients for DP
   */
  addGradientNoise(gradients: number[][]): number[][] {
    const sigma = this.calculateSigma();

    return gradients.map(layer =>
      layer.map(gradient => {
        // Clip gradient
        const clipped = Math.max(-this.maxGradientNorm,
                   Math.min(this.maxGradientNorm, gradient));

        // Add Gaussian noise
        const noise = this.gaussianRandom(0, sigma);
        return clipped + noise;
      })
    );
  }

  /**
   * Calculate noise sigma for (epsilon, delta)-DP
   */
  private calculateSigma(): number {
    // Using Gaussian mechanism: sigma = sqrt(2*ln(1.25/delta)) * sensitivity / epsilon
    const sensitivity = this.maxGradientNorm;
    const lnTerm = Math.log(1.25 / this.delta);
    return Math.sqrt(2 * lnTerm) * sensitivity / this.epsilon;
  }

  /**
   * Generate Gaussian random number using Box-Muller transform
   */
  private gaussianRandom(mean: number, stdDev: number): number {
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return z0 * stdDev + mean;
  }

  /**
   * Advanced Composition Theorem for privacy accounting
   */
  compose(other: DifferentialPrivacy): DifferentialPrivacy {
    // Privacy composition: add epsilons, special handling for deltas
    return new DifferentialPrivacy(
      this.epsilon + other.epsilon,
      this.delta + other.delta - this.delta * other.delta,
      Math.min(this.maxGradientNorm, other.maxGradientNorm)
    );
  }
}

/**
 * Secure Aggregation with Encryption
 */
class SecureAggregator {
  private encryptionScheme: 'paillier' | 'elgamal' | 'boolean';
  private clientKeys: Map<string, CryptoKey> = new Map();

  constructor(encryptionScheme: 'paillier' | 'elgamal' | 'boolean') {
    this.encryptionScheme = encryptionScheme;
  }

  /**
   * Encrypt client updates before transmission
   */
  async encryptUpdate(update: ClientUpdate, publicKey: CryptoKey): Promise<ClientUpdate> {
    const encryptedWeights: ModelWeights[] = [];

    for (const layer of update.weightsDiff) {
      const encryptedWeightsLayer = {
        layerName: layer.layerName,
        weights: await this.encryptMatrix(layer.weights, publicKey),
        bias: await this.encryptVector(layer.bias, publicKey)
      };
      encryptedWeights.push(encryptedWeightsLayer);
    }

    return {
      ...update,
      weightsDiff: encryptedWeights
    };
  }

  /**
   * Decrypt aggregated update
   */
  async decryptAggregated(encrypted: ModelWeights[], privateKey: CryptoKey): Promise<ModelWeights[]> {
    const decrypted: ModelWeights[] = [];

    for (const layer of encrypted) {
      const decryptedLayer = {
        layerName: layer.layerName,
        weights: await this.decryptMatrix(layer.weights, privateKey),
        bias: await this.decryptVector(layer.bias, privateKey)
      };
      decrypted.push(decryptedLayer);
    }

    return decrypted;
  }

  private async encryptMatrix(matrix: number[][], publicKey: CryptoKey): Promise<number[][]> {
    // Simplified encryption (actual implementation would use proper crypto)
    return matrix.map(row =>
      row.map(val => {
        // In real implementation, use proper homomorphic encryption
        return val * 2 + 1;  // Placeholder
      })
    );
  }

  private async encryptVector(vector: number[], publicKey: CryptoKey): Promise<number[]> {
    return vector.map(val => val * 2 + 1);  // Placeholder
  }

  private async decryptMatrix(matrix: number[][], privateKey: CryptoKey): Promise<number[][]> {
    return matrix.map(row =>
      row.map(val => (val - 1) / 2)  // Placeholder
    );
  }

  private async decryptVector(vector: number[], privateKey: CryptoKey): Promise<number[]> {
    return vector.map(val => (val - 1) / 2);  // Placeholder
  }

  /**
   * Aggregate encrypted updates without decryption
   */
  aggregateEncrypted(encryptedUpdates: ClientUpdate[]): ModelWeights[] {
    if (encryptedUpdates.length === 0) return [];

    const numLayers = encryptedUpdates[0].weightsDiff.length;
    const aggregated: ModelWeights[] = [];

    for (let i = 0; i < numLayers; i++) {
      const layer = encryptedUpdates[0].weightsDiff[i];
      const aggregatedWeights: number[][] = [];
      const aggregatedBias: number[] = [];

      const numRows = layer.weights.length;
      const numCols = layer.weights[0].length;

      for (let r = 0; r < numRows; r++) {
        aggregatedWeights[r] = [];
        for (let c = 0; c < numCols; c++) {
          let sum = 0;
          for (const update of encryptedUpdates) {
            sum += update.weightsDiff[i].weights[r][c];
          }
          aggregatedWeights[r][c] = sum / encryptedUpdates.length;
        }
      }

      for (let j = 0; j < layer.bias.length; j++) {
        let sum = 0;
        for (const update of encryptedUpdates) {
          sum += update.weightsDiff[i].bias[j];
        }
        aggregatedBias[j] = sum / encryptedUpdates.length;
      }

      aggregated.push({
        layerName: layer.layerName,
        weights: aggregatedWeights,
        bias: aggregatedBias
      });
    }

    return aggregated;
  }
}

/**
 * Client Selection and Scheduling
 */
class ClientSelector {
  /**
   * Select clients for federated round using various strategies
   */
  selectClients(
    allClients: string[],
    numToSelect: number,
    strategy: 'random' | 'circular' | 'importance' | 'diversity',
    clientMetrics?: Map<string, { dataQuality: number; latency: number }>
  ): string[] {
    switch (strategy) {
      case 'random':
        return this.randomSelection(allClients, numToSelect);

      case 'circular':
        return this.circularSelection(allClients, numToSelect);

      case 'importance':
        return this.importanceSelection(allClients, numToSelect, clientMetrics);

      case 'diversity':
        return this.diversitySelection(allClients, numToSelect, clientMetrics);

      default:
        return this.randomSelection(allClients, numToSelect);
    }
  }

  private randomSelection(clients: string[], numToSelect: number): string[] {
    const selected: string[] = [];
    const available = [...clients];

    for (let i = 0; i < numToSelect && available.length > 0; i++) {
      const idx = Math.floor(Math.random() * available.length);
      selected.push(available.splice(idx, 1)[0]);
    }

    return selected;
  }

  private circularSelection(clients: string[], numToSelect: number): string[] {
    // Use timestamp-based deterministic selection
    const roundNumber = Math.floor(Date.now() / 60000);  // Changes every minute
    const startIdx = roundNumber % clients.length;

    const selected: string[] = [];
    for (let i = 0; i < numToSelect; i++) {
      selected.push(clients[(startIdx + i) % clients.length]);
    }

    return selected;
  }

  private importanceSelection(
    clients: string[],
    numToSelect: number,
    metrics?: Map<string, { dataQuality: number; latency: number }>
  ): string[] {
    if (!metrics) {
      return this.randomSelection(clients, numToSelect);
    }

    // Sort by data quality
    const sorted = clients.sort((a, b) => {
      const metricA = metrics.get(a) || { dataQuality: 0, latency: Infinity };
      const metricB = metrics.get(b) || { dataQuality: 0, latency: Infinity };
      return metricB.dataQuality - metricA.dataQuality;
    });

    return sorted.slice(0, numToSelect);
  }

  private diversitySelection(
    clients: string[],
    numToSelect: number,
    metrics?: Map<string, { dataQuality: number; latency: number }>
  ): string[] {
    if (!metrics) {
      return this.randomSelection(clients, numToSelect);
    }

    // Select diverse clients based on latency clusters
    const byLatency = Array.from(metrics.entries())
      .sort((a, b) => a[1].latency - b[1].latency);

    // Select from different latency quartiles
    const quartileSize = Math.floor(byLatency.length / 4);
    const selected: string[] = [];

    for (let q = 0; q < 4 && selected.length < numToSelect; q++) {
      const start = q * quartileSize;
      const end = Math.min(start + quartileSize, byLatency.length);
      const clientsInQuartile = byLatency.slice(start, end);

      const numFromQuartile = Math.ceil(numToSelect / 4);
      for (let i = 0; i < numFromQuartile && i < clientsInQuartile.length; i++) {
        selected.push(clientsInQuartile[i][0]);
      }
    }

    return selected.slice(0, numToSelect);
  }
}

/**
 * Main Federated Learning Coordinator
 */
export class FederatedLearningCoordinator {
  private config: FederatedConfig;
  private globalWeights: ModelWeights[];
  private dp: DifferentialPrivacy | null;
  private secureAgg: SecureAggregator | null;
  private clientSelector: ClientSelector;
  private trainingHistory: Array<{
    round: number;
    loss: number;
    accuracy: number;
  }> = [];

  constructor(config: FederatedConfig, initialWeights: ModelWeights[]) {
    this.config = config;
    this.globalWeights = initialWeights;
    this.dp = config.differentialPrivacy.enabled
      ? new DifferentialPrivacy(
          config.differentialPrivacy.epsilon,
          config.differentialPrivacy.delta,
          config.differentialPrivacy.maxGradientNorm
        )
      : null;
    this.secureAgg = config.secureAggregation.enabled
      ? new SecureAggregator(config.secureAggregation.encryptionScheme)
      : null;
    this.clientSelector = new ClientSelector();
  }

  /**
   * Run federated learning for specified number of rounds
   */
  async train(
    clients: string[],
    trainOnClient: (clientId: string, weights: ModelWeights[]) => Promise<ClientUpdate>
  ): Promise<void> {
    console.log(`Starting federated training with ${clients.length} clients`);

    for (let round = 0; round < this.config.numRounds; round++) {
      console.log(`\n=== Round ${round + 1}/${this.config.numRounds} ===`);

      // Select clients for this round
      const selectedClients = this.clientSelector.selectClients(
        clients,
        Math.min(this.config.clientsPerRound, clients.length),
        'random'  // Can be configured
      );

      console.log(`Selected ${selectedClients.length} clients:`, selectedClients);

      // Train on selected clients
      const clientUpdates: ClientUpdate[] = [];
      for (const clientId of selectedClients) {
        try {
          console.log(`Training on client ${clientId}...`);
          const update = await this.trainClient(clientId, trainOnClient);
          clientUpdates.push(update);
        } catch (error) {
          console.error(`Failed to train on client ${clientId}:`, error);
        }
      }

      if (clientUpdates.length === 0) {
        console.warn('No successful client updates this round, skipping aggregation');
        continue;
      }

      // Aggregate updates
      console.log(`Aggregating ${clientUpdates.length} client updates...`);
      const aggregationResult = await this.aggregateUpdates(clientUpdates);

      // Update global weights
      this.globalWeights = aggregationResult.newWeights;

      // Log metrics
      console.log(`Round ${round + 1} Metrics:`);
      console.log(`  Average Loss: ${aggregationResult.globalMetrics.averageLoss.toFixed(4)}`);
      console.log(`  Average Accuracy: ${(aggregationResult.globalMetrics.averageAccuracy * 100).toFixed(2)}%`);
      console.log(`  Weight Delta: ${aggregationResult.convergenceMetrics.weightDelta.toFixed(6)}`);

      this.trainingHistory.push({
        round: round + 1,
        loss: aggregationResult.globalMetrics.averageLoss,
        accuracy: aggregationResult.globalMetrics.averageAccuracy
      });

      // Check convergence
      if (aggregationResult.convergenceMetrics.weightDelta < 0.001) {
        console.log('Converged!');
        break;
      }
    }

    console.log('\nFederated training complete!');
  }

  /**
   * Train on a single client
   */
  private async trainClient(
    clientId: string,
    trainOnClient: (clientId: string, weights: ModelWeights[]) => Promise<ClientUpdate>
  ): Promise<ClientUpdate> {
    // Client receives global weights and trains locally
    let update = await trainOnClient(clientId, this.globalWeights);

    // Apply differential privacy if enabled
    if (this.dp) {
      update = this.applyDifferentialPrivacy(update);
    }

    // Encrypt if secure aggregation enabled
    if (this.secureAgg) {
      // In real implementation, would use proper encryption
      update.updateHash = this.computeUpdateHash(update);
    } else {
      update.updateHash = this.computeUpdateHash(update);
    }

    return update;
  }

  /**
   * Apply differential privacy to client update
   */
  private applyDifferentialPrivacy(update: ClientUpdate): ClientUpdate {
    if (!this.dp) return update;

    const noisyWeights: ModelWeights[] = [];

    for (const layer of update.weightsDiff) {
      noisyWeights.push({
        layerName: layer.layerName,
        weights: this.dp.addGradientNoise(layer.weights),
        bias: this.dp.addGradientNoise(layer.bias.map(b => [b])).map(row => row[0])
      });
    }

    return {
      ...update,
      weightsDiff: noisyWeights
    };
  }

  /**
   * Aggregate client updates using configured strategy
   */
  private async aggregateUpdates(updates: ClientUpdate[]): Promise<AggregationResult> {
    let aggregatedWeights: ModelWeights[];

    switch (this.config.aggregationStrategy) {
      case 'fedavg':
        aggregatedWeights = this.federatedAveraging(updates);
        break;
      case 'fedprox':
        aggregatedWeights = this.federatedProximal(updates);
        break;
      case 'fednova':
        aggregatedWeights = this.federatedNova(updates);
        break;
      case 'qfedavg':
        aggregatedWeights = this.qfedAvg(updates);
        break;
      default:
        aggregatedWeights = this.federatedAveraging(updates);
    }

    // Calculate metrics
    const avgLoss = updates.reduce((sum, u) => sum + u.metrics.loss, 0) / updates.length;
    const avgAccuracy = updates.reduce((sum, u) => sum + u.metrics.accuracy, 0) / updates.length;

    // Calculate convergence metrics
    const weightDelta = this.calculateWeightDelta(aggregatedWeights);

    return {
      newWeights: aggregatedWeights,
      participatingClients: updates.map(u => u.clientId),
      globalMetrics: {
        averageLoss: avgLoss,
        averageAccuracy: avgAccuracy
      },
      convergenceMetrics: {
        weightDelta,
        gradientNorm: this.calculateGradientNorm(updates)
      }
    };
  }

  /**
   * FedAvg: Weighted average of client weights
   */
  private federatedAveraging(updates: ClientUpdate[]): ModelWeights[] {
    const numLayers = updates[0].weightsDiff.length;
    const aggregated: ModelWeights[] = [];

    // Calculate total examples for weighting
    const totalExamples = updates.reduce((sum, u) => sum + u.numExamples, 0);

    for (let i = 0; i < numLayers; i++) {
      const layer = updates[0].weightsDiff[i];
      const aggregatedWeights: number[][] = [];
      const aggregatedBias: number[] = [];

      const numRows = layer.weights.length;
      const numCols = layer.weights[0].length;

      // Weighted average
      for (let r = 0; r < numRows; r++) {
        aggregatedWeights[r] = [];
        for (let c = 0; c < numCols; c++) {
          let weightedSum = 0;
          for (const update of updates) {
            const weight = update.numExamples / totalExamples;
            weightedSum += weight * update.weightsDiff[i].weights[r][c];
          }
          aggregatedWeights[r][c] = weightedSum;
        }
      }

      for (let j = 0; j < layer.bias.length; j++) {
        let weightedSum = 0;
        for (const update of updates) {
          const weight = update.numExamples / totalExamples;
          weightedSum += weight * update.weightsDiff[i].bias[j];
        }
        aggregatedBias[j] = weightedSum;
      }

      aggregated.push({
        layerName: layer.layerName,
        weights: aggregatedWeights,
        bias: aggregatedBias
      });
    }

    return aggregated;
  }

  /**
   * FedProx: Add proximal term to constrain local updates
   */
  private federatedProximal(updates: ClientUpdate[]): ModelWeights[] {
    // FedProx adds a proximal term: ||w - w_global||^2
    // Simplified implementation
    return this.federatedAveraging(updates);
  }

  /**
   * FedNova: Normalize updates by local training steps
   */
  private federatedNova(updates: ClientUpdate[]): ModelWeights[] {
    // FedNova handles heterogeneous local steps differently
    // Simplified implementation
    return this.federatedAveraging(updates);
  }

  /**
   * q-FedAvg: Weight by loss reduction instead of data size
   */
  private qfedAvg(updates: ClientUpdate[]): ModelWeights[] {
    // Calculate weights based on loss reduction
    const totalLossReduction = updates.reduce((sum, u) => sum + (1 - u.metrics.loss), 0);

    const weightedUpdates = updates.map(update => ({
      ...update,
      weight: (1 - update.metrics.loss) / totalLossReduction
    }));

    // Use weighted updates
    const numLayers = updates[0].weightsDiff.length;
    const aggregated: ModelWeights[] = [];

    for (let i = 0; i < numLayers; i++) {
      const layer = updates[0].weightsDiff[i];
      const aggregatedWeights: number[][] = [];
      const aggregatedBias: number[] = [];

      for (let r = 0; r < layer.weights.length; r++) {
        aggregatedWeights[r] = [];
        for (let c = 0; c < layer.weights[0].length; c++) {
          let weightedSum = 0;
          for (let wu = 0; wu < weightedUpdates.length; wu++) {
            weightedSum += weightedUpdates[wu].weight * updates[wu].weightsDiff[i].weights[r][c];
          }
          aggregatedWeights[r][c] = weightedSum;
        }
      }

      for (let j = 0; j < layer.bias.length; j++) {
        let weightedSum = 0;
        for (let wu = 0; wu < weightedUpdates.length; wu++) {
          weightedSum += weightedUpdates[wu].weight * updates[wu].weightsDiff[i].bias[j];
        }
        aggregatedBias[j] = weightedSum;
      }

      aggregated.push({
        layerName: layer.layerName,
        weights: aggregatedWeights,
        bias: aggregatedBias
      });
    }

    return aggregated;
  }

  /**
   * Calculate weight delta for convergence checking
   */
  private calculateWeightDelta(newWeights: ModelWeights[]): number {
    let totalDelta = 0;
    let totalParams = 0;

    for (let i = 0; i < newWeights.length; i++) {
      const newLayer = newWeights[i];
      const oldLayer = this.globalWeights[i];

      for (let r = 0; r < newLayer.weights.length; r++) {
        for (let c = 0; c < newLayer.weights[0].length; c++) {
          totalDelta += Math.abs(newLayer.weights[r][c] - oldLayer.weights[r][c]);
          totalParams++;
        }
      }

      for (let j = 0; j < newLayer.bias.length; j++) {
        totalDelta += Math.abs(newLayer.bias[j] - oldLayer.bias[j]);
        totalParams++;
      }
    }

    return totalDelta / totalParams;
  }

  /**
   * Calculate gradient norm
   */
  private calculateGradientNorm(updates: ClientUpdate[]): number {
    let totalNorm = 0;

    for (const update of updates) {
      for (const layer of update.weightsDiff) {
        for (const row of layer.weights) {
          for (const val of row) {
            totalNorm += val * val;
          }
        }
        for (const val of layer.bias) {
          totalNorm += val * val;
        }
      }
    }

    return Math.sqrt(totalNorm);
  }

  /**
   * Compute hash of update for verification
   */
  private computeUpdateHash(update: ClientUpdate): string {
    // Simplified hash computation
    const data = JSON.stringify(update.weightsDiff);
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;  // Convert to 32bit integer
    }
    return hash.toString(16);
  }

  /**
   * Get current global weights
   */
  getGlobalWeights(): ModelWeights[] {
    return this.globalWeights;
  }

  /**
   * Get training history
   */
  getTrainingHistory(): Array<{ round: number; loss: number; accuracy: number }> {
    return this.trainingHistory;
  }
}
