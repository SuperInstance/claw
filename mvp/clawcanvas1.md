## 🎨 ClawCanvas MVP – Visual Front Door for CudaClaw

**ClawCanvas** is a minimalist web application that visualizes a live CudaClaw simulation. It connects directly to a running CudaClaw instance (or a public demo) via WebSocket and renders thousands of agents in real time. This MVP serves as the "show, don't tell" proof that your GPU engine is real, fast, and controllable.

---

## 🧭 Guiding Principles

- **No backend logic** – The UI does not store state or run agents; it only renders data from CudaClaw.
- **Minimal dependencies** – React + Canvas + WebSocket. No Redux, no heavy UI libraries.
- **One purpose** – Visualize agent positions and values. Later, maybe add basic controls (pause, step).
- **Works out of the box** – Connect to `localhost:8080` or a public demo URL via a simple config.

---

## 🏗️ System Architecture

```
┌─────────────────┐         WebSocket          ┌─────────────────┐
│   CudaClaw      │  ────────────────────────> │   ClawCanvas    │
│   (Engine)      │         agent updates       │   (React App)   │
└─────────────────┘                             └─────────────────┘
        │                                                 │
        │ (optional)                                       │
        ▼                                                 ▼
┌─────────────────┐                             ┌─────────────────┐
│   WebSocket     │                             │   Canvas        │
│   Broadcaster   │                             │   Renderer      │
└─────────────────┘                             └─────────────────┘
```

- **CudaClaw engine** runs the simulation. After each step (or every N steps), it sends the current agent states to all connected WebSocket clients.
- **ClawCanvas** connects to the WebSocket endpoint, receives binary or JSON data, and draws agents on an HTML5 canvas.

---

## 📁 Repository Structure (Stripped Down)

We'll start fresh, but you can reuse parts of `spreadsheet-moment` if desired. The MVP should be a standalone repo (e.g., `clawcanvas`) with minimal files.

```
clawcanvas/
├── public/
│   └── index.html          # Basic HTML shell
├── src/
│   ├── App.tsx             # Main component (canvas + connection UI)
│   ├── Canvas.tsx          # Canvas rendering logic
│   ├── WebSocketClient.ts  # WebSocket management
│   ├── types.ts            # Shared type definitions (mirror CudaClaw)
│   └── index.tsx           # Entry point
├── package.json            # React + TypeScript + WebSocket
├── tsconfig.json
└── README.md               # Quick start
```

**Delete all packages from `spreadsheet-moment` except `agent-ui` (if you want to salvage components).** But for MVP, it's easier to rebuild from scratch with the above structure.

---

## 🔌 Integration with CudaClaw

CudaClaw needs a small addition: a WebSocket broadcaster. This can be a separate thread (or async task) that periodically reads agent state from GPU memory and sends it to clients. For the MVP, we can add a simple feature flag to the CudaClaw binary.

### Option A: Embed a WebSocket server in CudaClaw

- Use `tokio_tungstenite` or `ws-rs` in Rust.
- Start a server on a configurable port (e.g., 8080).
- After each simulation step, broadcast the agent buffer to all connected clients.

**Minimal code sketch in CudaClaw:**

```rust
// In main.rs (or a new binary)
use tokio::sync::broadcast;
use warp::ws::{Message, WebSocket};
use warp::Filter;

#[tokio::main]
async fn main() {
    let (tx, _) = broadcast::channel(16);

    // WebSocket route
    let ws_route = warp::path("ws")
        .and(warp::ws())
        .and(with_tx(tx.clone()))
        .map(|ws: warp::ws::Ws, tx| ws.on_upgrade(move |socket| handle_socket(socket, tx)));

    tokio::spawn(async move {
        warp::serve(ws_route).run(([127,0,0,1], 8080)).await;
    });

    // Start simulation loop
    let mut sim = CudaClaw::new(10000).unwrap();
    loop {
        sim.step(1).unwrap();
        let agents = sim.download_agents().unwrap();
        let data = serialize_agents(&agents); // e.g., bincode or JSON
        let _ = tx.send(data);
        std::thread::sleep(std::time::Duration::from_millis(16)); // ~60 FPS
    }
}
```

