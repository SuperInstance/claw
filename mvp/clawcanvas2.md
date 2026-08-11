# 🎨 ClawCanvas MVP – Architecture Design

**Visual front-end for CudaClaw: real‑time GPU agent visualization**

## 1. Overview & Goals

ClawCanvas is a companion web application that connects to a running CudaClaw instance and visualizes the state of thousands of geometric agents in real time. Its sole purpose is to **make the invisible visible** – to show that CudaClaw actually coordinates agents deterministically at scale.

**MVP Scope:**

- Connect to a CudaClaw instance via WebSocket.
- Render agent positions as colored points on a 2D canvas.
- Update the canvas continuously as new agent states arrive.
- Provide minimal UI: connection status, FPS counter, maybe pause/resume.
- **No backend API** – everything is client‑side. No AI, no formulas, no spreadsheet UI.

**Why this MVP?**

- Immediately demonstrates the power of CudaClaw.
- Lets developers *see* what 10,000 agents are doing.
- Can be hosted as a static site and pointed at a public demo instance.

---

## 2. Technology Stack

| Layer          | Choice                          | Rationale                                                                 |
|----------------|----------------------------------|---------------------------------------------------------------------------|
| Build tool     | **Vite**                         | Fast, minimal, great for static SPAs.                                     |
| Framework      | **React 18 + TypeScript**        | Ubiquitous, strong typing, easy to reason about.                          |
| Canvas rendering | **PixiJS** (or raw Canvas API) | PixiJS gives WebGL acceleration for 10k+ sprites; raw canvas may suffice. |
| WebSocket      | **Native browser WebSocket**     | No extra libraries needed.                                                |
| State management | **React hooks + context**      | Simple enough – no Redux.                                                 |
| Styling        | **CSS modules** or **Tailwind**  | Minimal, scoped styles.                                                   |

---

## 3. System Architecture

```
┌─────────────────┐        WebSocket        ┌─────────────────────┐
│   CudaClaw      │  ←────────────────────→ │   ClawCanvas        │
│   (GPU engine)  │    (binary protocol)    │   (React SPA)       │
└─────────────────┘                          └─────────────────────┘
         │                                            │
         │ (1) Simulates agents                       │ (2) Renders canvas
         │ (3) Broadcasts state every frame           │ (4) User sees agents
```

**CudaClaw side** (extension to the MVP binary):

- Adds a lightweight WebSocket server (e.g., using `tokio_tungstenite` or `std::net` + a simple thread).
- After each simulation step, serialises the agent array (positions, colors) and sends a binary or JSON message to all connected clients.
- Optional: accept commands like `pause`, `reset` from the client (for future).

**ClawCanvas side**:

- Connects to `ws://localhost:8080` (or a configurable URL).
- Receives agent updates, passes them to a PixiJS stage.
- Renders each agent as a circle (color based on value, group, etc.).
- Updates at 60 FPS, independent of simulation step rate.

---

## 4. Data Protocol (WebSocket)

We need a lightweight, fast format. JSON is easy but verbose for 10k agents. A binary format is more efficient.

**MVP Binary Format (per frame):**

```
[u32: agent_count]
[ for each agent:
    f32: x
    f32: y
    u32: color (RGBA)  // or separate r,g,b,a bytes
]
```

Total size: `4 + agent_count * (4+4+4) = 4 + 12*N` bytes. For 10k agents ≈ 120KB per frame, acceptable.

**Optional JSON fallback** for debugging: `{ "agents": [ {x, y, color}, ... ] }`.

**Message types** (for future extensibility):

- `0x01` = Frame data (binary)
- `0x02` = Metadata (simulation bounds, etc.)
- `0x03` = Command response/error

For MVP we only need frame data. CudaClaw can send a fixed‑size binary blob.

---

## 5. Frontend Components

### High‑level component tree

```
App
├── ConnectionBar (status, URL input, Connect button)
├── CanvasView
│   └── PixiStage (managed by custom hook)
└── StatsOverlay (FPS, agent count, step count)
```

### Key logic

- **useWebSocket** custom hook:
  - Manages connection lifecycle.
  - Parses incoming binary messages (using `DataView`).
  - Stores latest agent list in state.
- **usePixi** custom hook:
  - Initialises Pixi application on a canvas ref.
  - Creates and updates sprite pool.
  - Receives agent list and updates sprite positions/colors.

### Performance considerations

- Use object pooling for sprites to avoid garbage collection.
- Batch updates – only update sprites that changed (if we track changes).
- Use `requestAnimationFrame` for smooth rendering, but update positions only when new data arrives.

---

## 6. CudaClaw Integration (Minimal Changes)

To make CudaClaw work with ClawCanvas, we need to add a WebSocket broadcaster. This can be a separate optional module that does not complicate the core simulation.

**CudaClaw additions:**

- New CLI flag: `--visualize --port 8080`
- When enabled, spawn a background thread that:
  - Listens for WebSocket connections.
  - After each simulation step, takes a snapshot of agent states and sends to all clients.

**Code sketch (Rust with `tokio` and `tokio_tungstenite`):**

```rust
// Inside main simulation loop
let agents = ...; // Vec<AgentState>
let msg = bincode::serialize(&agents).unwrap(); // or custom binary
broadcast_sender.send(msg).ok();

// In WebSocket task
while let Ok(msg) = broadcast_receiver.recv() {
    for peer in peers.lock().unwrap().iter() {
        peer.send(msg.clone()).await.ok();
    }
}
```

For MVP, we can even use a simpler approach: write agent states to a file (e.g., `/tmp/agents.bin`) and let the visualizer poll it. But WebSocket is cleaner and real‑time.

---

## 7. Development & Deployment

### Local development

```bash
# Terminal 1: Run CudaClaw with visualizer enabled
cudaclaw --visualize --port 8080

# Terminal 2: Run ClawCanvas dev server
cd clawcanvas
npm install
npm run dev
# open http://localhost:5173
```

### Production deployment

- Build ClawCanvas as static files: `npm run build` → `dist/` folder.
- Host on any static hosting (Cloudflare Pages, Netlify, GitHub Pages).
- Point it to a public CudaClaw demo instance (e.g., `ws://demo.cudaclaw.ai:8080`).

### Configuration

Allow the user to specify the WebSocket URL via query parameter: `?server=ws://localhost:8080`. Default to a public demo.

---

## 8. Future Extensions (Post‑MVP)

- **Agent properties**: Show value, group, connections.
- **Controls**: Pause, step, reset simulation.
- **Multiple visualizations**: Heatmaps, trails, charts.
- **Authentication**: For private instances.
- **Recording/playback**: Save and replay sessions.

But for the MVP, we keep it **dead simple**: a canvas with moving dots.

---

## 9. Repository & Naming

- New repo: `github.com/SuperInstance/clawcanvas` (or `cudaclaw-viz`).
- Keep it separate from `cudaclaw` to avoid bloat.
- `README.md` with screenshot and one‑line setup: point it at a running CudaClaw instance.

---

## 10. Success Criteria

- A user can clone `cudaclaw`, run it with `--visualize`, clone `clawcanvas`, run `npm run dev`, and see 10,000 colored dots moving on the screen.
- The connection is stable, and the canvas updates at a smooth frame rate.
- The code is minimal (< 500 lines of meaningful code).

---

With this architecture, ClawCanvas becomes the perfect visual proof for CudaClaw, and together they form a compelling open‑source demonstration of your GPU‑agent technology.

## 🎨 ClawCanvas MVP – Complete Architecture

**ClawCanvas** is the visual front door for CudaClaw. It’s a dead‑simple web application that connects to a running CudaClaw instance and renders the state of thousands of agents in real time. No backend logic, no AI, no spreadsheets – just a canvas and a WebSocket.

---

### 📌 MVP Core Purpose

- Connect to a CudaClaw WebSocket endpoint.
- Receive periodic snapshots of agent positions and states.
- Render them on an HTML5 canvas (or WebGL for performance).
- Provide minimal controls: start/stop, reset view, maybe color by value.

---

### 🧱 Stripped-Down Components (Cut 95%)

| Component | Keep? | Why / How |
|-----------|-------|-----------|
| `agent-core`, `agent-ai`, `agent-formulas` | ❌ | Entirely removed – no agent execution. |
| Backend API server | ❌ | The MVP has no server; it’s a static frontend. |
| WebSocket handling | ✅ | Connect directly to a CudaClaw instance (or a public demo). |
| Canvas rendering | ✅ | Use `requestAnimationFrame` for smooth animation. |
| UI controls | ✅ | A few buttons: connect, clear, maybe a slider for speed. |
| All documentation except `README.md` | ❌ | One `README` with screenshot and quick start. |
| Multiple visualizations | ❌ | Only agent positions (dots) with color intensity for value. |
| `packages/*` | ❌ | No monorepo – a single HTML file or simple React app. |

