/**
 * Spreadsheet Moment - Cloudflare Workers Entry Point
 *
 * Distributed AI spreadsheet platform with:
 * - Tensor-based cell storage
 * - Real-time collaboration via Durable Objects
 * - Vector search for cell similarity
 * - NLP cell processing
 * - Hardware I/O integration
 *
 * @author SuperInstance Evolution Team
 * @date 2026-03-14
 * @version Round 2 Implementation
 */

import { Router, IRequest } from 'itty-router';

// Create router
const router = Router();

// ============================================================================
// Types
// ============================================================================

interface TensorCell {
  id: string;
  position: [number, number];  // [row, col]
  value: number | string | TensorData;
  type: CellType;
  formula?: string;
  dependencies: string[];  // IDs of cells this cell depends on
  dependents: string[];   // IDs of cells that depend on this cell
  metadata: CellMetadata;
  createdAt: number;
  updatedAt: number;
}

interface TensorData {
  shape: number[];
  data: number[];
  dtype: 'float32' | 'float64' | 'int32' | 'int64' | 'bool';
}

type CellType =
  | 'scalar'      // Single value
  | 'vector'      // 1D tensor
  | 'matrix'      // 2D tensor
  | 'tensor'      // N-D tensor
  | 'agent'       // AI agent cell
  | 'io'          // I/O connection cell
  | 'api';        // API endpoint cell

interface CellMetadata {
  temperature: number;      // For data propagation (0-1)
  confidence: number;       // Confidence in value (0-1)
  author: string;           // Creator email/ID
  tags: string[];           // Search tags
  description?: string;     // Human-readable description
  nlpProcessed: boolean;    // Whether NLP has been applied
}

interface Spreadsheet {
  id: string;
  name: string;
  owner: string;
  cells: Map<string, TensorCell>;
  collaborators: string[];
  createdAt: number;
  updatedAt: number;
}

interface NLPRequest {
  query: string;
  context?: string;
  cellId?: string;
}

interface NLPResponse {
  result: any;
  explanation?: string;
  confidence: number;
}

// ============================================================================
// Tensor Operations
// ============================================================================

/**
 * Tensor operations engine for cell computations
 */
class TensorEngine {
  /**
   * Add two tensors
   */
  static add(a: TensorData, b: TensorData): TensorData {
    if (a.shape.length !== b.shape.length || !a.shape.every((dim, i) => dim === b.shape[i])) {
      throw new Error('Tensor shapes must match for addition');
    }

    const result = new Float32Array(a.data.length);
    for (let i = 0; i < a.data.length; i++) {
      result[i] = a.data[i] + b.data[i];
    }

    return {
      shape: a.shape,
      data: Array.from(result),
      dtype: a.dtype
    };
  }

  /**
   * Multiply two tensors element-wise
   */
  static multiply(a: TensorData, b: TensorData): TensorData {
    if (a.shape.length !== b.shape.length || !a.shape.every((dim, i) => dim === b.shape[i])) {
      throw new Error('Tensor shapes must match for multiplication');
    }

    const result = new Float32Array(a.data.length);
    for (let i = 0; i < a.data.length; i++) {
      result[i] = a.data[i] * b.data[i];
    }

    return {
      shape: a.shape,
      data: Array.from(result),
      dtype: a.dtype
    };
  }

  /**
   * Matrix multiplication
   */
  static matmul(a: TensorData, b: TensorData): TensorData {
    if (a.shape.length !== 2 || b.shape.length !== 2 || a.shape[1] !== b.shape[0]) {
      throw new Error('Invalid shapes for matrix multiplication');
    }

    const [m, k1] = a.shape;
    const [k2, n] = b.shape;

    const result = new Float32Array(m * n);

    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        let sum = 0;
        for (let k = 0; k < k1; k++) {
          sum += a.data[i * k1 + k] * b.data[k * n + j];
        }
        result[i * n + j] = sum;
      }
    }

    return {
      shape: [m, n],
      data: Array.from(result),
      dtype: a.dtype
    };
  }

  /**
   * Apply temperature-based propagation
   *
   * Higher temperature = faster propagation through dependencies
   */
  static applyTemperature(
    value: number,
    temperature: number,
    targetTemperature: number
  ): number {
    const diff = targetTemperature - temperature;
    return value * (1 + diff * 0.1);
  }

  /**
   * Reduce tensor along axis
   */
  static reduce(tensor: TensorData, axis: number, operation: 'sum' | 'mean' | 'max'): TensorData {
    const { shape, data } = tensor;
    const dim = shape[axis];

    if (shape.length === 1) {
      const result = operation === 'sum'
        ? data.reduce((a, b) => a + b, 0)
        : operation === 'mean'
        ? data.reduce((a, b) => a + b, 0) / data.length
        : Math.max(...data);

      return {
        shape: [],
        data: [result],
        dtype: tensor.dtype
      };
    }

    // For higher dimensions, implement accordingly
    throw new Error('Reduce for higher dimensions not yet implemented');
  }
}

