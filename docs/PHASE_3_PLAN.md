# Phase 3 Implementation Plan: Core Simplification

**Project:** SuperInstance Claw - Minimal Cellular Agent Engine
**Start Date:** 2026-03-15
**Status:** READY TO START
**Branch:** `phase-3-simplification` (from `phase-2-stripping`)

---

## Executive Summary

Phase 3 addresses critical review findings from Phase 2 and implements core simplification to create a minimal cellular agent engine. This phase focuses on cleaning up incomplete dependency removal and simplifying core modules.

**Target Metrics:**
- Dependencies: 100+ → ~20 (80% reduction)
- Core modules: Simplified by ~1,400 lines
- Minimal core loop: ~500 lines
- TypeScript compilation: Zero errors

---

## Review Findings to Address (Priority 1)

### Critical Findings (Must Fix)

#### C1: Incomplete Dependency Cleanup
**Severity:** CRITICAL
**Location:** `package.json`, `tsconfig.json`

**Issues:**
1. Channel SDKs remain in package.json despite extension removal
2. Plugin SDK exports reference deleted extensions
3. tsconfig.json has orphaned paths

**Dependencies to Remove:**
```json
{
  "channel_sdks": [
    "@slack/bolt",
    "@slack/web-api",
    "discord-api-types",
    "@discordjs/voice",
    "grammy",
    "@grammyjs/runner",
    "@grammyjs/transformer-throttler",
    "@grammyjs/types",
    "@whiskeysockets/baileys",
    "@line/bot-sdk",
    "@larksuiteoapi/node-sdk",
    "@buape/carbon",
    "@matrix-org/matrix-sdk-crypto-nodejs",
    "@tloncorp/api"
  ]
}
```

**Plugin SDK Exports to Remove:**
- telegram, discord, slack, signal, imessage, whatsapp
- line, msteams, acpx, bluebubbles, copilot-proxy
- device-pair, diagnostics-otel, diffs, feishu, googlechat
- irc, llm-task, lobster, matrix, mattermost
- minimax-portal-auth, nextcloud-talk, nostr
- open-prose, phone-control, qwen-portal-auth
- synology-chat, talk-voice, thread-ownership
- tlon, twitch, voice-call, zalo, zalouser

**Action Items:**
- [ ] Remove channel SDK dependencies from package.json
- [ ] Remove plugin SDK exports from package.json
- [ ] Clean up tsconfig.json paths
- [ ] Update vitest.config.ts test paths
- [ ] Run `pnpm install` to clean node_modules
- [ ] Test TypeScript compilation

### Major Findings (Should Fix)

#### M1: Orphaned Plugin SDK Paths in tsconfig.json
**Severity:** MAJOR
**Location:** `tsconfig.json`

**Issues:**
- Extension paths removed but aliases remain
- May cause TypeScript compilation errors
- IDE confusion with missing paths

**Action Items:**
- [ ] Review all paths in tsconfig.json
- [ ] Remove references to deleted extensions
- [ ] Test IDE path resolution
- [ ] Verify TypeScript compilation

#### M2: Missing Circular Dependency Validation
**Severity:** MAJOR
**Location:** CI pipeline

**Issues:**
- No automated check for circular dependencies
- Large-scale removals may create import cycles

**Action Items:**
- [ ] Add `madge` to devDependencies
- [ ] Create circular dependency check script
- [ ] Add to CI pipeline
- [ ] Fix any detected cycles

### Security Findings

#### S1: Dependency Vulnerabilities
**Severity:** CRITICAL
**Status:** RESOLVED

**Finding:** 15 vulnerabilities detected in Phase 2 review
**Resolution:** `pnpm audit` shows "No known vulnerabilities found"
**Action:** None required - already resolved

---

## Week 3: Core Simplification

### Day 11-12: Simplify src/agents/

**Remove from src/agents/:**
```
src/agents/bash-tools.ts           # Shell execution
src/agents/pi-embedded-*.ts        # PI agent integration
src/agents/cli-runner.ts           # CLI execution
src/agents/claude-cli-runner.ts    # Claude CLI
src/agents/lanes.ts                # Execution lanes
src/agents/auth-profiles/          # Simplify to single profile
```

