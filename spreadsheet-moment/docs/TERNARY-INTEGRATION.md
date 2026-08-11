# Ternary Integration: Spreadsheet Moment

> How the Univer-based spreadsheet UI renders and interacts with the ternary world model.

## Overview

Spreadsheet Moment is built on [Univer](https://github.com/dream-num/univer) — a modern, open-source spreadsheet engine with React UI components. This document describes how ternary concepts appear in the spreadsheet interface, making the world model tangible and interactive.

---

## 1. Rendering the World Model

### Cell Values → Ternary Display

Each ternary cell has a value in {−1, 0, +1}. In the Univer UI, this maps to:

| Trit Value | Display | Color (conditional format) |
|---|---|---|
| −1 (Negative) | `-` or `−1` | 🔵 Blue |
| 0 (Neutral) | `0` or empty | ⬜ White/Gray |
| +1 (Positive) | `+` or `+1` | 🔴 Red |

### Fitness Heatmap

The `fitness_heatmap` from `ternary-spreadsheet` maps to conditional formatting:

```
High fitness (>0.5)  → 🔴 Red background (hot)
Medium fitness        → 🟡 Yellow background (warm)
Low fitness (<0)      → 🔵 Blue background (cold)
No fitness (0)        → ⬜ White background (dead)
```

### Univer Custom Renderer

```typescript
// packages/agent-ui/src/ternary-renderer.ts

import type { ICellRenderer } from '@univerjs/core';

/**
 * Custom cell renderer for ternary values.
 * Displays -1, 0, +1 with fitness-based background colors.
 */
export class TernaryCellRenderer implements ICellRenderer {
  render(cell: SpreadsheetCell): CellStyle {
    const value = this.toTernary(cell.value);
    const fitness = cell.fitness ?? 0;

    return {
      value: this.formatTernary(value),
      style: {
        bg: this.fitnessColor(fitness),
        // Bold for high-surprise cells
        bold: Math.abs(cell.surprise ?? 0) > 0.5,
      },
    };
  }

  private toTernary(raw: number): -1 | 0 | 1 {
    if (raw < -0.33) return -1;
    if (raw > 0.33) return 1;
    return 0;
  }

  private formatTernary(v: -1 | 0 | 1): string {
    switch (v) {
      case -1: return '−';
      case 0: return '0';
      case 1: return '+';
    }
  }

  private fitnessColor(fitness: number): string {
    if (fitness > 0.5) return '#ff6b6b'; // hot
    if (fitness > 0) return '#ffd93d';   // warm
    if (fitness < 0) return '#6bc5ff';   // cold
    return '#f0f0f0';                     // dead
  }
}
```

---

## 2. Ternary Formulas in the Spreadsheet

### Built-in Ternary Functions

The `ternary-spreadsheet` formula engine provides these functions. They appear in the Univer formula bar just like any spreadsheet function:

```
=EVOLVE(A1:C50, 100)     → Run 100 generations of evolution on cells A1:C50
=BEST(A1:A10)             → Return highest fitness in range
=SPECIES(A1:A10)          → Count distinct species (sign clusters)
=EXHAUSTIVE(A1:C3)        → Try all 3^9 combinations, return best
=ENTROPY(A1:D10)          → Shannon entropy of ternary distribution
=SUM(A1:J10)              → Sum of ternary values
=AVG(A1:J10)              → Average of ternary values
=COUNT(A1:J10)            → Count of cells
```

### Univer Formula Plugin

```typescript
// packages/agent-formulas/src/ternary-functions.ts

import type { IFunctionPlugin } from '@univerjs/engine-formula';

/**
 * Register ternary formula functions with the Univer engine.
 */
export class TernaryFormulaPlugin implements IFunctionPlugin {
  register(registry: FunctionRegistry): void {
    registry.register('EVOLVE', {
      description: 'Run evolutionary simulation on a cell range',
      args: [
        { name: 'range', type: 'range', description: 'Cell population' },
        { name: 'generations', type: 'number', description: 'Number of generations' },
      ],
      returns: 'number',
      execute: (args, context) => {
        const [range, generations] = args;
        const cells = context.getRangeCells(range);
        const result = evolvePopulation(cells, generations);
        // Apply results back to grid
        context.setRangeCells(range, result.cells);
        return result.bestFitness;
      },
    });

    registry.register('ENTROPY', {
      description: 'Compute Shannon entropy of ternary values in range',
      args: [{ name: 'range', type: 'range' }],
      returns: 'number',
      execute: (args, context) => {
        const cells = context.getRangeCells(args[0]);
        return computeEntropy(cells);
      },
    });

    registry.register('SPECIES', {
      description: 'Count distinct species (sign clusters) in range',
      args: [{ name: 'range', type: 'range' }],
      returns: 'number',
      execute: (args, context) => {
        const cells = context.getRangeCells(args[0]);
        return countSpecies(cells);
      },
    });
  }
}
```

### What Each Formula Looks Like in the UI

When a user types `=EVOLVE(A1:C50, 100)`:

1. **Before**: Range A1:C50 shows initial ternary values (random or user-set)
2. **During**: Cells flash as generations run (each recalculation = 1 generation)
3. **After**: Range shows evolved values. The formula cell shows best fitness.
4. **Formatting**: Cells colored by fitness (red = high, blue = low)

---

## 3. The 6-Phase Tick as Cell Recalculation

The ternary-cell tick cycle manifests as visible spreadsheet recalculation:

### Phase-by-Phase UI

| Phase | Tick Name | What the User Sees |
|---|---|---|
| 1 | **predict** | Cells show their *expected* values (dimmed/italic) |
| 2 | **perceive** | Formulas evaluate, values snap to actual (bold) |
| 3 | **surprise** | Cells that changed get highlighted (yellow border) |
| 4 | **vibe** | Background colors update based on new fitness |
| 5 | **gc** | Low-fitness cells fade to gray (pruned) |
| 6 | **conservation** | Status bar shows "Conserved ✓" or "VIOLATED ✗" |

### Status Bar Integration

```typescript
// packages/agent-ui/src/tick-status.tsx

import React from 'react';

interface TickPhase {
  name: string;
  icon: string;
  active: boolean;
}

const PHASES: TickPhase[] = [
  { name: 'Predict', icon: '🔮', active: false },
  { name: 'Perceive', icon: '👁', active: false },
  { name: 'Surprise', icon: '⚡', active: false },
  { name: 'Vibe', icon: '🎨', active: false },
  { name: 'GC', icon: '🗑', active: false },
  { name: 'Conserve', icon: '⚖️', active: false },
];

export const TickStatusBar: React.FC<{ currentPhase: number }> = ({ currentPhase }) => (
  <div className="tick-status-bar">
    {PHASES.map((phase, i) => (
      <span
        key={phase.name}
        className={`phase ${i === currentPhase ? 'active' : ''} ${i < currentPhase ? 'done' : ''}`}
      >
        {phase.icon} {phase.name}
      </span>
    ))}
    <span className="tick-divider">|</span>
    <span className="tick-count">Tick: {currentPhase / 6}</span>
  </div>
);
```

### Recalculation Animation

```typescript
// packages/agent-ui/src/recalc-animation.ts

/**
 * Animate a tick cycle across the visible grid.
 * Each phase takes ~100ms for visual clarity.
 */
export async function animateTick(
  grid: UniverGrid,
  phase: number,
  duration = 100
): Promise<void> {
  switch (phase % 6) {
    case 0: // predict — dim cells
      grid.forEachCell(cell => {
        cell.setStyle({ opacity: 0.5, fontStyle: 'italic' });
      });
      break;

    case 1: // perceive — snap to actual
      grid.forEachCell(cell => {
        cell.setStyle({ opacity: 1.0, fontStyle: 'normal', fontWeight: 'bold' });
        cell.recalculate();
      });
      break;

    case 2: // surprise — highlight changed cells
      grid.forEachCell(cell => {
        if (cell.surprise > 0.5) {
          cell.setStyle({ border: '2px solid yellow' });
        }
      });
      break;

    case 3: // vibe — update colors
      grid.forEachCell(cell => {
        cell.setStyle({
          backgroundColor: fitnessColor(cell.fitness),
          border: 'none',
        });
      });
      break;

    case 4: // gc — fade low-fitness cells
      grid.forEachCell(cell => {
        if (cell.fitness < 0) {
          cell.setStyle({ opacity: 0.3 });
        }
      });
      break;

    case 5: // conservation — status update
      const conserved = grid.checkConservation();
      grid.emit('conservation-check', conserved);
      break;
  }

  await sleep(duration);
}
```

---

## 4. Demo: A Living Spreadsheet Where Cells Evolve

### Concept

A fully interactive spreadsheet where:
1. Cells start with random ternary values
2. Each tick, cells predict, perceive, and adapt
3. `=EVOLVE()` runs natural selection
4. The UI shows evolution in real-time with color and animation
5. Users can interact: set values, trigger evolution, observe species emergence

### Demo Script

```typescript
// packages/agent-ui/src/demo/living-spreadsheet.tsx

import React, { useEffect, useState } from 'react';

export const LivingSpreadsheetDemo: React.FC = () => {
  const [tick, setTick] = useState(0);
  const [phase, setPhase] = useState(0);
  const [running, setRunning] = useState(false);
  const [conservation, setConservation] = useState(true);

  // Main evolution loop
  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      setPhase(p => {
        const next = (p + 1) % 6;
        if (next === 0) setTick(t => t + 1);
        return next;
      });
    }, 100); // 6 phases × 100ms = 600ms per tick

    return () => clearInterval(interval);
  }, [running]);

  return (
    <div className="living-spreadsheet">
      <header>
        <h1>🧬 Living Spreadsheet</h1>
        <div className="controls">
          <button onClick={() => setRunning(!running)}>
            {running ? '⏸ Pause' : '▶ Play'}
          </button>
          <button onClick={() => {/* trigger =EVOLVE() */}}>
            🧬 Evolve
          </button>
          <button onClick={() => {/* reset grid */}}>
            🔄 Reset
          </button>
        </div>
      </header>

      {/* Phase indicator */}
      <TickStatusBar currentPhase={phase} />

      {/* The spreadsheet grid */}
      <UniverSpreadsheet
        gridId="living-grid"
        rows={50}
        cols={26}
        cellRenderer={new TernaryCellRenderer()}
        onCellChange={(row, col, value) => {
          // User manually changes a cell value
          // Triggers conservation compensation
        }}
      />

      {/* Status */}
      <footer>
        <span>Tick: {tick}</span>
        <span>Phase: {PHASE_NAMES[phase]}</span>
        <span>
          Conservation: {conservation ? '✅ Maintained' : '❌ Violated'}
        </span>
      </footer>
    </div>
  );
};

const PHASE_NAMES = ['Predict', 'Perceive', 'Surprise', 'Vibe', 'GC', 'Conserve'];
```

### What the User Experiences

1. **Open the spreadsheet** → 50×26 grid of ternary cells, all neutral
2. **Click "▶ Play"** → Cells begin ticking. Values change, colors shift.
3. **Watch the phases** → Status bar shows predict → perceive → surprise → vibe → gc → conserve cycling
4. **See species emerge** → Clusters of same-sign cells form (blue regions, red regions)
5. **Click "🧬 Evolve"** → `=EVOLVE()` runs 100 generations. Cells adapt. Best fitness appears.
6. **Set a cell manually** → Change A1 to +1. B1 auto-adjusts to −1 (conservation).
7. **Watch adaptation** → The grid reorganizes around your change. Species boundaries shift.
8. **Check entropy** → Type `=ENTROPY(A1:Z50)` to see if the system is ordered or chaotic.

### Expected Behaviors

| Observation | Why It Happens |
|---|---|
| Cells form clusters | Evolution favors cooperation; same-sign neighbors support each other |
| Clusters compete | Resources (energy budget) are finite; species compete for fitness |
| Sorting reorganizes the grid | `sort_by_fitness()` is natural selection in action |
| Manual changes cascade | Conservation law propagates changes to neighbors |
| Entropy decreases over time | Evolution creates order from chaos (lower entropy) |
| GC removes dead cells | Low-fitness cells are pruned, freeing energy for survivors |

---

## 5. Integration Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Spreadsheet Moment                      │
│                    (Univer + React)                        │
├──────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────┐    ┌──────────────┐    ┌────────────┐  │
│  │  Ternary      │    │  Formula     │    │  Tick      │  │
│  │  Renderer     │    │  Plugin      │    │  Controller│  │
│  │  (UI colors)  │    │  (=EVOLVE)   │    │  (6-phase) │  │
│  └──────┬───────┘    └──────┬───────┘    └──────┬─────┘  │
│         │                    │                    │         │
│         ▼                    ▼                    ▼         │
│  ┌──────────────────────────────────────────────────────┐ │
│  │              Ternary Bridge Layer                     │ │
│  │   TypeScript ↔ Rust (via WASM or HTTP API)           │ │
│  └──────────────────────────┬───────────────────────────┘ │
│                              │                              │
└──────────────────────────────┼──────────────────────────────┘
                               │
           ┌───────────────────┼───────────────────┐
           ▼                   ▼                   ▼
   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
   │ ternary-     │   │ ternary-     │   │ ternary-     │
   │ spreadsheet  │   │ world        │   │ cell         │
   │ (Grid, Cell, │   │ (WorldGrid,  │   │ (6-phase     │
   │  Formula)    │   │  Physics)    │   │  tick)       │
   └──────────────┘   └──────────────┘   └──────────────┘
```

### Bridge Options

**Option A: WASM (Recommended for single-user)**

```bash
wasm-pack build --target web ../ternary-spreadsheet
# → Generates JS bindings for Grid, FormulaEngine, etc.
# → Called directly from browser, no server needed
```

**Option B: HTTP API (For multi-user / DGX backends)**

```typescript
// packages/agent-core/src/ternary-api.ts
const response = await fetch('/api/evolve', {
  method: 'POST',
  body: JSON.stringify({
    range: 'A1:C50',
    generations: 100,
    grid_state: currentGridState,
  }),
});
const { best_fitness, grid_state } = await response.json();
```

---

## 6. Next Steps

1. **WASM bridge**: Compile `ternary-spreadsheet` to WASM for direct browser use
2. **Custom Univer plugin**: Register `EVOLVE`, `ENTROPY`, `SPECIES` as native formulas
3. **Tick animation**: Implement the 6-phase visual cycle in the UI
4. **WebSocket sync**: For multi-user evolution sessions
5. **Snapshot export**: Save/load world states as spreadsheet files
6. **Heatmap mode**: Toggle between value view and fitness view
7. **Species tracker**: Chart species count over time
8. **Conservation monitor**: Real-time display of conservation law status
