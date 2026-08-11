/**
 * MarineViz - Complete TypeScript Type Definitions
 *
 * This file contains all TypeScript interfaces and types for the
 * MarineViz fishing vessel data visualization system.
 *
 * Version: 1.0.0
 * Date: 2026-07-24
 */

// ============================================================================
// CORE TYPES
// ============================================================================

/**
 * Geographic coordinate as [longitude, latitude]
 */
export type GeoPoint = [number, number];

/**
 * Geographic bounding box
 */
export interface GeoBoundingBox {
  min: GeoPoint;
  max: GeoPoint;
}

/**
 * Unix timestamp in milliseconds
 */
export type timestamp = number;

/**
 * Time range
 */
export interface TimeRange {
  start: timestamp;
  end: timestamp;
}

/**
 * Date string in ISO 8601 format
 */
export type ISODate = string;

// ============================================================================
// DATA STRUCTURES
// ============================================================================

/**
 * Single ping of hydroacoustic data
 */
export interface PingData {
  timestamp: timestamp;
  latitude: number;
  longitude: number;
  depth: number[]; // Depth samples in meters
  sv: number[]; // Volume backscatter values (dB)
  frequency: number; // Transducer frequency in kHz
  beam: number; // Beam number for multibeam systems
  pulseLength: number; // Pulse length in ms
  gain: number; // Transducer gain
}

/**
 * Echogram data collection
 */
export interface EchogramData {
  pings: PingData[];
  metadata: {
    sampleRate: number; // Samples per second
    soundVelocity: number; // Speed of sound in m/s
    transducerDepth: number; // Depth of transducer in meters
    frequency: number; // Frequency in kHz
    beamWidth: number; // Beam width in degrees
  };
}

/**
 * GPS/Navigation data point
 */
export interface GPSData {
  timestamp: timestamp;
  latitude: number;
  longitude: number;
  speed: number; // Speed in m/s
  heading: number; // Heading in degrees (0-359)
  altitude?: number; // Altitude in meters (for GPS)
  accuracy?: number; // Position accuracy in meters
  hdop?: number; // Horizontal dilution of precision
}

/**
 * Catch event data
 */
export interface CatchData {
  id: string;
  timestamp: timestamp;
  latitude: number;
  longitude: number;
  depth: number; // Depth of catch in meters
  species: string;
  quantity: number;
  unit: 'kg' | 'count' | 'boxes';
  gearType: string;
  quality: 'high' | 'medium' | 'low';
  notes?: string;
}

/**
 * Gear deployment data
 */
export interface GearData {
  id: string;
  timestamp: timestamp;
  type: string; // Gear type (trawl, longline, pot, etc.)
  status: 'deployed' | 'retrieved' | 'active' | 'inactive';
  settings: GearSettings;
  location?: GeoPoint;
  depth?: number;
}

/**
 * Gear-specific settings
 */
export interface GearSettings {
  [key: string]: number | string | boolean;
  // Example settings for trawl:
  // - doorSpread: number (meters)
  // - headlineHeight: number (meters)
  // - towSpeed: number (knots)
}

/**
 * Environmental data point
 */
export interface EnvironmentalData {
  timestamp: timestamp;
  latitude: number;
  longitude: number;
  depth?: number; // For depth-specific measurements
  parameter: EnvironmentalParameter;
  value: number;
  unit: string;
  quality: 'good' | 'questionable' | 'bad';
}

/**
 * Environmental parameter types
 */
export type EnvironmentalParameter =
  | 'sst' // Sea surface temperature
  | 'bottom_temperature' // Bottom temperature
  | 'chlorophyll' // Chlorophyll concentration
  | 'salinity' // Water salinity (PSU)
  | 'dissolved_oxygen' // Dissolved oxygen (mg/L)
  | 'current_speed' // Current speed (m/s)
  | 'current_direction' // Current direction (degrees)
  | 'wave_height' // Significant wave height (m)
  | 'wave_period' // Wave period (seconds)
  | 'wind_speed' // Wind speed (m/s)
  | 'wind_direction' // Wind direction (degrees)
  | 'pressure' // Barometric pressure (hPa)
  | 'turbidity' // Water turbidity (NTU);

/**
 * Crew activity data
 */
