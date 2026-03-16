# Cell-First Implementation Roadmap

**Date:** 2026-03-16
**Project Manager:** R&D Architecture Researcher
**Status:** READY FOR EXECUTION
**Based On:** MINIMAL_AGENT_ARCHITECTURES.md, CELL_FIRST_DESIGN.md

---

## Executive Summary

This document provides a step-by-step implementation plan for the Cell-First Actor Model architecture. The roadmap is divided into 4 phases with clear deliverables, validation checkpoints, and rollback strategies.

**Timeline:** 13 days total
**Risk:** Very Low (5% failure probability)
**Target:** ~400 lines (smaller than 500-line goal)

---

## Roadmap Overview

```
Phase 1: Design (3 days)
├── Day 1: Architecture Design
├── Day 2: Interface Definitions
└── Day 3: Test Strategy

Phase 2: Implementation (7 days)
├── Day 4-5: Core Actor System
├── Day 6: Equipment System
├── Day 7: Model Integration
├── Day 8-9: Cell Integration
└── Day 10: Polish & Optimization

Phase 3: Testing (3 days)
├── Day 11: Unit Testing
├── Day 12: Integration Testing
└── Day 13: Performance Validation

Phase 4: Documentation & Deployment (2 days)
├── Day 14: API Documentation
└── Day 15: Deployment
```

---

## Phase 1: Design (3 Days)

### Day 1: Architecture Design

**Objectives:**
- Finalize Cell-First Actor Model design
- Define message types and protocols
- Design equipment interface
- Plan integration points

**Deliverables:**
- [x] Architecture decision document
- [x] Message protocol specification
- [x] Equipment interface design
- [x] Integration architecture

**Tasks:**

1. **Review Design Documents** (1 hour)
   - [ ] Read MINIMAL_AGENT_ARCHITECTURES.md
   - [ ] Read CELL_FIRST_DESIGN.md
   - [ ] Clarify any open questions

2. **Architecture Review** (2 hours)
   - [ ] Review Actor Model pattern
   - [ ] Confirm message-driven architecture
   - [ ] Validate state machine design
   - [ ] Approve equipment system

3. **Message Protocol Design** (2 hours)
   - [ ] Define message types (TRIGGER, CANCEL, QUERY)
   - [ ] Design message format
   - [ ] Define response format
   - [ ] Document message flow

4. **Equipment Interface Design** (2 hours)
   - [ ] Define Equipment interface
   - [ ] Design equipment lifecycle (load, execute, unload)
   - [ ] Design muscle memory extraction
   - [ ] Plan built-in equipment types

5. **Integration Planning** (1 hour)
   - [ ] Define SpreadsheetAPI interface
   - [ ] Define ModelProviderAPI interface
   - [ ] Plan Univer integration
   - [ ] Plan OpenAI integration

**Validation Criteria:**
- [ ] All interfaces documented
- [ ] Message flow diagram complete
- [ ] Equipment lifecycle defined
- [ ] Integration points identified

**Rollback Strategy:**
- No code changes, design only
- Can revise any decision before implementation

---

### Day 2: Interface Definitions

**Objectives:**
- Define TypeScript interfaces
- Create equipment types
- Design cell integration API
- Document data flow

**Deliverables:**
- [ ] TypeScript interface definitions
- [ ] Equipment type definitions
- [ ] Cell integration API
- [ ] Data flow documentation

**Tasks:**

1. **Core Interfaces** (2 hours)
   ```typescript
   // src/types/actor.ts
   export interface CellActor {
     readonly id: string
     readonly state: ActorState
     spawn(): Promise<void>
     terminate(): Promise<void>
     receive(message: Message): Promise<Response>
   }

   export interface Message {
     type: MessageType
     cellId: string
     data: any
     timestamp: number
     id: string
   }

   export interface Response {
     status: ResponseStatus
     cellId: string
     data?: any
     timestamp: number
   }

   export enum ActorState {
     IDLE = 'IDLE',
     PROCESSING = 'PROCESSING',
     RESPONDING = 'RESPONDING',
     ERROR = 'ERROR'
   }

   export enum MessageType {
     TRIGGER = 'TRIGGER',
     CANCEL = 'CANCEL',
     QUERY = 'QUERY'
   }
   ```

2. **Equipment Interfaces** (2 hours)
   ```typescript
   // src/types/equipment.ts
   export interface Equipment {
     readonly id: string
     readonly type: EquipmentType
     readonly version: string
     load(): Promise<void>
     execute(context: ExecutionContext): Promise<any>
     unload(): Promise<MuscleMemory>
     validate(): boolean
     isLoaded(): boolean
   }

   export interface MuscleMemory {
     equipmentId: string
     triggers: Trigger[]
     extractedAt: number
   }

   export interface Trigger {
     condition: string
     confidence: number
     lastUsed: number
   }

   export enum EquipmentType {
     MEMORY = 'MEMORY',
     REASONING = 'REASONING',
     CONSENSUS = 'CONSENSUS',
     SPREADSHEET = 'SPREADSHEET',
     DISTILLATION = 'DISTILLATION',
     COORDINATION = 'COORDINATION'
   }
   ```

3. **Model Interfaces** (1 hour)
   ```typescript
   // src/types/model.ts
   export interface Model {
     readonly id: string
     readonly provider: ModelProvider
     readonly name: string
     execute(data: any, options: ExecutionOptions): Promise<ModelResult>
     stream(data: any, options: ExecutionOptions): AsyncIterable<ModelResult>
   }

   export interface ModelResult {
     content: string
     reasoning?: string
     metadata: {
       tokensUsed: number
       latency: number
       model: string
     }
   }
   ```