### Option B: Separate broadcaster process

For cleaner separation, you could create a small Rust tool that reads from CudaClaw's shared memory or listens on a Unix socket. But for MVP, embedding is simpler.

**Data format:** Send binary (e.g., flat buffer of `AgentState` structs) for efficiency, or JSON for simplicity. ClawCanvas can decode binary using `ArrayBuffer` and `DataView`.

---

## 🌐 ClawCanvas – Detailed Design

### 1. Type Definitions (`src/types.ts`)

Mirror the CudaClaw `AgentState` struct.

```typescript
export interface AgentState {
    x: number;          // f32
    y: number;
    value: number;
    timestamp: number;  // u32
    _padding: number;   // u32 (unused)
}

export const AGENT_STATE_SIZE = 16; // bytes (4 floats * 4 bytes)
```

### 2. WebSocket Client (`src/WebSocketClient.ts`)

Manages connection, binary parsing, and callbacks.

```typescript
export class WebSocketClient {
    private socket: WebSocket | null = null;
    private onMessage: (agents: AgentState[]) => void;

    constructor(onMessage: (agents: AgentState[]) => void) {
        this.onMessage = onMessage;
    }

    connect(url: string) {
        this.socket = new WebSocket(url);
        this.socket.binaryType = 'arraybuffer';

        this.socket.onmessage = (event) => {
            const buffer = event.data as ArrayBuffer;
            const agents = this.parseBinary(buffer);
            this.onMessage(agents);
        };
    }

    private parseBinary(buffer: ArrayBuffer): AgentState[] {
        const view = new DataView(buffer);
        const count = buffer.byteLength / AGENT_STATE_SIZE;
        const agents: AgentState[] = [];

        for (let i = 0; i < count; i++) {
            const offset = i * AGENT_STATE_SIZE;
            agents.push({
                x: view.getFloat32(offset, true),      // little-endian
                y: view.getFloat32(offset + 4, true),
                value: view.getFloat32(offset + 8, true),
                timestamp: view.getUint32(offset + 12, true),
                _padding: view.getUint32(offset + 16, true),
            });
        }
        return agents;
    }

    disconnect() {
        this.socket?.close();
    }
}
```

### 3. Canvas Renderer (`src/Canvas.tsx`)

Renders agents as colored dots. Simple and fast.

```typescript
import React, { useRef, useEffect } from 'react';
import { AgentState } from './types';

interface CanvasProps {
    agents: AgentState[];
    width: number;
    height: number;
}

export const Canvas: React.FC<CanvasProps> = ({ agents, width, height }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, width, height);

        // Map agent positions to canvas coordinates (assuming range [-1,1] or [0,1])
        // For simplicity, assume positions are normalized [0,1]
        agents.forEach(agent => {
            const x = agent.x * width;
            const y = agent.y * height;
            const value = agent.value; // use to color (0-1)

            ctx.fillStyle = `hsl(${value * 360}, 100%, 50%)`;
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, 2 * Math.PI);
            ctx.fill();
        });
    }, [agents, width, height]);

    return <canvas ref={canvasRef} width={width} height={height} />;
};
```

### 4. Main App (`src/App.tsx`)

Handles connection UI and passes agents to canvas.

