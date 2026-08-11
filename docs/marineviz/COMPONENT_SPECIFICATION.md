# MarineViz Component Specification

**Version:** 1.0.0
**Date:** 2026-07-24

This document provides detailed specifications for all React components in the MarineViz system.

---

## Table of Contents

1. [Component Hierarchy](#component-hierarchy)
2. [Core Components](#core-components)
3. [Panel Components](#panel-components)
4. [Timeline Components](#timeline-components)
5. [Shared Components](#shared-components)
6. [Hook Specifications](#hook-specifications)
7. [Context Providers](#context-providers)

---

## Component Hierarchy

```
MarineVizApp
├── ConfigProvider
│   └── (Provides configuration context)
├── DataProvider
│   └── (Provides data manager context)
├── SelectionProvider
│   └── (Provides selection bus context)
│
├── AppLayout
│   ├── Header
│   │   ├── TitleBar
│   │   ├── Toolbar
│   │   └── StatusIndicator
│   │
│   ├── MainContent
│   │   ├── PanelLayout
│   │   │   ├── PanelContainer
│   │   │   │   ├── SideViewPanel
│   │   │   │   ├── TopViewPanel
│   │   │   │   └── FrontViewPanel
│   │   │   │
│   │   │   └── PanelControls
│   │   │       ├── SyncToggle
│   │   │       ├── LayoutSelector
│   │   │       └── ZoomControls
│   │   │
│   │   └── TimelinePanel
│   │       ├── TimelineRuler
│   │       ├── PlaybackControls
│   │       ├── ZoomControls
│   │       └── TrackList
│   │           └── TrackComponent (repeated)
│   │
│   └── Sidebar
│       ├── LayerControls
│       ├── SelectionInfo
│       ├── DataInfo
│       └── Settings
│
└── OverlayContainer
    ├── HelpOverlay
    ├── LoadingOverlay
    └── ErrorBoundary
```

---

## Core Components

### MarineVizApp

**File:** `src/components/MarineVizApp.tsx`

**Description:** Root application component that orchestrates all providers and layout.

**Props:**

```typescript
interface MarineVizAppProps {
  dataSources: DataSourceConfig[];
  initialConfig?: Partial<MarineVizConfig>;
  onConfigChange?: (config: MarineVizConfig) => void;
  onError?: (error: Error) => void;
}
```

**State:**

```typescript
interface MarineVizAppState {
  config: MarineVizConfig;
  loading: boolean;
  error: Error | null;
}
```

**Example Usage:**

```tsx
<MarineVizApp
  dataSources={[
    {
      id: 'acoustic-source',
      type: 'file',
      format: 'raw',
      location: '/data/acoustic/',
    },
    {
      id: 'gps-source',
      type: 'api',
      format: 'json',
      location: 'https://api.example.com/gps',
    },
  ]}
  initialConfig={{
    theme: { mode: 'dark' },
    panels: {
      sideView: { /* ... */ },
    },
  }}
  onConfigChange={(config) => console.log('Config updated:', config)}
/>
```

---

### AppLayout

**File:** `src/components/layout/AppLayout.tsx`

**Description:** Main layout container for the application.

**Props:**

```typescript
interface AppLayoutProps {
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  main: React.ReactNode;
  overlay?: React.ReactNode;
  sidebarWidth?: number;
  headerHeight?: number;
  className?: string;
}
```

**Features:**

- Responsive grid layout
- Collapsible sidebar
- Fixed header
- Overlay support
- Keyboard navigation

**Example:**

```tsx
<AppLayout
  header={<Header />}
  sidebar={<Sidebar />}
  main={<PanelLayout />}
  overlay={<HelpOverlay visible={showHelp} />}
  sidebarWidth={300}
  headerHeight={60}
/>
```

---

## Panel Components

### PanelLayout

**File:** `src/components/panels/PanelLayout.tsx`

**Description:** Grid layout container for the three CAD-style panels.

**Props:**

```typescript
interface PanelLayoutProps {
  config: {
    sideView: EchogramPanel;
    topView: ChartPanel;
    frontView: CrossSectionPanel;
  };
  dataManager: DataManager;
  selectionBus: SelectionBus;
  syncMode: 'linked' | 'independent' | 'semilinked';
  onConfigChange: (config: PanelLayoutProps['config']) => void;
}
```

**Layout:**

```tsx
<div className="panel-layout">
  <div className="panel-grid">
    <SideViewPanel {...sideViewProps} />
    <TopViewPanel {...topViewProps} />
    <FrontViewPanel {...frontViewProps} />
  </div>
  <PanelControls {...controlsProps} />
</div>
```

**Grid CSS:**

```css
.panel-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr;
  gap: 4px;
  height: 60vh;
}

@media (max-width: 1024px) {
  .panel-grid {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(3, 1fr);
  }
}
```

---

### SideViewPanel (Echogram)

**File:** `src/components/panels/SideViewPanel.tsx`

**Description:** WebGL-based echogram rendering panel for water column data.

**Props:**

```typescript
interface SideViewPanelProps {
  config: EchogramPanel;
  dataManager: DataManager;
  selectionBus: SelectionBus;
  onConfigChange: (config: EchogramPanel) => void;
  onHover?: (data: HoverData) => void;
}
```

**Features:**

- WebGL-accelerated rendering
- Real-time color scale adjustment
- Threshold selection
- Depth/time measurement tools
- Bottom tracking
- School detection overlay

**Component Structure:**

```tsx
<div className="side-view-panel">
  <EchogramCanvas
    ref={canvasRef}
    config={config}
    data={echogramData}
    selections={selections}
    onMouseMove={handleMouseMove}
    onClick={handleClick}
    onWheel={handleWheel}
  />
  <ColorScaleLegend
    colorScale={config.colorScale}
    onChange={handleColorScaleChange}
  />
  <DepthAxis
    range={config.yAxis.range}
    position="left"
  />
  <TimeAxis
    range={config.xAxis.range}
    position="bottom"
  />
  <OverlayControls
    tools={config.interaction.measurementTool}
    onToolChange={handleToolChange}
  />
  {hoverData && <HoverTooltip data={hoverData} />}
</div>
```

**WebGL Canvas Component:**

```tsx
const EchogramCanvas: React.FC<EchogramCanvasProps> = ({
  config,
  data,
  selections,
  onMouseMove,
  onClick,
  onWheel,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { renderer, initRenderer, renderFrame } = useWebGLRenderer();

  useEffect(() => {
    if (canvasRef.current) {
      initRenderer(canvasRef.current, config);
    }
  }, [initRenderer, config]);

  useEffect(() => {
    renderer?.updateData(data);
    renderFrame();
  }, [renderer, data, renderFrame]);

  useEffect(() => {
    renderer?.highlightSelections(selections);
    renderFrame();
  }, [renderer, selections, renderFrame]);

  return (
    <canvas
      ref={canvasRef}
      onMouseMove={onMouseMove}
      onClick={onClick}
      onWheel={onWheel}
    />
  );
};
```

---

### TopViewPanel (Chart)

**File:** `src/components/panels/TopViewPanel.tsx`

**Description:** MapLibre-based chart panel for spatial data visualization.

**Props:**

```typescript
interface TopViewPanelProps {
  config: ChartPanel;
  dataManager: DataManager;
  selectionBus: SelectionBus;
  onConfigChange: (config: ChartPanel) => void;
}
```

**Features:**

- MapLibre GL JS integration
- Bathymetry base layer
- Vessel track visualization
- Backscatter heatmap layer
- Catch location markers
- School detection display
- Environmental data layers
- Box and lasso selection

**Component Structure:**

```tsx
<div className="top-view-panel">
  <MapLibreMap
    ref={mapRef}
    config={config.map}
    onLoad={handleMapLoad}
    onMove={handleMapMove}
    onClick={handleMapClick}
    onBoxSelect={handleBoxSelect}
  >
    <BathymetryLayer
      source={config.baseLayers.source}
      opacity={config.baseLayers.opacity}
    />
    <VesselTrackLayer
      data={vesselTrackData}
      color={config.layers.vesselTrack.color}
      width={config.layers.vesselTrack.width}
    />
    <BackscatterHeatmapLayer
      data={backscatterData}
      config={config.layers.backscatterHeatmap}
    />
    <CatchLocationsLayer
      data={catchData}
      config={config.layers.catchLocations}
    />
    <SchoolDetectionsLayer
      data={schoolDetections}
      config={config.layers.schoolDetections}
    />
    <EnvironmentalLayers
      data={environmentalData}
      config={config.layers.environmental}
    />
  </MapLibreMap>
  <MapControls
    onZoomIn={() => mapRef.current?.zoomIn()}
    onZoomOut={() => mapRef.current?.zoomOut()}
    onReset={() => mapRef.current?.resetView()}
  />
  <LayerSelector
    layers={config.layers}
    onVisibilityChange={handleLayerVisibility}
  />
</div>
```

---

### FrontViewPanel (Cross-Section)

**File:** `src/components/panels/FrontViewPanel.tsx`

**Description:** WebGL-based cross-section panel showing water column slice at vessel heading.

**Props:**

```typescript
interface FrontViewPanelProps {
  config: CrossSectionPanel;
  dataManager: DataManager;
  selectionBus: SelectionBus;
  onConfigChange: (config: CrossSectionPanel) => void;
}
```

**Features:**

- Spatial interpolation (kriging/IDW)
- Depth/distance axes
- Orientation indicator
- Bottom profile
- Surface line
- Selection tools

**Component Structure:**

```tsx
<div className="front-view-panel">
  <CrossSectionCanvas
    ref={canvasRef}
    config={config}
    data={interpolatedData}
    selections={selections}
  />
  <DepthAxis
    range={config.yAxis.range}
    position="left"
    inverted={config.yAxis.inverted}
  />
  <DistanceAxis
    range={config.xAxis.range}
    position="bottom"
  />
  <OrientationIndicator
    heading={config.orientation.heading}
    viewAngle={config.orientation.viewAngle}
  />
  <InterpolationControls
    method={config.dataSource.interpolationMethod}
    onMethodChange={handleMethodChange}
  />
</div>
```

---

## Timeline Components

### TimelinePanel

**File:** `src/components/timeline/TimelinePanel.tsx`

**Description:** DAW-style timeline interface with multiple tracks and playback controls.

**Props:**

```typescript
interface TimelinePanelProps {
  config: TimelineInterface;
  dataManager: DataManager;
  selectionBus: SelectionBus;
  onConfigChange: (config: TimelineInterface) => void;
  height?: number;
}
```

**Component Structure:**

```tsx
<div className="timeline-panel">
  <TimelineRuler
    config={config.ruler}
    timeRange={config.timeAxis.visible}
    zoom={config.timeAxis.zoomLevels.current}
  />
  <PlaybackControls
    playing={config.playback.enabled}
    position={config.playback.position}
    speed={config.playback.speed}
    onPlayChange={handlePlayChange}
    onPositionChange={handlePositionChange}
    onSpeedChange={handleSpeedChange}
  />
  <ZoomControls
    zoom={config.timeAxis.zoomLevels.current}
    min={config.timeAxis.zoomLevels.min}
    max={config.timeAxis.zoomLevels.max}
    onZoomChange={handleZoomChange}
  />
  <TrackList
    tracks={config.tracks.tracks}
    layout={config.tracks.layout}
    onTrackChange={handleTrackChange}
  >
    {config.tracks.tracks.map(track => (
      <TrackComponent
        key={track.id}
        track={track}
        timeRange={config.timeAxis.visible}
        onClipSelect={handleClipSelect}
        onClipMove={handleClipMove}
        onClipResize={handleClipResize}
      />
    ))}
  </TrackList>
  <Scrubber
    position={config.scrubber.position}
    snap={config.scrubber.snap}
    onPositionChange={handleScrubberMove}
  />
</div>
```

---

### TrackComponent

**File:** `src/components/timeline/TrackComponent.tsx`

**Description:** Individual track rendering component.

**Props:**

```typescript
interface TrackComponentProps {
  track: Track;
  timeRange: TimeRange;
  pixelsPerSecond: number;
  onClipSelect: (clipId: string) => void;
  onClipMove: (clipId: string, newStart: timestamp) => void;
  onClipResize: (clipId: string, newStart: timestamp, newEnd: timestamp) => void;
}
```

**Component Structure:**

```tsx
<div className={`track track-${track.type}`} style={{
  height: `${track.height}px`,
  backgroundColor: track.color,
  opacity: track.visible ? track.opacity : 0.3,
}}>
  <TrackHeader>
    <TrackIcon type={track.type} />
    <TrackName>{track.name}</TrackName>
    <TrackControls>
      <MuteButton muted={track.muted} onToggle={() => onMute(track.id)} />
      <SoloButton solo={track.solo} onToggle={() => onSolo(track.id)} />
      <LockButton locked={track.locked} onToggle={() => onLock(track.id)} />
    </TrackControls>
  </TrackHeader>
  <TrackContent
    timeRange={timeRange}
    pixelsPerSecond={pixelsPerSecond}
    onClipSelect={onClipSelect}
    onClipMove={onClipMove}
    onClipResize={onClipResize}
  >
    {track.clips.map(clip => (
      <ClipComponent
        key={clip.id}
        clip={clip}
        trackType={track.type}
        pixelsPerSecond={pixelsPerSecond}
        timeRange={timeRange}
      />
    ))}
  </TrackContent>
</div>
```

---

### ClipComponent

**File:** `src/components/timeline/ClipComponent.tsx`

**Description:** Individual clip rendering within a track.

**Props:**

```typescript
interface ClipComponentProps {
  clip: Clip;
  trackType: TrackType;
  pixelsPerSecond: number;
  timeRange: TimeRange;
  onDragStart: (clipId: string) => void;
  onResizeStart: (clipId: string, edge: 'start' | 'end') => void;
  onClick: (clipId: string) => void;
}
```

**Component Structure:**

```tsx
<div
  className={`clip clip-${trackType}`}
  style={{
    left: `${(clip.startTime - timeRange.start) * pixelsPerSecond}px`,
    width: `${(clip.endTime - clip.startTime) * pixelsPerSecond}px`,
    backgroundColor: clip.color,
  }}
  draggable={!clip.locked}
  onDragStart={() => onDragStart(clip.id)}
  onClick={() => onClick(clip.id)}
>
  <ClipResizeHandle
    edge="start"
    onResizeStart={() => onResizeStart(clip.id, 'start')}
  />
  <ClipContent>
    <ClipLabel>{clip.label}</ClipLabel>
    <ClipThumbnail type={clip.visualization.thumbnail} />
  </ClipContent>
  <ClipResizeHandle
    edge="end"
    onResizeStart={() => onResizeStart(clip.id, 'end')}
  />
</div>
```

---

### TimelineRuler

**File:** `src/components/timeline/TimelineRuler.tsx`

**Description:** Time axis ruler with tick marks and labels.

**Props:**

```typescript
interface TimelineRulerProps {
  timeRange: TimeRange;
  zoom: number;
  format: 'time' | 'relative' | 'timestamp';
  majorTicks: number;
  minorTicks: number;
  showDates: boolean;
}
```

**Implementation (D3.js):**

```tsx
const TimelineRuler: React.FC<TimelineRulerProps> = ({
  timeRange,
  format,
  majorTicks,
  minorTicks,
  showDates,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;

    // Time scale
    const xScale = d3.scaleTime()
      .domain([new Date(timeRange.start), new Date(timeRange.end)])
      .range([0, width]);

    // Clear previous
    svg.selectAll('*').remove();

    // Draw major ticks
    const majorAxis = d3.axisTop(xScale)
      .ticks(d3.timeSecond.every(majorTicks));

    if (showDates) {
      majorAxis.tickFormat(d3.timeFormat('%Y-%m-%d %H:%M:%S'));
    } else {
      majorAxis.tickFormat(d3.timeFormat('%H:%M:%S'));
    }

    svg.append('g')
      .attr('class', 'major-ticks')
      .call(majorAxis);

    // Draw minor ticks
    const minorAxis = d3.axisTop(xScale)
      .ticks(d3.timeSecond.every(minorTicks))
      .tickSize(-10)
      .tickFormat('');

    svg.append('g')
      .attr('class', 'minor-ticks')
      .attr('transform', 'translate(0, 20)')
      .call(minorAxis);

  }, [timeRange, format, majorTicks, minorTicks, showDates]);

  return (
    <svg
      ref={svgRef}
      className="timeline-ruler"
      style={{ width: '100%', height: '60px' }}
    />
  );
};
```

---

### PlaybackControls

**File:** `src/components/timeline/PlaybackControls.tsx`

**Description:** Playback control buttons (play/pause, stop, step, speed).

**Props:**

```typescript
interface PlaybackControlsProps {
  playing: boolean;
  position: timestamp;
  speed: number;
  loop: boolean;
  onPlayToggle: () => void;
  onStop: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onSpeedChange: (speed: number) => void;
  onLoopToggle: () => void;
}
```

**Component Structure:**

```tsx
<div className="playback-controls">
  <ButtonGroup>
    <Button onClick={onStepBackward} title="Step Backward">
      <StepBackwardIcon />
    </Button>
    <Button onClick={onStop} title="Stop">
      <StopIcon />
    </Button>
    <Button
      onClick={onPlayToggle}
      title={playing ? 'Pause' : 'Play'}
      primary={true}
    >
      {playing ? <PauseIcon /> : <PlayIcon />}
    </Button>
    <Button onClick={onStepForward} title="Step Forward">
      <StepForwardIcon />
    </Button>
  </ButtonGroup>

  <SpeedControl
    speed={speed}
    speeds={[0.25, 0.5, 1, 2, 4, 8]}
    onChange={onSpeedChange}
  />

  <LoopToggle
    active={loop}
    onToggle={onLoopToggle}
  />
</div>
```

---

## Shared Components

### Button

**File:** `src/components/shared/Button.tsx`

**Description:** Reusable button component with variants and sizes.

**Props:**

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  onClick?: () => void;
  title?: string;
}
```

**Example:**

```tsx
<Button variant="primary" size="medium" onClick={handleSubmit}>
  <PlusIcon />
  Submit
</Button>
```

---

### ColorScaleLegend

**File:** `src/components/shared/ColorScaleLegend.tsx`

**Description:** Interactive color scale legend for echogram panels.

**Props:**

```typescript
interface ColorScaleLegendProps {
  colorScale: {
    type: 'sv' | 'ts' | 'power';
    range: [number, number];
    colormap: ColorMap;
  };
  orientation?: 'horizontal' | 'vertical';
  showLabels?: boolean;
  onRangeChange?: (range: [number, number]) => void;
  onColormapChange?: (colormap: ColorMap) => void;
}
```

**Component Structure:**

```tsx
<div className={`color-scale-legend ${orientation}`}>
  <ColorGradient
    colormap={colorScale.colormap}
    range={colorScale.range}
  />
  {showLabels && (
    <ColorLabels>
      <ColorLabel value={colorScale.range[0]} />
      <ColorLabel value={colorScale.range[1]} />
    </ColorLabels>
  )}
  <RangeSlider
    min={-70}
    max={0}
    value={colorScale.range}
    onChange={onRangeChange}
  />
  <ColormapSelector
    value={colorScale.colormap}
    onChange={onColormapChange}
  />
</div>
```

---

### Axis

**File:** `src/components/shared/Axis.tsx`

**Description:** Generic axis component for depth, time, and distance axes.

**Props:**

```typescript
interface AxisProps {
  type: 'time' | 'depth' | 'distance';
  range: [number, number];
  position: 'top' | 'bottom' | 'left' | 'right';
  inverted?: boolean;
  showTicks?: boolean;
  showLabels?: boolean;
  labelFormat?: (value: number) => string;
}
```

**Implementation (D3.js):**

```tsx
const Axis: React.FC<AxisProps> = ({
  type,
  range,
  position,
  inverted,
  showTicks = true,
  showLabels = true,
  labelFormat,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const { width, height } = svgRef.current.getBoundingClientRect();

    // Create scale
    let scale: d3.ScaleLinear<number, number> | d3.ScaleTime<number, number>;

    if (type === 'time') {
      scale = d3.scaleTime()
        .domain([new Date(range[0]), new Date(range[1])])
        .range([0, width]);
    } else {
      scale = d3.scaleLinear()
        .domain(inverted ? [range[1], range[0]] : range)
        .range(position === 'left' || position === 'right' ? [height, 0] : [0, width]);
    }

    // Create axis generator
    const axisGenerator =
      position === 'top' ? d3.axisTop(scale as any) :
      position === 'bottom' ? d3.axisBottom(scale as any) :
      position === 'left' ? d3.axisLeft(scale as any) :
      d3.axisRight(scale as any);

    if (!showTicks) {
      axisGenerator.tickSize(0);
    }

    if (labelFormat) {
      axisGenerator.tickFormat(labelFormat);
    }

    // Render axis
    svg.select('.axis').remove();
    svg.append('g')
      .attr('class', 'axis')
      .call(axisGenerator as any);

  }, [type, range, position, inverted, showTicks, showLabels, labelFormat]);

  return <svg ref={svgRef} className={`axis axis-${position}`} />;
};
```

---

### HoverTooltip

**File:** `src/components/shared/HoverTooltip.tsx`

**Description:** Floating tooltip component for hover information.

**Props:**

```typescript
interface HoverTooltipProps {
  visible: boolean;
  x: number;
  y: number;
  data: {
    time?: timestamp;
    depth?: number;
    position?: GeoPoint;
    value?: number;
    label?: string;
  };
  format?: (data: HoverTooltipProps['data']) => React.ReactNode;
}
```

**Example:**

```tsx
<HoverTooltip
  visible={!!hoverData}
  x={hoverData?.x}
  y={hoverData?.y}
  data={hoverData}
  format={(data) => (
    <>
      <div>Time: {new Date(data.time).toLocaleTimeString()}</div>
      <div>Depth: {data.depth.toFixed(1)}m</div>
      <div>Sv: {data.value.toFixed(1)} dB</div>
    </>
  )}
/>
```

---

## Hook Specifications

### useWebGLRenderer

**File:** `src/hooks/useWebGLRenderer.ts`

**Description:** Custom hook for WebGL context and rendering management.

**Signature:**

```typescript
function useWebGLRenderer(): {
  renderer: WebGLRenderer | null;
  initRenderer: (canvas: HTMLCanvasElement, config: WebGLRendererConfig) => void;
  renderFrame: () => void;
  cleanup: () => void;
}
```

**Example:**

```tsx
const { renderer, initRenderer, renderFrame } = useWebGLRenderer();

useEffect(() => {
  if (canvasRef.current) {
    initRenderer(canvasRef.current, {
      context: 'webgl2',
      antialias: true,
      powerPreference: 'high-performance',
    });
  }

  return () => cleanup();
}, [initRenderer, cleanup]);
```

---

### useSelection

**File:** `src/hooks/useSelection.ts`

**Description:** Hook for interacting with the selection bus.

**Signature:**

```typescript
function useSelection(): {
  selections: Selection[];
  addSelection: (selection: Selection) => void;
  removeSelection: (selectionId: string) => void;
  clearSelections: () => void;
  updateSelection: (selectionId: string, updates: Partial<Selection>) => void;
}
```

**Example:**

```tsx
const { selections, addSelection, clearSelections } = useSelection();

const handleClick = (point: DataPoint) => {
  addSelection({
    id: `selection-${Date.now()}`,
    source: 'side-view',
    temporal: {
      type: 'instant',
      startTime: point.timestamp,
    },
    acoustic: {
      type: 'point',
      depth: point.depth,
    },
    metadata: {
      color: '#00ff00',
      label: 'Point selection',
      created: Date.now(),
    },
  });
};
```

---

### useDataManager

**File:** `src/hooks/useDataManager.ts`

**Description:** Hook for accessing the data manager.

**Signature:**

```typescript
function useDataManager(): {
  getEchogramData: (query: EchogramQuery) => EchogramData;
  getGPSData: (query: GPSQuery) => GPSData[];
  getCatchData: (query: TimeRange) => CatchData[];
  spatialQuery: (bounds: GeoBoundingBox) => DataPoint[];
  temporalQuery: (range: TimeRange) => DataPoint[];
  query: (query: MultiDimensionalQuery) => DataPoint[];
  loading: boolean;
  error: Error | null;
}
```

---

### usePlayback

**File:** `src/hooks/usePlayback.ts`

**Description:** Hook for managing timeline playback state.

**Signature:**

```typescript
function usePlayback(): {
  playing: boolean;
  position: timestamp;
  speed: number;
  play: () => void;
  pause: () => void;
  stop: () => void;
  seek: (position: timestamp) => void;
  setSpeed: (speed: number) => void;
  stepForward: () => void;
  stepBackward: () => void;
}
```

**Example:**

```tsx
const { playing, position, play, pause, seek } = usePlayback();

<PlaybackControls
  playing={playing}
  position={position}
  onPlayToggle={playing ? pause : play}
  onPositionChange={seek}
/>
```

---

### useKeyboardShortcuts

**File:** `src/hooks/useKeyboardShortcuts.ts`

**Description:** Hook for registering keyboard shortcuts.

**Signature:**

```typescript
function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  options?: {
    disabled?: boolean;
    preventDefault?: boolean;
  }
): void;
```

**Example:**

```tsx
useKeyboardShortcuts([
  {
    key: ' ',
    action: 'toggle-playback',
    modifiers: {},
    handler: () => playing ? pause() : play(),
  },
  {
    key: 'ArrowLeft',
    action: 'step-backward',
    modifiers: {},
    handler: () => stepBackward(),
  },
  {
    key: 'Escape',
    action: 'clear-selection',
    modifiers: {},
    handler: () => clearSelections(),
  },
]);
```

---

## Context Providers

### ConfigProvider

**File:** `src/contexts/ConfigContext.tsx`

**Description:** Provides global configuration state.

**Context Value:**

```typescript
interface ConfigContextValue {
  config: MarineVizConfig;
  updateConfig: (updates: Partial<MarineVizConfig>) => void;
  resetConfig: () => void;
}
```

**Example:**

```tsx
const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<MarineVizConfig>(defaultConfig);

  const updateConfig = (updates: Partial<MarineVizConfig>) => {
    setConfig(prev => deepMerge(prev, updates));
  };

  const resetConfig = () => {
    setConfig(defaultConfig);
  };

  return (
    <ConfigContext.Provider value={{ config, updateConfig, resetConfig }}>
      {children}
    </ConfigContext.Provider>
  );
};
```

---

### DataProvider

**File:** `src/contexts/DataContext.tsx`

**Description:** Provides data manager instance.

**Context Value:**

```typescript
interface DataContextValue {
  dataManager: DataManager;
  loading: boolean;
  error: Error | null;
  loadData: (bounds: DataBounds) => Promise<void>;
}
```

---

### SelectionProvider

**File:** `src/contexts/SelectionContext.tsx`

**Description:** Provides selection bus and selection state.

**Context Value:**

```typescript
interface SelectionContextValue {
  selectionBus: SelectionBus;
  selections: Selection[];
  addSelection: (selection: Selection) => void;
  removeSelection: (id: string) => void;
  clearSelections: () => void;
}
```

---

## Utility Components

### ErrorBoundary

**File:** `src/components/shared/ErrorBoundary.tsx`

**Description:** Error boundary for catching and displaying errors.

**Props:**

```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error }>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}
```

**Example:**

```tsx
<ErrorBoundary
  fallback={({ error }) => (
    <ErrorFallback
      error={error}
      onReset={() => window.location.reload()}
    />
  )}
  onError={(error, errorInfo) => {
    console.error('Error caught:', error, errorInfo);
  }}
>
  <MarineVizApp />
</ErrorBoundary>
```

---

### LoadingOverlay

**File:** `src/components/shared/LoadingOverlay.tsx`

**Description:** Loading overlay with progress indicator.

**Props:**

```typescript
interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  progress?: number;
}
```

---

### HelpOverlay

**File:** `src/components/shared/HelpOverlay.tsx`

**Description:** Help overlay with keyboard shortcuts and documentation.

**Props:**

```typescript
interface HelpOverlayProps {
  visible: boolean;
  onClose: () => void;
  shortcuts?: KeyboardShortcut[];
}
```

---

**End of Component Specification**