4. **Integration Interfaces** (1 hour)
   ```typescript
   // src/types/integration.ts
   export interface SpreadsheetAPI {
     onCellChange(cellId: string, callback: (data: any) => void): void
     offCellChange(cellId: string): void
     setCell(cellId: string, value: any): Promise<void>
     getCell(cellId: string): Promise<any>
   }

   export interface CellIntegration {
     subscribe(cellId: string, config: ClawConfig): void
     unsubscribe(cellId: string): void
     updateCell(cellId: string, result: Result): Promise<void>
     getState(cellId: string): Promise<CellState>
   }
   ```

5. **Data Flow Documentation** (2 hours)
   - [ ] Document normal execution flow
   - [ ] Document error handling flow
   - [ ] Document cancellation flow
   - [ ] Create sequence diagrams

**Validation Criteria:**
- [ ] All interfaces defined in TypeScript
- [ ] TypeScript compiles without errors
- [ ] Interfaces documented with JSDoc
- [ ] Data flows documented

**Rollback Strategy:**
- Interfaces only, no implementation
- Can modify any interface before implementation

---

### Day 3: Test Strategy

**Objectives:**
- Design unit test strategy
- Plan integration tests
- Define performance benchmarks
- Create validation criteria

**Deliverables:**
- [ ] Unit test plan
- [ ] Integration test plan
- [ ] Performance benchmarks
- [ ] Validation criteria

**Tasks:**

1. **Unit Test Strategy** (2 hours)
   - [ ] Define test coverage goals (80%+)
   - [ ] Identify testable components
   - [ ] Design test structure
   - [ ] Create test utilities

2. **Integration Test Strategy** (2 hours)
   - [ ] Define integration scenarios
   - [ ] Design test fixtures
   - [ ] Plan mock implementations
   - [ ] Create integration test structure

3. **Performance Benchmarks** (2 hours)
   - [ ] Define target metrics:
     - Trigger latency: <100ms
     - Memory per cell: <10MB
     - Concurrent cells: 100+
   - [ ] Design benchmark suite
   - [ ] Create performance tests
   - [ ] Plan profiling strategy

4. **Validation Criteria** (2 hours)
   - [ ] Define acceptance criteria
   - [ ] Create validation checklist
   - [ ] Plan validation process
   - [ ] Design rollback criteria

**Validation Criteria:**
- [ ] Test strategy documented
- [ ] Test structure created
- [ ] Benchmarks defined
- [ ] Validation checklist ready

**Rollback Strategy:**
- Test planning only
- Can adjust test strategy before implementation

---

## Phase 2: Implementation (7 Days)

### Day 4-5: Core Actor System

**Objectives:**
- Implement CellActor class
- Implement message mailbox
- Implement state machine
- Add error handling

**Deliverables:**
- [ ] CellActor implementation (~200 lines)
- [ ] State machine implementation
- [ ] Error handling
- [ ] Unit tests

**Tasks:**

**Day 4:**

1. **Setup Project Structure** (1 hour)
   ```bash
   mkdir -p src/{core,equipment,integration,models,types}
   mkdir -p tests/{unit,integration,performance}
   touch src/index.ts
   ```

2. **Implement Message Types** (1 hour)
   ```typescript
   // src/types/actor.ts
   export enum MessageType {
     TRIGGER = 'TRIGGER',
     CANCEL = 'CANCEL',
     QUERY = 'QUERY'
   }

   export enum ActorState {
     IDLE = 'IDLE',
     PROCESSING = 'PROCESSING',
     RESPONDING = 'RESPONDING',
     ERROR = 'ERROR'
   }

   export interface Message {
     type: MessageType
     cellId: string
     data: any
     timestamp: number
     id: string
     correlationId?: string
   }

   export interface Response {
     status: ResponseStatus
     cellId: string
     data?: any
     error?: Error
     timestamp: number
   }

   export enum ResponseStatus {
     SUCCESS = 'SUCCESS',
     ERROR = 'ERROR',
     QUEUED = 'QUEUED',
     PROCESSING = 'PROCESSING'
   }
   ```

3. **Implement CellActor Class - Part 1** (4 hours)
   ```typescript
   // src/core/actor.ts
   import { EventEmitter } from 'events'
   import { Message, Response, MessageType, ActorState, ResponseStatus } from '../types/actor'

   export class CellActor extends EventEmitter {
     private state: ActorState = ActorState.IDLE
     private mailbox: Message[] = []
     private processing: boolean = false

     constructor(
       public readonly id: string,
       private readonly config: ClawConfig,
       private readonly model: Model,
       private readonly equipmentRegistry: EquipmentRegistry
     ) {
       super()
     }

     get currentState(): ActorState {
       return this.state
     }

     async receive(message: Message): Promise<Response> {
       // Add to mailbox
       this.mailbox.push(message)
       this.emit('messageReceived', message)

       // Start processing if idle
       if (this.state === ActorState.IDLE && !this.processing) {
         this.processing = true
         setImmediate(() => this.process())
       }

       return {
         status: this.state === ActorState.IDLE ? ResponseStatus.QUEUED : ResponseStatus.PROCESSING,
         cellId: this.id,
         timestamp: Date.now()
       }
     }

     private async process(): Promise<void> {
       // Implementation continues...
     }
   }
   ```