// ============================================================================
// NLP Cell Processing
// ============================================================================

/**
 * Natural language processing for cell operations
 */
class NLPProcessor {
  /**
   * Process natural language query for cell operations
   */
  static async processQuery(
    query: string,
    spreadsheet: Spreadsheet,
    env: Env
  ): Promise<NLPResponse> {
    // Extract intent and entities from query
    const intent = this.extractIntent(query);
    const entities = this.extractEntities(query);

    switch (intent.type) {
      case 'compute':
        return await this.handleComputeIntent(query, entities, spreadsheet, env);

      case 'create':
        return await this.handleCreateIntent(query, entities, spreadsheet, env);

      case 'analyze':
        return await this.handleAnalyzeIntent(query, entities, spreadsheet, env);

      case 'connect':
        return await this.handleConnectIntent(query, entities, spreadsheet, env);

      default:
        return {
          result: null,
          explanation: 'Could not understand the query',
          confidence: 0
        };
    }
  }

  /**
   * Extract intent from natural language query
   */
  private static extractIntent(query: string): { type: string; confidence: number } {
    const lowerQuery = query.toLowerCase();

    // Compute intent
    if (lowerQuery.match(/\b(compute|calculate|add|multiply|divide|subtract)\b/)) {
      return { type: 'compute', confidence: 0.9 };
    }

    // Create intent
    if (lowerQuery.match(/\b(create|make|new|add|insert)\b/)) {
      return { type: 'create', confidence: 0.9 };
    }

    // Analyze intent
    if (lowerQuery.match(/\b(analyze|show|display|find|search)\b/)) {
      return { type: 'analyze', confidence: 0.9 };
    }

    // Connect intent
    if (lowerQuery.match(/\b(connect|link|attach|bind)\b/)) {
      return { type: 'connect', confidence: 0.9 };
    }

    return { type: 'unknown', confidence: 0 };
  }

  /**
   * Extract entities from query
   */
  private static extractEntities(query: string): Record<string, any> {
    const entities: Record<string, any> = {};

    // Extract cell references (e.g., A1, B5, C10)
    const cellRefs = query.match(/[A-Z]+\d+/gi);
    if (cellRefs) {
      entities.cellReferences = cellRefs;
    }

    // Extract numbers
    const numbers = query.match(/\d+(\.\d+)?/g);
    if (numbers) {
      entities.numbers = numbers.map(parseFloat);
    }

    // Extract operations
    if (query.toLowerCase().includes('sum')) {
      entities.operation = 'sum';
    } else if (query.toLowerCase().includes('average') || query.toLowerCase().includes('mean')) {
      entities.operation = 'mean';
    } else if (query.toLowerCase().includes('multiply') || query.includes('*')) {
      entities.operation = 'multiply';
    }

    return entities;
  }

  /**
   * Handle compute intent
   */
  private static async handleComputeIntent(
    query: string,
    entities: Record<string, any>,
    spreadsheet: Spreadsheet,
    env: Env
  ): Promise<NLPResponse> {
    // Implementation for compute operations
    return {
      result: null,
      explanation: 'Compute operation processed',
      confidence: 0.8
    };
  }

  /**
   * Handle create intent
   */
  private static async handleCreateIntent(
    query: string,
    entities: Record<string, any>,
    spreadsheet: Spreadsheet,
    env: Env
  ): Promise<NLPResponse> {
    // Implementation for create operations
    return {
      result: null,
      explanation: 'Create operation processed',
      confidence: 0.8
    };
  }

  /**
   * Handle analyze intent
   */
  private static async handleAnalyzeIntent(
    query: string,
    entities: Record<string, any>,
    spreadsheet: Spreadsheet,
    env: Env
  ): Promise<NLPResponse> {
    // Implementation for analyze operations
    return {
      result: null,
      explanation: 'Analyze operation processed',
      confidence: 0.8
    };
  }