**Keep from src/agents/:**
```
src/agents/acp-spawn.ts            # Simplify
src/agents/model-selection.ts      # Keep
src/agents/tools/                  # Convert to equipment
src/agents/internal-events.ts      # Adapt
```

**Target:** Remove ~500 lines

**Action Items:**
- [ ] Remove bash execution code
- [ ] Remove PI agent integration
- [ ] Simplify auth profiles to single API key mode
- [ ] Keep core agent lifecycle
- [ ] Test compilation

### Day 13-14: Simplify src/acp/

**Remove from src/acp/:**
```
src/acp/translator.ts              # ACP protocol translation
src/acp/persistent-bindings.ts     # Persistent bindings
src/acp/server.ts                  # ACP server
src/acp/client.ts                  # ACP client
src/acp/control-plane/manager.runtime-controls.ts
src/acp/control-plane/manager.identity-reconcile.ts
```

**Keep and Simplify:**
```
src/acp/session.ts                 # Single-cell sessions
src/acp/control-plane/manager.ts   # Simplify
src/acp/event-mapper.ts            # Adapt to cell events
```

**Target:** Remove ~300 lines

**Action Items:**
- [ ] Remove ACP protocol complexity
- [ ] Simplify to single-cell session model
- [ ] Remove multi-agent coordination
- [ ] Adapt event mapper to cell events
- [ ] Test compilation

### Day 15-16: Simplify src/gateway/

**Remove from src/gateway/:**
```
src/gateway/plugins-http.ts       # HTTP plugin system
src/gateway/server-methods/       # Simplify to core methods
```

**Keep and Simplify:**
```
src/gateway/server.ts              # Simplify WebSocket server
src/gateway/protocol/              # Keep core protocol
src/gateway/ws-connection.ts       # WebSocket management
```

**Target:** Remove ~400 lines

**Action Items:**
- [ ] Remove plugin system
- [ ] Simplify WebSocket to cell-level only
- [ ] Remove webhook routing
- [ ] Keep core protocol
- [ ] Test compilation

### Day 17: Simplify src/config/

**Flatten Configuration Hierarchy:**
```typescript
// Before (5-level hierarchy)
global.channels.slack.accounts.account1.conversations.conversation1.agents

// After (flat per-cell)
{
  "cell_A1": { model, seed, equipment, ... },
  "cell_B2": { model, seed, equipment, ... }
}
```

**Remove from src/config/:**
```
src/config/sessions/               # Session config
src/config/*.config.ts             # Various configs (simplify)
```

**Keep and Simplify:**
```
src/config/paths.ts                # Cell paths only
```

**Target:** Remove ~200 lines

**Action Items:**
- [ ] Flatten 5-level hierarchy to single level
- [ ] Remove runtime config updates
- [ ] Simplify to per-cell config
- [ ] Test compilation

---

## Week 4: Minimal Core Loop

### Day 18-19: Create ~500-line Minimal Core

**Core Loop Architecture:**
```
TRIGGER → ROUTE → EXECUTE → RESPOND → CLEANUP
```

**Implementation:**
```typescript
// 1. TRIGGER: Cell data changed
onCellChange(cellId: string, data: any) {
  const claw = this.config[cellId];
  if (!claw) return;

  // 2. ROUTE: Match cell to claw config
  const instance = this.getInstance(claw);

  // 3. EXECUTE: Run claw with model and equipment
  const result = await instance.execute(data);

  // 4. RESPOND: Update cell value/state
  this.updateCell(cellId, result);

  // 5. CLEANUP: Return to dormant state
  instance.cleanup();
}
```

**Target:** ~500 lines total

**Action Items:**
- [ ] Implement cell trigger mechanism
- [ ] Add routing logic (match cell to claw config)
- [ ] Implement execution engine
- [ ] Add response handling
- [ ] Implement cleanup
- [ ] Test compilation

### Day 20: Implement Equipment System