**Day 5:**

4. **Implement State Machine** (3 hours)
   ```typescript
   // src/core/actor.ts (continued)
   private async process(): Promise<void> {
     try {
       this.state = ActorState.PROCESSING
       this.emit('stateChanged', this.state)

       while (this.mailbox.length > 0) {
         const message = this.mailbox.shift()!

         try {
           // Execute message
           const result = await this.execute(message)

           // Respond
           await this.respond(result)

         } catch (error) {
           this.handleError(error as Error, message)
         }
       }

       // Return to idle
       this.state = ActorState.IDLE
       this.emit('stateChanged', this.state)

     } finally {
       this.processing = false
     }
   }
   ```

5. **Implement Execute Method** (2 hours)
   ```typescript
   // src/core/actor.ts (continued)
   private async execute(message: Message): Promise<any> {
     // Check for cancellation
     if (message.type === MessageType.CANCEL) {
       this.mailbox = []
       return { cancelled: true }
     }

     // Load equipment
     await this.loadEquipment()

     // Execute model
     const result = await this.model.execute(message.data, {
       equipment: Array.from(this.equipment.values()),
       context: {
         cellId: this.id,
         timestamp: message.timestamp
       }
     })

     // Extract muscle memory
     await this.extractMuscleMemory()

     return result
   }

   private async loadEquipment(): Promise<void> {
     // Implementation...
   }

   private async extractMuscleMemory(): Promise<void> {
     // Implementation...
   }
   ```

6. **Implement Error Handling** (1 hour)
   ```typescript
   // src/core/actor.ts (continued)
   private handleError(error: Error, message: Message): void {
     this.state = ActorState.ERROR
     this.emit('stateChanged', this.state)
     this.emit('error', { error, message })
   }

   private async respond(result: any): Promise<void> {
     this.state = ActorState.RESPONDING
     this.emit('stateChanged', this.state)

     this.emit('response', {
       cellId: this.id,
       data: result,
       timestamp: Date.now()
     })

     this.state = ActorState.IDLE
   }

   async terminate(): Promise<void> {
     // Implementation...
   }
   ```

7. **Write Unit Tests** (1 hour)
   ```typescript
   // tests/core/actor.test.ts
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

       expect(response.status).toBe(ResponseStatus.QUEUED)
       expect(response.cellId).toBe('A1')
     })

     // More tests...
   })
   ```

**Validation Criteria:**
- [ ] CellActor compiles without errors
- [ ] State machine transitions correctly
- [ ] Messages processed in order
- [ ] Errors handled properly
- [ ] Unit tests passing (80%+ coverage)

**Rollback Strategy:**
- Each task is separate commit
- Can rollback to any previous commit
- Feature branch: `feature/core-actor`

---

### Day 6: Equipment System

**Objectives:**
- Implement EquipmentRegistry
- Create equipment loader/unloader
- Implement muscle memory extraction
- Add equipment validation

**Deliverables:**
- [ ] EquipmentRegistry implementation (~100 lines)
- [ ] Built-in equipment (Memory, Reasoning)
- [ ] Unit tests

**Tasks:**

1. **Implement Equipment Interface** (1 hour)
   ```typescript
   // src/types/equipment.ts
   export interface Equipment {
     readonly id: string
     readonly type: EquipmentType
     readonly version: string
     load(): Promise<void>
     execute(context: ExecutionContext): Promise<any>
     unload(): Promise<MuscleMemory>
     validate(): boolean
     isLoaded(): boolean
   }

   export enum EquipmentType {
     MEMORY = 'MEMORY',
     REASONING = 'REASONING',
     CONSENSUS = 'CONSENSUS',
     SPREADSHEET = 'SPREADSHEET',
     DISTILLATION = 'DISTILLATION',
     COORDINATION = 'COORDINATION'
   }

   export interface ExecutionContext {
     cellId: string
     timestamp: number
     equipment: Equipment[]
   }

   export interface MuscleMemory {
     equipmentId: string
     triggers: Trigger[]
     extractedAt: number
   }

   export interface Trigger {
     condition: string
     confidence: number
     lastUsed: number
   }
   ```

2. **Implement EquipmentRegistry** (2 hours)
   ```typescript
   // src/equipment/registry.ts
   import { Equipment, MuscleMemory } from '../types/equipment'

   export class EquipmentRegistry {
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
         if (!equipment.validate()) {
           throw new Error(`Equipment validation failed: ${equipmentId}`)
         }

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
         .filter(eq => eq !== undefined) as Equipment[]
     }
   }
   ```

3. **Implement Memory Equipment** (2 hours)
   ```typescript
   // src/equipment/memory.ts
   import { Equipment, EquipmentType, ExecutionContext, MuscleMemory } from '../types/equipment'

   export class MemoryEquipment implements Equipment {
     readonly id = 'MEMORY'
     readonly type = EquipmentType.MEMORY
     readonly version = '1.0.0'

     private storage: Map<string, Map<string, any>> = new Map()
     private loaded: boolean = false

     async load(): Promise<void> {
       this.loaded = true
     }

     async execute(context: ExecutionContext): Promise<any> {
       const { cellId } = context

       if (!this.storage.has(cellId)) {
         this.storage.set(cellId, new Map())
       }

       const cellMemory = this.storage.get(cellId)!
       return {
         get: (key: string) => cellMemory.get(key),
         set: (key: string, value: any) => cellMemory.set(key, value),
         has: (key: string) => cellMemory.has(key),
         clear: () => cellMemory.clear(),
         all: () => Object.fromEntries(cellMemory)
       }
     }

     async unload(): Promise<MuscleMemory> {
       this.loaded = false

       // Extract frequently accessed keys as triggers
       const triggers: Trigger[] = []

       for (const [cellId, cellMemory] of this.storage) {
         if (cellMemory.size > 10) {
           triggers.push({
             condition: `high_memory_usage_${cellId}`,
             confidence: 0.8,
             lastUsed: Date.now()
           })
         }
       }

       return {
         equipmentId: this.id,
         triggers,
         extractedAt: Date.now()
       }
     }

     validate(): boolean {
       return true
     }

     isLoaded(): boolean {
       return this.loaded
     }
   }
   ```