---

### 🏗️ Architecture Overview

```
┌─────────────┐       WebSocket       ┌─────────────────┐
│   Browser   │ ◄───────────────────► │  CudaClaw Demo  │
│ ClawCanvas  │       (or HTTP/2)     │   (running on   │
└─────────────┘                        │  public server) │
                                       └─────────────────┘
```

- **CudaClaw instance** exposes a WebSocket endpoint (e.g., `ws://demo.cudaclaw.ai:8080/agents`). It streams binary or JSON snapshots of agent states (positions, values).
- **ClawCanvas** is a static site (hosted on Cloudflare Pages, GitHub Pages, etc.). It connects to the WebSocket, decodes messages, and renders using Canvas.
- **No authentication** for MVP – the demo is public read‑only.

#### Data Flow

1. User opens the page.
2. Page connects to the configured WebSocket URL.
3. CudaClaw sends incremental updates (e.g., every 100ms) as `ArrayBuffer` of `AgentState` structs.
4. Canvas renders dots at `(x, y)` with color based on `value`.
5. User can pause, resume, reset view.

---

### 🧩 Tech Stack

| Layer          | Technology                          | Why |
|----------------|-------------------------------------|-----|
| **Language**   | TypeScript                          | Type safety for message decoding. |
| **UI Framework** | Vanilla JS + HTML (or React if preferred) | Minimal dependencies; React optional for component structure. |
| **Rendering**  | HTML5 Canvas (2D)                   | Sufficient for 10k dots; fallback to WebGL if needed later. |
| **Networking** | WebSocket API (browser native)      | Real‑time, low latency. |
| **Build**      | Vite (or Parcel)                    | Fast dev server, simple build. |
| **Deployment** | Static hosting (Cloudflare Pages)   | Free, global edge. |

---

### 📁 Folder Structure (Minimal)

```
clawcanvas/
├── index.html              # Single HTML entry
├── style.css               # Basic styling
├── src/
│   ├── main.ts             # Entry: init UI, WebSocket, canvas loop
│   ├── canvas/
│   │   └── renderer.ts     # Draw agents on canvas
│   ├── network/
│   │   └── client.ts       # WebSocket connection + message parsing
│   └── types.ts            # Shared type definitions (mirror CudaClaw)
├── vite.config.js          # Vite config (if using)
├── package.json            # Only necessary deps (vite, typescript)
└── README.md               # Screenshot + one-liner
```

---

### 🔌 Communication Protocol

CudaClaw sends binary messages for efficiency. Each message is a sequence of `AgentState` structs (packed, same layout as in CudaClaw).

**`types.ts`** (mirroring CudaClaw’s `AgentState`):
```typescript
export interface AgentState {
    x: number;          // float32
    y: number;          // float32
    value: number;      // float32
    timestamp: number;  // uint32
    _padding: number;   // uint32 (unused)
}

export const AGENT_STATE_BYTES = 16; // 4 floats = 16 bytes
```

**WebSocket message format:**  
- First 4 bytes: `uint32` count of agents in this update.  
- Then `count * 16` bytes of raw binary data (little‑endian).  
- Updates may be delta or full state – for MVP, assume full state each time.

**`network/client.ts`**:
```typescript
export class CudaClawClient {
    private ws: WebSocket;
    private onUpdate: (agents: AgentState[]) => void;

    constructor(url: string, onUpdate: (agents: AgentState[]) => void) {
        this.onUpdate = onUpdate;
        this.ws = new WebSocket(url);
        this.ws.binaryType = 'arraybuffer';
        this.ws.onmessage = this.handleMessage;
    }

    private handleMessage = (event: MessageEvent) => {
        const buffer = event.data as ArrayBuffer;
        const view = new DataView(buffer);
        const count = view.getUint32(0, true); // little-endian
        const agents: AgentState[] = [];
        let offset = 4;
        for (let i = 0; i < count; i++) {
            agents.push({
                x: view.getFloat32(offset, true),
                y: view.getFloat32(offset + 4, true),
                value: view.getFloat32(offset + 8, true),
                timestamp: view.getUint32(offset + 12, true),
                _padding: view.getUint32(offset + 16, true), // actually offset 16? careful
            });
            offset += AGENT_STATE_BYTES;
        }
        this.onUpdate(agents);
    };
}
```