**Equipment Pattern:**
```typescript
interface Equipment {
  id: string;
  type: EquipmentType;
  execute: (context: ExecutionContext) => Promise<any>;
}

// Convert tools to equipment
const tools = [
  { id: 'search', type: 'web-search', execute: searchWeb },
  { id: 'memory', type: 'memory-store', execute: storeMemory }
];

const equipment = tools.map(toEquipment);
```

**Action Items:**
- [ ] Convert tool execution to equipment pattern
- [ ] Add equipment registry
- [ ] Implement equipment lifecycle
- [ ] Add equipment validation
- [ ] Test compilation

### Day 21: Add Cell Integration

**Cell Integration:**
```typescript
class CellIntegration {
  private triggers: Map<string, ClawConfig>;

  // Cell trigger listeners
  subscribe(cellId: string, config: ClawConfig) {
    this.triggers.set(cellId, config);
  }

  // Cell update mechanisms
  update(cellId: string, result: ExecutionResult) {
    this.cells.set(cellId, result);
  }

  // Cell state persistence
  persist(cellId: string, state: CellState) {
    this.storage.set(cellId, state);
  }

  // Cell lifecycle management
  activate(cellId: string) { /* ... */ }
  deactivate(cellId: string) { /* ... */ }
}
```

**Action Items:**
- [ ] Cell trigger listeners
- [ ] Cell update mechanisms
- [ ] Cell state persistence
- [ ] Cell lifecycle management
- [ ] Test compilation

---

## Success Criteria

### Immediate (Review Findings)
- [ ] Channel SDKs removed from package.json
- [ ] tsconfig.json paths cleaned up
- [ ] Dependency vulnerabilities fixed (already resolved)
- [ ] npm audit clean (already clean)

### Week 3 (Core Simplification)
- [ ] src/agents/ simplified (~500 lines removed)
- [ ] src/acp/ simplified (~300 lines removed)
- [ ] src/gateway/ simplified (~400 lines removed)
- [ ] src/config/ flattened (~200 lines removed)
- [ ] TypeScript compiles with zero errors

### Week 4 (Minimal Core)
- [ ] ~500-line core loop implemented
- [ ] Equipment system working
- [ ] Cell trigger mechanism functional
- [ ] Integration tests passing

---

## Risk Mitigation

### High Risk Areas
1. **Hidden Dependencies:** Some "unused" code may have hidden dependencies
   - **Mitigation:** Test compilation after each major removal

2. **Breaking Changes:** Removing code may break dependent systems
   - **Mitigation:** Systematic testing at each stage

3. **Performance Regression:** Simplified code may be slower
   - **Mitigation:** Performance testing after simplification

### Rollback Plan
- Each day's work is a separate commit
- Can rollback to any previous commit
- phase-2-stripping branch remains stable

---

## Workflow

1. **Address review findings first** (1-2 hours)
2. **Create feature branch** `phase-3-simplification` from `phase-2-stripping`
3. **Start with dependency cleanup** (package.json, tsconfig.json)
4. **Fix security vulnerabilities** (already resolved)
5. **Simplify core modules** (agents, acp, gateway, config)
6. **Implement minimal core loop** (~500 lines)
7. **Add equipment system**
8. **Add cell integration**
9. **Test thoroughly**
10. **Document changes**

---

## Documentation

Read Phase 2 documentation first:
- `claw/docs/PHASE_2_PLAN.md`
- `claw/docs/PHASE_2_STATUS.md`
- `claw/docs/QUICK_REFERENCE.md`

## Review Reports

Review the findings before starting:
- `/c/Users/casey/polln/REVIEW_ARCHITECTURE.md`
- `/c/Users/casey/polln/REVIEW_CODE_QUALITY.md`
- `/c/Users/casey/polln/PHASE_2_SECURITY_AUDIT_REPORT.md`

---

## Next Steps

1. **Create Phase 3 branch**
2. **Address critical review findings**
3. **Begin core simplification**
4. **Implement minimal core loop**
5. **Test and validate**

---

**Phase 3 Start Date:** 2026-03-15
**Target Completion:** 2026-03-29 (2 weeks)
**Status:** READY TO START
**Current Focus:** Addressing review findings

---

**Last Updated:** 2026-03-15
**Next Update:** End of Week 3 Day 1 (2026-03-16)