export interface CrewActivityData {
  id: string;
  timestamp: timestamp;
  crewMember: string;
  activity: string;
  location?: GeoPoint;
  notes?: string;
}

/**
 * Unified data point across all types
 */
export interface DataPoint {
  timestamp: timestamp;
  latitude: number;
  longitude: number;
  depth?: number;

  // Acoustic
  sv?: number;
  frequency?: number;

  // Navigation
  speed?: number;
  heading?: number;

  // Environmental
  sst?: number;
  chlorophyll?: number;
  salinity?: number;
  dissolvedOxygen?: number;

  // Events
  catch?: CatchData;
  gear?: GearData;
  crew?: CrewActivityData;

  // Source
  source: 'acoustic' | 'gps' | 'catch' | 'gear' | 'environmental' | 'crew';
}

// ============================================================================
// PANEL CONFIGURATIONS
// ============================================================================

/**
 * Base panel interface
 */
export interface BasePanel {
  id: string;
  type: 'side-view' | 'top-view' | 'front-view' | 'timeline';
  visible: boolean;
  locked: boolean;
  opacity: number;
}

// ============================================================================
// SIDE VIEW (ECHOGRAM)
// ============================================================================

/**
 * Side view echogram panel configuration
 */
export interface EchogramPanel extends BasePanel {
  id: 'side-view';
  type: 'side-view';

  // X-axis (time)
  xAxis: {
    type: 'time';
    range: TimeRange;
    pixelsPerSecond: number;
  };

  // Y-axis (depth)
  yAxis: {
    type: 'depth';
    range: [number, number]; // [surface, bottom]
    pixelsPerMeter: number;
    inverted: boolean; // Surface at top
  };

  // Color scale
  colorScale: {
    type: 'sv' | 'ts' | 'power';
    range: [number, number]; // [min, max] dB values
    colormap: ColorMap;
    contrast: number; // 0-100%
    brightness: number; // 0-100%
  };

  // Overlays
  overlays: {
    bottomTrack: boolean;
    surfaceLine: boolean;
    schoolDetections: DetectionLayer[];
    noiseMask: NoiseLayer;
    speciesLayers: SpeciesLayer[];
  };

  // Interaction
  interaction: {
    selectionMode: 'range' | 'polygon' | 'threshold';
    measurementTool: 'distance' | 'area' | 'depth' | 'none';
  };
}

/**
 * Color map types
 */
export type ColorMap =
  | 'ECHOVIEW_DEFAULT'
  | 'ECHOVIEW_BLUE_WHITE_RED'
  | 'ECHOVIEW_GRAY'
  | 'ECHOVIEW_INVERTED_GRAY'
  | 'CUSTOM'
  | 'VIRIDIS'
  | 'MAGMA'
  | 'PLASMA'
  | 'INFERNO'
  | 'TURBO';

/**
 * Detection layer for fish schools
 */
export interface DetectionLayer {
  id: string;
  name: string;
  visible: boolean;
  color: string;
  opacity: number;
  detections: SchoolDetection[];
}

/**
 * School detection
 */
export interface SchoolDetection {
  id: string;
  timestamp: timestamp;
  bounds: {
    timeStart: timestamp;
    timeEnd: timestamp;
    depthMin: number;
    depthMax: number;
  };
  confidence: number; // 0-1
  speciesHint?: string;
  properties: {
    meanSv: number;
    maxSv: number;
    area: number; // m²
    volume: number; // m³
  };
}

/**
 * Noise layer
 */
export interface NoiseLayer {
  enabled: boolean;
  method: 'impulse' | 'background';
  threshold: number;
  maskColor: string;
}

/**
 * Species layer for color-coding
 */
export interface SpeciesLayer {
  id: string;
  name: string;
  species: string;
  color: string;
  visible: boolean;
  opacity: number;
}

// ============================================================================
// TOP VIEW (CHART)
// ============================================================================

/**
 * Top view chart panel configuration
 */
export interface ChartPanel extends BasePanel {
  id: 'top-view';
  type: 'top-view';

  // Map configuration
  map: {
    center: GeoPoint;
    zoom: number; // 1-20
    pitch: number; // 0-60 degrees
    bearing: number; // 0-360 degrees
  };

  // Base layers
  baseLayers: {
    type: 'bathymetry' | 'nautical-chart' | 'satellite' | 'street';
    source: 'MapTiler' | 'MarineCharts' | 'Custom';
    opacity: number;
  };