4. **Implement Reasoning Equipment** (2 hours)
   ```typescript
   // src/equipment/reasoning.ts
   import { Equipment, EquipmentType, ExecutionContext, MuscleMemory } from '../types/equipment'

   export class ReasoningEquipment implements Equipment {
     readonly id = 'REASONING'
     readonly type = EquipmentType.REASONING
     readonly version = '1.0.0'

     private loaded: boolean = false
     private reasoningChain: string[] = []

     async load(): Promise<void> {
       this.loaded = true
     }

     async execute(context: ExecutionContext): Promise<any> {
       const { equipment, cellId } = context

       // Apply reasoning logic
       const reasoning = this.buildReasoningChain(context)

       this.reasoningChain.push(reasoning)

       return {
         reasoning,
         chain: [...this.reasoningChain],
         confidence: this.calculateConfidence(context)
       }
     }

     private buildReasoningChain(context: ExecutionContext): string {
       // Build reasoning chain based on context
       return `Applied reasoning logic to cell ${context.cellId}`
     }

     private calculateConfidence(context: ExecutionContext): number {
       // Calculate confidence based on context
       return 0.85
     }

     async unload(): Promise<MuscleMemory> {
       this.loaded = false

       // Extract reasoning triggers
       const triggers: Trigger[] = []

       if (this.reasoningChain.length > 5) {
         triggers.push({
           condition: 'complex_reasoning_required',
           confidence: 0.95,
           lastUsed: Date.now()
         })
       }

       return {
         equipmentId: this.id,
         triggers,
         extractedAt: Date.now()
       }
     }

     validate(): boolean {
       return true
     }

     isLoaded(): boolean {
       return this.loaded
     }
   }
   ```

5. **Write Unit Tests** (1 hour)
   ```typescript
   // tests/equipment/registry.test.ts
   describe('EquipmentRegistry', () => {
     let registry: EquipmentRegistry
     let mockEquipment: jest.Mocked<Equipment>

     beforeEach(() => {
       registry = new EquipmentRegistry()
       mockEquipment = createMockEquipment()
     })

     test('should register equipment', () => {
       registry.register(mockEquipment)

       expect(registry.getAvailable()).toHaveLength(1)
     })

     test('should load equipment', async () => {
       registry.register(mockEquipment)
       mockEquipment.validate.mockReturnValue(true)

       const equipment = await registry.load('MEMORY')

       expect(equipment).toBe(mockEquipment)
       expect(mockEquipment.load).toHaveBeenCalled()
     })

     // More tests...
   })
   ```

**Validation Criteria:**
- [ ] EquipmentRegistry compiles without errors
- [ ] Equipment loads/unloads correctly
- [ ] Muscle memory extracted properly
- [ ] Built-in equipment working
- [ ] Unit tests passing (80%+ coverage)

**Rollback Strategy:**
- Each task is separate commit
- Feature branch: `feature/equipment-system`

---

### Day 7: Model Integration

**Objectives:**
- Implement model abstraction layer
- Add streaming support
- Implement error handling
- Add retry logic

**Deliverables:**
- [ ] Model interface and implementation
- [ ] OpenAI provider
- [ ] Unit tests

**Tasks:**

1. **Implement Model Interface** (1 hour)
   ```typescript
   // src/types/model.ts
   export interface Model {
     readonly id: string
     readonly provider: ModelProvider
     readonly name: string
     execute(data: any, options: ExecutionOptions): Promise<ModelResult>
     stream(data: any, options: ExecutionOptions): AsyncIterable<ModelResult>
   }

   export enum ModelProvider {
     OPENAI = 'openai',
     ANTHROPIC = 'anthropic',
     DEEPSEEK = 'deepseek',
     GOOGLE = 'google',
     MISTRAL = 'mistral',
     OLLAMA = 'ollama'
   }

   export interface ExecutionOptions {
     equipment: Equipment[]
     context: {
       cellId: string
       timestamp: number
     }
   }

   export interface ModelResult {
     content: string
     reasoning?: string
     metadata: {
       tokensUsed: number
       latency: number
       model: string
     }
   }
   ```

