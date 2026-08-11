/**
 * Shared TypeScript types for SuperInstance example applications
 */

// ============================================================================
// Agent Types
// ============================================================================

export interface Agent {
  id: string;
  model: string;
  seed: AgentSeed;
  equipment: EquipmentSlot[];
  position: Position3D;
  orientation: Orientation3D;
  state: AgentState;
  stats: AgentStats;
  metadata?: Record<string, any>;
}

export interface AgentSeed {
  purpose: string;
  trigger: Trigger;
  learningStrategy?: LearningStrategy;
  defaultEquipment?: EquipmentSlot[];
}

export interface Trigger {
  type: 'data' | 'periodic' | 'event' | 'manual';
  source?: string;
  interval?: number;
  conditions?: Record<string, any>;
}

export interface LearningStrategy {
  type: 'reinforcement' | 'supervised' | 'unsupervised';
  parameters?: Record<string, any>;
}

export type EquipmentSlot =
  | 'MEMORY'
  | 'REASONING'
  | 'CONSENSUS'
  | 'SPREADSHEET'
  | 'DISTILLATION'
  | 'COORDINATION';

export type AgentState =
  | 'IDLE'
  | 'THINKING'
  | 'ACTING'
  | 'WAITING'
  | 'ERROR';

export interface AgentStats {
  triggers: number;
  anomalies: number;
  avgLatency: number;
  lastTrigger: string | null;
  memoryUsage?: number;
}

// ============================================================================
// Spatial Types
// ============================================================================

export interface Position3D {
  x: number;
  y: number;
  z: number;
}

export interface Orientation3D {
  x: number;
  y: number;
  z: number;
}

export interface SpatialQuery {
  radius?: number;
  fieldOfView?: number;
  maxResults?: number;
  filter?: SpatialFilter;
}

export interface SpatialFilter {
  type?: string;
  state?: AgentState;
  equipment?: EquipmentSlot[];
  metadata?: Record<string, any>;
}

// ============================================================================
// Communication Types
// ============================================================================

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp?: string;
}

export interface AgentUpdateMessage extends WebSocketMessage {
  type: 'agent-update';
  agentId: string;
  data: Partial<Agent>;
}

export interface AlertMessage extends WebSocketMessage {
  type: 'alert';
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  data?: any;
}

export interface MetricsMessage extends WebSocketMessage {
  type: 'metrics';
  data: {
    totalAgents: number;
    activeAgents: number;
    triggers: number;
    anomalies: number;
    avgLatency: number;
  };
}

// ============================================================================
// API Types
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    hasMore: boolean;
  };
}

// ============================================================================
// Domain Types
// ============================================================================

// Analytics Dashboard
export interface AnalyticsDashboard {
  agents: Agent[];
  alerts: Alert[];
  metrics: DashboardMetrics;
  filters: DashboardFilters;
}

export interface Alert {
  id: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  timestamp: string;
  data?: any;
  acknowledged: boolean;
}

export interface DashboardMetrics {
  totalAgents: number;
  activeAgents: number;
  triggers: number;
  anomalies: number;
  avgLatency: number;
  memoryUsage: number;
}

export interface DashboardFilters {
  state?: AgentState[];
  equipment?: EquipmentSlot[];
  positionRange?: {
    min: Position3D;
    max: Position3D;
  };
}

// Collaborative Planner
export interface Plan {
  id: string;
  name: string;
  owner: string;
  collaborators: string[];
  agents: string[];
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  assignee: string;
  deadline: string;
  status: TaskStatus;
  requiresConsensus: boolean;
  consensus?: ConsensusState;
  dependencies: string[];
}

export type TaskStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'blocked'
  | 'cancelled';

export interface ConsensusState {
  status: 'pending' | 'approved' | 'rejected';
  votes: ConsensusVote[];
  createdAt: string;
  resolvedAt?: string;
}

export interface ConsensusVote {
  participantId: string;
  vote: 'approve' | 'reject' | 'abstain';
  reasoning?: string;
  timestamp: string;
}

// Geographic Asset Tracker
export interface Asset {
  id: string;
  name: string;
  type: string;
  location: GeographicLocation;
  status: AssetStatus;
  metadata?: Record<string, any>;
  lastUpdate: string;
}

export interface GeographicLocation {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
}

export type AssetStatus =
  | 'active'
  | 'inactive'
  | 'moving'
  | 'stationary'
  | 'alert';

export interface Geofence {
  id: string;
  name: string;
  location: GeographicLocation;
  radius: number;
  assets: string[];
  onEnter?: (asset: Asset) => void;
  onExit?: (asset: Asset) => void;
}

// Inventory System
export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  inventory: InventoryItem[];
  predictions: DemandPrediction[];
  alertRules: AlertRule[];
}

export interface InventoryItem {
  warehouseId: string;
  quantity: number;
  minStock: number;
  maxStock: number;
  location: string;
  lastUpdated: string;
}

export interface DemandPrediction {
  productId: string;
  warehouseId: string;
  horizon: number; // days
  predicted: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  seasonality: 'low' | 'medium' | 'high';
  createdAt: string;
}

export interface AlertRule {
  id: string;
  productId: string;
  condition: string;
  action: string;
  recipients: string[];
  enabled: boolean;
}

// Multi-Agent Simulation
export interface SimulationConfig {
  agentCount: number;
  paradigm: 'fps' | 'rts';
  spatialIndexing: boolean;
  bounds: {
    min: Position3D;
    max: Position3D;
  };
}

export interface SimulationMetrics {
  agentCount: number;
  fpsQueryTime: number;
  rtsQueryTime: number;
  memoryUsage: number;
  frameRate: number;
}

// ============================================================================
// Utility Types
// ============================================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T> = T | null | undefined;

export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };
