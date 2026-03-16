# Cell-First Architecture - Detailed Design Specifications

**Date:** 2026-03-16
**Architect:** R&D Architecture Researcher
**Status:** READY FOR IMPLEMENTATION
**Based On:** MINIMAL_AGENT_ARCHITECTURES.md

---

## Overview

This document provides detailed design specifications for the **Cell-First Actor Model** architecture recommended in the research report. It specifies module breakdown, core abstractions, integration points, and implementation details.

**Target Implementation:** ~400 lines total
**Development Time:** 13 days
**Risk:** Very Low (5% failure probability)

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Core Abstractions](#core-abstractions)
3. [Module Breakdown](#module-breakdown)
4. [Integration Points](#integration-points)
5. [Data Flow](#data-flow)
6. [Error Handling](#error-handling)
7. [Performance Optimization](#performance-optimization)
8. [Testing Strategy](#testing-strategy)
9. [Deployment](#deployment)

---

## Architecture Overview

### Design Philosophy

**Cell as First-Class Citizen**
```
Traditional: Application → Gateway → Agent → Cell
Cell-First:  Cell → Actor → Equipment → Model
```

**Key Principles:**

1. **Isolation:** Each cell is an independent actor
2. **Message-Driven:** All communication via messages
3. **Stateless Core:** Actor framework is stateless
4. **State Per Cell:** Each cell owns its state
5. **Dynamic Equipment:** Equipment loads/unloads on demand

### Architecture Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                     SPREADSHEET LAYER                          │
│                                                                 │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐           │
│  │  Cell   │  │  Cell   │  │  Cell   │  │  Cell   │           │
│  │   A1    │  │   B2    │  │   C3    │  │   D4    │           │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘           │
│       │            │            │            │                  │
└───────┼────────────┼────────────┼────────────┼──────────────────┘
        │            │            │            │
        │ Cell Messages (TRIGGER, CANCEL, QUERY)
        │            │            │            │
┌───────┼────────────┼────────────┼────────────┼──────────────────┐
│       ↓            ↓            ↓            ↓                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    ACTOR FRAMEWORK                       │  │
│  │                                                          │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │  │
│  │  │  Actor   │  │  Actor   │  │  Actor   │  │  Actor   │  │  │
│  │  │   A1     │  │   B2     │  │   C3     │  │   D4     │  │  │
│  │  │          │  │          │  │          │  │          │  │  │
│  │  │ ┌──────┐ │  │ ┌──────┐ │  │ ┌──────┐ │  │ ┌──────┐ │  │  │
│  │  │ │Mailbox│ │  │ │Mailbox│ │  │ │Mailbox│ │  │ │Mailbox│ │  │  │
│  │  │ └──────┘ │  │ └──────┘ │  │ └──────┘ │  │ └──────┘ │  │  │
│  │  │          │  │          │  │          │  │          │  │  │
│  │  │ ┌──────┐ │  │ ┌──────┐ │  │ ┌──────┐ │  │ ┌──────┐ │  │  │
│  │  │ │State │ │  │ │State │ │  │ │State │ │  │ │State │ │  │  │
│  │  │ │Machine│ │  │ │Machine│ │  │ │Machine│ │  │ │Machine│ │  │  │
│  │  │ └──────┘ │  │ └──────┘ │  │ └──────┘ │  │ └──────┘ │  │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ↓                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                 EQUIPMENT REGISTRY                       │  │
│  │                                                          │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │  │
│  │  │ MEMORY   │  │REASONING │  │CONSENSUS │  │SPREADSHEET│  │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │  │
│  │  │DISTILL   │  │COORDINATE│  │CUSTOM    │  │CUSTOM    │  │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ↓                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   MODEL LAYER                            │  │
│  │                                                          │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │  │
│  │  │ OpenAI   │  │Anthropic │  │ DeepSeek │  │ Google   │  │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## Core Abstractions

### 1. Actor Abstraction

**Purpose:** Represent each spreadsheet cell as an independent actor

```typescript
/**
 * CellActor - Core abstraction for cellular agents
 *
 * Responsibilities:
 * - Receive messages (cell data changes)
 * - Manage execution state
 * - Load/unload equipment
 * - Execute model inference
 * - Update cell values
 */
export interface CellActor {
  // Identity
  readonly id: string;                    // Cell coordinate (A1, B2, etc.)

  // Lifecycle
  spawn(): Promise<void>;                 // Initialize actor
  terminate(): Promise<void>;             // Cleanup and shutdown

  // Communication
  receive(message: Message): Promise<Response>;  // Receive message
  respond(result: Result): Promise<void>;        // Send response

  // State
  readonly state: ActorState;             // Current state
  readonly stats: ActorStats;             // Performance stats
}
```

**State Machine:**
```
IDLE → PROCESSING → RESPONDING → IDLE
  ↓                                ↓
ERROR ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ←
```

### 2. Message Abstraction

**Purpose:** Define communication protocol between spreadsheet and actors

```typescript
/**
 * Message - Communication protocol
 */
export interface Message {
  // Message type
  type: MessageType;                     // TRIGGER, CANCEL, QUERY

  // Source
  cellId: string;                        // Source cell coordinate

  // Payload
  data: any;                             // Cell data/value

  // Metadata
  timestamp: number;                     // Message timestamp
  id: string;                            // Unique message ID
  correlationId?: string;                // For request/response
}

export enum MessageType {
  TRIGGER = 'TRIGGER',                   // Cell data changed
  CANCEL = 'CANCEL',                     // Cancel execution
  QUERY = 'QUERY'                        // Query actor state
}
```

### 3. Equipment Abstraction

**Purpose:** Define modular capability system

```typescript
/**
 * Equipment - Modular capability
 *
 * Equipment dynamically loads/unloads based on claw needs.
 * When unloaded, extracts "muscle memory" (triggers for re-equip).
 */
export interface Equipment {
  // Identity
  readonly id: string;                   // Equipment ID
  readonly type: EquipmentType;          // Equipment type
  readonly version: string;              // Semver version

  // Lifecycle
  load(): Promise<void>;                 // Load equipment
  execute(context: ExecutionContext): Promise<any>;  // Execute
  unload(): Promise<MuscleMemory>;       // Unload and extract memory

  // Validation
  validate(): boolean;                   // Validate configuration
  isLoaded(): boolean;                   // Check if loaded
}

export enum EquipmentType {
  MEMORY = 'MEMORY',                     // State persistence
  REASONING = 'REASONING',               // Decision making
  CONSENSUS = 'CONSENSUS',               // Multi-claw agreement
  SPREADSHEET = 'SPREADSHEET',           // Cell integration
  DISTILLATION = 'DISTILLATION',         // Model compression
  COORDINATION = 'COORDINATION'          // Multi-claw orchestration
}
```

### 4. Model Abstraction

**Purpose:** Abstract model provider interface

```typescript
/**
 * Model - AI model abstraction
 */
export interface Model {
  // Identity
  readonly id: string;                   // Model ID
  readonly provider: ModelProvider;      // Provider
  readonly name: string;                 // Model name

  // Execution
  execute(
    data: any,
    options: ExecutionOptions
  ): Promise<ModelResult>;               // One-shot execution

  stream(
    data: any,
    options: ExecutionOptions
  ): AsyncIterable<ModelResult>;         // Streaming execution
}

export enum ModelProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  DEEPSEEK = 'deepseek',
  GOOGLE = 'google',
  MISTRAL = 'mistral',
  OLLAMA = 'ollama'
}
```

---

## Module Breakdown

### Module 1: Core Actor System (~200 lines)

**File:** `src/core/actor.ts`

**Responsibilities:**
- Implement CellActor class
- Manage message mailbox
- Implement state machine
- Handle lifecycle (spawn, terminate)

**Dependencies:**
- None (core module)

**API:**
```typescript
export class CellActor extends EventEmitter {
  constructor(
    id: string,
    config: ClawConfig,
    model: Model,
    equipmentRegistry: EquipmentRegistry
  )

  // Communication
  async receive(message: Message): Promise<Response>

  // Lifecycle
  async terminate(): Promise<void>

  // State
  get currentState(): ActorState
  get stats(): ActorStats
}

export enum ActorState {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  RESPONDING = 'RESPONDING',
  ERROR = 'ERROR'
}
```

**Implementation Outline:**
```typescript
class CellActor extends EventEmitter {
  private state: ActorState = ActorState.IDLE
  private mailbox: Message[] = []
  private equipment: Map<string, Equipment> = new Map()
  private processing: boolean = false

  async receive(message: Message): Promise<Response> {
    // Add to mailbox
    this.mailbox.push(message)

    // Start processing if idle
    if (this.state === ActorState.IDLE && !this.processing) {
      this.processing = true
      setImmediate(() => this.process())
    }

    return { status: 'QUEUED', cellId: this.id, timestamp: Date.now() }
  }

  private async process(): Promise<void> {
    this.state = ActorState.PROCESSING
    this.emit('stateChanged', this.state)

    while (this.mailbox.length > 0) {
      const message = this.mailbox.shift()!
      const result = await this.execute(message)
      await this.respond(result)
    }

    this.state = ActorState.IDLE
    this.processing = false
  }

  private async execute(message: Message): Promise<any> {
    // Load equipment
    await this.loadEquipment()

    // Execute model
    const result = await this.model.execute(message.data, {
      equipment: Array.from(this.equipment.values()),
      context: { cellId: this.id, timestamp: message.timestamp }
    })

    // Extract muscle memory
    await this.extractMuscleMemory()

    return result
  }

  private async loadEquipment(): Promise<void> {
    // Load equipment from config
  }

  private async extractMuscleMemory(): Promise<void> {
    // Extract muscle memory from equipment
  }

  private async respond(result: any): Promise<void> {
    this.state = ActorState.RESPONDING
    this.emit('response', { cellId: this.id, data: result })
    this.state = ActorState.IDLE
  }

  async terminate(): Promise<void> {
    // Unload all equipment
    // Cleanup state
  }
}
```

### Module 2: Equipment Registry (~100 lines)

**File:** `src/equipment/registry.ts`

**Responsibilities:**
- Register equipment types
- Load/unload equipment
- Manage equipment lifecycle
- Extract muscle memory

**Dependencies:**
- `src/equipment/equipment.ts` (equipment interface)

**API:**
```typescript
export class EquipmentRegistry {
  register(equipment: Equipment): void
  async load(equipmentId: string): Promise<Equipment>
  async unload(equipmentId: string): Promise<MuscleMemory>
  getAvailable(): Equipment[]
  getLoaded(): Equipment[]
}
```

**Implementation Outline:**
```typescript
class EquipmentRegistry {
  private equipment: Map<string, Equipment> = new Map()
  private loaded: Set<string> = new Set()

  register(equipment: Equipment): void {
    this.equipment.set(equipment.id, equipment)
  }

  async load(equipmentId: string): Promise<Equipment> {
    const equipment = this.equipment.get(equipmentId)
    if (!equipment) {
      throw new Error(`Equipment not found: ${equipmentId}`)
    }

    if (!this.loaded.has(equipmentId)) {
      await equipment.load()
      this.loaded.add(equipmentId)
    }

    return equipment
  }

  async unload(equipmentId: string): Promise<MuscleMemory> {
    const equipment = this.equipment.get(equipmentId)
    if (!equipment || !this.loaded.has(equipmentId)) {
      throw new Error(`Equipment not loaded: ${equipmentId}`)
    }

    const memory = await equipment.unload()
    this.loaded.delete(equipmentId)

    return memory
  }

  getAvailable(): Equipment[] {
    return Array.from(this.equipment.values())
  }

  getLoaded(): Equipment[] {
    return Array.from(this.loaded.values())
      .map(id => this.equipment.get(id)!)
  }
}
```

### Module 3: Cell Integration (~100 lines)

**File:** `src/integration/cell.ts`

**Responsibilities:**
- Integrate with spreadsheet API
- Subscribe to cell changes
- Update cell values
- Manage actor lifecycle

**Dependencies:**
- `src/core/actor.ts` (CellActor)
- `src/equipment/registry.ts` (EquipmentRegistry)

**API:**
```typescript
export class CellIntegration {
  constructor(
    spreadsheet: SpreadsheetAPI,
    equipmentRegistry: EquipmentRegistry
  )

  subscribe(cellId: string, config: ClawConfig): void
  unsubscribe(cellId: string): void
  async updateCell(cellId: string, result: Result): Promise<void>
  async getState(cellId: string): Promise<CellState>
}
```

**Implementation Outline:**
```typescript
class CellIntegration {
  private actors: Map<string, CellActor> = new Map()

  constructor(
    private spreadsheet: SpreadsheetAPI,
    private equipmentRegistry: EquipmentRegistry
  ) {}

  subscribe(cellId: string, config: ClawConfig): void {
    // Create actor
    const actor = new CellActor(
      cellId,
      config,
      config.model,
      this.equipmentRegistry
    )

    this.actors.set(cellId, actor)

    // Listen for cell changes
    this.spreadsheet.onCellChange(cellId, async (data) => {
      await actor.receive({
        type: MessageType.TRIGGER,
        cellId,
        data,
        timestamp: Date.now(),
        id: generateId()
      })
    })

    // Listen for responses
    actor.on('response', async (response) => {
      await this.updateCell(response.cellId, response.data)
    })
  }

  unsubscribe(cellId: string): void {
    const actor = this.actors.get(cellId)
    if (actor) {
      actor.terminate()
      this.actors.delete(cellId)
    }

    this.spreadsheet.offCellChange(cellId)
  }

  async updateCell(cellId: string, result: Result): Promise<void> {
    await this.spreadsheet.setCell(cellId, result.data)
  }

  async getState(cellId: string): Promise<CellState> {
    const actor = this.actors.get(cellId)
    if (!actor) {
      throw new Error(`Actor not found: ${cellId}`)
    }

    return {
      cellId,
      state: actor.currentState,
      stats: actor.stats
    }
  }
}
```

---

## Integration Points

### 1. Spreadsheet Integration

**Interface:**
```typescript
/**
 * SpreadsheetAPI - Integration point with spreadsheet
 */
export interface SpreadsheetAPI {
  // Events
  onCellChange(cellId: string, callback: (data: any) => void): void
  offCellChange(cellId: string): void

  // Operations
  setCell(cellId: string, value: any): Promise<void>
  getCell(cellId: string): Promise<any>
  getCellRange(range: string): Promise<any[][]>
}
```

**Implementation (Univer):**
```typescript
class UniverSheet implements SpreadsheetAPI {
  constructor(private univer: UniverAPI) {}

  onCellChange(cellId: string, callback: (data: any) => void): void {
    const [row, col] = this.parseCellId(cellId)
    this.univer.registerListener(row, col, callback)
  }

  offCellChange(cellId: string): void {
    const [row, col] = this.parseCellId(cellId)
    this.univer.unregisterListener(row, col)
  }

  async setCell(cellId: string, value: any): Promise<void> {
    const [row, col] = this.parseCellId(cellId)
    this.univer.setValue(row, col, value)
  }

  async getCell(cellId: string): Promise<any> {
    const [row, col] = this.parseCellId(cellId)
    return this.univer.getValue(row, col)
  }

  private parseCellId(cellId: string): [number, number] {
    // Parse "A1" → [0, 0]
    const col = cellId.charCodeAt(0) - 65  // A → 0
    const row = parseInt(cellId.slice(1)) - 1  // 1 → 0
    return [row, col]
  }
}
```

### 2. Model Provider Integration

**Interface:**
```typescript
/**
 * ModelProviderAPI - Integration point with model providers
 */
export interface ModelProviderAPI {
  execute(model: string, data: any): Promise<ModelResult>
  stream(model: string, data: any): AsyncIterable<ModelResult>
}
```

**Implementation (OpenAI):**
```typescript
class OpenAIProvider implements ModelProviderAPI {
  constructor(private client: OpenAI) {}

  async execute(model: string, data: any): Promise<ModelResult> {
    const start = Date.now()

    const response = await this.client.chat.completions.create({
      model,
      messages: [{ role: 'user', content: JSON.stringify(data) }]
    })

    const latency = Date.now() - start

    return {
      content: response.choices[0].message.content || '',
      metadata: {
        tokensUsed: response.usage.total_tokens,
        latency,
        model: response.model
      }
    }
  }

  async *stream(model: string, data: any): AsyncIterable<ModelResult> {
    const stream = await this.client.chat.completions.create({
      model,
      messages: [{ role: 'user', content: JSON.stringify(data) }],
      stream: true
    })

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || ''
      if (content) {
        yield {
          content,
          metadata: {
            tokensUsed: 0,
            latency: 0,
            model
          }
        }
      }
    }
  }
}
```

### 3. Equipment Integration

**Built-in Equipment:**

**1. Memory Equipment**
```typescript
class MemoryEquipment implements Equipment {
  readonly id = 'MEMORY'
  readonly type = EquipmentType.MEMORY
  readonly version = '1.0.0'

  private storage: Map<string, any> = new Map()

  async load(): Promise<void> {
    // Initialize memory storage
  }

  async execute(context: ExecutionContext): Promise<any> {
    // Store/retrieve from memory
    const { cellId } = context
    return this.storage.get(cellId)
  }

  async unload(): Promise<MuscleMemory> {
    // Extract frequently accessed keys as triggers
    return {
      equipmentId: this.id,
      triggers: [],
      extractedAt: Date.now()
    }
  }

  validate(): boolean {
    return true
  }

  isLoaded(): boolean {
    return true
  }
}
```

**2. Reasoning Equipment**
```typescript
class ReasoningEquipment implements Equipment {
  readonly id = 'REASONING'
  readonly type = EquipmentType.REASONING
  readonly version = '1.0.0'

  async load(): Promise<void> {
    // Initialize reasoning engine
  }

  async execute(context: ExecutionContext): Promise<any> {
    // Apply reasoning logic
    return { reasoning: 'Applied logic chain' }
  }

  async unload(): Promise<MuscleMemory> {
    return {
      equipmentId: this.id,
      triggers: [
        {
          condition: 'complex_decision_required',
          confidence: 0.95,
          lastUsed: Date.now()
        }
      ],
      extractedAt: Date.now()
    }
  }

  validate(): boolean {
    return true
  }

  isLoaded(): boolean {
    return true
  }
}
```

---

## Data Flow

### 1. Normal Execution Flow

```
User edits cell A1
        ↓
Spreadsheet detects change
        ↓
CellIntegration.onCellChange('A1', data)
        ↓
CellActor.receive({
  type: 'TRIGGER',
  cellId: 'A1',
  data: newValue,
  timestamp: Date.now()
})
        ↓
[Actor State: IDLE → PROCESSING]
        ↓
CellActor.loadEquipment()
  - Load MEMORY equipment
  - Load REASONING equipment
        ↓
CellActor.execute(message)
  - model.execute(data, {
      equipment: [MEMORY, REASONING],
      context: { cellId: 'A1', timestamp }
    })
        ↓
Model processes with equipment
        ↓
CellActor.extractMuscleMemory()
  - Extract triggers from MEMORY
  - Extract triggers from REASONING
        ↓
CellActor.respond(result)
        ↓
[Actor State: PROCESSING → RESPONDING → IDLE]
        ↓
CellIntegration.updateCell('A1', result)
        ↓
Spreadsheet displays result
```

### 2. Error Handling Flow

```
Error occurs during execution
        ↓
CellActor.execute() throws
        ↓
[Actor State: PROCESSING → ERROR]
        ↓
CellActor.handleError(error, message)
        ↓
Emit 'error' event
        ↓
CellIntegration handles error
  - Log error
  - Update cell with error message
  - Optionally retry
        ↓
[Actor State: ERROR → IDLE]
```

### 3. Cancellation Flow

```
User cancels execution
        ↓
CellActor.receive({
  type: 'CANCEL',
  cellId: 'A1',
  data: null,
  timestamp: Date.now()
})
        ↓
Check if currently processing
        ↓
If processing:
  - Abort current operation
  - Cleanup equipment
  - Clear mailbox
  - [Actor State: PROCESSING → IDLE]
        ↓
Return cancellation confirmation
```

---

## Error Handling

### Error Categories

**1. Transient Errors** (Retry)
```typescript
class TransientError extends Error {
  constructor(message: string, public retryAfter: number) {
    super(message)
    this.name = 'TransientError'
  }
}

// Example: Rate limit, network timeout
```

**2. Permanent Errors** (No Retry)
```typescript
class PermanentError extends Error {
  constructor(message: string, public code: string) {
    super(message)
    this.name = 'PermanentError'
  }
}

// Example: Invalid configuration, missing equipment
```

**3. Timeout Errors** (Abort)
```typescript
class TimeoutError extends Error {
  constructor(message: string, public timeout: number) {
    super(message)
    this.name = 'TimeoutError'
  }
}

// Example: Model execution timeout
```

### Error Handling Strategy

```typescript
class CellActor extends EventEmitter {
  private async execute(message: Message): Promise<any> {
    try {
      // Load equipment
      await this.loadEquipment()

      // Execute with timeout
      const result = await this.withTimeout(
        this.model.execute(message.data, {
          equipment: Array.from(this.equipment.values()),
          context: { cellId: this.id, timestamp: message.timestamp }
        }),
        30000  // 30 second timeout
      )

      return result

    } catch (error) {
      if (error instanceof TimeoutError) {
        // Abort and return timeout
        this.emit('timeout', { cellId: this.id, timeout: error.timeout })
        throw error

      } else if (error instanceof TransientError) {
        // Retry with exponential backoff
        await this.retry(message, error.retryAfter)
        return

      } else if (error instanceof PermanentError) {
        // Log and fail
        this.emit('error', { error, message })
        throw error

      } else {
        // Unknown error
        this.emit('error', { error, message })
        throw new PermanentError(error.message, 'UNKNOWN')
      }
    }
  }

  private async withTimeout<T>(
    promise: Promise<T>,
    timeout: number
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new TimeoutError('Execution timeout', timeout)), timeout)
      )
    ])
  }

  private async retry(message: Message, retryAfter: number): Promise<void> {
    const delay = Math.min(retryAfter * Math.pow(2, this.retryCount), 60000)
    await new Promise(resolve => setTimeout(resolve, delay))
    this.retryCount++
    return this.execute(message)
  }
}
```

---

## Performance Optimization

### 1. Equipment Caching

```typescript
class EquipmentRegistry {
  private cache: Map<string, Equipment> = new Map()

  async load(equipmentId: string): Promise<Equipment> {
    // Check cache first
    if (this.cache.has(equipmentId)) {
      return this.cache.get(equipmentId)!
    }

    // Load equipment
    const equipment = await this.loadEquipment(equipmentId)

    // Cache it
    this.cache.set(equipmentId, equipment)

    return equipment
  }
}
```

### 2. Message Batching

```typescript
class CellActor extends EventEmitter {
  private mailbox: Message[] = []
  private batchTimer?: NodeJS.Timeout
  private batchSize: number = 10
  private batchTimeout: number = 100  // ms

  async receive(message: Message): Promise<Response> {
    this.mailbox.push(message)

    // Start batch timer if not already running
    if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => {
        this.processBatch()
      }, this.batchTimeout)
    }

    // Process immediately if batch size reached
    if (this.mailbox.length >= this.batchSize) {
      clearTimeout(this.batchTimer)
      this.batchTimer = undefined
      return this.processBatch()
    }

    return { status: 'QUEUED', cellId: this.id, timestamp: Date.now() }
  }

  private async processBatch(): Promise<Response> {
    const batch = this.mailbox.splice(0, this.batchSize)

    // Process batch
    const results = await Promise.all(
      batch.map(message => this.execute(message))
    )

    return { status: 'COMPLETE', cellId: this.id, data: results }
  }
}
```

### 3. Lazy Equipment Loading

```typescript
class CellActor extends EventEmitter {
  private equipment: Map<string, Equipment> = new Map()

  private async loadEquipment(): Promise<void> {
    // Load only required equipment
    for (const eqId of this.config.equipment) {
      if (!this.equipment.has(eqId)) {
        const equipment = await this.equipmentRegistry.load(eqId)
        this.equipment.set(eqId, equipment)
      }
    }
  }
}
```

---

## Testing Strategy

### 1. Unit Tests

**File:** `tests/core/actor.test.ts`

```typescript
describe('CellActor', () => {
  let actor: CellActor
  let mockModel: jest.Mocked<Model>
  let mockRegistry: jest.Mocked<EquipmentRegistry>

  beforeEach(() => {
    mockModel = createMockModel()
    mockRegistry = createMockRegistry()
    actor = new CellActor('A1', mockConfig, mockModel, mockRegistry)
  })

  test('should receive message', async () => {
    const message = {
      type: MessageType.TRIGGER,
      cellId: 'A1',
      data: { value: 42 },
      timestamp: Date.now(),
      id: 'msg-1'
    }

    const response = await actor.receive(message)

    expect(response.status).toBe('QUEUED')
    expect(response.cellId).toBe('A1')
  })

  test('should process message', async () => {
    const message = {
      type: MessageType.TRIGGER,
      cellId: 'A1',
      data: { value: 42 },
      timestamp: Date.now(),
      id: 'msg-1'
    }

    await actor.receive(message)

    await new Promise(resolve => {
      actor.on('response', resolve)
    })

    expect(mockModel.execute).toHaveBeenCalled()
  })

  test('should handle errors', async () => {
    mockModel.execute.mockRejectedValue(new Error('Test error'))

    const message = {
      type: MessageType.TRIGGER,
      cellId: 'A1',
      data: { value: 42 },
      timestamp: Date.now(),
      id: 'msg-1'
    }

    await actor.receive(message)

    await new Promise(resolve => {
      actor.on('error', resolve)
    })

    expect(actor.currentState).toBe(ActorState.ERROR)
  })
})
```

### 2. Integration Tests

**File:** `tests/integration/cell.test.ts`

```typescript
describe('CellIntegration', () => {
  let integration: CellIntegration
  let mockSpreadsheet: jest.Mocked<SpreadsheetAPI>
  let mockRegistry: jest.Mocked<EquipmentRegistry>

  beforeEach(() => {
    mockSpreadsheet = createMockSpreadsheet()
    mockRegistry = createMockRegistry()
    integration = new CellIntegration(mockSpreadsheet, mockRegistry)
  })

  test('should subscribe to cell changes', async () => {
    integration.subscribe('A1', mockConfig)

    // Trigger cell change
    mockSpreadsheet.onCellChange.mock.calls[0][1]({ value: 42 })

    await new Promise(resolve => setTimeout(resolve, 100))

    expect(mockSpreadsheet.setCell).toHaveBeenCalled()
  })

  test('should unsubscribe from cell', () => {
    integration.subscribe('A1', mockConfig)
    integration.unsubscribe('A1')

    expect(mockSpreadsheet.offCellChange).toHaveBeenCalledWith('A1')
  })
})
```

### 3. Performance Tests

**File:** `tests/performance/actor.bench.ts`

```typescript
describe('CellActor Performance', () => {
  test('should process message in <100ms', async () => {
    const actor = new CellActor('A1', mockConfig, mockModel, mockRegistry)

    const start = Date.now()

    await actor.receive({
      type: MessageType.TRIGGER,
      cellId: 'A1',
      data: { value: 42 },
      timestamp: Date.now(),
      id: 'msg-1'
    })

    await new Promise(resolve => {
      actor.on('response', resolve)
    })

    const latency = Date.now() - start

    expect(latency).toBeLessThan(100)
  })

  test('should handle 100 concurrent actors', async () => {
    const actors: CellActor[] = []

    for (let i = 0; i < 100; i++) {
      const actor = new CellActor(
        `A${i}`,
        mockConfig,
        mockModel,
        mockRegistry
      )
      actors.push(actor)
    }

    const start = Date.now()

    await Promise.all(
      actors.map(actor =>
        actor.receive({
          type: MessageType.TRIGGER,
          cellId: actor.id,
          data: { value: 42 },
          timestamp: Date.now(),
          id: `msg-${actor.id}`
        })
      )
    )

    const latency = Date.now() - start

    expect(latency).toBeLessThan(1000)  // 10ms per actor average
  })
})
```

---

## Deployment

### 1. Package Structure

```
@superinstance/claw/
├── dist/
│   ├── core/
│   │   ├── actor.js
│   │   └── actor.d.ts
│   ├── equipment/
│   │   ├── registry.js
│   │   ├── registry.d.ts
│   │   ├── memory.js
│   │   └── reasoning.js
│   ├── integration/
│   │   ├── cell.js
│   │   └── cell.d.ts
│   ├── models/
│   │   ├── openai.js
│   │   └── openai.d.ts
│   └── index.js
├── package.json
└── README.md
```

### 2. API Surface

```typescript
// Main entry point
export { CellActor, ActorState } from './core/actor'
export { EquipmentRegistry } from './equipment/registry'
export { CellIntegration } from './integration/cell'
export { OpenAIModel } from './models/openai'

// Types
export type { Message, Response, Result } from './types'
export type { Equipment, MuscleMemory } from './equipment/types'
export type { Model, ModelResult } from './models/types'
```

### 3. Usage Example

```typescript
import {
  CellActor,
  EquipmentRegistry,
  CellIntegration,
  OpenAIModel
} from '@superinstance/claw'

// Create registry
const registry = new EquipmentRegistry()
registry.register(new MemoryEquipment())
registry.register(new ReasoningEquipment())

// Create model
const model = new OpenAIModel(process.env.OPENAI_API_KEY)

// Create integration
const integration = new CellIntegration(spreadsheet, registry)

// Subscribe cell
integration.subscribe('A1', {
  model,
  equipment: ['MEMORY', 'REASONING']
})
```

---

## Conclusion

This design specification provides a complete blueprint for implementing the Cell-First Actor Model architecture. The design is:

- **Minimal:** ~400 lines total (smaller than 500-line target)
- **Clean:** Clear separation of concerns
- **Proven:** Based on Actor Model (Erlang, Akka)
- **Testable:** Comprehensive test strategy
- **Performant:** Optimized for low latency
- **Maintainable:** Easy to understand and extend

**Next Steps:**
1. Review and approve this design
2. Set up repository structure
3. Begin implementation (13 days)
4. Test and validate
5. Deploy to production

---

**Architect:** R&D Architecture Researcher
**Date:** 2026-03-16
**Status:** READY FOR IMPLEMENTATION
**Estimated Implementation:** 13 days

---

## End of Design Specifications