```typescript
import React, { useState, useEffect, useCallback } from 'react';
import { Canvas } from './Canvas';
import { WebSocketClient } from './WebSocketClient';
import { AgentState } from './types';

const DEFAULT_URL = 'ws://localhost:8080/ws';

function App() {
    const [agents, setAgents] = useState<AgentState[]>([]);
    const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
    const [wsUrl, setWsUrl] = useState(DEFAULT_URL);

    useEffect(() => {
        const client = new WebSocketClient((newAgents) => {
            setAgents(newAgents);
        });

        setConnectionStatus('connecting');
        client.connect(wsUrl);

        // Basic connection state detection (WebSocket API is limited)
        // We'll rely on onopen and onclose
        // For simplicity, we assume connected if we get messages.

        return () => {
            client.disconnect();
        };
    }, [wsUrl]);

    const handleConnect = (e: React.FormEvent) => {
        e.preventDefault();
        // Reconnect by changing URL triggers useEffect
        setWsUrl((document.getElementById('wsUrl') as HTMLInputElement).value);
    };

    return (
        <div style={{ padding: 20 }}>
            <h1>ClawCanvas – CudaClaw Visualizer</h1>
            <form onSubmit={handleConnect}>
                <input
                    id="wsUrl"
                    type="text"
                    defaultValue={DEFAULT_URL}
                    style={{ width: 300 }}
                />
                <button type="submit">Connect</button>
                <span> Status: {connectionStatus}</span>
            </form>
            <div>
                Agents: {agents.length} | FPS: {/** compute fps */}
            </div>
            <Canvas agents={agents} width={800} height={600} />
        </div>
    );
}

export default App;
```

### 5. Styling (Optional)

Keep it minimal; maybe a CSS file to make the canvas responsive.

---

## 🚀 Deployment & Demo

- **ClawCanvas** – Deploy to Cloudflare Pages or Vercel as a static site.
- **CudaClaw Demo Instance** – Run a CudaClaw binary with WebSocket broadcasting on a cheap cloud GPU instance (e.g., Lambda Labs, RunPod). Expose port 8080 (or use a tunnel like ngrok for quick demos).
- **Announcement** – Post a short video showing the visualizer connected to the live demo, with a link to the code.

---

## ✂️ Stripping Down `spreadsheet-moment` (if you reuse)

If you prefer to salvage code from `spreadsheet-moment`, here's what to keep and delete:

| Package/Folder        | Action | Reason |
|-----------------------|--------|--------|
| `packages/agent-ui/`  | ✅ Keep (but heavily trim) | Contains React components for visualization. Keep only `AgentVisualizer` and `StatusIndicator`. Delete everything else. |
| `packages/agent-core/`| ❌ Delete | Backend logic, not needed. |
| `packages/agent-ai/`  | ❌ Delete | No AI routing in MVP. |
| `packages/agent-formulas/` | ❌ Delete | Spreadsheet formulas, not needed. |
| `website/`            | ❌ Delete | Use new simple index.html. |
| `docs/`               | ❌ Delete | Keep only a brief README. |
| `tests/`              | ❌ Delete | Not needed for MVP. |
| `backend/`, `cloudflare/`, `workers/` | ❌ Delete | No backend. |

**New structure from `spreadsheet-moment` remnants:**

```
clawcanvas/
├── public/
├── src/
│   ├── components/       # from agent-ui, but stripped
│   │   ├── Canvas.tsx    (rewritten)
│   │   └── ConnectionStatus.tsx
│   ├── hooks/            # WebSocket hook
│   ├── types/
│   └── App.tsx
├── package.json          (downgraded to minimal)
└── README.md
```

---

## 🔄 Future Enhancements (Post-MVP)

- Add simple controls (pause, step, reset) via a control channel to CudaClaw.
- Show agent details on hover.
- Support different visualizations (heatmap, connections).
- Allow multiple simultaneous connections (collaborative viewing).
- Export screenshots/video.

---

## ✅ Validation: MVP Checklist

- [ ] Connects to a WebSocket endpoint.
- [ ] Parses binary agent data correctly.
- [ ] Renders 10,000+ agents at 60 FPS.
- [ ] Handles disconnections gracefully.
- [ ] Runs as a static site (no build step beyond `npm run build`).
- [ ] README explains how to run and connect.

---

## 📦 Next Steps

1. **Implement the WebSocket broadcaster** in CudaClaw (simple addition).
2. **Build ClawCanvas** with the code above.
3. **Test locally** with CudaClaw running and sending data.
4. **Deploy** a public demo instance and announce.

This MVP will clearly demonstrate your technology and give potential users an immediate, visual understanding of what CudaClaw can do.

Would you like me to expand any section, provide the full code for the WebSocket server in CudaClaw, or write the `README.md` for ClawCanvas?