  // Data layers
  layers: ChartLayers;
}

/**
 * Chart layer configuration
 */
export interface ChartLayers {
  vesselTrack: VesselTrackLayer;
  backscatterHeatmap: HeatmapLayer;
  catchLocations: CatchLocationsLayer;
  schoolDetections: SchoolDetectionsLayer;
  environmental: EnvironmentalLayers;
}

/**
 * Vessel track layer
 */
export interface VesselTrackLayer {
  visible: boolean;
  color: string;
  width: number;
  showHeading: boolean;
  showSpeed: boolean;
  smoothPath: boolean;
}

/**
 * Heatmap layer for backscatter
 */
export interface HeatmapLayer {
  visible: boolean;
  aggregation: 'mean' | 'max' | 'sum';
  depthRange: [number, number]; // Depth slice to show
  colorScale: ColorMap;
  opacity: number;
  radius: number;
  intensity: number;
}

/**
 * Catch locations layer
 */
export interface CatchLocationsLayer {
  visible: boolean;
  size: number;
  colorBy: 'species' | 'quantity' | 'gear' | 'none';
  showLabels: boolean;
  cluster: boolean;
}

/**
 * School detections layer
 */
export interface SchoolDetectionsLayer {
  visible: boolean;
  color: string;
  size: number;
  showConfidence: boolean;
  showBounds: boolean;
}

/**
 * Environmental data layers
 */
export interface EnvironmentalLayers {
  sst: EnvironmentalLayerConfig;
  chlorophyll: EnvironmentalLayerConfig;
  currents: CurrentsLayerConfig;
  waves: EnvironmentalLayerConfig;
}

/**
 * Single environmental layer config
 */
export interface EnvironmentalLayerConfig {
  visible: boolean;
  opacity: number;
  colorMap: ColorMap;
  showValues: boolean;
  contourLines: boolean;
}

/**
 * Currents layer (vector field)
 */
export interface CurrentsLayerConfig extends EnvironmentalLayerConfig {
  arrowSize: number;
  arrowSpacing: number;
  showSpeed: boolean;
}

// ============================================================================
// FRONT VIEW (CROSS-SECTION)
// ============================================================================

/**
 * Front view cross-section panel configuration
 */
export interface CrossSectionPanel extends BasePanel {
  id: 'front-view';
  type: 'front-view';

  // Orientation
  orientation: {
    heading: number; // Vessel heading in degrees
    viewAngle: number; // 0 = forward, 180 = backward
    width: number; // Width of cross-section in meters
    maxDepth: number; // Maximum depth in meters
  };

  // X-axis (distance)
  xAxis: {
    type: 'distance';
    range: [number, number]; // [left, right] meters
    pixelsPerMeter: number;
    origin: 'vessel';
  };

  // Y-axis (depth)
  yAxis: {
    type: 'depth';
    range: [number, number]; // [surface, bottom]
    pixelsPerMeter: number;
    inverted: boolean;
  };

  // Data source
  dataSource: {
    type: 'side-scan' | 'interpolated-echogram' | 'multibeam';
    interpolationMethod: 'kriging' | 'idw' | 'nearest';
  };

  // Visualization
  visualization: {
    colorScale: ColorMap;
    showBottom: boolean;
    showSurface: boolean;
    showGrid: boolean;
  };
}

// ============================================================================
// TIMELINE
// ============================================================================

/**
 * Timeline interface configuration
 */
export interface TimelineInterface {
  // Time axis
  timeAxis: TimelineTimeAxis;

  // Track layout
  tracks: TimelineTracksConfig;

  // Ruler
  ruler: TimelineRuler;

  // Scrubber
  scrubber: TimelineScrubber;

  // Playback
  playback: TimelinePlayback;
}

/**
 * Timeline time axis
 */
export interface TimelineTimeAxis {
  min: timestamp;
  max: timestamp;
  visible: {
    start: timestamp;
    end: timestamp;
  };

  // Zoom levels
  zoomLevels: {
    min: number; // Minimum seconds visible
    max: number; // Maximum seconds visible
    current: number;
  };
}

/**
 * Timeline tracks configuration
 */