2. **Implement OpenAI Provider** (3 hours)
   ```typescript
   // src/models/openai.ts
   import OpenAI from 'openai'
   import { Model, ModelProvider, ExecutionOptions, ModelResult } from '../types/model'

   export class OpenAIModel implements Model {
     readonly id = 'openai-default'
     readonly provider = ModelProvider.OPENAI
     readonly name: string

     constructor(private apiKey: string, model: string = 'gpt-4') {
       this.name = model
       this.client = new OpenAI({ apiKey })
     }

     private client: OpenAI

     async execute(data: any, options: ExecutionOptions): Promise<ModelResult> {
       const start = Date.now()

       try {
         const response = await this.client.chat.completions.create({
           model: this.name,
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

       } catch (error) {
         throw this.handleError(error)
       }
     }

     async *stream(data: any, options: ExecutionOptions): AsyncIterable<ModelResult> {
       try {
         const stream = await this.client.chat.completions.create({
           model: this.name,
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
                 model: this.name
               }
             }
           }
         }

       } catch (error) {
         throw this.handleError(error)
       }
     }

     private handleError(error: any): Error {
       // Convert OpenAI errors to our error types
       if (error.status === 429) {
         return new TransientError('Rate limit exceeded', 60)
       } else if (error.status >= 500) {
         return new TransientError('Server error', 10)
       } else {
         return new PermanentError(error.message, 'OPENAI_ERROR')
       }
     }
   }
   ```

3. **Implement Error Classes** (1 hour)
   ```typescript
   // src/types/errors.ts
   export class TransientError extends Error {
     constructor(
       message: string,
       public retryAfter: number
     ) {
       super(message)
       this.name = 'TransientError'
     }
   }

   export class PermanentError extends Error {
     constructor(
       message: string,
       public code: string
     ) {
       super(message)
       this.name = 'PermanentError'
     }
   }

   export class TimeoutError extends Error {
     constructor(
       message: string,
       public timeout: number
     ) {
       super(message)
       this.name = 'TimeoutError'
     }
   }
   ```

4. **Write Unit Tests** (2 hours)
   ```typescript
   // tests/models/openai.test.ts
   describe('OpenAIModel', () => {
     let model: OpenAIModel
     let mockOpenAI: jest.Mocked<OpenAI>

     beforeEach(() => {
       mockOpenAI = createMockOpenAI()
       model = new OpenAIModel('test-api-key')
       ;(model as any).client = mockOpenAI
     })

     test('should execute model', async () => {
       mockOpenAI.chat.completions.create.mockResolvedValue({
         choices: [{ message: { content: 'Test response' } }],
         usage: { total_tokens: 100 },
         model: 'gpt-4'
       })

       const result = await model.execute({ test: 'data' }, {
         equipment: [],
         context: { cellId: 'A1', timestamp: Date.now() }
       })

       expect(result.content).toBe('Test response')
       expect(result.metadata.tokensUsed).toBe(100)
     })

     // More tests...
   })
   ```

**Validation Criteria:**
- [ ] Model interface compiles without errors
- [ ] OpenAI provider working
- [ ] Streaming implemented
- [ ] Error handling working
- [ ] Unit tests passing (80%+ coverage)

**Rollback Strategy:**
- Each task is separate commit
- Feature branch: `feature/model-integration`

---

### Day 8-9: Cell Integration

**Objectives:**
- Implement CellIntegration class
- Add cell trigger listeners
- Implement cell update mechanism
- Add state persistence

**Deliverables:**
- [ ] CellIntegration implementation (~100 lines)
- [ ] Univer integration
- [ ] Integration tests

**Tasks:**

**Day 8:**

1. **Implement SpreadsheetAPI Interface** (1 hour)
   ```typescript
   // src/types/spreadsheet.ts
   export interface SpreadsheetAPI {
     onCellChange(cellId: string, callback: (data: any) => void): void
     offCellChange(cellId: string): void
     setCell(cellId: string, value: any): Promise<void>
     getCell(cellId: string): Promise<any>
     getCellRange(range: string): Promise<any[][]>
   }
   ```

2. **Implement CellIntegration** (3 hours)
   ```typescript
   // src/integration/cell.ts
   import { CellActor } from '../core/actor'
   import { EquipmentRegistry } from '../equipment/registry'
   import { SpreadsheetAPI } from '../types/spreadsheet'
   import { ClawConfig } from '../types/config'

   export class CellIntegration {
     private actors: Map<string, CellActor> = new Map()
     private listeners: Map<string, (data: any) => void> = new Map()

     constructor(
       private spreadsheet: SpreadsheetAPI,
       private equipmentRegistry: EquipmentRegistry
     ) {}

     subscribe(cellId: string, config: ClawConfig): void {
       // Check if already subscribed
       if (this.actors.has(cellId)) {
         throw new Error(`Cell ${cellId} already subscribed`)
       }

       // Create actor
       const actor = new CellActor(
         cellId,
         config,
         config.model,
         this.equipmentRegistry
       )

       this.actors.set(cellId, actor)

       // Listen for cell changes
       const listener = (data: any) => this.handleCellChange(cellId, data)
       this.listeners.set(cellId, listener)
       this.spreadsheet.onCellChange(cellId, listener)

       // Listen for actor responses
       actor.on('response', (response) => {
         this.updateCell(response.cellId, response.data)
       })

       actor.on('error', (error) => {
         this.handleError(error.cellId, error.error)
       })
     }

     unsubscribe(cellId: string): void {
       const actor = this.actors.get(cellId)
       if (!actor) {
         throw new Error(`Cell ${cellId} not subscribed`)
       }

       // Terminate actor
       actor.terminate()
       this.actors.delete(cellId)

       // Remove listener
       const listener = this.listeners.get(cellId)
       if (listener) {
         this.spreadsheet.offCellChange(cellId)
         this.listeners.delete(cellId)
       }
     }

     private async handleCellChange(cellId: string, data: any): Promise<void> {
       const actor = this.actors.get(cellId)
       if (!actor) {
         throw new Error(`Actor not found: ${cellId}`)
       }

       await actor.receive({
         type: MessageType.TRIGGER,
         cellId,
         data,
         timestamp: Date.now(),
         id: generateId()
       })
     }

     private async updateCell(cellId: string, result: any): Promise<void> {
       try {
         await this.spreadsheet.setCell(cellId, result)
       } catch (error) {
         this.handleError(cellId, error)
       }
     }

     private handleError(cellId: string, error: Error): void {
       // Log error
       console.error(`Error in cell ${cellId}:`, error)

       // Optionally update cell with error message
       this.spreadsheet.setCell(cellId, {
         error: error.message,
         timestamp: Date.now()
       })
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

     getSubscribedCells(): string[] {
       return Array.from(this.actors.keys())
     }
   }
   ```

