/**
 * CellAgentManager - Bridges spreadsheet cells to the Claw engine.
 * 
 * This manager handles:
 * 1. Registering a spreadsheet cell as a 'Claw' agent instance.
 * 2. Translating cell addresses (e.g., 'A1') to manifold coordinates (e.g., [x, y, z]).
 * 3. Providing a bridge to send WebSocket commands to the Claw engine.
 */

import { WebSocket } from 'ws'; // or appropriate WS client for runtime
import { EventEmitter } from 'events';

// Mock or Import interfaces based on project structure
export interface ManifoldCoordinates {
  x: number;
  y: number;
  z: number;
}

export type CellAddress = string;

export interface ClawCommand {
  type: string;
  payload: any;
  traceId: string;
}

export interface CellAgent {
  address: CellAddress;
  coordinates: ManifoldCoordinates;
  agentId: string;
}

export class CellAgentManager extends EventEmitter {
  private agents: Map<CellAddress, CellAgent> = new Map();
  private ws: WebSocket | null = null;
  private manifoldMapper: (address: CellAddress) => ManifoldCoordinates;

  constructor(
    wsUrl: string,
    manifoldMapper: (address: CellAddress) => ManifoldCoordinates
  ) {
    super();
    this.manifoldMapper = manifoldMapper;
    this.setupWebSocket(wsUrl);
  }

  /**
   * Sets up the WebSocket connection to the Claw engine.
   */
  private setupWebSocket(url: string): void {
    this.ws = new WebSocket(url);

    this.ws.on('open', () => {
      this.emit('connected');
    });

    this.ws.on('message', (data: string) => {
      try {
        const message = JSON.parse(data);
        this.emit('message', message);
      } catch (error) {
        this.emit('error', `Failed to parse WebSocket message: ${error}`);
      }
    });

    this.ws.on('error', (error: Error) => {
      this.emit('error', error);
    });

    this.ws.on('close', () => {
      this.emit('disconnected');
    });
  }

  /**
   * Registers a cell as a 'Claw' instance.
   */
  public registerCell(address: CellAddress): CellAgent {
    if (this.agents.has(address)) {
      throw new Error(`Cell at ${address} is already registered.`);
    }

    const agent: CellAgent = {
      address,
      coordinates: this.manifoldMapper(address),
      agentId: `agent-${address.replace(/[^a-zA-Z0-9]/g, '_')}-${Date.now()}`,
    };

    this.agents.set(address, agent);
    this.emit('cell_registered', agent);
    return agent;
  }

  /**
   * Unregisters a cell.
   */
  public unregisterCell(address: CellAddress): void {
    const agent = this.agents.get(address);
    if (agent) {
      this.agents.delete(address);
      this.emit('cell_unregistered', agent);
    }
  }

  /**
   * Sends a command to the Claw engine via WebSocket.
   */
  public sendCommand(address: CellAddress, command: ClawCommand): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected.');
    }

    const agent = this.agents.get(address);
    if (!agent) {
      throw new Error(`No agent registered at address ${address}`);
    }

    // Add spatial metadata to the command payload
    const enrichedPayload = {
      ...command.payload,
      agentId: agent.agentId,
      coordinates: agent.coordinates,
    };

    const message: ClawCommand = {
      ...command,
      payload: enrichedPayload,
    };

    this.ws.send(JSON.stringify(message));
    this.emit('command_sent', { address, command });
  }

  /**
   * Get the registered agent for a cell address.
   */
  public getAgent(address: CellAddress): CellAgent | undefined {
    return this.agents.get(address);
  }

  /**
   * Closes the WebSocket connection.
   */
  public close(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