export interface TimelineTracksConfig {
  layout: 'stacked' | 'overlaid';
  minHeight: number;
  maxHeight: number;
  autoResize: boolean;
  tracks: Track[];
}

/**
 * Track type
 */
export type TrackType =
  | 'acoustic'
  | 'gps'
  | 'catch'
  | 'gear'
  | 'crew'
  | 'environmental';

/**
 * Base track interface
 */
export interface Track {
  id: string;
  type: TrackType;
  name: string;
  visible: boolean;
  solo: boolean;
  muted: boolean;
  locked: boolean;
  height: number;
  color: string;
  opacity: number;
  selectable: boolean;
  clips: Clip[];
}

/**
 * Base clip interface
 */
export interface Clip {
  id: string;
  startTime: timestamp;
  endTime: timestamp;
  label?: string;
  color?: string;
}

/**
 * Acoustic track
 */
export interface AcousticTrack extends Track {
  type: 'acoustic';
  clips: AcousticClip[];
  configuration: {
    frequency: number;
    beamType: 'single' | 'split' | 'multibeam';
    dataRate: number;
  };
}

/**
 * Acoustic clip
 */
export interface AcousticClip extends Clip {
  data: {
    pingRate: number;
    samplesPerPing: number;
    format: 'raw' | 'processed';
    compression: 'none' | 'lz4';
  };
  visualization: {
    thumbnail: 'waveform' | 'spectrogram' | 'compressed';
  };
}

/**
 * GPS track
 */
export interface GPSTrack extends Track {
  type: 'gps';
  clips: GPSClip[];
  configuration: {
    updateRate: number;
    precision: 'high' | 'standard';
  };
}

/**
 * GPS clip
 */
export interface GPSClip extends Clip {
  data: {
    points: GPSPoint[];
    interpolated: boolean;
  };
  visualization: {
    showSpeed: boolean;
    showHeading: boolean;
    showCourse: boolean;
  };
}

/**
 * GPS point
 */
export interface GPSPoint {
  timestamp: timestamp;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  depth?: number;
}

/**
 * Catch track
 */
export interface CatchTrack extends Track {
  type: 'catch';
  clips: CatchClip[];
  configuration: {
    categories: string[];
    units: 'kg' | 'count' | 'boxes';
  };
}

/**
 * Catch clip
 */
export interface CatchClip extends Clip {
  data: CatchData;
  visualization: {
    color: string;
    icon: string;
    showQuantity: boolean;
  };
}

/**
 * Gear track
 */
export interface GearTrack extends Track {
  type: 'gear';
  clips: GearClip[];
  configuration: {
    gearTypes: string[];
  };
}

/**
 * Gear clip
 */
export interface GearClip extends Clip {
  data: GearData;
  visualization: {
    color: string;
    icon: string;
    showStatus: boolean;
  };
}

/**
 * Crew track
 */
export interface CrewTrack extends Track {
  type: 'crew';
  clips: CrewClip[];
  configuration: {
    crewMembers: CrewMember[];
  };
}

/**
 * Crew clip
 */
export interface CrewClip extends Clip {
  data: CrewActivityData;
  visualization: {
    color: string;
    icon: string;
  };
}

/**
 * Crew member
 */
export interface CrewMember {
  id: string;
  name: string;
  role: string;
  color: string;
}

/**
 * Environmental track
 */
export interface EnvironmentalTrack extends Track {
  type: 'environmental';
  clips: EnvironmentalClip[];
  configuration: {
    parameters: EnvironmentalParameter[];
  };
}

/**
 * Environmental clip
 */
export interface EnvironmentalClip extends Clip {
  data: EnvironmentalData[];
  visualization: {
    color: string;
    showValues: boolean;
    showUnits: boolean;
  };
}

/**
 * Timeline ruler
 */
export interface TimelineRuler {
  visible: boolean;
  position: 'top' | 'bottom';
  format: 'time' | 'relative' | 'timestamp';
  majorTicks: number;
  minorTicks: number;
  showDates: boolean;
}

/**
 * Timeline scrubber (playback head)
 */
export interface TimelineScrubber {
  visible: boolean;
  position: timestamp;
  snap: 'none' | 'clip-start' | 'clip-end' | 'clip-boundary';
  followPlayback: boolean;
}

/**
 * Timeline playback controls
 */