**Note:** Ensure offset calculation matches the actual packed struct size (likely 16 bytes). We'll assume 4 floats (16 bytes). If `_padding` exists, it's part of the struct, so offset increments by 16 each agent.

---

### 🎨 Rendering (`canvas/renderer.ts`)

```typescript
export class AgentRenderer {
    private ctx: CanvasRenderingContext2D;
    private width: number;
    private height: number;
    private agents: AgentState[] = [];

    constructor(canvas: HTMLCanvasElement) {
        this.ctx = canvas.getContext('2d')!;
        this.resize();
        window.addEventListener('resize', this.resize.bind(this));
    }

    resize() {
        this.width = this.ctx.canvas.clientWidth;
        this.height = this.ctx.canvas.clientHeight;
        this.ctx.canvas.width = this.width;
        this.ctx.canvas.height = this.height;
    }

    updateAgents(agents: AgentState[]) {
        this.agents = agents;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        // Map world coordinates to canvas (assume world bounds [-1,1] or [0,1])
        const scaleX = this.width / 2; // if world x in [-1,1]
        const scaleY = this.height / 2;
        const offsetX = this.width / 2;
        const offsetY = this.height / 2;

        for (const a of this.agents) {
            const x = a.x * scaleX + offsetX;
            const y = a.y * scaleY + offsetY; // may need to invert Y
            // Color by value (e.g., red = high, blue = low)
            const hue = 240 * (1 - a.value); // blue (0) to red (1)
            this.ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
            this.ctx.fillRect(x, y, 2, 2);
        }
    }

    // Call this in animation loop
    animate() {
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}
```

**Usage in `main.ts`:**
```typescript
import { CudaClawClient } from './network/client';
import { AgentRenderer } from './canvas/renderer';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const renderer = new AgentRenderer(canvas);
renderer.animate();

const client = new CudaClawClient('ws://localhost:8080', (agents) => {
    renderer.updateAgents(agents);
});
```

---

### 🖥️ Minimal UI (`index.html`)

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>ClawCanvas – Live CudaClaw Visualization</title>
    <style>
        body { margin: 0; overflow: hidden; background: #111; color: white; font-family: sans-serif; }
        #canvas { width: 100vw; height: 100vh; display: block; }
        #controls {
            position: absolute; top: 10px; left: 10px; background: rgba(0,0,0,0.7);
            padding: 8px 12px; border-radius: 4px; z-index: 10;
        }
        button { margin-right: 8px; }
    </style>
</head>
<body>
    <canvas id="canvas"></canvas>
    <div id="controls">
        <button id="connect">Connect</button>
        <button id="disconnect">Disconnect</button>
        <span id="status">Disconnected</span>
    </div>
    <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

---

### 🚀 Deployment

- Build with `vite build` → outputs static files in `dist/`.
- Deploy to Cloudflare Pages, Netlify, GitHub Pages.
- Configure the WebSocket URL via an environment variable or hardcode a public demo endpoint (e.g., `wss://demo.cudaclaw.ai/live`).

For the MVP, you can host a simple CudaClaw instance on a cheap VPS with a public WebSocket port (e.g., using `nohup` or a systemd service). The visualizer connects to that.

---

### ✅ Does this meet MVP goals?

- **Single static page** – No backend, no build complexity.
- **Visualizes agents** – Real‑time, supports 10k dots smoothly with canvas.
- **Minimal UI** – Connect button, status, and the canvas.
- **Direct connection** – Talks to CudaClaw over WebSocket.
- **No AI, no spreadsheets** – Pure visualization.

---

### 🔜 Next Steps After MVP

1. **Add simple controls** – Speed slider, pause, color mapping options.
2. **Improve rendering** – Use WebGL if 2D canvas chokes on >20k agents.
3. **Multiple visualizations** – Show agent connections or heatmaps.
4. **Integrate with CudaClaw’s binary protocol** more robustly (e.g., support for delta updates).
5. **Package as a desktop app** (Tauri) for users who want local connection.

This design gives you a clean, focused visual companion to launch alongside CudaClaw. It proves the engine works and invites developers to explore.