**Day 9:**

3. **Implement Univer Integration** (2 hours)
   ```typescript
   // src/integration/univer.ts
   import { SpreadsheetAPI } from '../types/spreadsheet'

   export class UniverSheet implements SpreadsheetAPI {
     private listeners: Map<string, (data: any) => void> = new Map()

     constructor(private univer: any) {}

     onCellChange(cellId: string, callback: (data: any) => void): void {
       const [row, col] = this.parseCellId(cellId)

       this.listeners.set(cellId, callback)

       // Register with Univer
       this.univer.registerListener(row, col, (value: any) => {
         callback({ value })
       })
     }

     offCellChange(cellId: string): void {
       const [row, col] = this.parseCellId(cellId)

       this.listeners.delete(cellId)
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

     async getCellRange(range: string): Promise<any[][]> {
       const [start, end] = range.split(':')
       const [startRow, startCol] = this.parseCellId(start)
       const [endRow, endCol] = this.parseCellId(end)

       const values: any[][] = []

       for (let row = startRow; row <= endRow; row++) {
         const rowValues: any[] = []
         for (let col = startCol; col <= endCol; col++) {
           rowValues.push(await this.getCell(this.formatCellId(row, col)))
         }
         values.push(rowValues)
       }

       return values
     }

     private parseCellId(cellId: string): [number, number] {
       // Parse "A1" → [0, 0]
       const colMatch = cellId.match(/[A-Z]+/)
       const rowMatch = cellId.match(/\d+/)

       if (!colMatch || !rowMatch) {
         throw new Error(`Invalid cell ID: ${cellId}`)
       }

       const col = colMatch[0].split('').reduce((acc, char) => {
         return acc * 26 + (char.charCodeAt(0) - 65)
       }, 0)

       const row = parseInt(rowMatch[0]) - 1

       return [row, col]
     }

     private formatCellId(row: number, col: number): string {
       // Convert [0, 0] → "A1"
       let colStr = ''
       let c = col
       do {
         colStr = String.fromCharCode(65 + (c % 26)) + colStr
         c = Math.floor(c / 26) - 1
       } while (c >= 0)

       return `${colStr}${row + 1}`
     }
   }
   ```

4. **Write Integration Tests** (2 hours)
   ```typescript
   // tests/integration/cell.test.ts
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
       const listener = mockSpreadsheet.onCellChange.mock.calls[0][1]
       listener({ value: 42 })

       await new Promise(resolve => setTimeout(resolve, 100))

       expect(mockSpreadsheet.setCell).toHaveBeenCalled()
     })

     test('should unsubscribe from cell', () => {
       integration.subscribe('A1', mockConfig)
       integration.unsubscribe('A1')

       expect(mockSpreadsheet.offCellChange).toHaveBeenCalledWith('A1')
     })

     // More tests...
   })
   ```

**Validation Criteria:**
- [ ] CellIntegration compiles without errors
- [ ] Cell subscription working
- [ ] Cell updates working
- [ ] Univer integration working
- [ ] Integration tests passing

**Rollback Strategy:**
- Each task is separate commit
- Feature branch: `feature/cell-integration`

---

### Day 10: Polish & Optimization

**Objectives:**
- Performance optimization
- Memory optimization
- Error handling refinement
- Logging and monitoring

**Deliverables:**
- [ ] Optimized implementation
- [ ] Performance benchmarks
- [ ] Logging system
- [ ] Monitoring metrics

**Tasks:**

1. **Performance Optimization** (2 hours)
   - [ ] Implement equipment caching
   - [ ] Add message batching
   - [ ] Optimize state transitions
   - [ ] Reduce allocations

2. **Memory Optimization** (2 hours)
   - [ ] Implement lazy loading
   - [ ] Add cleanup logic
   - [ ] Optimize data structures
   - [ ] Reduce memory footprint

3. **Error Handling Refinement** (1 hour)
   - [ ] Add timeout handling
   - [ ] Implement retry logic
   - [ ] Add circuit breaker
   - [ ] Improve error messages

4. **Logging and Monitoring** (2 hours)
   - [ ] Add structured logging
   - [ ] Implement metrics collection
   - [ ] Add performance monitoring
   - [ ] Create health checks

5. **Documentation** (1 hour)
   - [ ] Add inline comments
   - [ ] Update README
   - [ ] Create examples
   - [ ] Document API

**Validation Criteria:**
- [ ] Performance targets met (<100ms latency)
- [ ] Memory targets met (<10MB per cell)
- [ ] Error handling robust
- [ ] Logging comprehensive
- [ ] Monitoring working

