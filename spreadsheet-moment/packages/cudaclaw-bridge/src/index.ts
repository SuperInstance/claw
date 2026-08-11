/**
 * @spreadsheet-moment/cudaclaw-bridge
 *
 * GPU-accelerated SmartCRDT bridge for SpreadsheetMoment using CudaClaw.
 *
 * @packageDocumentation
 */

// ============================================================================
// EXPORTS
// ============================================================================

// Main client
export { default as CudaClawClient } from './CudaClawClient';

// SmartCRDT cell
export {
  default as SmartCRDTCell,
  createSmartCRDTCell,
  resolveSmartCRDTConflicts,
  mergeSmartCRDTCells,
} from './SmartCRDTCell';

// Batch updater
export {
  BatchUpdater,
  createBatchUpdater,
  executeOneTimeBatch,
} from './BatchUpdater';

// StateManager Integration
// Temporarily disabled due to missing type dependencies
// export { default as StateManagerIntegration } from './StateManagerIntegration';

// Types
export * from './types';

// ============================================================================
// VERSION
// ============================================================================

export const VERSION = '0.1.0';

// ============================================================================
// CONVENIENCE EXPORTS
// ============================================================================

/**
 * Create a configured CudaClaw client
 */
export function createCudaClawClient(config: {
  serverUrl: string;
  websocketUrl?: string;
  apiKey?: string;
  timeout?: number;
  enableWebSocket?: boolean;
  enableGPUAcceleration?: boolean;
}) {
  const { default: CudaClawClient } = require('./CudaClawClient');
  return new CudaClawClient(config);
}

/**
 * Quick start helper
 */
export async function quickStart(config: {
  serverUrl: string;
  sheetId: string;
}) {
  const client = createCudaClawClient({
    serverUrl: config.serverUrl,
    enableGPUAcceleration: true,
  });

  await client.connect();

  return {
    client,
    updateCell: (row: number, col: number, value: number | string) =>
      client.updateCell(config.sheetId, { row, col }, value),
    getCell: (row: number, col: number) =>
      client.getCell(config.sheetId, { row, col }),
    disconnect: () => client.disconnect(),
  };
}