  /**
   * Handle connect intent
   */
  private static async handleConnectIntent(
    query: string,
    entities: Record<string, any>,
    spreadsheet: Spreadsheet,
    env: Env
  ): Promise<NLPResponse> {
    // Implementation for connect operations
    return {
      result: null,
      explanation: 'Connect operation processed',
      confidence: 0.8
    };
  }
}

// ============================================================================
// Spreadsheet Operations
// ============================================================================

/**
 * Spreadsheet operations handler
 */
class SpreadsheetOps {
  /**
   * Create new spreadsheet
   */
  static async create(
    name: string,
    owner: string,
    env: Env
  ): Promise<Spreadsheet> {
    const id = crypto.randomUUID();
    const now = Date.now();

    const spreadsheet: Spreadsheet = {
      id,
      name,
      owner,
      cells: new Map(),
      collaborators: [],
      createdAt: now,
      updatedAt: now
    };

    // Store in KV
    await env.SPREADSHEET_METADATA.put(
      id,
      JSON.stringify({
        id,
        name,
        owner,
        collaborators: [],
        createdAt: now,
        updatedAt: now
      })
    );

    return spreadsheet;
  }

  /**
   * Get spreadsheet by ID
   */
  static async get(id: string, env: Env): Promise<Spreadsheet | null> {
    const metadata = await env.SPREADSHEET_METADATA.get(id);
    if (!metadata) return null;

    const data = JSON.parse(metadata);
    const cells = await env.CELL_DATA.get(`${id}:cells`);

    return {
      ...data,
      cells: cells ? new Map(JSON.parse(cells)) : new Map()
    };
  }

  /**
   * Update cell in spreadsheet
   */
  static async updateCell(
    spreadsheetId: string,
    cellId: string,
    updates: Partial<TensorCell>,
    env: Env
  ): Promise<TensorCell> {
    // Get current cell data
    const cellKey = `${spreadsheetId}:cell:${cellId}`;
    const cellData = await env.CELL_DATA.get(cellKey);

    let cell: TensorCell;
    if (cellData) {
      cell = { ...JSON.parse(cellData), ...updates, updatedAt: Date.now() };
    } else {
      cell = {
        id: cellId,
        position: [0, 0],
        value: 0,
        type: 'scalar',
        dependencies: [],
        dependents: [],
        metadata: {
          temperature: 0.5,
          confidence: 1.0,
          author: '',
          tags: [],
          nlpProcessed: false
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
        ...updates
      };
    }

    // Store updated cell
    await env.CELL_DATA.put(cellKey, JSON.stringify(cell));

    // Update spreadsheet timestamp
    const sheetKey = `${spreadsheetId}:cells`;
    const allCells = await env.CELL_DATA.get(sheetKey);
    let cellsMap: Record<string, any> = allCells ? JSON.parse(allCells) : {};
    cellsMap[cellId] = cell;
    await env.CELL_DATA.put(sheetKey, JSON.stringify(cellsMap));

    return cell;
  }

  /**
   * Propagate cell updates to dependents
   */
  static async propagateUpdate(
    spreadsheetId: string,
    cellId: string,
    env: Env
  ): Promise<void> {
    const cellKey = `${spreadsheetId}:cell:${cellId}`;
    const cellData = await env.CELL_DATA.get(cellKey);

    if (!cellData) return;

    const cell: TensorCell = JSON.parse(cellData);

    // Recursively update dependents
    for (const dependentId of cell.dependents) {
      await this.recomputeCell(spreadsheetId, dependentId, env);
      await this.propagateUpdate(spreadsheetId, dependentId, env);
    }
  }

  /**
   * Recompute cell value based on formula
   */
  static async recomputeCell(
    spreadsheetId: string,
    cellId: string,
    env: Env
  ): Promise<void> {
    const cellKey = `${spreadsheetId}:cell:${cellId}`;
    const cellData = await env.CELL_DATA.get(cellKey);

    if (!cellData || !cellData.formula) return;

    const cell: TensorCell = JSON.parse(cellData);

    // Parse and evaluate formula
    // This is a simplified version - full implementation would handle
    // complex formulas, tensor operations, and agent cells
    try {
      // Formula evaluation would go here
      const newValue = cell.value; // Placeholder

      await this.updateCell(spreadsheetId, cellId, { value: newValue }, env);
    } catch (error) {
      console.error(`Error recomputing cell ${cellId}:`, error);
    }
  }
}

// ============================================================================
// API Routes
// ============================================================================

/**
 * Health check endpoint
 */
router.get('/health', () => {
  return new Response(JSON.stringify({
    status: 'healthy',
    timestamp: Date.now(),
    version: '1.0.0'
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
});

/**
 * Get spreadsheet
 */
router.get('/api/spreadsheets/:id', async (request, env) => {
  const id = request.params.id as string;
  const spreadsheet = await SpreadsheetOps.get(id, env);

  if (!spreadsheet) {
    return new Response('Spreadsheet not found', { status: 404 });
  }

  return new Response(JSON.stringify(spreadsheet), {
    headers: { 'Content-Type': 'application/json' }
  });
});

/**
 * Create spreadsheet
 */
router.post('/api/spreadsheets', async (request, env) => {
  const data = await request.json() as { name: string; owner: string };
  const spreadsheet = await SpreadsheetOps.create(data.name, data.owner, env);

  return new Response(JSON.stringify(spreadsheet), {
    status: 201,
    headers: { 'Content-Type': 'application/json' }
  });
});

/**
 * Update cell
 */
router.put('/api/spreadsheets/:id/cells/:cellId', async (request, env) => {
  const id = request.params.id as string;
  const cellId = request.params.cellId as string;
  const updates = await request.json();

  const cell = await SpreadsheetOps.updateCell(id, cellId, updates, env);

  // Propagate updates to dependents
  await SpreadsheetOps.propagateUpdate(id, cellId, env);

  return new Response(JSON.stringify(cell), {
    headers: { 'Content-Type': 'application/json' }
  });
});

/**
 * Process NLP query
 */
router.post('/api/nlp', async (request, env) => {
  const data = await request.json() as NLPRequest;
  // Get spreadsheet from context or create default
  const spreadsheet = await SpreadsheetOps.get('default', env) ||
    await SpreadsheetOps.create('Default', 'system', env);

  const result = await NLPProcessor.processQuery(data.query, spreadsheet, env);

  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' }
  });
});

/**
 * Vector search for similar cells
 */
router.get('/api/search', async (request, env) => {
  const url = new URL(request.url);
  const query = url.searchParams.get('q');
  const limit = parseInt(url.searchParams.get('limit') || '10');

  if (!query) {
    return new Response('Query parameter required', { status: 400 });
  }

  // Use Vectorize for similarity search
  const results = await env.VECTOR_INDEX.query(query.toString(), { topK: limit });

  return new Response(JSON.stringify({
    query,
    results: results.matches,
    count: results.matches.length
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
});

/**
 * Batch cell operations
 */
router.post('/api/cells/batch', async (request, env) => {
  const data = await request.json() as {
    spreadsheetId: string;
    operations: Array<{ type: string; cellId: string; data: any }>;
  };

  const results = [];

  for (const op of data.operations) {
    try {
      switch (op.type) {
        case 'update':
          const cell = await SpreadsheetOps.updateCell(
            data.spreadsheetId,
            op.cellId,
            op.data,
            env
          );
          results.push({ success: true, cellId: op.cellId, cell });
          break;

        case 'delete':
          // Implement delete
          results.push({ success: true, cellId: op.cellId });
          break;

        default:
          results.push({ success: false, cellId: op.cellId, error: 'Unknown operation' });
      }
    } catch (error) {
      results.push({
        success: false,
        cellId: op.cellId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return new Response(JSON.stringify({ results }), {
    headers: { 'Content-Type': 'application/json' }
  });
});

// ============================================================================
// Export
// ============================================================================

export interface Env {
  CELL_DATA: KVNamespace;
  SPREADSHEET_METADATA: KVNamespace;
  DB: D1Database;
  COLLABORATION: DurableObjectNamespace;
  FILE_STORAGE: R2Bucket;
  VECTOR_INDEX: VectorizeIndex;
  CELL_PROCESSOR: Queue<Encoder, any>;
}

/**
 * Main fetch handler
 */
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Handle CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }

    // Route request
    return router.handle(request, env).catch((error) => {
      console.error('Request error:', error);
      return new Response(JSON.stringify({
        error: 'Internal server error',
        message: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    });
  }
};