export interface TimelinePlayback {
  enabled: boolean;
  position: timestamp;
  speed: number; // 1 = real-time
  loop: boolean;
  loopStart?: timestamp;
  loopEnd?: timestamp;
}

// ============================================================================
// SELECTION SYSTEM
// ============================================================================

/**
 * Selection bus for coordinating selections across panels
 */
export interface SelectionBus {
  selections: Selection[];
  mode: 'append' | 'replace' | 'intersect' | 'subtract';
  syncPolicy: 'immediate' | 'debounced' | 'manual';
  events: SelectionEvents;
}

/**
 * Selection events
 */
export interface SelectionEvents {
  onSelectionChanged: EventEmitter<Selection[]>;
  onSelectionAdded: EventEmitter<Selection>;
  onSelectionRemoved: EventEmitter<Selection>;
  onSelectionCleared: EventEmitter<void>;
}

/**
 * Base selection interface
 */
export interface Selection {
  id: string;
  source: 'side-view' | 'top-view' | 'front-view' | 'timeline';
  spatial?: SpatialSelection;
  temporal?: TemporalSelection;
  acoustic?: AcousticSelection;
  metadata: SelectionMetadata;
}

/**
 * Spatial selection
 */
export interface SpatialSelection {
  type: 'point' | 'line' | 'polygon' | 'bounding-box';
  coordinates: number[][];
  crs: 'EPSG:4326' | 'EPSG:3857';
}

/**
 * Temporal selection
 */
export interface TemporalSelection {
  type: 'range' | 'instant';
  startTime: timestamp;
  endTime?: timestamp;
}

/**
 * Acoustic selection
 */
export interface AcousticSelection {
  type: 'threshold' | 'range' | 'polygon';
  frequencyRange?: [number, number];
  depthRange?: [number, number];
  svRange?: [number, number];
}

/**
 * Selection metadata
 */
export interface SelectionMetadata {
  color: string;
  label: string;
  created: timestamp;
  creator: 'user' | 'system';
}

/**
 * Compound selection (AND/OR/NOT operations)
 */
export interface CompoundSelection extends Selection {
  type: 'compound';
  operator: 'AND' | 'OR' | 'XOR' | 'NOT';
  operands: Selection[];
}

// ============================================================================
// QUERY TYPES
// ============================================================================

/**
 * Multi-dimensional query
 */
export interface MultiDimensionalQuery {
  spatial?: GeoBoundingBox;
  temporal?: TimeRange;
  acoustic?: AcousticFilter;
  environmental?: EnvironmentalFilter;
  eventFilters?: EventFilter[];
}

/**
 * Acoustic filter
 */
export interface AcousticFilter {
  svRange?: [number, number];
  frequencyRange?: [number, number];
  depthRange?: [number, number];
}

/**
 * Environmental filter
 */
export interface EnvironmentalFilter {
  parameter?: EnvironmentalParameter;
  valueRange?: [number, number];
  quality?: Array<'good' | 'questionable' | 'bad'>;
}

/**
 * Event filter
 */
export interface EventFilter {
  type: 'catch' | 'gear' | 'crew';
  conditions: Record<string, any>;
}

// ============================================================================
// DATA MANAGER
// ============================================================================

/**
 * Data source configuration
 */
export interface DataSourceConfig {
  id: string;
  type: 'file' | 'api' | 'database' | 'stream';
  format: 'raw' | 'json' | 'csv' | 'netcdf' | 'custom';
  location: string;
  credentials?: Record<string, string>;
  refreshInterval?: number;
}

/**
 * Data bounds for loading
 */
export interface DataBounds {
  timeRange: TimeRange;
  spatialBounds: GeoBoundingBox;
  depthRange?: [number, number];
}

/**
 * Echogram query
 */
export interface EchogramQuery {
  timeRange: TimeRange;
  depthRange: [number, number];
}

/**
 * GPS query
 */
export interface GPSQuery {
  timeRange: TimeRange;
}

// ============================================================================
// RENDERING
// ============================================================================

/**
 * WebGL renderer configuration
 */
export interface WebGLRendererConfig {
  context: 'webgl2' | 'webgpu';
  antialias: boolean;
  powerPreference: 'default' | 'high-performance' | 'low-power';
  failIfMajorPerformanceCaveat: boolean;
}

/**
 * Heatmap render configuration
 */
