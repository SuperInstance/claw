# MarineViz Implementation Guide

**Version:** 1.0.0
**Date:** 2026-07-24

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Wireframe Descriptions](#wireframe-descriptions)
3. [Interaction Flows](#interaction-flows)
4. [Rendering Pipeline](#rendering-pipeline)
5. [Data Loading Strategy](#data-loading-strategy)
6. [Performance Checklist](#performance-checklist)
7. [Testing Strategy](#testing-strategy)

---

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Git
- Modern web browser with WebGL 2.0 support

### Installation

```bash
# Clone the repository
git clone https://github.com/SuperInstance/marineviz.git
cd marineviz

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

### Project Structure

```
marineviz/
├── src/
│   ├── components/          # React components
│   │   ├── panels/         # Panel components (Side, Top, Front)
│   │   ├── timeline/       # Timeline components
│   │   ├── shared/         # Shared UI components
│   │   └── layout/         # Layout components
│   ├── hooks/              # Custom React hooks
│   ├── contexts/           # React contexts
│   ├── utils/              # Utility functions
│   ├── types/              # TypeScript types
│   ├── webgl/              # WebGL shaders and utilities
│   ├── data/               # Data management
│   └── App.tsx             # Root component
├── public/                  # Static assets
├── docs/                    # Documentation
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## Wireframe Descriptions

### 1. Main Application Layout

**Dimensions:** 1920x1080 (full screen)

**Layout:**

```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER (60px)                                                   │
│  ┌─────────────────────────────────────────────────────────────┐
│  │ 🌊 MarineViz    [File] [View] [Tools] [Help]    □ - □ ×     │
│  └─────────────────────────────────────────────────────────────┘
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┬─────────────────────────────────────────────┐ │
│  │              │                                             │ │
│  │  SIDEBAR     │             MAIN CONTENT                     │ │
│  │  (300px)     │                                             │ │
│  │              │  ┌─────────────────────────────────────────┐ │ │
│  │  ┌────────┐  │  │                                         │ │ │
│  │  │ Layers │  │  │          PANEL LAYOUT                   │ │ │
│  │  │        │  │  │                                         │ │ │
│  │  ├────────┤  │  │  ┌─────────┬─────────┬─────────┐         │ │ │
│  │  │        │  │  │  │ Side    │  Top    │ Front   │         │ │ │
│  │  │ Select.│  │  │  │ View    │  View   │  View   │         │ │ │
│  │  │        │  │  │  │         │         │         │         │ │ │
│  │  ├────────┤  │  │  │  (60vh height, 3 columns)           │ │ │
│  │  │        │  │  │  └─────────┴─────────┴─────────┘         │ │ │
│  │  │ Data   │  │  │                                         │ │ │
│  │  │        │  │  │  ┌─────────────────────────────────────┐ │ │ │
│  │  ├────────┤  │  │  │                                     │ │ │
│  │  │        │  │  │  │          TIMELINE                   │ │ │ │
│  │  │ Settings│  │  │  │                                     │ │ │
│  │  │        │  │  │  │  [Controls] [Ruler]                 │ │ │
│  │  └────────┘  │  │  │  [Track 1]                           │ │ │
│  │              │  │  │  [Track 2]                           │ │ │ │
│  │              │  │  │  [Track 3]                           │ │ │
│  │              │  │  └─────────────────────────────────────┘ │ │ │
│  │              │  │                                         │ │ │
│  │              │  └─────────────────────────────────────────┘ │ │
│  │              │                                             │ │
│  └──────────────┴─────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

Status Bar: Ready | Selection: 3 points | Playback: Stopped | Memory: 256MB
```

---

### 2. Side View Panel (Echogram) Detail

**Dimensions:** 520x600 (1/3 of screen width, 60vh height)

**Controls:**

```
┌─────────────────────────────────────────────────────────────────┐
│  SIDE VIEW                              [⊕] [⊖] [⚙] [🔍]         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                                                           │ │
│  │  0m ┌─────────────────────────────────────────────────┐  │ │
│  │     │ ░░░▓▓███░░░░▓▓▓░░░░░██░░░░░░░░▓▓▓███░░░░          │  │ │
│  │     │ ░░░▓▓████░░░▓▓▓░░░░░██░░░░░░░░▓▓▓████░░░         │  │ │
│  │ 50m │ ░░░▓▓███░░░░▓▓▓░░░░░██░░░░░░░░▓▓▓███░░░░         │  │ │
│  │     │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░          │  │ │
│  │     │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░          │  │ │
│  │100m │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░          │  │ │
│  │     │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░          │  │ │
│  │     │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░          │  │ │
│  │150m │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░          │  │ │
│  │     └───────────────────────────────────────────────────┘  │ │
│  │       ────────────────────────────────────────────> time    │ │
│  │     00:00                12:00                24:00          │ │
│  │                                                           │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  -70dB  ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬  0dB        │ │
│  │        ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒                 │ │
│  │        [Blue] [Cyan] [Green] [Yellow] [Red] [Viridis]    │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

Toolbar:
  ⊕ = Zoom in
  ⊖ = Zoom out
  ⚙ = Settings
  🔍 = Fit to view

Color scale:
  Interactive slider with gradient
  Dropdown for colormap selection
```

---

### 3. Top View Panel (Chart) Detail

**Dimensions:** 520x600 (1/3 of screen width, 60vh height)

**Controls:**

```
┌─────────────────────────────────────────────────────────────────┐
│  TOP VIEW                         [+ -] [⚙] [📍] [🗺️]            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                                                           │ │
│  │                      ╱──────────╲                          │ │
│  │                    ╱    ░░░░░░   ╲                         │ │
│  │                   ╱  ░░░▓▓▓▓░░░░   ╲                        │ │
│  │                  │   ░░░▓▓███▓▓░░░   │                       │ │
│  │                  │  ░░░░░░░░░░░░░░░  │                       │ │
│  │                  │  ░░░██░░░██░░░░░  │                       │ │
│  │                  ╲  ░░░░░░░░░░░░░░  ╱                        │ │
│  │                   ╲   ░░░░░░░░░░   ╱                         │ │
│  │                    ╲────────────╱                           │ │
│  │                      ▲     ▲                               │ │
│  │                      │     │                               │ │
│  │                  Start    End                              │ │
│  │                                                           │ │
│  │   ─────────────────────────────────────────               │ │
│  │   ○ Catch location                                        │ │
│  │   △ School detection                                      │ │
│  │   ──── Vessel track                                       │ │
│  │                                                           │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Layers: ☑ Bathymetry  ☑ Vessel Track  ☑ Heatmap         │ │
│  │          ☐ SST         ☐ Chlorophyll   ☐ Currents        │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

Map controls:
  + - = Zoom
  ⚙ = Settings
  📍 = Show location
  🗺️ = Layer selector

Layer checkboxes:
  Toggle visibility of each layer
```

---

### 4. Timeline Panel Detail

**Dimensions:** Full width, 300px height

**Controls:**

```
┌─────────────────────────────────────────────────────────────────┐
│  TIMELINE                                  [⏮] [◀] [▶ ⏸] [⏭]    │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  00:00    01:00    02:00    03:00    04:00    05:00      │ │
│  │    ├────────┼────────┼────────┼────────┼────────┼────────┤ │ │
│  │                                                           │ │
│  │  ▼ Playback head (scrubber)                               │ │
│  │                                                           │ │
│  │  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │ M └─ Acoustic Track  │  ████████████████████████     │ │ │
│  │  ├─────────────────────────────────────────────────────┤ │ │
│  │  │ S └─ GPS Track        │  ████████████████████████████ │ │ │
│  │  ├─────────────────────────────────────────────────────┤ │ │
│  │  │   └─ Catch Track      │  ████      ██  █    ████     │ │ │
│  │  ├─────────────────────────────────────────────────────┤ │ │
│  │  │   └─ Gear Track       │  ████████████████████████     │ │ │
│  │  ├─────────────────────────────────────────────────────┤ │ │
│  │  │   └─ Crew Track       │  ██  ████  ██  ████  ██      │ │ │
│  │  ├─────────────────────────────────────────────────────┤ │ │
│  │  │   └─ Environmental   │  ████████████████████████████   │ │ │
│  │  └─────────────────────────────────────────────────────┘ │ │
│  │                                                           │ │
│  │  Legend:                                                  │ │
│  │  M/S = Mute/Solo button                                   │ │
│  │  █ = Clip/segment                                         │ │
│  │  ▼ = Playback head position                              │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Zoom: ────●──────────────────────────  1x = ●───────     │ │
│  │  Speed: 0.25x ──●── 0.5x ──●── 1x ──●── 2x ──●── 4x ──●──  │ │
│  │  Loop: ☑  Scrubber snap: [Clip boundaries ▼]              │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

Playback controls:
  ⏮ = Go to start
  ◀ = Step backward
  ▶ / ⏸ = Play / Pause
  ⏭ = Go to end

Zoom slider:
  Drag to zoom in/out

Speed control:
  Select playback speed

Loop checkbox:
  Toggle loop mode

Scrubber snap:
  Choose snap behavior
```

---

## Interaction Flows

### Flow 1: Spatial Selection → Temporal Highlighting

**User Action:** Draw a box selection in the Top View (Chart) panel

**Sequence:**

1. **User clicks and drags** in Top View panel
   - Mouse down at (lat1, lon1)
   - Mouse drag to (lat2, lon2)
   - Visual feedback: Semi-transparent box appears

2. **Mouse release** completes selection
   - SelectionBus broadcasts spatial selection:
     ```typescript
     {
       source: 'top-view',
       spatial: {
         type: 'bounding-box',
         coordinates: [[lat1, lon1], [lat2, lon2]],
         crs: 'EPSG:4326'
       },
       metadata: { color: '#00ff00', label: 'Box selection' }
     }
     ```

3. **Side View panel** receives selection
   - Queries DataManager for pings within spatial bounds
   - Highlights corresponding time range in echogram
   - Draws vertical highlight region:
     ```
     ┌────────────────────────────────────────────────────────┐
     │  0m ┌───────────────────────────────────────────────┐ │
     │     │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░       │ │
     │     │ ░░░▓▓▓▓░░░░░▓▓▓▓░░░░░██░░░░░░░░▓▓▓▓░░░░       │ │
     │ 50m │ ░░░▓▓███░░░░▓▓▓░░░░░██░░░░░░░░▓▓▓███░░░░      │ │
     │     │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░       │ │
     │     │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓      │ ← Highlighted time range
     │100m │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░       │ │
     │     └───────────────────────────────────────────────┘ │
     └────────────────────────────────────────────────────────┘
     ```

4. **Front View panel** receives selection
   - Updates cross-section to show data for selected area
   - Interpolates data if needed

5. **Timeline panel** receives selection
   - Calculates time range from spatial selection
   - Highlights corresponding clips:
     ```
     ┌────────────────────────────────────────────────────────┐
     │  00:00    01:00    02:00    03:00    04:00    05:00  │ │
     │    ├────────┼────────┼────────┼────────┼────────┤ │ │
     │                                                       │ │
     │  ┌───────────────────────────────────────────────┐ │ │
     │  │ Acoustic Track  │  ████████████████████████     │ │
     │  ├───────────────────────────────────────────────┤ │ │
     │  │ GPS Track        │  ████████████████████████████ │ │
     │  └───────────────────────────────────────────────┘ │ │
     │                    ━━━━━━                           │ ← Highlighted clips
     └─────────────────────────────────────────────────────┘
     ```

6. **Sidebar updates** with selection information
   - Shows selection bounds
   - Displays statistics (area, duration, data points)

---

### Flow 2: Temporal Selection → Spatial Highlighting

**User Action:** Select time range in Timeline panel

**Sequence:**

1. **User clicks and drags** in Timeline ruler
   - Mouse down at time1
   - Mouse drag to time2
   - Visual feedback: Semi-transparent highlight appears

2. **Mouse release** completes selection
   - SelectionBus broadcasts temporal selection:
     ```typescript
     {
       source: 'timeline',
       temporal: {
         type: 'range',
         startTime: time1,
         endTime: time2
       },
       metadata: { color: '#ff0000', label: 'Time range' }
     }
     ```

3. **Top View panel** receives selection
   - Queries DataManager for vessel track in time range
   - Highlights track segment:
     ```
     ┌────────────────────────────────────────────────────────┐
     │                                                           │
     │                  ╱──────────╲                             │
     │                ╱    ░░░░░░   ╲                            │
     │               ╱  ░░░▓▓▓▓░░░░   ╲                         │
     │              │   ░░░▓▓███▓▓░░░   │                        │
     │              │  ░░░░░░░░░░░░░░░  │                        │
     │              │  ░░░░░░░░░░░░░░░  │                        │
     │               ╲  ░░░░░░░░░░░░  ╱                         │
     │                ╲────────────╱    ←━━━ Highlighted track   │
     │                                                           │
     └─────────────────────────────────────────────────────────┘
     ```

4. **Side View panel** receives selection
   - Scrolls to selected time range
   - Highlights time region with vertical overlay

5. **Front View panel** receives selection
   - Updates cross-section for selected time range
   - Shows interpolated data

6. **Sidebar updates** with selection information
   - Shows time range
   - Displays statistics (duration, distance traveled)

---

### Flow 3: Compound Selection (AND Operation)

**User Action:**
1. Select high backscatter area in Side View
2. Hold Shift and click gear deployment time in Timeline

**Sequence:**

1. **First selection** (high backscatter)
   - SelectionBus stores selection A

2. **Second selection** (gear deployment)
   - SelectionBus stores selection B

3. **User clicks "AND"** in compound selection toolbar
   - SelectionBus creates compound selection:
     ```typescript
     {
       type: 'compound',
       operator: 'AND',
       operands: [selectionA, selectionB]
     }
     ```

4. **All panels** update to show intersection
   - Side View: High backscatter area during gear deployment
   - Top View: Spatial area during gear deployment
   - Front View: Cross-section during gear deployment
   - Timeline: Gear deployment clip with high backscatter highlight

5. **Result:** Captain can see where fish schools were detected while gear was active

---

## Rendering Pipeline

### WebGL Rendering Pipeline (Side View & Front View)

```
┌─────────────────────────────────────────────────────────────────┐
│                    WEBGL RENDERING PIPELINE                      │
└─────────────────────────────────────────────────────────────────┘

1. DATA INPUT
   └─ PingData[] (acoustic pings)
      ├─ timestamp
      ├─ latitude, longitude
      ├─ depth[] (depth samples)
      └─ sv[] (backscatter values)

2. DATA PROCESSING
   └─ DataProcessor
      ├─ Circular buffer management (max 10,000 pings)
      ├─ LOD calculation (high/medium/low)
      ├─ Data aggregation (if needed)
      └─ Texture upload preparation

3. TEXTURE GENERATION
   └─ TextureGenerator
      ├─ Create 2D texture (time × depth)
      ├─ Upload ping data to GPU
      └─ Generate mipmaps

4. VERTEX SHADER
   └─ echogram-vertex.glsl
      ├─ Input: Ping positions
      ├─ Transform: Screen coordinates
      └─ Output: Fragment shader input

5. FRAGMENT SHADER
   └─ echogram-fragment.glsl
      ├─ Input: Texture coordinates
      ├─ Lookup: Backscatter value from texture
      ├─ Transform: Color scale mapping
      └─ Output: Final pixel color

6. COLOR SCALE MAPPING
   └─ ColorScaleMapper
      ├─ Input: dB value (-70 to 0)
      ├─ Transform: Color palette lookup
      └─ Output: RGB color

7. SELECTION HIGHLIGHTING
   └─ SelectionRenderer
      ├─ Input: Selection[]
      ├─ Transform: Highlight regions
      └─ Output: Overlay rendering

8. OUTPUT
   └─ Rendered frame to canvas
```

**Vertex Shader Example:**

```glsl
// echogram-vertex.glsl
#version 300 es

in vec2 a_position;  // Ping position (time, depth)
out vec2 v_texCoord;

uniform vec2 u_resolution;
uniform vec2 u_timeRange;
uniform vec2 u_depthRange;

void main() {
  // Convert data coordinates to screen coordinates
  float x = (a_position.x - u_timeRange.x) /
            (u_timeRange.y - u_timeRange.x);
  float y = (a_position.y - u_depthRange.x) /
            (u_depthRange.y - u_depthRange.x);

  // Convert to clip space
  vec2 clipSpace = 2.0 * vec2(x, y) - 1.0;

  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
  v_texCoord = vec2(x, y);
}
```

**Fragment Shader Example:**

```glsl
// echogram-fragment.glsl
#version 300 es

precision highp float;

in vec2 v_texCoord;
out vec4 outColor;

uniform sampler2D u_dataTexture;  // Ping data texture
uniform sampler2D u_colorTexture; // Color scale texture
uniform vec2 u_svRange;           // [-70, 0]
uniform float u_contrast;         // 0.0 - 2.0
uniform float u_brightness;       // -1.0 - 1.0

void main() {
  // Sample backscatter value from data texture
  float sv = texture(u_dataTexture, v_texCoord).r;

  // Apply contrast and brightness
  sv = (sv - u_svRange.x) / (u_svRange.y - u_svRange.x);  // Normalize to 0-1
  sv = sv * u_contrast + u_brightness;
  sv = clamp(sv, 0.0, 1.0);

  // Sample color from color scale texture
  vec4 color = texture(u_colorTexture, vec2(sv, 0.5));

  outColor = color;
}
```

---

### MapLibre Rendering Pipeline (Top View)

```
┌─────────────────────────────────────────────────────────────────┐
│                    MAPLIBRE RENDERING PIPELINE                    │
└─────────────────────────────────────────────────────────────────┘

1. DATA INPUT
   ├─ GPS data (vessel track)
   ├─ Catch data (catch locations)
   ├─ School detections
   └─ Environmental data (SST, chlorophyll, etc.)

2. LAYER CONFIGURATION
   ├─ Base layer (bathymetry/nautical chart)
   ├─ Vessel track layer
   ├─ Heatmap layer
   ├─ Point layer (catches, schools)
   └─ Environmental layers

3. DATA TRANSFORMATION
   ├─ Convert data to GeoJSON
   ├─ Project coordinates (EPSG:4326)
   └─ Generate vector tiles

4. STYLE GENERATION
   ├─ Layer-specific paint properties
   ├─ Color scales
   └─ Symbol placement

5. RENDERING
   ├─ Tile loading
   ├─ Layer composition
   └─ Symbol rendering

6. INTERACTION
   ├─ Click/hover detection
   ├─ Box/lasso selection
   └─ Tooltip generation

7. OUTPUT
   └─ Rendered map
```

**Heatmap Layer Example:**

```typescript
map.addLayer({
  id: 'backscatter-heatmap',
  type: 'heatmap',
  source: 'backscatter-data',
  maxzoom: 18,
  paint: {
    // Weight by backscatter value
    'heatmap-weight': ['get', 'sv'],

    // Heatmap intensity
    'heatmap-intensity': [
      'interpolate',
      ['linear'],
      ['zoom'],
      0, 1,
      9, 3,
    ],

    // Color scale
    'heatmap-color': [
      'interpolate',
      ['linear'],
      ['heatmap-density'],
      0, 'rgba(0,0,255,0)',
      0.2, 'blue',
      0.4, 'cyan',
      0.6, 'lime',
      0.8, 'yellow',
      1, 'red',
    ],

    // Heatmap radius
    'heatmap-radius': [
      'interpolate',
      ['linear'],
      ['zoom'],
      0, 2,
      9, 20,
    ],

    // Heatmap opacity
    'heatmap-opacity': 0.7,
  },
});
```

---

### D3.js Rendering Pipeline (Timeline)

```
┌─────────────────────────────────────────────────────────────────┐
│                      D3.JS TIMELINE PIPELINE                      │
└─────────────────────────────────────────────────────────────────┘

1. DATA INPUT
   ├─ Track configuration
   └─ Clips (time ranges, data)

2. SCALE CALCULATION
   ├─ Time scale (xScale)
   ├─ Track scale (yScale)
   └─ Zoom transform

3. AXIS GENERATION
   ├─ Time axis (top)
   ├─ Track labels (left)
   └─ Tick marks

4. CLIP RENDERING
   ├─ Calculate clip positions
   ├─ Render clip rectangles
   └─ Render clip thumbnails

5. SELECTION RENDERING
   ├─ Brush selection
   ├─ Highlight clips
   └─ Scrubber position

6. INTERACTION
   ├─ Zoom (wheel/pinch)
   ├─ Pan (drag)
   ├─ Clip selection
   └─ Scrubber dragging

7. OUTPUT
   └─ SVG timeline
```

**Timeline Component Example:**

```typescript
const TimelineComponent: React.FC<TimelineProps> = ({
  tracks,
  timeRange,
  onClipSelect,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // Time scale
    const xScale = d3.scaleTime()
      .domain([new Date(timeRange.start), new Date(timeRange.end)])
      .range([0, width]);

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 1000])
      .on('zoom', (event) => {
        const newXScale = event.transform.rescaleX(xScale);
        updateTimeline(newXScale);
      });

    svg.call(zoom);

    // Render tracks
    let y = 0;
    tracks.forEach(track => {
      const trackGroup = svg.append('g')
        .attr('class', 'track')
        .attr('transform', `translate(0, ${y})`);

      // Track background
      trackGroup.append('rect')
        .attr('width', width)
        .attr('height', track.height)
        .attr('fill', track.color)
        .attr('opacity', 0.1);

      // Render clips
      track.clips.forEach(clip => {
        const clipGroup = trackGroup.append('g')
          .attr('class', 'clip')
          .style('cursor', 'pointer');

        const startX = xScale(new Date(clip.startTime));
        const endX = xScale(new Date(clip.endTime));

        clipGroup.append('rect')
          .attr('x', startX)
          .attr('y', 0)
          .attr('width', endX - startX)
          .attr('height', track.height)
          .attr('fill', track.color)
          .attr('opacity', 0.7)
          .on('click', () => onClipSelect(clip.id));
      });

      y += track.height;
    });

  }, [tracks, timeRange, onClipSelect]);

  return <svg ref={svgRef} className="timeline" />;
};
```

---

## Data Loading Strategy

### Progressive Loading

```
┌─────────────────────────────────────────────────────────────────┐
│                    PROGRESSIVE LOADING STRATEGY                 │
└─────────────────────────────────────────────────────────────────┘

Phase 1: Initial Load (0-2 seconds)
  ├─ Load bounding box metadata
  ├─ Load first 1000 pings (side view)
  ├─ Load vessel track (top view)
  └─ Load timeline tracks

Phase 2: Detail Load (2-5 seconds)
  ├─ Load detailed echogram data
  ├─ Load catch data
  ├─ Load gear deployment data
  └─ Load environmental data

Phase 3: On-Demand Load (5+ seconds)
  ├─ Load data as user zooms/pans
  ├─ Load historical data as needed
  └─ Cache frequently accessed data

Data Prioritization:
  1. Visible viewport data (highest priority)
  2. Adjacent viewport data (medium priority)
  3. Off-screen data (low priority)
```

### Caching Strategy

```typescript
interface CacheStrategy {
  // L1 Cache: GPU memory (fastest)
  gpu: {
    capacity: 256; // MB
    policy: 'LRU';
    data: ['recent echogram textures', 'map tiles'];
  };

  // L2 Cache: Main memory (fast)
  memory: {
    capacity: 1024; // MB
    policy: 'LRU';
    data: ['ping data', 'GPS data', 'catch data'];
  };

  // L3 Cache: IndexedDB (medium)
  disk: {
    capacity: 5120; // MB
    policy: 'LFU';
    data: ['historical data', 'archived data'];
  };

  // L4 Cache: Remote server (slow)
  remote: {
    capacity: 'unlimited';
    policy: 'none';
    data: ['all data'];
  };
}
```

### Data Streaming

```typescript
class DataStreamer {
  private websocket: WebSocket;

  constructor(url: string) {
    this.websocket = new WebSocket(url);

    this.websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // Route to appropriate panel
      switch (data.type) {
        case 'acoustic':
          this.handleAcousticData(data);
          break;
        case 'gps':
          this.handleGPSData(data);
          break;
        case 'catch':
          this.handleCatchData(data);
          break;
      }
    };
  }

  private handleAcousticData(data: PingData) {
    // Update side view panel
    sideViewPanel.updatePing(data);

    // Update heatmap
    chartPanel.updateHeatmap(data);

    // Add to timeline
    timelinePanel.addAcousticClip(data);
  }

  private handleGPSData(data: GPSData) {
    // Update vessel track
    chartPanel.updateTrack(data);

    // Add to timeline
    timelinePanel.addGPSClip(data);
  }

  private handleCatchData(data: CatchData) {
    // Update catch markers
    chartPanel.addCatchMarker(data);

    // Add to timeline
    timelinePanel.addCatchClip(data);
  }
}
```

---

## Performance Checklist

### Rendering Performance

- [ ] Maintain 60 FPS during interaction
- [ ] WebGL rendering for >100K data points
- [ ] LOD system for large datasets
- [ ] Texture atlasing for batch rendering
- [ ] GPU compute shaders for heatmap generation
- [ ] Efficient vertex/fragment shaders
- [ ] Minimal state updates
- [ ] Memoized React components
- [ ] Virtual scrolling for long lists
- [ ] Debounced/throttled event handlers

### Data Performance

- [ ] IndexedDB for offline data storage
- [ ] Web Workers for data processing
- [ ] Progressive data loading
- [ ] Intelligent caching strategy
- [ ] Data compression (LZ4)
- [ ] Binary data formats where possible
- [ ] Spatial indexing (R-tree)
- [ ] Temporal indexing (B-tree)
- [ ] Data pre-fetching
- [ ] Background data loading

### Memory Performance

- [ ] Memory usage < 1GB
- [ ] Circular buffer for recent data
- [ ] Data cleanup for off-screen content
- [ ] Texture recycling
- [ ] Object pooling
- [ ] WeakMap for metadata
- [ ] Lazy loading of resources
- [ ] Memory leak detection
- [ ] Profile memory usage regularly
- [ ] Test with large datasets

### Network Performance

- [ ] HTTP/2 for parallel requests
- [ ] CDN for static assets
- [ ] Data compression
- [ ] Request batching
- [ ] Optimistic UI updates
- [ ] Offline support
- [ ] Resume interrupted downloads
- [ ] Delta updates (not full reloads)
- [ ] Request deduplication
- [ ] Network error handling

---

## Testing Strategy

### Unit Tests

```typescript
// Example: Data processor unit test
describe('DataProcessor', () => {
  it('should aggregate ping data correctly', () => {
    const pings = [
      { timestamp: 1000, sv: [-50, -45, -40] },
      { timestamp: 2000, sv: [-48, -43, -38] },
      { timestamp: 3000, sv: [-52, -47, -42] },
    ];

    const aggregated = DataProcessor.aggregatePings(pings, 1);

    expect(aggregated).toHaveLength(3);
    expect(aggregated[0].meanSV).toBeCloseTo(-45, 0);
    expect(aggregated[1].meanSV).toBeCloseTo(-43, 0);
    expect(aggregated[2].meanSV).toBeCloseTo(-47, 0);
  });

  it('should handle empty input', () => {
    const aggregated = DataProcessor.aggregatePings([], 10);
    expect(aggregated).toHaveLength(0);
  });

  it('should apply contrast correctly', () => {
    const input = -50; // dB
    const contrast = 1.5;
    const output = DataProcessor.applyContrast(input, contrast);
    expect(output).toBeGreaterThan(input);
  });
});
```

### Integration Tests

```typescript
// Example: Selection system integration test
describe('Selection System', () => {
  it('should broadcast selection to all panels', () => {
    const selectionBus = new SelectionBus();
    const sideView = new SideViewPanel();
    const topView = new TopViewPanel();
    const timeline = new TimelinePanel();

    selectionBus.register(sideView);
    selectionBus.register(topView);
    selectionBus.register(timeline);

    const selection: Selection = {
      id: 'test-selection',
      source: 'side-view',
      temporal: {
        type: 'range',
        startTime: 1000,
        endTime: 2000,
      },
      metadata: {
        color: '#ff0000',
        label: 'Test',
        created: Date.now(),
      },
    };

    selectionBus.add(selection);

    expect(sideView.highlightedSelections).toContain(selection);
    expect(topView.highlightedSelections).toContain(selection);
    expect(timeline.highlightedSelections).toContain(selection);
  });
});
```

### E2E Tests

```typescript
// Example: E2E test with Playwright
test('user can select spatial region and see temporal highlights', async ({
  page,
}) => {
  await page.goto('http://localhost:3000');

  // Wait for data to load
  await page.waitForSelector('.top-view-panel');

  // Draw box selection in top view
  const canvas = page.locator('.top-view-panel canvas');
  await canvas.click({ position: { x: 200, y: 200 } });
  await canvas.dragTo(canvas, {
    sourcePosition: { x: 200, y: 200 },
    targetPosition: { x: 400, y: 400 },
  });

  // Verify selection appears in side view
  const highlight = page.locator('.side-view-panel .selection-highlight');
  await expect(highlight).toBeVisible();

  // Verify selection appears in timeline
  const timelineHighlight = page.locator('.timeline-panel .clip-highlighted');
  await expect(timelineHighlight).toHaveCount(await timelineHighlight.count());
});
```

### Performance Tests

```typescript
// Example: Performance test
describe('Rendering Performance', () => {
  it('should render 10K pings at 60 FPS', async () => {
    const pings = generateMockPings(10000);
    const panel = new SideViewPanel();

    const startTime = performance.now();
    panel.render(pings);
    const endTime = performance.now();

    const renderTime = endTime - startTime;
    const fps = 1000 / renderTime;

    expect(fps).toBeGreaterThanOrEqual(60);
  });

  it('should handle 100K pings without crashing', async () => {
    const pings = generateMockPings(100000);
    const panel = new SideViewPanel();

    // Should not throw
    expect(() => panel.render(pings)).not.toThrow();

    // Should complete within 5 seconds
    const startTime = performance.now();
    panel.render(pings);
    const endTime = performance.now();

    expect(endTime - startTime).toBeLessThan(5000);
  });
});
```

---

**End of Implementation Guide**
