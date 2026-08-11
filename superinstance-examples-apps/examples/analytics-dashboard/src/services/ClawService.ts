import { io, Socket } from 'socket.io-client';
import type { Agent, AgentCreateConfig, TriggerResult } from '../types';

class ClawServiceClass {
  private socket: Socket | null = null;
  private endpoint: string;
  private apiKey: string;
  private agents: Map<string, Agent> = new Map();

  constructor() {
    this.endpoint = process.env.VITE_CLAW_ENDPOINT || 'ws://localhost:8080';
    this.apiKey = process.env.VITE_CLAW_API_KEY || '';
  }

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = io(this.endpoint, {
        auth: { apiKey: this.apiKey },
        transports: ['websocket']
      });

      this.socket.on('connect', () => {
        console.log('Connected to Claw service');
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('Claw service connection error:', error);
        reject(error);
      });

      this.socket.on('agent-update', (data) => {
        const agent = this.agents.get(data.agentId);
        if (agent) {
          this.agents.set(data.agentId, { ...agent, ...data.data });
        }
      });
    });
  }

  async createAgents(configs: Partial<Agent>[]): Promise<Agent[]> {
    const response = await fetch(`${this.endpoint.replace('ws://', 'http://')}/api/agents/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({ agents: configs })
    });

    if (!response.ok) {
      throw new Error(`Failed to create agents: ${response.statusText}`);
    }

    const { agents } = await response.json();

    agents.forEach((agent: Agent) => {
      this.agents.set(agent.id, agent);
    });

    return agents;
  }

  async createAgent(config: Partial<Agent>): Promise<Agent> {
    const response = await fetch(`${this.endpoint.replace('ws://', 'http://')}/api/agents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(config)
    });

    if (!response.ok) {
      throw new Error(`Failed to create agent: ${response.statusText}`);
    }

    const agent = await response.json();
    this.agents.set(agent.id, agent);
    return agent;
  }

  async triggerAgent(agentId: string, data: any): Promise<TriggerResult> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    const startTime = Date.now();

    const response = await fetch(
      `${this.endpoint.replace('ws://', 'http://')}/api/agents/${agentId}/trigger`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(data)
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to trigger agent: ${response.statusText}`);
    }

    const result = await response.json();
    const latency = Date.now() - startTime;

    // Update agent stats
    const updatedAgent = this.agents.get(agentId);
    if (updatedAgent) {
      updatedAgent.stats = {
        ...updatedAgent.stats,
        triggers: updatedAgent.stats.triggers + 1,
        avgLatency:
          (updatedAgent.stats.avgLatency * updatedAgent.stats.triggers + latency) /
          (updatedAgent.stats.triggers + 1),
        lastTrigger: new Date().toISOString()
      };
      this.agents.set(agentId, updatedAgent);
    }

    return {
      ...result,
      latency
    };
  }

  async getAgent(agentId: string): Promise<Agent | undefined> {
    return this.agents.get(agentId);
  }

  async getAllAgents(): Promise<Agent[]> {
    return Array.from(this.agents.values());
  }

  async deleteAgent(agentId: string): Promise<void> {
    const response = await fetch(
      `${this.endpoint.replace('ws://', 'http://')}/api/agents/${agentId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to delete agent: ${response.statusText}`);
    }

    this.agents.delete(agentId);
  }

  async getMetrics(): Promise<any> {
    const response = await fetch(
      `${this.endpoint.replace('ws://', 'http://')}/api/metrics`,
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get metrics: ${response.statusText}`);
    }

    return response.json();
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.agents.clear();
  }
}

export const ClawService = new ClawServiceClass();
