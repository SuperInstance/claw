import React, { useEffect, useState } from 'react';
import { useDashboardStore } from './store/dashboardStore';
import AgentGrid from './components/AgentGrid';
import MetricsPanel from './components/MetricsPanel';
import AlertPanel from './components/AlertPanel';
import Visualization3D from './components/Visualization3D';
import HeatMap from './components/HeatMap';
import WebSocketManager from './services/WebSocketManager';
import ClawService from './services/ClawService';
import GeoService from './services/GeoService';
import type { Agent, Alert, Metric } from './types';
import './App.css';

const App: React.FC = () => {
  const {
    agents,
    alerts,
    metrics,
    addAgent,
    updateAgent,
    addAlert,
    updateMetrics,
    setIsConnected
  } = useDashboardStore();

  const [view, setView] = useState<'grid' | '3d' | 'heatmap'>('grid');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeDashboard();
    return () => {
      WebSocketManager.disconnect();
    };
  }, []);

  const initializeDashboard = async () => {
    try {
      // Initialize services
      await ClawService.initialize();
      await GeoService.initialize();

      // Connect WebSocket
      WebSocketManager.connect({
        onMessage: handleWebSocketMessage,
        onConnect: () => {
          console.log('WebSocket connected');
          setIsConnected(true);
        },
        onDisconnect: () => {
          console.log('WebSocket disconnected');
          setIsConnected(false);
        }
      });

      // Create initial agents
      const agentCount = parseInt(process.env.VITE_AGENT_COUNT || '1000');
      await createAgents(agentCount);

      setLoading(false);
    } catch (error) {
      console.error('Failed to initialize dashboard:', error);
      addAlert({
        id: 'init-error',
        severity: 'critical',
        message: 'Failed to initialize dashboard',
        timestamp: new Date().toISOString(),
        data: error
      });
    }
  };

  const createAgents = async (count: number) => {
    const batchSize = 100;
    for (let i = 0; i < count; i += batchSize) {
      const batch = Array.from(
        { length: Math.min(batchSize, count - i) },
        (_, j) => createAgentConfig(i + j)
      );

      const createdAgents = await ClawService.createAgents(batch);
      createdAgents.forEach((agent) => {
        addAgent(agent);
        GeoService.createAgent(agent);
      });

      // Update progress
      updateMetrics({
        totalAgents: createdAgents.length,
        activeAgents: createdAgents.filter((a) => a.state === 'IDLE').length
      });
    }
  };

  const createAgentConfig = (index: number): Partial<Agent> => {
    return {
      id: `analytics-agent-${index}`,
      model: 'deepseek-chat',
      seed: {
        purpose: 'Monitor data stream and detect anomalies',
        trigger: { type: 'data', source: `stream-${index % 10}` }
      },
      equipment: ['MEMORY', 'REASONING'],
      position: {
        x: Math.random() * 1000,
        y: Math.random() * 1000,
        z: Math.random() * 1000
      },
      orientation: {
        x: 0,
        y: 0,
        z: 1
      },
      state: 'IDLE',
      stats: {
        triggers: 0,
        anomalies: 0,
        avgLatency: 0,
        lastTrigger: null
      }
    };
  };

  const handleWebSocketMessage = (message: any) => {
    switch (message.type) {
      case 'agent-update':
        updateAgent(message.agentId, message.data);
        break;

      case 'alert':
        addAlert(message);
        break;

      case 'metrics':
        updateMetrics(message);
        break;

      default:
        console.warn('Unknown message type:', message.type);
    }
  };

  const handleTriggerAgent = async (agentId: string, data: any) => {
    try {
      const result = await ClawService.triggerAgent(agentId, data);
      updateAgent(agentId, {
        state: 'THINKING',
        stats: {
          ...result.stats,
          lastTrigger: new Date().toISOString()
        }
      });
    } catch (error) {
      addAlert({
        id: `trigger-error-${agentId}`,
        severity: 'error',
        message: `Failed to trigger agent ${agentId}`,
        timestamp: new Date().toISOString(),
        data: error
      });
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Initializing Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>SuperInstance Analytics Dashboard</h1>
        <div className="view-switcher">
          <button
            className={view === 'grid' ? 'active' : ''}
            onClick={() => setView('grid')}
          >
            Agent Grid
          </button>
          <button
            className={view === '3d' ? 'active' : ''}
            onClick={() => setView('3d')}
          >
            3D View
          </button>
          <button
            className={view === 'heatmap' ? 'active' : ''}
            onClick={() => setView('heatmap')}
          >
            Heat Map
          </button>
        </div>
      </header>

      <main className="app-main">
        <div className="metrics-section">
          <MetricsPanel metrics={metrics} />
        </div>

        <div className="content-section">
          {view === 'grid' && (
            <AgentGrid
              agents={agents}
              onTrigger={handleTriggerAgent}
            />
          )}
          {view === '3d' && <Visualization3D agents={agents} />}
          {view === 'heatmap' && <HeatMap agents={agents} />}
        </div>

        <div className="alerts-section">
          <AlertPanel alerts={alerts} />
        </div>
      </main>
    </div>
  );
};

export default App;