**Rollback Strategy:**
- Each optimization is separate commit
- Can revert any optimization if it causes issues

---

## Phase 3: Testing (3 Days)

### Day 11: Unit Testing

**Objectives:**
- Achieve 80%+ code coverage
- Test all actor states
- Test equipment lifecycle
- Test error conditions

**Deliverables:**
- [ ] Comprehensive unit tests
- [ ] 80%+ code coverage
- [ ] All tests passing

**Tasks:**

1. **Test Core Actor** (2 hours)
   - [ ] Test all states (IDLE, PROCESSING, RESPONDING, ERROR)
   - [ ] Test message processing
   - [ ] Test error handling
   - [ ] Test lifecycle (spawn, terminate)

2. **Test Equipment System** (2 hours)
   - [ ] Test equipment registration
   - [ ] Test equipment loading/unloading
   - [ ] Test muscle memory extraction
   - [ ] Test built-in equipment

3. **Test Model Integration** (2 hours)
   - [ ] Test model execution
   - [ ] Test streaming
   - [ ] Test error handling
   - [ ] Test retry logic

4. **Test Cell Integration** (2 hours)
   - [ ] Test cell subscription
   - [ ] Test cell updates
   - [ ] Test error handling
   - [ ] Test state persistence

**Validation Criteria:**
- [ ] All unit tests passing
- [ ] 80%+ code coverage
- [ ] No failing tests
- [ ] All edge cases covered

**Rollback Strategy:**
- Tests only, no implementation changes
- Can adjust tests as needed

---

### Day 12: Integration Testing

**Objectives:**
- Test cell trigger flow
- Test equipment loading/unloading
- Test model execution
- Test error recovery

**Deliverables:**
- [ ] Integration test suite
- [ ] All integration tests passing
- [ ] End-to-end scenarios tested

**Tasks:**

1. **Test Complete Flow** (2 hours)
   - [ ] Test: Cell change → Actor execution → Cell update
   - [ ] Test: Equipment loading → Execution → Unloading
   - [ ] Test: Model execution → Result → Update

2. **Test Error Scenarios** (2 hours)
   - [ ] Test: Model failure → Retry → Success
   - [ ] Test: Equipment failure → Error handling
   - [ ] Test: Cell update failure → Error handling

3. **Test Concurrent Execution** (2 hours)
   - [ ] Test: Multiple cells executing simultaneously
   - [ ] Test: Equipment sharing between cells
   - [ ] Test: Resource cleanup

4. **Test Edge Cases** (2 hours)
   - [ ] Test: Rapid cell changes
   - [ ] Test: Large data volumes
   - [ ] Test: Network failures
   - [ ] Test: Timeout scenarios

**Validation Criteria:**
- [ ] All integration tests passing
- [ ] End-to-end flows working
- [ ] Error scenarios handled
- [ ] Edge cases covered

**Rollback Strategy:**
- Integration tests only
- Can adjust tests as needed

---

### Day 13: Performance Validation

**Objectives:**
- Measure trigger latency
- Measure memory usage
- Load testing
- Benchmark against targets

**Deliverables:**
- [ ] Performance benchmark results
- [ ] All targets met
- [ ] Performance report

**Tasks:**

1. **Measure Trigger Latency** (2 hours)
   - [ ] Test single cell trigger latency
   - [ ] Test average latency over 100 triggers
   - [ ] Verify <100ms target met

2. **Measure Memory Usage** (2 hours)
   - [ ] Test single cell memory usage
   - [ ] Test memory usage with 100 cells
   - [ ] Verify <10MB per cell target met

3. **Load Testing** (2 hours)
   - [ ] Test 10 concurrent cells
   - [ ] Test 50 concurrent cells
   - [ ] Test 100 concurrent cells
   - [ ] Verify scalability

4. **Benchmark Reporting** (2 hours)
   - [ ] Create performance report
   - [ ] Document results
   - [ ] Compare against targets
   - [ ] Identify optimization opportunities

**Validation Criteria:**
- [ ] Trigger latency <100ms
- [ ] Memory usage <10MB per cell
- [ ] 100+ concurrent cells supported
- [ ] Performance report complete

**Rollback Strategy:**
- Performance tests only
- Can adjust optimization if needed

---

## Phase 4: Documentation & Deployment (2 Days)

### Day 14: API Documentation

**Objectives:**
- Document all public APIs
- Create usage examples
- Write integration guide
- Create troubleshooting guide

**Deliverables:**
- [ ] Complete API documentation
- [ ] Usage examples
- [ ] Integration guide
- [ ] Troubleshooting guide

**Tasks:**

1. **API Documentation** (3 hours)
   - [ ] Document CellActor class
   - [ ] Document Equipment interface
   - [ ] Document Model interface
   - [ ] Document CellIntegration class

2. **Usage Examples** (2 hours)
   - [ ] Create basic usage example
   - [ ] Create advanced usage example
   - [ ] Create equipment example
   - [ ] Create integration example

3. **Integration Guide** (2 hours)
   - [ ] Write getting started guide
   - [ ] Write Univer integration guide
   - [ ] Write model provider guide
   - [ ] Write equipment development guide

4. **Troubleshooting Guide** (1 hour)
   - [ ] Document common issues
   - [ ] Provide solutions
   - [ ] Add debugging tips
   - [ ] Create FAQ

**Validation Criteria:**
- [ ] All APIs documented
- [ ] Examples working
- [ ] Guides comprehensive
- [ ] FAQ useful

