# MarineViz: CAD + DAW-Inspired Fishing Vessel Data Visualization System

**Version:** 1.0.0
**Date:** 2026-07-24
**Status:** Production Design Specification
**Architecture:** React + TypeScript + WebGL + D3.js + MapLibre

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Three-Panel CAD Layout](#three-panel-cad-layout)
3. [DAW-Style Timeline Interface](#daw-style-timeline-interface)
4. [Cross-Panel Selection System](#cross-panel-selection-system)
5. [Component Architecture](#component-architecture)
6. [Data Structures](#data-structures)
7. [Interaction Patterns](#interaction-patterns)
8. [Rendering Optimization](#rendering-optimization)
9. [Technology Stack](#technology-stack)
10. [Implementation Roadmap](#implementation-roadmap)

---

## System Overview

### Design Philosophy

**MarineViz** combines the precision of CAD (Computer-Aided Design) with the temporal manipulation capabilities of DAWs (Digital Audio Workstations) to create an intuitive exploration interface for commercial fishing vessel data.

**Key Principles:**

1. **Spatial-Temporal Duality** - Every data point exists in both space and time
2. **Multi-Panel Coordination** - Selection in one panel highlights across all panels
3. **GPU-Accelerated Rendering** - Real-time visualization of millions of data points
4. **Gesture-Based Interaction** - Intuitive touch and mouse interactions
5. **Domain-Specific Workflows** - Built for fishing industry workflows

### Core Metaphors

```
┌─────────────────────────────────────────────────────────────────┐
│                    MARINEVIZ INTERFACE                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  SIDE VIEW      │  │  TOP VIEW       │  │  FRONT VIEW     │ │
│  │  (Echogram)     │  │  (Chart)        │  │  (Cross-Sect)   │ │
│  │                 │  │                 │  │                 │ │
│  │  Water column   │  │  Spatial map    │  │  Vessel heading │ │
│  │  depth profile  │  │  with heatmaps  │  │  cross-section  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              DAW TIMELINE (Horizontal)                     │  │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          │  │
│  │  │ Acoustic│ │ GPS    │ │ Catch   │ │ Gear    │ ...      │  │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘          │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Three-Panel CAD Layout

### Panel Overview

**CAD-inspired three-panel layout provides orthogonal views of the same data:**

1. **Side View (Echogram Panel)** - Traditional water column profile
2. **Top View (Chart Panel)** - Spatial chart overlay with heatmaps
3. **Front View (Cross-Section Panel)** - Cross-section at vessel heading

### Panel Synchronization

**Synchronization Architecture:**

```typescript
interface PanelSynchronization {
  // Spatial sync - all panels show same geographic area
  spatialBounds: GeoBoundingBox;

  // Temporal sync - all panels show same time range
  temporalBounds: TimeRange;

  // Selection sync - selection in one panel highlights in all
  selectionBus: SelectionBus;

  // Zoom sync - coordinated zoom levels
  zoomSync: ZoomCoordinator;
}
```

**Synchronization Modes:**

- **LINKED** - All panels synchronized (default)
- **INDEPENDENT** - Panels operate independently
- **SEMILINKED** - Spatial linked, temporal independent (or vice versa)

---

### 1. Side View Panel (Echogram)

**Purpose:** Traditional water column profile showing acoustic backscatter over time

**Data Structure:**

```typescript
interface EchogramPanel {
  id: 'side-view';
  type: 'echogram';

  // Data dimensions
  xAxis: {
    type: 'time';
    range: TimeRange;
    pixelsPerSecond: number;
  };

  yAxis: {
    type: 'depth';
    range: [number, number]; // [surface, bottom]
    pixelsPerMeter: number;
    inverted: true; // Surface at top
  };

  // Color scale
  colorScale: {
    type: 'sv' | 'ts' | 'power';
    range: [-70, 0]; // dB values
    colormap: string; // 'ECHOVIEW_DEFAULT' | 'CUSTOM'
  };

  // Overlays
  overlays: {
    bottomTrack: boolean;
    surfaceLine: boolean;
    schoolDetections: DetectionLayer[];
    noiseMask: NoiseLayer;
  };

  // Interaction
  interaction: {
    selectionMode: 'range' | 'polygon' | 'threshold';
    measurementTool: 'distance' | 'area' | 'depth';
  };
}
```

**Rendering Specifications:**

```typescript
interface EchogramRenderer {
  // WebGL-based renderer
  renderer: 'webgl';

  // Data organization
  dataLayout: {
    pingBuffer: PingData[]; // Circular buffer of recent pings
    textureSize: [number, number]; // [width=frames, height=samples]
    compression: 'lossless' | 'lossy';
  };

  // Shaders
  shaders: {
    vertex: 'echogram-vertex.glsl';
    fragment: 'echogram-fragment.glsl';
    uniforms: {
      colorScale: 'Texture1D';
      dataRange: 'vec2';
      contrast: 'float';
      brightness: 'float';
    };
  };

  // Performance targets
  performance: {
    targetFPS: 60;
    maxPingsVisible: 10000;
    pingDropThreshold: 12000; // Drop old pings when exceeded
  };
}
```

**Visual Specification:**

```
┌─────────────────────────────────────────────────────────────┐
│                    SIDE VIEW (Echogram)                     │
├─────────────────────────────────────────────────────────────┤
│  0m ┌───────────────────────────────────────────────────┐  │
│     │ ░░░▓▓███░░░░▓▓▓░░░░░██░░░░░░░░▓▓▓███░░░░          │  │
│     │ ░░░▓▓████░░░▓▓▓░░░░░██░░░░░░░░▓▓▓████░░░         │  │
│ 50m │ ░░░▓▓███░░░░▓▓▓░░░░░██░░░░░░░░▓▓▓███░░░░         │  │
│     │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░          │  │
│     │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░          │  │
│100m │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░          │  │
│     │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░          │  │
│     │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░          │  │
│150m │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░          │  │
│     └───────────────────────────────────────────────────┘  │
│       ────────────────────────────────────────────> time    │
│     00:00                12:00                24:00          │
└─────────────────────────────────────────────────────────────┘

Legend:
  ░ = Low backscatter (-70 to -50 dB)
  ▓ = Medium backscatter (-50 to -30 dB)
  ██ = High backscatter (-30 to 0 dB) - potential fish schools
```

**Interaction Patterns:**

- **Pan Time**: Drag horizontally to scroll through time
- **Zoom Depth**: Mouse wheel or pinch gesture on Y-axis
- **Range Select**: Click-drag to select time-depth region
- **Threshold**: Right-click-drag to create threshold selection
- **Measure**: Shift-click for distance/area measurements

---

### 2. Top View Panel (Chart)

**Purpose:** Spatial chart overlay with vessel track, heatmaps, and spatial analysis

**Data Structure:**

```typescript
interface ChartPanel {
  id: 'top-view';
  type: 'chart';

  // Map configuration
  map: {
    center: [number, number]; // [longitude, latitude]
    zoom: number; // 1-20
    pitch: number; // 0-60 degrees (3D perspective)
    bearing: number; // 0-360 degrees (rotation)
  };

  // Base layers
  baseLayers: {
    type: 'bathymetry' | 'nautical-chart' | 'satellite';
    source: 'MapTiler' | 'MarineCharts' | 'Custom';
    opacity: number;
  };

  // Data layers
  layers: {
    vesselTrack: {
      visible: boolean;
      color: string;
      width: number;
      showHeading: boolean;
    };

    backscatterHeatmap: {
      visible: boolean;
      aggregation: 'mean' | 'max' | 'sum';
      depthRange: [number, number]; // Depth slice to show
      colorScale: string;
      opacity: number;
    };

    catchLocations: {
      visible: boolean;
      size: number;
      colorBy: 'species' | 'quantity' | 'gear';
    };

    schoolDetections: {
      visible: boolean;
      color: string;
      size: number;
      showConfidence: boolean;
    };

    environmental: {
      sst: boolean; // Sea surface temperature
      chlorophyll: boolean;
      currents: boolean;
    };
  };
}
```

**Rendering Specifications:**

```typescript
interface ChartRenderer {
  // MapLibre GL JS renderer
  renderer: 'maplibre-gl-js';

  // Layer composition
  layers: {
    // Base bathymetry
    bathymetry: MapLayer;

    // Vessel track line
    trackLine: MapLayer & {
      paint: {
        'line-color': 'string';
        'line-width': number;
        'line-opacity': number;
      };
    };

    // WebGL-accelerated heatmap
    heatmap: HeatmapLayer & {
      heatmapWeight: 'property';
      heatmapIntensity: number;
      heatmapColor: 'expression';
      heatmapRadius: number;
    };

    // Point clusters for catches
    catchClusters: ClusterLayer;
  };

  // Interaction
  interaction: {
    boxSelect: boolean;
    lassoSelect: boolean;
    clickToSelect: boolean;
  };
}
```

**Visual Specification:**

```
┌─────────────────────────────────────────────────────────────┐
│                    TOP VIEW (Chart)                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                  ╱──────────╲                                │
│                ╱    ░░░     ╲                               │
│               ╱  ░░░▓▓▓░░░   ╲                              │
│              │   ░░▓▓███▓▓░░   │                             │
│              │  ░░░░░░░░░░░░░░  │  ← Heatmap overlay        │
│              │  ░░░██░░░██░░░░  │    (backscatter)          │
│              ╲  ░░░░░░░░░░░░░  ╱                             │
│               ╲   ░░░░░░░░░   ╱                              │
│                ╲────────────╱                                │
│                  ▲     ▲                                     │
│                  │     │                                     │
│              Start    End                                    │
│                                                              │
│   ─────────────────────────────────────────                  │
│   ○ Catch location                                          │
│   △ School detection                                        │
│   ──── Vessel track                                         │
│   ░░░░ Low density                                           │
│   ▓▓▓▓ Medium density                                         │
│   ████ High density (potential fishing area)                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**MapLibre Integration:**

```typescript
import maplibregl from 'maplibre-gl';

// Initialize map
const map = new maplibregl.Map({
  container: 'chart-panel',
  style: {
    version: 8,
    sources: {
      'bathymetry': {
        type: 'raster',
        tiles: ['https://api.maptiler.com/tiles/bathymetry/{z}/{x}/{y}.png'],
        tileSize: 256,
      },
      'backscatter-heatmap': {
        type: 'heatmap',
        data: acousticData,
        weight: ['get', 'sv'],
      },
    },
    layers: [
      {
        id: 'bathymetry-layer',
        type: 'raster',
        source: 'bathymetry',
        paint: { 'raster-opacity': 0.7 },
      },
      {
        id: 'heatmap-layer',
        type: 'heatmap',
        source: 'backscatter-heatmap',
        paint: {
          'heatmap-weight': ['get', 'sv'],
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 9, 3],
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(0,0,255,0)',
            0.2, 'blue',
            0.4, 'cyan',
            0.6, 'lime',
            0.8, 'yellow',
            1, 'red'
          ],
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, 9, 20],
        },
      },
    ],
  },
  center: [-122.4194, 37.7749],
  zoom: 10,
});
```

---

### 3. Front View Panel (Cross-Section)

**Purpose:** Cross-section of water column at vessel heading, showing side-scan sonar or interpolated data

**Data Structure:**

```typescript
interface CrossSectionPanel {
  id: 'front-view';
  type: 'cross-section';

  // Orientation
  orientation: {
    heading: number; // Vessel heading in degrees
    viewAngle: number; // 0 = looking forward, 180 = looking backward
    width: number; // Width of cross-section in meters
  };

  // Axes
  xAxis: {
    type: 'distance';
    range: [-500, 500]; // Meters perpendicular to vessel track
    origin: 'vessel';
  };

  yAxis: {
    type: 'depth';
    range: [0, 200]; // Meters
    inverted: true;
  };

  // Data source
  dataSource: {
    type: 'side-scan' | 'interpolated-echogram' | 'multibeam';
    interpolationMethod: 'kriging' | 'idw' | 'nearest';
  };
}
```

**Rendering Specifications:**

```typescript
interface CrossSectionRenderer {
  renderer: 'webgl';

  // For interpolated data from echogram
  interpolation: {
    method: 'kriging';
    variogram: 'spherical' | 'exponential' | 'gaussian';
    range: number;
    nugget: number;
    sill: number;
  };

  // For side-scan/multibeam data
  sonarRender: {
    slantRangeCorrection: boolean;
    beamPattern: 'cosine' | 'custom';
    mosaicking: 'overlap' | 'latest';
  };
}
```

**Visual Specification:**

```
┌─────────────────────────────────────────────────────────────┐
│                FRONT VIEW (Cross-Section)                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                  ╱──────────╲                                │
│  0m ──────────╱    ░░░░░░   ╲────────────                   │
│               ╱  ░░░░░░░░░░░  ╲                             │
│              │   ░░░░▓▓▓░░░░░   │                            │
│ 50m         │  ░░░░▓▓██▓▓░░░░  │  ← Fish school cross-section│
│              │   ░░░░▓▓▓░░░░░   │    visible in cross-section │
│               ╲  ░░░░░░░░░░░  ╱                             │
│100m ─────────╲   ░░░░░░░░   ╱────────────                   │
│                 ╲────────────╱                                │
│                                                              │
│              -500m    0m    +500m                           │
│                      (vessel)                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## DAW-Style Timeline Interface

### Timeline Overview

**DAW-inspired horizontal timeline provides temporal context and clip-based event organization.**

**Core Metaphor:**

```
Like tracks in a Digital Audio Workstation:
- Each data type has its own track
- Events are "clips" on the timeline
- Scrub, zoom, arrange like audio clips
- Multiple tracks can be soloed, muted, or grouped
```

### Track Architecture

**Track Types:**

```typescript
type TrackType =
  | 'acoustic'    // Hydroacoustic data
  | 'gps'         // Position and navigation
  | 'catch'       // Catch events and logging
  | 'gear'        // Gear deployment and status
  | 'crew'        // Crew activities
  | 'environmental'; // Environmental conditions

interface Track {
  id: string;
  type: TrackType;
  name: string;

  // Visibility
  visible: boolean;
  solo: boolean;
  muted: boolean;
  height: number; // Track height in pixels

  // Content
  clips: Clip[];

  // Styling
  color: string;
  opacity: number;

  // Interaction
  locked: boolean;
  selectable: boolean;
}
```

**Track Specifications:**

#### 1. Acoustic Track

```typescript
interface AcousticTrack extends Track {
  type: 'acoustic';

  clips: AcousticClip[];

  configuration: {
    frequency: number; // kHz
    beamType: 'single' | 'split' | 'multibeam';
    dataRate: number; // Hz
  };
}

interface AcousticClip {
  id: string;
  startTime: timestamp;
  endTime: timestamp;

  data: {
    pingRate: number;
    samplesPerPing: number;
    format: 'raw' | 'processed';
    compression: 'none' | 'lz4';
  };

  visualization: {
    thumbnail: 'waveform' | 'spectrogram' | 'compressed';
    color: string;
  };
}
```

#### 2. GPS Track

```typescript
interface GPSTrack extends Track {
  type: 'gps';

  clips: GPSClip[];

  configuration: {
    updateRate: number; // Hz
    precision: 'high' | 'standard';
  };
}

interface GPSClip {
  id: string;
  startTime: timestamp;
  endTime: timestamp;

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

interface GPSPoint {
  timestamp: number;
  latitude: number;
  longitude: number;
  speed: number; // m/s
  heading: number; // degrees
  depth: number; // meters (for depth sounder)
}
```

#### 3. Catch Track

```typescript
interface CatchTrack extends Track {
  type: 'catch';

  clips: CatchClip[];

  configuration: {
    categories: string[]; // Fish species or categories
    units: 'kg' | 'count' | 'boxes';
  };
}

interface CatchClip {
  id: string;
  startTime: timestamp;
  endTime: timestamp;

  data: {
    species: string;
    quantity: number;
    gearType: string;
    location: [number, number]; // [lat, lon]
    depth: number;
    quality: 'high' | 'medium' | 'low';
  };

  visualization: {
    color: string; // Color-coded by species
    icon: string;
    showQuantity: boolean;
  };
}
```

#### 4. Gear Track

```typescript
interface GearTrack extends Track {
  type: 'gear';

  clips: GearClip[];

  configuration: {
    gearTypes: string[];
  };
}

interface GearClip {
  id: string;
  startTime: timestamp;
  endTime: timestamp;

  data: {
    gearType: string;
    status: 'deployed' | 'retrieved' | 'active' | 'inactive';
    settings: GearSettings;
  };

  visualization: {
    color: string;
    icon: string;
    showStatus: boolean;
  };
}

interface GearSettings {
  [key: string]: number | string | boolean;
  // Gear-specific settings (trawl doors, net depth, etc.)
}
```

#### 5. Crew Track

```typescript
interface CrewTrack extends Track {
  type: 'crew';

  clips: CrewClip[];

  configuration: {
    crewMembers: CrewMember[];
  };
}

interface CrewClip {
  id: string;
  startTime: timestamp;
  endTime: timestamp;

  data: {
    crewMember: string;
    activity: string;
    notes?: string;
  };

  visualization: {
    color: string; // Color-coded by crew member
    icon: string;
  };
}

interface CrewMember {
  id: string;
  name: string;
  role: string;
  color: string;
}
```

#### 6. Environmental Track

```typescript
interface EnvironmentalTrack extends Track {
  type: 'environmental';

  clips: EnvironmentalClip[];

  configuration: {
    parameters: EnvironmentalParameter[];
  };
}

interface EnvironmentalClip {
  id: string;
  startTime: timestamp;
  endTime: timestamp;

  data: {
    parameter: EnvironmentalParameter;
    readings: EnvironmentalReading[];
  };

  visualization: {
    color: string;
    showValues: boolean;
    showUnits: boolean;
  };
}

interface EnvironmentalReading {
  timestamp: number;
  value: number;
  unit: string;
  quality: 'good' | 'questionable' | 'bad';
}

type EnvironmentalParameter =
  | 'sst'              // Sea surface temperature
  | 'chlorophyll'      // Chlorophyll concentration
  | 'salinity'         // Water salinity
  | 'dissolved_oxygen' // Dissolved oxygen
  | 'currents'         // Current speed and direction
  | 'wave_height';     // Wave height
```

### Timeline Interface

```typescript
interface TimelineInterface {
  // Time axis
  timeAxis: {
    min: timestamp;
    max: timestamp;
    visible: {
      start: timestamp;
      end: timestamp;
    };

    // Zoom levels
    zoomLevels: {
      min: number; // Minimum seconds visible (e.g., 60)
      max: number; // Maximum seconds visible (e.g., 86400 for 24 hours)
      current: number;
    };

    // Playback
    playback: {
      enabled: boolean;
      position: timestamp;
      speed: number; // 1 = real-time, 2 = 2x, etc.
      loop: boolean;
    };
  };

  // Track layout
  tracks: {
    layout: 'stacked' | 'overlaid';
    minHeight: number;
    maxHeight: number;
    autoResize: boolean;
  };

  // Ruler
  ruler: {
    visible: boolean;
    position: 'top' | 'bottom';
    format: 'time' | 'relative' | 'timestamp';
    majorTicks: number;
    minorTicks: number;
  };

  // Scrubber
  scrubber: {
    visible: boolean;
    position: timestamp;
    snap: 'none' | 'clip-start' | 'clip-end' | 'clip-boundary';
  };
}
```

**Visual Specification:**

```
┌─────────────────────────────────────────────────────────────┐
│                    DAW TIMELINE INTERFACE                   │
├─────────────────────────────────────────────────────────────┤
│  00:00    01:00    02:00    03:00    04:00    05:00      │
│    ├────────┼────────┼────────┼────────┼────────┼────────┤
│                                                           │
│  ▼ Playback head (scrubber)                               │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Acoustic Track  │  ████████████████████████         │  │
│  ├─────────────────────────────────────────────────────┤  │
│  │ GPS Track        │  ████████████████████████████████ │  │
│  ├─────────────────────────────────────────────────────┤  │
│  │ Catch Track      │  ████      ██  █    ████          │  │
│  ├─────────────────────────────────────────────────────┤  │
│  │ Gear Track       │  ████████████████████████         │  │
│  ├─────────────────────────────────────────────────────┤  │
│  │ Crew Track       │  ██  ████  ██  ████  ██          │  │
│  ├─────────────────────────────────────────────────────┤  │
│  │ Environmental   │  ████████████████████████████     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐                          │
│  │ + │ │ - │ │ ◄ │ │ ► │ │ ■ │  Playback controls       │
│  └───┘ └───┘ └───┘ └───┘ └───┘                          │
│                                                           │
│  Zoom: ────●───────  ▲ Zoom slider                        │
└─────────────────────────────────────────────────────────────┘

Controls:
  █ = Clip/segment
  ▼ = Playback head position
  +/- = Zoom in/out
  ◄/► = Step backward/forward
  ■ = Stop playback
```

### D3.js Implementation

```typescript
import { scaleTime, select, drag, zoom } from 'd3';

// Timeline component
class TimelineComponent {
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private xScale: d3.ScaleTime<number, number>;
  private width: number;
  private height: number;

  constructor(container: HTMLElement, tracks: Track[]) {
    this.width = container.clientWidth;
    this.height = 600;

    // Create SVG
    this.svg = select(container)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height);

    // Time scale
    this.xScale = scaleTime()
      .domain([new Date('2024-01-01'), new Date('2024-01-02')])
      .range([0, this.width]);

    // Add zoom behavior
    const zoomBehavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 1000])
      .on('zoom', (event) => this.handleZoom(event));

    this.svg.call(zoomBehavior);

    // Render tracks
    this.renderTracks(tracks);
  }

  private handleZoom(event: d3.D3ZoomEvent<SVGSVGElement, unknown>) {
    const { transform } = event;
    this.xScale = transform.rescaleX(this.xScale);
    this.updateTracks();
  }

  private renderTracks(tracks: Track[]) {
    let y = 50; // Start below ruler

    tracks.forEach(track => {
      const trackGroup = this.svg.append('g')
        .attr('class', 'track')
        .attr('transform', `translate(0, ${y})`);

      // Track background
      trackGroup.append('rect')
        .attr('width', this.width)
        .attr('height', track.height)
        .attr('fill', track.color)
        .attr('opacity', 0.1);

      // Render clips
      track.clips.forEach(clip => {
        const clipGroup = trackGroup.append('g')
          .attr('class', 'clip');

        const startX = this.xScale(new Date(clip.startTime));
        const endX = this.xScale(new Date(clip.endTime));

        clipGroup.append('rect')
          .attr('x', startX)
          .attr('y', 0)
          .attr('width', endX - startX)
          .attr('height', track.height)
          .attr('fill', track.color)
          .attr('opacity', 0.7);
      });

      y += track.height;
    });
  }

  private updateTracks() {
    // Re-render clips with updated scale
    // Called after zoom
  }
}
```

---

## Cross-Panel Selection System

### Selection Bus Architecture

**The Selection Bus coordinates selections across all panels.**

```typescript
interface SelectionBus {
  // Selection types
  selections: Selection[];

  // Communication
  events: {
    onSelectionChanged: EventEmitter<Selection[]>;
    onSelectionAdded: EventEmitter<Selection>;
    onSelectionRemoved: EventEmitter<Selection>;
  };

  // Modes
  mode: 'append' | 'replace' | 'intersect' | 'subtract';

  // Coordination
  syncPolicy: 'immediate' | 'debounced' | 'manual';
}

interface Selection {
  id: string;

  // Selection source
  source: 'side-view' | 'top-view' | 'front-view' | 'timeline';

  // Spatial dimension
  spatial?: {
    type: 'point' | 'line' | 'polygon' | 'bounding-box';
    coordinates: number[][];
    crs: 'EPSG:4326' | 'EPSG:3857'; // WGS84 or Web Mercator
  };

  // Temporal dimension
  temporal?: {
    type: 'range' | 'instant';
    startTime: timestamp;
    endTime?: timestamp;
  };

  // Acoustic dimension (frequency/depth)
  acoustic?: {
    type: 'threshold' | 'range' | 'polygon';
    frequencyRange?: [number, number];
    depthRange?: [number, number];
    svRange?: [number, number]; // Volume backscatter range
  };

  // Metadata
  metadata: {
    color: string;
    label: string;
    created: timestamp;
  };
}
```

### Selection Flow

**Spatial Selection → Temporal Highlighting:**

```
User selects region in TOP VIEW (Chart panel)
  ↓
Selection bus broadcasts spatial selection
  ↓
SIDE VIEW highlights corresponding time range
  ↓
FRONT VIEW highlights corresponding depth range
  ↓
TIMELINE clips within spatial range are highlighted
```

**Temporal Selection → Spatial Highlighting:**

```
User selects time range in TIMELINE
  ↓
Selection bus broadcasts temporal selection
  ↓
TOP VIEW highlights vessel track segment
  ↓
SIDE VIEW scrolls to selected time range
  ↓
FRONT VIEW updates cross-section for time range
```

**Compound Selection:**

```typescript
interface CompoundSelection extends Selection {
  type: 'compound';

  // Combine multiple selections
  operands: Selection[];
  operator: 'AND' | 'OR' | 'XOR' | 'NOT';

  // Example:
  // Show me high-backscatter areas AND times when gear was deployed
  operands: [
    {
      source: 'side-view',
      acoustic: { svRange: [-30, 0] }, // High backscatter
    },
    {
      source: 'timeline',
      temporal: { ... },
      track: 'gear',
      filter: { status: 'deployed' },
    },
  ];
  operator: 'AND';
}
```

### Selection Coordination

```typescript
class SelectionCoordinator {
  private selectionBus: SelectionBus;
  private panels: Map<string, Panel>;

  constructor() {
    this.selectionBus = new SelectionBus();
    this.panels = new Map();

    // Listen for selection changes
    this.selectionBus.events.onSelectionChanged.subscribe(
      selections => this.handleSelectionChange(selections)
    );
  }

  registerPanel(panel: Panel) {
    this.panels.set(panel.id, panel);

    // Panel reports selection changes
    panel.onSelection.subscribe(selection => {
      this.selectionBus.add(selection);
    });
  }

  private handleSelectionChange(selections: Selection[]) {
    // Broadcast to all panels
    this.panels.forEach(panel => {
      panel.highlightSelections(selections);
    });
  }

  // Query across dimensions
  query(query: MultiDimensionalQuery): DataPoint[] {
    const results: DataPoint[] = [];

    // Spatial filter
    let points = this.spatialIndex.query(query.spatial);

    // Temporal filter
    points = points.filter(p =>
      p.timestamp >= query.temporal.startTime &&
      p.timestamp <= query.temporal.endTime
    );

    // Acoustic filter
    if (query.acoustic) {
      points = points.filter(p =>
        p.sv >= query.acoustic.svRange[0] &&
        p.sv <= query.acoustic.svRange[1]
      );
    }

    return results;
  }
}

interface MultiDimensionalQuery {
  spatial: BoundingBox;
  temporal: TimeRange;
  acoustic?: AcousticFilter;
}
```

---

## Component Architecture

### Component Hierarchy

```
MarineVizApp
├── PanelLayout
│   ├── SideViewPanel (Echogram)
│   │   ├── WebGLCanvas
│   │   ├── ColorScaleLegend
│   │   ├── DepthAxis
│   │   └── TimeAxis
│   │
│   ├── TopViewPanel (Chart)
│   │   ├── MapLibreMap
│   │   ├── LayerControls
│   │   ├── VesselTrackLayer
│   │   ├── HeatmapLayer
│   │   └── CatchMarkers
│   │
│   └── FrontViewPanel (CrossSection)
│       ├── WebGLCanvas
│       ├── DepthAxis
│       ├── DistanceAxis
│       └── OrientationIndicator
│
└── TimelinePanel
    ├── TimelineRuler
    ├── PlaybackControls
    ├── ZoomControls
    └── TrackComponents
        ├── AcousticTrack
        ├── GPSTrack
        ├── CatchTrack
        ├── GearTrack
        ├── CrewTrack
        └── EnvironmentalTrack
```

### React Components

**Main Application Component:**

```typescript
import React, { useState, useEffect, useCallback } from 'react';
import { PanelLayout } from './PanelLayout';
import { TimelinePanel } from './TimelinePanel';
import { SelectionBus } from './SelectionBus';
import { DataManager } from './DataManager';
import './MarineVizApp.css';

interface MarineVizAppProps {
  dataSources: DataSourceConfig[];
  initialConfig?: MarineVizConfig;
}

export const MarineVizApp: React.FC<MarineVizAppProps> = ({
  dataSources,
  initialConfig
}) => {
  const [selectionBus] = useState(() => new SelectionBus());
  const [dataManager] = useState(() => new DataManager(dataSources));
  const [config, setConfig] = useState<MarineVizConfig>(
    initialConfig || defaultConfig
  );

  // Load initial data
  useEffect(() => {
    dataManager.load(config.dataBounds);
  }, [dataManager, config.dataBounds]);

  // Handle selection changes
  const handleSelectionChange = useCallback((selections: Selection[]) => {
    // Update all panels
    // Query data for selections
    // Update highlights
  }, []);

  useEffect(() => {
    selectionBus.events.onSelectionChanged.subscribe(handleSelectionChange);
    return () => {
      selectionBus.events.onSelectionChanged.unsubscribe(handleSelectionChange);
    };
  }, [selectionBus, handleSelectionChange]);

  return (
    <div className="marineviz-app">
      <PanelLayout
        config={config.panels}
        dataManager={dataManager}
        selectionBus={selectionBus}
        onConfigChange={(panels) =>
          setConfig(prev => ({ ...prev, panels }))
        }
      />
      <TimelinePanel
        config={config.timeline}
        dataManager={dataManager}
        selectionBus={selectionBus}
        onConfigChange={(timeline) =>
          setConfig(prev => ({ ...prev, timeline }))
        }
      />
    </div>
  );
};
```

**Panel Layout Component:**

```typescript
import React, { useRef, useEffect } from 'react';
import { SideViewPanel } from './SideViewPanel';
import { TopViewPanel } from './TopViewPanel';
import { FrontViewPanel } from './FrontViewPanel';
import { SelectionBus, Selection } from './SelectionBus';
import { DataManager } from './DataManager';
import './PanelLayout.css';

interface PanelLayoutProps {
  config: PanelConfig;
  dataManager: DataManager;
  selectionBus: SelectionBus;
  onConfigChange: (config: PanelConfig) => void;
}

export const PanelLayout: React.FC<PanelLayoutProps> = ({
  config,
  dataManager,
  selectionBus,
  onConfigChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleResize = useCallback(() => {
    // Update panel dimensions
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  return (
    <div ref={containerRef} className="panel-layout">
      <div className="panel-container" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        height: '60vh',
      }}>
        <SideViewPanel
          config={config.sideView}
          dataManager={dataManager}
          selectionBus={selectionBus}
          onConfigChange={(sideView) =>
            onConfigChange({ ...config, sideView })
          }
        />
        <TopViewPanel
          config={config.topView}
          dataManager={dataManager}
          selectionBus={selectionBus}
          onConfigChange={(topView) =>
            onConfigChange({ ...config, topView })
          }
        />
        <FrontViewPanel
          config={config.frontView}
          dataManager={dataManager}
          selectionBus={selectionBus}
          onConfigChange={(frontView) =>
            onConfigChange({ ...config, frontView })
          }
        />
      </div>
    </div>
  );
};
```

**Side View Panel Component:**

```typescript
import React, { useRef, useEffect, useState } from 'react';
import { useWebGLRenderer } from '../hooks/useWebGLRenderer';
import { SelectionBus } from './SelectionBus';
import { DataManager } from './DataManager';
import { ColorScaleLegend } from './ColorScaleLegend';
import { DepthAxis } from './DepthAxis';
import { TimeAxis } from './TimeAxis';
import './SideViewPanel.css';

interface SideViewPanelProps {
  config: EchogramPanel;
  dataManager: DataManager;
  selectionBus: SelectionBus;
  onConfigChange: (config: EchogramPanel) => void;
}

export const SideViewPanel: React.FC<SideViewPanelProps> = ({
  config,
  dataManager,
  selectionBus,
  onConfigChange
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { renderer, initRenderer, renderFrame } = useWebGLRenderer();
  const [hoverData, setHoverData] = useState<HoverData | null>(null);

  // Initialize WebGL renderer
  useEffect(() => {
    if (canvasRef.current) {
      initRenderer(canvasRef.current, config);
    }
  }, [initRenderer, config]);

  // Load data
  useEffect(() => {
    const data = dataManager.getEchogramData({
      timeRange: config.xAxis.range,
      depthRange: config.yAxis.range
    });

    renderer?.updateData(data);
    renderFrame();
  }, [dataManager, config, renderer, renderFrame]);

  // Handle selections
  useEffect(() => {
    const unsubscribe = selectionBus.events.onSelectionChanged.subscribe(
      selections => {
        renderer?.highlightSelections(selections);
        renderFrame();
      }
    );

    return () => unsubscribe();
  }, [selectionBus, renderer, renderFrame]);

  // Handle mouse interactions
  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Convert to data coordinates
    const time = config.xAxis.range.start +
      (x / rect.width) * (config.xAxis.range.end - config.xAxis.range.start);
    const depth = config.yAxis.range[0] +
      (y / rect.height) * (config.yAxis.range[1] - config.yAxis.range[0]);

    setHoverData({ time, depth, x, y });
  };

  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!hoverData) return;

    // Create selection
    const selection: Selection = {
      id: `selection-${Date.now()}`,
      source: 'side-view',
      temporal: {
        type: 'instant',
        startTime: hoverData.time,
      },
      acoustic: {
        type: 'point',
        depth: hoverData.depth,
      },
      metadata: {
        color: '#00ff00',
        label: 'Point selection',
        created: Date.now(),
      },
    };

    selectionBus.add(selection);
  };

  return (
    <div className="side-view-panel">
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
      />
      <ColorScaleLegend config={config.colorScale} />
      <DepthAxis range={config.yAxis.range} />
      <TimeAxis range={config.xAxis.range} />
      {hoverData && (
        <div className="hover-tooltip" style={{
          left: hoverData.x,
          top: hoverData.y,
        }}>
          Time: {new Date(hoverData.time).toISOString()}<br />
          Depth: {hoverData.depth.toFixed(1)}m
        </div>
      )}
    </div>
  );
};
```

**Timeline Panel Component:**

```typescript
import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { SelectionBus } from './SelectionBus';
import { DataManager } from './DataManager';
import { TrackComponent } from './TrackComponent';
import { PlaybackControls } from './PlaybackControls';
import { ZoomControls } from './ZoomControls';
import './TimelinePanel.css';

interface TimelinePanelProps {
  config: TimelineInterface;
  dataManager: DataManager;
  selectionBus: SelectionBus;
  onConfigChange: (config: TimelineInterface) => void;
}

export const TimelinePanel: React.FC<TimelinePanelProps> = ({
  config,
  dataManager,
  selectionBus,
  onConfigChange
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [zoomLevel, setZoomLevel] = useState(config.timeAxis.zoomLevels.current);

  // Initialize D3 timeline
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // Time scale
    const xScale = d3.scaleTime()
      .domain([new Date(config.timeAxis.min), new Date(config.timeAxis.max)])
      .range([0, width]);

    // Zoom behavior
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 1000])
      .on('zoom', (event) => {
        const newScale = event.transform.rescaleX(xScale);
        updateTimeline(newScale);
      });

    svg.call(zoomBehavior);

    const updateTimeline = (scale: d3.ScaleTime<number, number>) => {
      // Update ruler
      // Update clips
      // Update scrubber
    };
  }, [config]);

  // Handle playback
  const handlePlayback = (playing: boolean) => {
    onConfigChange({
      ...config,
      timeAxis: {
        ...config.timeAxis,
        playback: {
          ...config.timeAxis.playback,
          enabled: playing,
        },
      },
    });
  };

  // Handle scrub
  const handleScrub = (position: number) => {
    onConfigChange({
      ...config,
      timeAxis: {
        ...config.timeAxis,
        playback: {
          ...config.timeAxis.playback,
          position,
        },
      },
    });
  };

  return (
    <div className="timeline-panel">
      <PlaybackControls
        playing={config.timeAxis.playback.enabled}
        position={config.timeAxis.playback.position}
        speed={config.timeAxis.playback.speed}
        onPlayChange={handlePlayback}
        onScrub={handleScrub}
      />
      <ZoomControls
        zoomLevel={zoomLevel}
        min={config.timeAxis.zoomLevels.min}
        max={config.timeAxis.zoomLevels.max}
        onZoomChange={setZoomLevel}
      />
      <svg ref={svgRef} className="timeline-svg">
        {/* Timeline content rendered by D3 */}
      </svg>
      {/* Track components */}
    </div>
  );
};
```

---

## Data Structures

### Core Data Types

```typescript
// Geographic types
type GeoPoint = [number, number]; // [longitude, latitude]
type GeoBoundingBox = {
  min: GeoPoint;
  max: GeoPoint;
};

// Temporal types
type timestamp = number; // Unix timestamp in milliseconds
type TimeRange = {
  start: timestamp;
  end: timestamp;
};

// Acoustic data
interface PingData {
  timestamp: timestamp;
  latitude: number;
  longitude: number;
  depth: number[]; // Depth samples
  sv: number[]; // Volume backscatter (dB)
  frequency: number; // kHz
  beam: number; // Beam number for multibeam
}

interface EchogramData {
  pings: PingData[];
  metadata: {
    sampleRate: number;
    soundVelocity: number;
    transducerDepth: number;
  };
}

// Navigation data
interface GPSData {
  timestamp: timestamp;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  altitude?: number;
}

// Catch data
interface CatchData {
  id: string;
  timestamp: timestamp;
  latitude: number;
  longitude: number;
  species: string;
  quantity: number;
  unit: string;
  gearType: string;
  depth: number;
}

// Gear data
interface GearData {
  id: string;
  timestamp: timestamp;
  type: string;
  status: 'deployed' | 'retrieved' | 'active' | 'inactive';
  settings: Record<string, number | string | boolean>;
}

// Environmental data
interface EnvironmentalData {
  timestamp: timestamp;
  latitude: number;
  longitude: number;
  parameter: EnvironmentalParameter;
  value: number;
  unit: string;
  quality: 'good' | 'questionable' | 'bad';
}

// Unified data point
interface DataPoint {
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

  // Events
  catch?: CatchData;
  gear?: GearData;

  // Source
  source: 'acoustic' | 'gps' | 'catch' | 'gear' | 'environmental';
}
```

### Data Manager

```typescript
class DataManager {
  private dataSources: Map<string, DataSource>;
  private cache: Map<string, CachedData>;
  private spatialIndex: SpatialIndex;

  constructor(config: DataSourceConfig[]) {
    this.dataSources = new Map();
    this.cache = new Map();

    // Initialize data sources
    config.forEach(sourceConfig => {
      this.dataSources.set(sourceConfig.id, new DataSource(sourceConfig));
    });

    // Build spatial index
    this.buildSpatialIndex();
  }

  // Load data for bounds
  async load(bounds: DataBounds): Promise<void> {
    const promises = Array.from(this.dataSources.values()).map(source =>
      source.load(bounds)
    );

    await Promise.all(promises);
    this.buildSpatialIndex();
  }

  // Query echogram data
  getEchogramData(query: EchogramQuery): EchogramData {
    const cacheKey = `echogram-${JSON.stringify(query)}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!.data as EchogramData;
    }

    // Query from data sources
    const pings: PingData[] = [];

    this.dataSources.forEach(source => {
      const sourceData = source.query({
        timeRange: query.timeRange,
        depthRange: query.depthRange,
      });

      pings.push(...sourceData);
    });

    const data = { pings, metadata: {} };
    this.cache.set(cacheKey, { data, timestamp: Date.now() });

    return data;
  }

  // Query GPS data
  getGPSData(query: GPSQuery): GPSData[] {
    const results: GPSData[] = [];

    this.dataSources.forEach(source => {
      const sourceData = source.query({
        timeRange: query.timeRange,
      });

      results.push(...sourceData.filter(d => d.latitude && d.longitude));
    });

    return results;
  }

  // Spatial query
  spatialQuery(bounds: GeoBoundingBox): DataPoint[] {
    return this.spatialIndex.query(bounds);
  }

  // Temporal query
  temporalQuery(range: TimeRange): DataPoint[] {
    const results: DataPoint[] = [];

    this.dataSources.forEach(source => {
      const sourceData = source.query({ timeRange: range });
      results.push(...sourceData);
    });

    return results.sort((a, b) => a.timestamp - b.timestamp);
  }

  // Multi-dimensional query
  query(query: MultiDimensionalQuery): DataPoint[] {
    let results: DataPoint[] = [];

    // Start with spatial query
    if (query.spatial) {
      results = this.spatialQuery(query.spatial);
    }

    // Filter by time
    if (query.temporal) {
      results = results.filter(p =>
        p.timestamp >= query.temporal.start &&
        p.timestamp <= query.temporal.end
      );
    }

    // Filter by acoustic properties
    if (query.acoustic) {
      results = results.filter(p => {
        if (query.acoustic.svRange) {
          return p.sv !== undefined &&
            p.sv >= query.acoustic.svRange[0] &&
            p.sv <= query.acoustic.svRange[1];
        }
        return true;
      });
    }

    return results;
  }

  private buildSpatialIndex(): void {
    // Use R-tree or similar spatial index
    this.spatialIndex = new RTree();

    this.dataSources.forEach(source => {
      const allData = source.getAll();
      allData.forEach(point => {
        this.spatialIndex.insert({
          x: point.longitude,
          y: point.latitude,
          data: point,
        });
      });
    });
  }
}

interface DataBounds {
  timeRange: TimeRange;
  spatialBounds: GeoBoundingBox;
  depthRange?: [number, number];
}

interface EchogramQuery {
  timeRange: TimeRange;
  depthRange: [number, number];
}

interface GPSQuery {
  timeRange: TimeRange;
}
```

---

## Interaction Patterns

### Gesture Mappings

**Mouse Interactions:**

| Gesture | Side View | Top View | Front View | Timeline |
|---------|-----------|----------|------------|----------|
| Left Click | Select point | Select location | Select point | Move scrubber |
| Left Drag | Range select | Box select | Range select | Select range |
| Right Drag | Threshold select | Lasso select | Polygon select | N/A |
| Mouse Wheel | Zoom depth | Zoom map | Zoom depth | Zoom time |
| Shift + Click | Add to selection | Add to selection | Add to selection | Add to selection |
| Ctrl + Click | Remove from selection | Remove from selection | Remove from selection | Remove from selection |
| Double Click | Zoom to extent | Zoom to selection | Zoom to extent | Zoom to clip |
| Middle Drag | Pan time | Pan map | Pan distance | Pan time |

**Touch Interactions:**

| Gesture | Side View | Top View | Front View | Timeline |
|---------|-----------|----------|------------|----------|
| Single Tap | Select point | Select location | Select point | Move scrubber |
| Two-Finger Drag | Pan time/depth | Pan map | Pan distance/depth | Pan time |
| Pinch | Zoom | Zoom map | Zoom | Zoom time |
| Three-Finger Drag | N/A | Rotate 3D | N/A | N/A |

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Space | Play/Pause |
| ← / → | Step backward/forward 1 second |
| Shift + ← / → | Step backward/forward 1 minute |
| ↑ / ↓ | Previous/next track |
| + / - | Zoom in/out |
| Home | Go to start |
| End | Go to end |
| Esc | Clear selection |
| Ctrl + A | Select all |
| Ctrl + D | Deselect |
| Ctrl + Z | Undo |
| Ctrl + Shift + Z | Redo |
| F | Full screen mode |
| H | Toggle help overlay |
| S | Toggle synchronization |

### Selection Modes

**1. Range Selection**

```typescript
interface RangeSelection {
  type: 'range';
  axis: 'time' | 'depth' | 'distance';
  start: number;
  end: number;
}

// Usage:
// - Select time range in timeline
// - Select depth range in echogram
// - Select distance range in cross-section
```

**2. Polygon Selection**

```typescript
interface PolygonSelection {
  type: 'polygon';
  points: Array<[number, number]>; // Screen coordinates

  // Converts to spatial polygon
  toSpatial(): GeoPolygon {
    // Transform screen coords to geo coords
  }
}

// Usage:
// - Select irregular area in chart view
// - Select school in echogram
```

**3. Threshold Selection**

```typescript
interface ThresholdSelection {
  type: 'threshold';
  dimension: 'sv' | 'depth' | 'speed';
  operator: '>' | '<' | '=' | '>=' | '<=';
  value: number;
}

// Usage:
// - Select all high backscatter areas (> -30 dB)
// - Select all depths > 100m
// - Select all speeds > 5 knots
```

**4. Compound Selection**

```typescript
interface CompoundSelection {
  type: 'compound';
  operator: 'AND' | 'OR' | 'NOT';
  selections: Selection[];
}

// Usage:
// - Select high backscatter AND gear deployed
// - Select catch locations OR school detections
```

---

## Rendering Optimization

### Performance Targets

| Metric | Target | Notes |
|--------|--------|-------|
| Frame rate | 60 FPS | Smooth interaction |
| Data points rendered | 10M+ | With WebGL acceleration |
| Zoom/pan response | <16ms | No lag |
| Selection highlight | <50ms | Instant feedback |
| Initial load | <3s | For 24 hours of data |

### WebGL Optimization Strategies

**1. Level of Detail (LOD)**

```typescript
interface LODStrategy {
  levels: {
    high: { maxPoints: 10000, sampling: 'none' };
    medium: { maxPoints: 100000, sampling: 'uniform' };
    low: { maxPoints: 1000000, sampling: 'adaptive' };
  };

  selectLOD(viewport: Viewport): LODLevel {
    const dataDensity = this.calculateDataDensity(viewport);

    if (dataDensity < this.levels.high.maxPoints) {
      return 'high';
    } else if (dataDensity < this.levels.medium.maxPoints) {
      return 'medium';
    } else {
      return 'low';
    }
  }
}
```

**2. Data Aggregation**

```typescript
interface DataAggregator {
  // Aggregate ping data for overview
  aggregatePings(pings: PingData[], targetCount: number): AggregatedPing[] {
    if (pings.length <= targetCount) {
      return pings; // No aggregation needed
    }

    const binSize = Math.ceil(pings.length / targetCount);
    const aggregated: AggregatedPing[] = [];

    for (let i = 0; i < pings.length; i += binSize) {
      const bin = pings.slice(i, i + binSize);

      aggregated.push({
        timestamp: bin[0].timestamp, // First ping time
        meanSV: this.mean(bin.map(p => p.sv)),
        maxSV: Math.max(...bin.map(p => p.sv)),
        depth: bin[0].depth,
        count: bin.length,
      });
    }

    return aggregated;
  }

  mean(values: number[]): number {
    return values.reduce((a, b) => a + b, 0) / values.length;
  }
}
```

**3. Texture Atlasing**

```typescript
interface TextureAtlas {
  // Combine multiple textures into one
  textures: Map<string, TextureInfo>;
  atlas: WebGLTexture;

  addTexture(id: string, texture: WebGLTexture, x: number, y: number): void {
    this.textures.set(id, { texture, x, y });
  }

  // Batch rendering
  renderBatch(drawCalls: DrawCall[]): void {
    // Render all draw calls from single texture atlas
    // Reduces texture switches
  }
}
```

**4. GPU Compute Shaders**

```typescript
// WebGPU compute shader for heatmap generation
interface HeatmapComputeShader {
  code: `
    @group(0) @binding(0) var<storage, read> input: array<DataPoint>;
    @group(0) @binding(1) var<storage, read_write> output: array<f32>;

    @compute @workgroup_size(16, 16)
    fn main(@builtin(global_invocation_id) id: vec3<u32>) {
      let x = id.x;
      let y = id.y;

      // Calculate heatmap value at (x, y)
      var sum: f32 = 0.0;
      var weight: f32 = 0.0;

      for (var i = 0u; i < arrayLength(&input); i++) {
        let point = input[i];
        let dx = f32(x) - point.x;
        let dy = f32(y) - point.y;
        let dist = sqrt(dx*dx + dy*dy);

        if (dist < 50.0) {
          let w = 1.0 - (dist / 50.0);
          sum += point.value * w;
          weight += w;
        }
      }

      let index = y * 1024 + x;
      output[index] = select(0.0, sum / weight, weight > 0.0);
    }
  `;
}
```

### React Optimization

**1. Component Memoization**

```typescript
import { memo, useMemo, useCallback } from 'react';

// Memoize panel components to prevent re-renders
export const SideViewPanel = memo<SideViewPanelProps>(({
  config,
  dataManager,
  selectionBus,
  onConfigChange
}) => {
  // Memoize expensive calculations
  const processedData = useMemo(() => {
    return processEchogramData(dataManager.getEchogramData(config));
  }, [dataManager, config]);

  // Memoize callbacks to prevent child re-renders
  const handleSelection = useCallback((selection: Selection) => {
    selectionBus.add(selection);
  }, [selectionBus]);

  return (
    <div className="side-view-panel">
      {/* Render */}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for shallow equality
  return (
    prevProps.config === nextProps.config &&
    prevProps.dataManager === nextProps.dataManager &&
    prevProps.selectionBus === nextProps.selectionBus
  );
});
```

**2. Virtual Scrolling**

```typescript
import { FixedSizeList } from 'react-window';

// Virtualize timeline clips for performance
const TimelineClips: React.FC<{ clips: Clip[] }> = ({ clips }) => {
  const ITEM_HEIGHT = 40;

  return (
    <FixedSizeList
      height={600}
      itemCount={clips.length}
      itemSize={ITEM_HEIGHT}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          <ClipComponent clip={clips[index]} />
        </div>
      )}
    </FixedSizeList>
  );
};
```

**3. Debounced Updates**

```typescript
import { useDebouncedCallback } from 'use-debounce';

const SearchComponent: React.FC = () => {
  const [query, setQuery] = useState('');

  // Debounce selection updates to avoid excessive renders
  const debouncedSelection = useDebouncedCallback(
    (selection: Selection) => {
      selectionBus.add(selection);
    },
    100 // 100ms delay
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    debouncedSelection(event.target.value);
  };

  return <input value={query} onChange={handleChange} />;
};
```

### D3.js Optimization

**1. Canvas Rendering**

```typescript
// Use Canvas instead of SVG for large datasets
const renderTimeline = (data: DataPoint[]) => {
  const canvas = d3.select('#timeline-canvas').node();
  const context = canvas.getContext('2d');

  // Clear canvas
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Draw clips directly to canvas
  data.forEach(point => {
    const x = xScale(point.timestamp);
    const y = yScale(point.depth);

    context.fillStyle = colorScale(point.sv);
    context.fillRect(x, y, 2, 2);
  });

  // Much faster than SVG for >10,000 points
};
```

**2. Efficient Scales**

```typescript
// Pre-compute scales and reuse
const scales = useMemo(() => {
  return {
    xScale: d3.scaleTime()
      .domain([timeStart, timeEnd])
      .range([0, width]),
    yScale: d3.scaleLinear()
      .domain([depthMin, depthMax])
      .range([height, 0]),
    colorScale: d3.scaleSequential()
      .domain([svMin, svMax])
      .interpolator(d3.interpolateViridis),
  };
}, [timeStart, timeEnd, depthMin, depthMax, svMin, svMax, width, height]);
```

---

## Technology Stack

### Core Technologies

```json
{
  "framework": {
    "name": "React",
    "version": "18.3.1",
    "language": "TypeScript",
    "reason": "Component architecture, strong typing, large ecosystem"
  },
  "visualization": {
    "webgl": "WebGL 2.0 / WebGPU",
    "chart": "MapLibre GL JS",
    "timeline": "D3.js v7",
    "reason": "GPU acceleration, map rendering, flexible timeline"
  },
  "stateManagement": {
    "library": "Zustand",
    "reason": "Lightweight, no boilerplate, good TypeScript support"
  },
  "styling": {
    "library": "Tailwind CSS",
    "reason": "Utility-first, responsive, small bundle size"
  }
}
```

### Package.json

```json
{
  "name": "marineviz",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "typescript": "^5.4.5",

    "maplibre-gl": "^4.1.3",
    "@maplibre/maplibre-gl-geocoder": "^1.5.0",

    "d3": "^7.9.0",
    "d3-zoom": "^3.0.0",
    "d3-brush": "^3.0.0",
    "d3-scale": "^4.0.2",
    "d3-shape": "^3.2.0",

    "zustand": "^4.5.2",
    "immer": "^10.0.4",

    "@react-three/fiber": "^8.16.2",
    "@react-three/drei": "^9.105.4",
    "three": "^0.163.0",

    "react-window": "^1.8.10",
    "use-debounce": "^10.0.1",

    "tailwindcss": "^3.4.3",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38"
  },
  "devDependencies": {
    "@types/react": "^18.3.1",
    "@types/react-dom": "^18.3.0",
    "@types/d3": "^7.4.3",
    "@types/three": "^0.163.0",

    "vite": "^5.2.10",
    "vitest": "^1.5.0",

    "eslint": "^8.57.0",
    "prettier": "^3.2.5"
  }
}
```

### Build Configuration

**vite.config.ts:**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@types': path.resolve(__dirname, './src/types'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'maplibre': ['maplibre-gl'],
          'd3': ['d3', 'd3-zoom', 'd3-brush', 'd3-scale', 'd3-shape'],
          'three': ['three', '@react-three/fiber', '@react-three/drei'],
        },
      },
    },
  },
});
```

---

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)

**Goal:** Set up core infrastructure and basic rendering

**Tasks:**

1. **Project Setup**
   - [ ] Initialize React + TypeScript project
   - [ ] Configure Vite build system
   - [ ] Set up Tailwind CSS
   - [ ] Configure ESLint + Prettier
   - [ ] Set up Git repository

2. **Core Components**
   - [ ] Create PanelLayout component
   - [ ] Create SideViewPanel component
   - [ ] Create TopViewPanel component
   - [ ] Create FrontViewPanel component
   - [ ] Create TimelinePanel component

3. **Data Layer**
   - [ ] Implement DataManager
   - [ ] Create data interfaces
   - [ ] Implement mock data generator
   - [ ] Set up data loading pipeline

4. **Selection System**
   - [ ] Implement SelectionBus
   - [ ] Create selection interfaces
   - [ ] Wire up basic selection coordination

**Deliverable:** Working three-panel layout with mock data

---

### Phase 2: Echogram Rendering (Weeks 3-4)

**Goal:** Implement WebGL-based echogram rendering

**Tasks:**

1. **WebGL Renderer**
   - [ ] Set up WebGL context
   - [ ] Write vertex shader
   - [ ] Write fragment shader
   - [ ] Implement ping data texture
   - [ ] Add color scale mapping

2. **Echogram Interactions**
   - [ ] Implement pan (time axis)
   - [ ] Implement zoom (depth axis)
   - [ ] Add range selection
   - [ ] Add threshold selection
   - [ ] Implement hover tooltips

3. **Performance**
   - [ ] Implement ping data circular buffer
   - [ ] Add LOD system
   - [ ] Implement data aggregation
   - [ ] Optimize shader uniforms

**Deliverable:** Fully functional echogram panel with 60 FPS rendering

---

### Phase 3: Map Integration (Weeks 5-6)

**Goal:** Integrate MapLibre for chart panel

**Tasks:**

1. **MapLibre Setup**
   - [ ] Initialize MapLibre map
   - [ ] Add bathymetry base layer
   - [ ] Configure map controls
   - [ ] Set up map style

2. **Data Layers**
   - [ ] Implement vessel track layer
   - [ ] Add catch markers
   - [ ] Implement school detection layer
   - [ ] Create backscatter heatmap layer

3. **Interactions**
   - [ ] Add box selection
   - [ ] Add lasso selection
   - [ ] Implement click selection
   - [ ] Add hover tooltips

4. **Environmental Data**
   - [ ] Add SST layer
   - [ ] Add chlorophyll layer
   - [ ] Add currents layer

**Deliverable:** Interactive chart panel with all data layers

---

### Phase 4: Timeline Interface (Weeks 7-8)

**Goal:** Implement DAW-style timeline

**Tasks:**

1. **Timeline Components**
   - [ ] Create timeline ruler
   - [ ] Implement playback controls
   - [ ] Add zoom controls
   - [ ] Create scrubber

2. **Track System**
   - [ ] Implement AcousticTrack
   - [ ] Implement GPSTrack
   - [ ] Implement CatchTrack
   - [ ] Implement GearTrack
   - [ ] Implement CrewTrack
   - [ ] Implement EnvironmentalTrack

3. **Clip Rendering**
   - [ ] Render clip rectangles
   - [ ] Add clip thumbnails
   - [ ] Implement clip selection
   - [ ] Add clip dragging

4. **Playback**
   - [ ] Implement playback engine
   - [ ] Add speed control
   - [ ] Implement looping
   - [ ] Sync with panels

**Deliverable:** Fully functional timeline with all tracks

---

### Phase 5: Cross-Section Panel (Weeks 9-10)

**Goal:** Implement front view cross-section panel

**Tasks:**

1. **Data Processing**
   - [ ] Implement spatial interpolation
   - [ ] Add kriging algorithm
   - [ ] Create depth slicing
   - [ ] Implement data aggregation

2. **WebGL Rendering**
   - [ ] Set up WebGL context
   - [ ] Write cross-section shaders
   - [ ] Implement color mapping
   - [ ] Add orientation indicator

3. **Interactions**
   - [ ] Implement pan/zoom
   - [ ] Add range selection
   - [ ] Implement hover tooltips
   - [ ] Add depth axis
   - [ ] Add distance axis

4. **Optimization**
   - [ ] Implement LOD
   - [ ] Add caching
   - [ ] Optimize interpolation

**Deliverable:** Interactive cross-section panel

---

### Phase 6: Selection & Synchronization (Weeks 11-12)

**Goal:** Implement cross-panel selection and synchronization

**Tasks:**

1. **Selection Bus**
   - [ ] Implement SelectionBus
   - [ ] Add selection events
   - [ ] Implement compound selections
   - [ ] Add selection modes

2. **Panel Synchronization**
   - [ ] Implement spatial sync
   - [ ] Implement temporal sync
   - [ ] Add selection sync
   - [ ] Implement zoom sync

3. **Multi-Dimensional Queries**
   - [ ] Implement spatial queries
   - [ ] Implement temporal queries
   - [ ] Add acoustic queries
   - [ ] Implement compound queries

4. **Highlighting**
   - [ ] Add selection highlighting
   - [ ] Implement cross-panel highlighting
   - [ ] Add selection effects
   - [ ] Optimize rendering

**Deliverable:** Fully synchronized panels with selection coordination

---

### Phase 7: Real Data Integration (Weeks 13-14)

**Goal:** Integrate real hydroacoustic data formats

**Tasks:**

1. **Data Import**
   - [ ] Implement .RAW reader
   - [ ] Add .JSON reader
   - [ ] Implement .CSV reader
   - [ ] Add NetCDF support

2. **Data Processing**
   - [ ] Implement calibration
   - [ ] Add noise removal
   - [ ] Implement bottom detection
   - [ ] Add school detection

3. **Performance**
   - [ ] Optimize data loading
   - [ ] Implement streaming
   - [ ] Add data caching
   - [ ] Optimize memory usage

4. **Validation**
   - [ ] Test with real data
   - [ ] Validate accuracy
   - [ ] Performance testing
   - [ ] Bug fixes

**Deliverable:** Working system with real data

---

### Phase 8: Polish & Deployment (Weeks 15-16)

**Goal:** Final polish and production deployment

**Tasks:**

1. **UI/UX**
   - [ ] Add keyboard shortcuts
   - [ ] Implement help system
   - [ ] Add loading states
   - [ ] Implement error handling

2. **Performance**
   - [ ] Optimize bundle size
   - [ ] Implement code splitting
   - [ ] Add lazy loading
   - [ ] Performance profiling

3. **Testing**
   - [ ] Unit tests
   - [ ] Integration tests
   - [ ] E2E tests
   - [ ] Performance tests

4. **Documentation**
   - [ ] User manual
   - [ ] Developer docs
   - [ ] API docs
   - [ ] Deployment docs

5. **Deployment**
   - [ ] CI/CD setup
   - [ ] Build optimization
   - [ ] Deploy to staging
   - [ ] Deploy to production

**Deliverable:** Production-ready system

---

## Appendix: Additional Resources

### Research Sources

Based on the research conducted, here are the key resources referenced:

**Hydroacoustic Visualization:**
- [Echoview Software - Marine Solutions](https://echoview.com/solutions/marine/)
- [FAO/AdriaMed Technical Manual](https://www.fao.org/) - Echoview usage guide

**Marine GIS & Visualization:**
- [Marine Tools QGIS Plugin](https://plugins.qgis.org/plugins/marinetools/)
- [How to Open Copernicus Marine Data in QGIS](https://help.marine.copernicus.eu/en/articles/6492453)
- [Create Heatmaps with QGIS (IHE Delft Tutorial)](https://www.youtube.com/watch?v=oK5hZMCCj6k)
- [Working with Marine Charts in QGIS 3](https://www.youtube.com/watch?v=9W5TmXSMsRk)

**DAW Interface Design:**
- [What Is a DAW? Beginner's Guide](https://acestudio.ai/blog/what-is-a-daw/)
- [What Is a DAW? In-Depth Guide](https://www.masteringbox.com/learn/what-is-a-daw-in-depth-guide-to-digital-audio-workstations)
- [Anatomy of a DAW Project File](https://www.linkedin.com/pulse/anatomy-digital-audio-workstation-project-file-bob-brown)

**MapLibre & Marine Charts:**
- [Styling Oceans with Bathymetry in MapLibre](https://snailbones.medium.com/styling-oceans-with-bathymetry-in-maplibre-a326e912e02f)
- [Seamap - Open Data Nautical Charts](https://github.com/prozessor13/seamap)
- [MarineCharts API](https://marinecharts.io/)
- [MapLibre GL JS](https://maplibre.org/projects/gl-js/)

**WebGL & Heatmap Rendering:**
- [Harnessing WebGPU for High-Performance Data Visualization](https://thebackenddevelopers.substack.com/p/harnessing-webgpu-for-high-performance)
- [WebGPU Data Visualization Community](https://www.webgpu.com/tag/data-visualization/)
- [Visual-Heatmap JS](https://medium.com/@narayanaswamy14/visual-heatmap-js-c6dda125b716)

**React Dashboard Architecture:**
- [React Design Patterns Complete Guide 2026](https://www.turbodocx.com/blog/react-design-patterns)
- [21 Fantastic React Design Patterns](https://www.perssondennis.com/articles/21-fantastic-react-design-patterns-and-when-to-use-them)
- [React Design Patterns from Refine.dev](https://refine.dev/blog/react-design-patterns/)

**Real-Time Synchronization:**
- [Synchronizing Multiple Charts in React (IBM)](https://developer.ibm.com/articles/awb-synchronizing-multiple-charts-react/)
- [Real-Time React: Syncing State Across Tabs](https://medium.com/@wul55267/real-time-react-syncing-state-across-browser-tabs-d0aa611d77c1)
- [Handling Real-Time Data in React](https://namastedev.com/blog/handling-real-time-data-in-react)

**D3.js Timeline:**
- [D3 Zoom Documentation](https://d3js.org/d3-zoom)
- [D3 Timescale Visualization](https://guypursey.com/blog/201605302300-d3-timescale-visualisation)
- [Patternfly Timeline](https://github.com/patternfly/patternfly-timeline)
- [Brushable and Zoomable Timeline (Stack Overflow)](https://stackoverflow.com/questions/41551957/brushable-and-zoomable-timeline-with-d3)

---

**End of Design Document**

**Document Status:** Complete
**Next Steps:** Begin Phase 1 implementation
**Contact:** SuperInstance Architecture Team