export interface HeatmapRenderConfig {
  method: 'gpu' | 'cpu';
  kernelSize: number;
  intensity: number;
  radius: number;
  colorScale: ColorMap;
}

/**
 * LOD (Level of Detail) strategy
 */
export interface LODStrategy {
  levels: {
    high: LODLevel;
    medium: LODLevel;
    low: LODLevel;
  };
  selectLOD(viewport: Viewport): LODLevel;
}

/**
 * LOD level
 */
export interface LODLevel {
  maxPoints: number;
  sampling: 'none' | 'uniform' | 'adaptive';
}

/**
 * Viewport for LOD calculations
 */
export interface Viewport {
  width: number;
  height: number;
  timeRange: TimeRange;
  depthRange: [number, number];
  spatialBounds: GeoBoundingBox;
}

// ============================================================================
// INTERACTION
// ============================================================================

/**
 * Interaction mode
 */
export type InteractionMode =
  | 'pan'
  | 'zoom'
  | 'select-point'
  | 'select-range'
  | 'select-polygon'
  | 'select-threshold'
  | 'measure'
  | 'navigate';

/**
 * Mouse interaction
 */
export interface MouseInteraction {
  type: 'click' | 'drag' | 'wheel' | 'hover';
  button: 'left' | 'right' | 'middle';
  modifiers: {
    shift: boolean;
    ctrl: boolean;
    alt: boolean;
  };
  position: { x: number; y: number };
  delta?: { x: number; y: number };
}

/**
 * Touch interaction
 */
export interface TouchInteraction {
  type: 'tap' | 'drag' | 'pinch' | 'rotate';
  touches: TouchPoint[];
  center: { x: number; y: number };
  scale?: number;
  rotation?: number;
}

/**
 * Touch point
 */
export interface TouchPoint {
  id: number;
  x: number;
  y: number;
}

/**
 * Keyboard shortcut
 */
export interface KeyboardShortcut {
  key: string;
  modifiers: {
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean;
  };
  action: string;
}

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

/**
 * Global application state
 */
export interface MarineVizState {
  // Panel configurations
  panels: {
    sideView: EchogramPanel;
    topView: ChartPanel;
    frontView: CrossSectionPanel;
  };

  // Timeline
  timeline: TimelineInterface;

  // Selection
  selections: Selection[];

  // Data
  dataBounds: DataBounds;
  loading: boolean;
  error?: string;

  // UI
  sidebarOpen: boolean;
  helpVisible: boolean;
  fullscreen: boolean;

  // Playback
  playback: {
    playing: boolean;
    position: timestamp;
    speed: number;
  };
}

// ============================================================================
// EVENTS
// ============================================================================

/**
 * Event emitter interface
 */
export interface EventEmitter<T> {
  subscribe(callback: (data: T) => void): () => void;
  unsubscribe(callback: (data: T) => void): void;
  emit(data: T): void;
}

/**
 * Application event types
 */
export interface AppEvents {
  onSelectionChanged: EventEmitter<Selection[]>;
  onPanelConfigChanged: EventEmitter<PanelConfig>;
  onTimelineConfigChanged: EventEmitter<TimelineInterface>;
  onDataLoaded: EventEmitter<DataBounds>;
  onPlaybackStateChanged: EventEmitter<PlaybackState>;
  onError: EventEmitter<Error>;
}

/**
 * Playback state
 */
export interface PlaybackState {
  playing: boolean;
  position: timestamp;
  speed: number;
  loop: boolean;
}

/**
 * Panel config union type
 */
export type PanelConfig = EchogramPanel | ChartPanel | CrossSectionPanel;

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Color configuration
 */
export interface ColorConfig {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  success: string;
  warning: string;
  error: string;
}

/**
 * Theme configuration
 */
export interface ThemeConfig {
  mode: 'light' | 'dark';
  colors: ColorConfig;
  fonts: {
    primary: string;
    monospace: string;
  };
}

/**
 * Application configuration
 */
export interface MarineVizConfig {
  panels: {
    sideView: EchogramPanel;
    topView: ChartPanel;
    frontView: CrossSectionPanel;
  };
  timeline: TimelineInterface;
  dataBounds: DataBounds;
  theme: ThemeConfig;
  shortcuts: KeyboardShortcut[];
}