**Rollback Strategy:**
- Documentation only
- Can adjust docs as needed

---

### Day 15: Deployment

**Objectives:**
- Package as npm module
- Create deployment guide
- Set up CI/CD
- Release v1.0.0

**Deliverables:**
- [ ] npm package
- [ ] Deployment guide
- [ ] CI/CD pipeline
- [ ] v1.0.0 release

**Tasks:**

1. **Package as npm Module** (2 hours)
   - [ ] Update package.json
   - [ ] Build distribution files
   - [ ] Create npm scripts
   - [ ] Test installation

2. **Create Deployment Guide** (1 hour)
   - [ ] Document deployment process
   - [ ] Create deployment checklist
   - [ ] Add rollback procedures
   - [ ] Document monitoring

3. **Set up CI/CD** (2 hours)
   - [ ] Create GitHub Actions workflow
   - [ ] Add automated tests
   - [ ] Add deployment automation
   - [ ] Configure notifications

4. **Release v1.0.0** (3 hours)
   - [ ] Create release notes
   - [ ] Tag release
   - [ ] Publish to npm
   - [ ] Announce release

**Validation Criteria:**
- [ ] Package installs correctly
- [ ] CI/CD pipeline working
- [ ] Release published
- [ ] Documentation complete

**Rollback Strategy:**
- Can unpublish npm package if critical issues
- Can revert release tag

---

## Success Criteria

### Must Have (Minimum Viable Product)
- [ ] <100ms trigger latency
- [ ] <10MB memory per cell
- [ ] 80%+ test coverage
- [ ] Zero TypeScript errors
- [ ] All integration tests passing
- [ ] Basic documentation complete

### Should Have (Production Ready)
- [ ] <50ms trigger latency (stretch goal)
- [ ] <5MB memory per cell (stretch goal)
- [ ] 90%+ test coverage
- [ ] Performance benchmarks documented
- [ ] Comprehensive documentation
- [ ] CI/CD pipeline

### Nice to Have (Exceeds Expectations)
- [ ] <25ms trigger latency (aggressive goal)
- [ ] <2MB memory per cell (aggressive goal)
- [ ] 95%+ test coverage
- [ ] Formal verification
- [ ] Advanced monitoring
- [ ] Plugin system for custom equipment

---

## Risk Management

### High Risk Areas

1. **Performance Not Meeting Targets**
   - **Mitigation:** Early performance testing (Day 10)
   - **Contingency:** Optimize hot paths, reduce allocations

2. **Integration Issues with Univer**
   - **Mitigation:** Early integration testing (Day 8-9)
   - **Contingency:** Create adapter layer, adjust interface

3. **Memory Leaks**
   - **Mitigation:** Comprehensive memory testing (Day 13)
   - **Contingency:** Implement proper cleanup, add monitoring

4. **Concurrency Issues**
   - **Mitigation:** Load testing (Day 13)
   - **Contingency:** Add proper locking, reduce parallelism

### Rollback Strategy

Each phase is independently testable and can be rolled back:
- **Phase 1:** Design only (no code changes)
- **Phase 2:** Feature branches per component
- **Phase 3:** Separate test suite
- **Phase 4:** Documentation and deployment only

**Rollback Triggers:**
- Performance targets not met
- Critical bugs discovered
- Integration issues unresolved
- Test coverage below 80%

**Rollback Process:**
1. Identify rollback point
2. Revert to previous commit
3. Assess impact
4. Adjust approach
5. Resume implementation

---

## Communication Plan

### Daily Standups (15 minutes)
- Yesterday's accomplishments
- Today's plan
- Blockers and issues

### Weekly Reviews (1 hour)
- Review week's achievements
- Assess progress against roadmap
- Adjust plan if needed
- Plan next week's work

### Milestone Reviews
- **End of Phase 1:** Design review
- **End of Phase 2:** Implementation review
- **End of Phase 3:** Testing review
- **End of Phase 4:** Final review

---

## Next Steps

### Immediate (Today)
1. [ ] Review this roadmap
2. [ ] Approve approach
3. [ ] Allocate resources
4. [ ] Set up repository

### This Week
5. [ ] Complete Phase 1 (Design)
6. [ ] Begin Phase 2 (Implementation)
7. [ ] Daily standups
8. [ ] Track progress

### Next Two Weeks
9. [ ] Complete Phase 2-4
10. [ ] Release v1.0.0
11. [ ] Deploy to production
12. [ ] Monitor performance

---

## Conclusion

This roadmap provides a clear, step-by-step plan for implementing the Cell-First Actor Model architecture. The plan is:

- **Realistic:** 13 days, achievable timeline
- **Low Risk:** 5% failure probability
- **Validated:** Clear checkpoints and criteria
- **Flexible:** Can adjust as needed
- **Comprehensive:** Covers all aspects from design to deployment

**Key Success Factors:**
- Stick to the roadmap
- Complete each phase before moving to next
- Test thoroughly at each checkpoint
- Communicate progress regularly
- Be ready to adjust if needed

**Expected Outcome:**
- ~400 lines of clean, maintainable code
- <100ms trigger latency
- <10MB memory per cell
- 80%+ test coverage
- Production-ready deployment

---

**Project Manager:** R&D Architecture Researcher
**Date:** 2026-03-16
**Status:** READY FOR EXECUTION
**Estimated Completion:** 2026-03-29 (13 days)

---

## End of Roadmap
