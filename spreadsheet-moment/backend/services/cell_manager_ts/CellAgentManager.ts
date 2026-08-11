/**
 * CellAgentManager - Bridges spreadsheet cell addresses to geometric manifold coordinates.
 * Implementation of the Claw-Cell bridge logic.
 */

export type ManifoldCoord = [number, number, number];

export class CellAgentManager {
  private cellToAgentMap: Map<string, string>; // cellAddress -> agentId
  private agentToCellMap: Map<string, string>; // agentId -> cellAddress

  constructor() {
    this.cellToAgentMap = new Map();
    this.agentToCellMap = new Map();
  }

  /**
   * Registers a mapping between a spreadsheet cell and a cellular agent.
   * @param cellAddress e.g., 'A1', 'B2'
   * @param agentId Unique identifier for the agent
   */
  public registerCell(cellAddress: string, agentId: string): void {
    // Normalize cell address (e.g., 'a1' -> 'A1')
    const normalizedAddress = cellAddress.toUpperCase();
    
    this.cellToAgentMap.set(normalizedAddress, agentId);
    this.agentToCellMap.set(agentId, normalizedAddress);
    
    console.log(`[CellAgentManager] Registered: ${normalizedAddress} <-> ${agentId}`);
  }

  /**
   * Calculates the deterministic [x, y, z] coordinate for a given cell address.
   * Coordinate system: Column = X, Row = Y, Z = 0 (for 2D spreadsheet plane).
   * @param cellAddress e.g., 'A1', 'B1'
   * @returns [x, y, z] manifold coordinates
   */
  public getManifoldCoord(cellAddress: string): ManifoldCoord {
    const normalized = cellAddress.toUpperCase();
    const match = normalized.match(/^([A-Z]+)([0-9]+)$/);

    if (!match) {
      throw new Error(`Invalid cell address format: ${cellAddress}`);
    }

    const columnStr = match[1];
    const rowNumber = parseInt(match[2], 10);

    const colIndex = this.columnToIndex(columnStr);
    const rowIndex = rowNumber - 1; // 1-based to 0-based

    // Return [x, y, z]
    return [colIndex, rowIndex, 0];
  }

  /**
   * Simulates sending a command to an agent via a WebSocket/Bridge.
   * @param agentId The target agent
   * @param command The command payload
   */
  public sendCommand(agentId: string, command: any): void {
    const cellAddress = this.agentToCellMap.get(agentId);
    const coord = cellAddress ? this.getManifoldCoord(cellAddress) : null;

    console.log(`[CellAgentManager] SENDING COMMAND to Agent ${agentId} (at ${cellAddress || 'UNKNOWN'} | Coord: ${JSON.stringify(coord)}):`, command);
    
    // Placeholder for actual WebSocket implementation:
    // this.wsClient.send(JSON.stringify({ agentId, command, coord }));
  }

  /**
   * Converts Excel-style column string (A, B, ..., Z, AA, AB...) to 0-based index.
   */
  private columnToIndex(column: string): number {
    let index = 0;
    for (let i = 0; i < column.length; i++) {
      index = index * 26 + (column.charCodeAt(i) - 'A'.charCodeAt(0) + 1);
    }
    return index - 1;
  }

  /**
   * Returns the agent currently occupying a specific cell.
   */
  public getAgentAtCell(cellAddress: string): string | undefined {
    return this.cellToAgentMap.get(cellAddress.toUpperCase());
  }
}
