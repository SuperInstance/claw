/**
 * CellAgentManager bridges spreadsheet cells to the Claw agent engine.
 * It maps cell addresses to a geometric manifold and handles command dispatch.
 */

export type ManifoldCoordinate = [number, number, number];

export interface AgentCommand {
    type: string;
    payload: any;
}

export class CellAgentManager {
    private cellToAgentMap: Map<string, string> = new Map();

    /**
     * Maps a cell address (e.g., 'B3') to a specific agent ID.
     * @param cellAddress The spreadsheet cell address.
     * @param agentId The unique ID of the agent to associate with this cell.
     */
    public registerCell(cellAddress: string, agentId: string): void {
        this.cellToAgentMap.set(cellAddress, agentId);
    }

    /**
     * Returns the agent ID associated with a cell address.
     * @param cellAddress The spreadsheet cell address.
     * @returns The agent ID or undefined if none is registered.
     */
    public getAgentId(cellAddress: string): string | undefined {
        return this.cellToAgentMap.get(cellAddress);
    }

    /**
     * Deterministically converts a cell address (e.g., 'A1', 'B3') to a 3D manifold coordinate.
     * Mapping logic:
     * 'A1' -> [0, 0, 0]
     * 'B1' -> [1, 0, 0]
     * 'A2' -> [0, 1, 0]
     * 
     * @param cellAddress The spreadsheet cell address.
     * @returns The [x, y, z] coordinate in the manifold.
     */
    public getManifoldCoord(cellAddress: string): ManifoldCoordinate {
        const match = cellAddress.match(/^([A-Z]+)(\d+)$/);
        if (!match) {
            throw new Error(`Invalid cell address format: ${cellAddress}`);
        }

        const columnStr = match[1];
        const rowStr = match[2];

        // Convert column letters to a number (A=0, B=1, etc.)
        let col = 0;
        for (let i = 0; i < columnStr.length; i++) {
            col = col * 26 + (columnStr.charCodeAt(i) - 'A'.charCodeAt(0) + 1);
        }
        const x = col - 1;

        // Convert row number to a number (1=0, 2=1, etc.)
        const y = parseInt(rowStr, 10) - 1;

        // We use z=0 for the base spreadsheet plane
        return [x, y, 0];
    }

    /**
     * Placeholder for sending a command to an agent via WebSocket.
     * In a real implementation, this would interface with the Claw engine's communication layer.
     * 
     * @param agentId The ID of the target agent.
     * @param command The command object to dispatch.
     */
    public async sendCommand(agentId: string, command: AgentCommand): Promise<void> {
        console.log(`[CellAgentManager] Dispatching command to agent ${agentId}:`, command);
        
        // TODO: Implement actual WebSocket dispatch to Claw engine
        // Example: this.socket.send(JSON.stringify({ agentId, ...command }));
        
        return Promise.resolve();
    }
}
