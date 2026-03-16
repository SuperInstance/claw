# Component Inventory

**Project:** SuperInstance Claw - Minimal Cellular Agent Engine
**Inventory Date:** 2026-03-15
**Source:** OpenCLAW codebase analysis
**Purpose:** Catalog all components for conversion to minimal Claw engine

---

## Table of Contents

1. [Core Modules](#core-modules)
2. [Extension Catalog](#extension-catalog)
3. [Configuration Components](#configuration-components)
4. [Data Models](#data-models)
5. [Utilities](#utilities)
6. [Testing Infrastructure](#testing-infrastructure)

---

## 1. Core Modules

### 1.1 Agent Control Protocol (ACP)

**Location:** `src/acp/`

| File/Module | Lines | Purpose | Keep? | Notes |
|-------------|-------|---------|-------|-------|
| `session.ts` | 191 | In-memory session store | SIMPLIFY | Single-cell sessions |
| `control-plane/manager.ts` | 500+ | Agent lifecycle management | KEEP | Simplify to single-claw |
| `control-plane/manager.runtime-controls.ts` | 200+ | Runtime controls | REMOVE | Too complex |
| `control-plane/manager.identity-reconcile.ts` | 150+ | Identity reconciliation | REMOVE | Not needed |
| `control-plane/runtime-cache.ts` | 99 | Runtime caching | KEEP | Useful |
| `control-plane/runtime-options.ts` | 349 | Runtime options | SIMPLIFY | Reduce options |
| `translator.ts` | 300+ | ACP protocol translation | REMOVE | Use WebSocket directly |
| `policy.ts` | 200+ | Authorization policy | SIMPLIFY | Basic auth only |
| `event-mapper.ts` | 150+ | Event mapping | KEEP | Adapt to cell events |
| `persistent-bindings.ts` | 400+ | Persistent bindings | REMOVE | Not needed |
| `server.ts` | 150+ | ACP server | REMOVE | Use simple WebSocket |
| `client.ts` | 100+ | ACP client | REMOVE | Not needed |

**Total:** ~2,500 lines
**Target:** ~500 lines (80% reduction)

### 1.2 Agent Execution

**Location:** `src/agents/`

| File/Module | Lines | Purpose | Keep? | Notes |
|-------------|-------|---------|-------|-------|
| `acp-spawn.ts` | 300+ | Spawn agent process | KEEP | Simplify |
| `bash-tools.ts` | 2000+ | Shell execution | REMOVE | Not needed |
| `model-selection.ts` | 400+ | Model routing | KEEP | Core feature |
| `auth-profiles/` | 2000+ | Auth profile management | SIMPLIFY | Single profile |
| `tools/` | 3000+ | Function calling | KEEP | Convert to equipment |
| `pi-embedded-*` | 1000+ | PI agent integration | REMOVE | External dep |
| `cli-runner.ts` | 500+ | CLI execution | REMOVE | Not needed |
| `claude-cli-runner.ts` | 400+ | Claude CLI | REMOVE | Not needed |
| `identity.ts` | 300+ | Agent identity | SIMPLIFY | Cell ID only |
| `lanes.ts` | 200+ | Execution lanes | REMOVE | Too complex |
| `internal-events.ts` | 150+ | Event emission | KEEP | Adapt |
| `compaction.ts` | 100+ | Response compaction | MAYBE | If needed |

**Total:** ~10,000 lines
**Target:** ~2,000 lines (80% reduction)

### 1.3 Channels

**Location:** `src/channels/`

| File/Module | Lines | Purpose | Keep? | Notes |
|-------------|-------|---------|-------|-------|
| `channel-config.ts` | 300+ | Channel configuration | REMOVE | Not needed |
| `account-snapshot-fields.ts` | 100+ | Account management | REMOVE | Not needed |
| `allowlist-*.ts` | 200+ | Allowlist filtering | REMOVE | Not needed |
| `command-gating.ts` | 150+ | Command gating | REMOVE | Not needed |
| `mention-gating.ts` | 100+ | Mention gating | REMOVE | Not needed |
| `conversation-label.ts` | 100+ | Conversation labels | REMOVE | Not needed |
| `draft-stream-*.ts` | 200+ | Response streaming | KEEP | Adapt to cells |
| `inbound-debounce-policy.ts` | 100+ | Debouncing | MAYBE | If needed |
| `location.ts` | 100+ | Channel location | REMOVE | Not needed |
| `logging.ts` | 100+ | Channel logging | KEEP | Adapt |
| `model-overrides.ts` | 150+ | Model overrides | SIMPLIFY | Per-claw model |
| `plugins/` | 5000+ | Channel plugins | REMOVE | All |
| `transport/` | 100+ | Transport layer | SIMPLIFY | WebSocket only |

**Total:** ~8,000 lines
**Target:** ~500 lines (94% reduction)

### 1.4 Gateway

**Location:** `src/gateway/`

| File/Module | Lines | Purpose | Keep? | Notes |
|-------------|-------|---------|-------|-------|
| `server.ts` | 300+ | HTTP/WebSocket server | KEEP | Simplify |
| `protocol/*.ts` | 1000+ | Message protocol | KEEP | Adapt |
| `server-methods/` | 2000+ | API methods | SIMPLIFY | Core only |
| `ws-connection.ts` | 300+ | WebSocket management | KEEP | Core feature |
| `plugins-http.ts` | 200+ | HTTP plugins | REMOVE | Not needed |

**Total:** ~4,000 lines
**Target:** ~1,000 lines (75% reduction)

### 1.5 Configuration

**Location:** `src/config/`

| File/Module | Lines | Purpose | Keep? | Notes |
|-------------|-------|---------|-------|-------|
| `paths.ts` | 100+ | Path resolution | SIMPLIFY | Cell paths only |
| `sessions/` | 200+ | Session config | REMOVE | Not needed |
| `*.config.ts` | 500+ | Various configs | SIMPLIFY | Flat config |

**Total:** ~1,000 lines
**Target:** ~200 lines (80% reduction)

### 1.6 Cron

**Location:** `src/cron/`

| File/Module | Lines | Purpose | Keep? | Notes |
|-------------|-------|---------|-------|-------|
| `service.ts` | 300+ | Scheduled automation | KEEP | For time triggers |
| `isolated-agent.ts` | 200+ | Isolated execution | REMOVE | Not needed |

**Total:** ~500 lines
**Target:** ~300 lines (40% reduction)

### 1.7 Memory

**Location:** `src/memory/`

| File/Module | Lines | Purpose | Keep? | Notes |
|-------------|-------|---------|-------|-------|
| `*.ts` | 1000+ | Memory storage | KEEP | Convert to equipment |

**Total:** ~1,000 lines
**Target:** ~500 lines (50% reduction, becomes equipment)

### 1.8 Providers

**Location:** `src/providers/`

| File/Module | Lines | Purpose | Keep? | Notes |
|-------------|-------|---------|-------|-------|
| `github-copilot-auth.ts` | 200+ | GitHub Copilot auth | REMOVE | Not needed |
| `github-copilot-models.ts` | 100+ | GitHub Copilot models | REMOVE | Not needed |
| `qwen-portal-oauth.ts` | 100+ | Qwen OAuth | REMOVE | Not needed |
| `google-shared.ts` | 200+ | Google shared | KEEP | For Google models |
| `kilocode-shared.ts` | 100+ | Kilocode | REMOVE | Not needed |

**Total:** ~1,000 lines
**Target:** ~300 lines (70% reduction)

### 1.9 Other Modules

| Module | Lines | Purpose | Keep? | Notes |
|--------|-------|---------|-------|-------|
| `src/cli/` | 5000+ | CLI interface | REMOVE | Not needed |
| `src/tui/` | 3000+ | Terminal UI | REMOVE | Not needed |
| `src/daemon/` | 1000+ | Daemon process | REMOVE | Not needed |
| `src/node-host/` | 500+ | Node hosting | KEEP | For embedded mode |
| `src/plugins/` | 2000+ | Plugin system | REMOVE | Not needed |
| `src/hooks/` | 1000+ | Lifecycle hooks | SIMPLIFY | Basic hooks |
| `src/security/` | 500+ | Security | KEEP | Adapt |
| `src/process/` | 1000+ | Process management | REMOVE | Not needed |
| `src/test-helpers/` | 2000+ | Test utilities | KEEP | For testing |

**Total:** ~16,000 lines
**Target:** ~1,000 lines (94% reduction)

---

## 2. Extension Catalog

### 2.1 Channel Extensions (REMOVE ALL)

**Total:** 40+ extensions, ~15,000 lines

| Extension | Files | Lines | Remove? |
|-----------|-------|-------|---------|
| `slack/` | 50+ | 2000+ | YES |
| `discord/` | 40+ | 1500+ | YES |
| `telegram/` | 30+ | 1000+ | YES |
| `whatsapp/` | 40+ | 1500+ | YES |
| `signal/` | 30+ | 1000+ | YES |
| `imessage/` | 30+ | 1000+ | YES |
| `feishu/` | 20+ | 500+ | YES |
| `googlechat/` | 20+ | 500+ | YES |
| `msteams/` | 20+ | 500+ | YES |
| `mattermost/` | 20+ | 500+ | YES |
| `matrix/` | 30+ | 1000+ | YES |
| `irc/` | 20+ | 500+ | YES |
| `nextcloud-talk/` | 20+ | 500+ | YES |
| `synology-chat/` | 20+ | 500+ | YES |
| `bluebubbles/` | 30+ | 1000+ | YES |
| `zalo/` | 20+ | 500+ | YES |
| `line/` | 20+ | 500+ | YES |
| `twitch/` | 20+ | 500+ | YES |
| `nostr/` | 20+ | 500+ | YES |
| `tlon/` | 20+ | 500+ | YES |
| `[20+ more...]` | 400+ | 8000+ | YES |

### 2.2 Model Provider Extensions (KEEP 11)

**Target:** Keep 11 core providers, remove others

| Extension | Files | Lines | Keep? | Priority |
|-----------|-------|-------|-------|----------|
| `openai/` | 20+ | 500+ | YES | HIGH |
| `anthropic/` | 10+ | 300+ | YES | HIGH |
| `deepseek/` | 10+ | 300+ | YES | HIGH |
| `google/` | 20+ | 500+ | YES | HIGH |
| `mistral/` | 10+ | 300+ | YES | MEDIUM |
| `cloudflare-ai-gateway/` | 10+ | 200+ | YES | LOW |
| `ollama/` | 20+ | 500+ | YES | HIGH (local) |
| `together/` | 10+ | 300+ | MAYBE | LOW |
| `replicate/` | 10+ | 300+ | MAYBE | LOW |
| `openrouter/` | 10+ | 300+ | MAYBE | LOW |
| `huggingface/` | 10+ | 300+ | MAYBE | LOW |
| `[10+ others...]` | 100+ | 3000+ | NO | - |

**Keep:** ~3,000 lines
**Remove:** ~6,000 lines

### 2.3 Utility Extensions (REMOVE OR INTEGRATE)

| Extension | Files | Lines | Keep? | Action |
|-----------|-------|-------|-------|--------|
| `memory-core/` | 20+ | 500+ | INTEGRATE | Become equipment |
| `memory-lancedb/` | 20+ | 500+ | NO | Use simple storage |
| `diagnostics-otel/` | 10+ | 300+ | NO | Not needed |
| `diffs/` | 10+ | 300+ | NO | Not needed |
| `voice-call/` | 30+ | 1000+ | NO | Not needed |
| `phone-control/` | 20+ | 500+ | NO | Not needed |
| `device-pair/` | 10+ | 300+ | NO | Not needed |
| `copilot-proxy/` | 10+ | 300+ | NO | Not needed |
| `acpx/` | 20+ | 500+ | NO | ACP protocol |
| `llm-task/` | 10+ | 300+ | NO | Not needed |
| `lobster/` | 10+ | 300+ | NO | Not needed |
| `test-utils/` | 10+ | 300+ | KEEP | For testing |
| `thread-ownership/` | 10+ | 300+ | NO | Not needed |

**Remove:** ~4,000 lines
**Integrate:** ~500 lines (as equipment)

---

## 3. Configuration Components

### 3.1 Configuration Files

| File | Purpose | Keep? | Notes |
|------|---------|-------|-------|
| `config.yaml` | Global config | REMOVE | Not needed |
| `channels.yaml` | Channel configs | REMOVE | Not needed |
| `agents.yaml` | Agent configs | SIMPLIFY | Per-claw config |
| `models.yaml` | Model configs | KEEP | Simplify |
| `.env.example` | Environment vars | KEEP | Adapt |

### 3.2 Configuration Schema

**Current (OpenCLAW):**
```yaml
# 5-level hierarchy
global:
  channels:
    slack:
      accounts:
        - account1:
            conversations:
              - conversation1:
                  agents: [...]
```

**Target (Claw):**
```typescript
// Single level
{
  claws: {
    "cell_A1": { model, seed, equipment, ... },
    "cell_B2": { model, seed, equipment, ... }
  }
}
```

---

## 4. Data Models

### 4.1 Core Models

| Model | Source | Keep? | Target Schema |
|-------|--------|-------|---------------|
| **Agent** | src/agents/ | KEEP | Claw |
| **Session** | src/acp/session.ts | SIMPLIFY | ClawInstance |
| **Channel** | src/channels/ | REMOVE | Cell |
| **Account** | src/channels/ | REMOVE | N/A |
| **Conversation** | src/channels/ | REMOVE | N/A |
| **Message** | src/channels/ | KEEP | CellEvent |
| **Tool** | src/agents/tools/ | KEEP | Equipment |
| **Model** | src/providers/ | KEEP | ModelProvider |

### 4.2 State Models

| Model | Current States | Target States |
|-------|----------------|---------------|
| **Agent** | 8 states | 6 states |
| **Session** | 6 states | 3 states |
| **Message** | 10+ statuses | 3 statuses |

---

## 5. Utilities

### 5.1 Shared Utilities

| Utility | Location | Keep? | Notes |
|---------|----------|-------|-------|
| `logging.ts` | src/logging/ | KEEP | Adapt |
| `errors.ts` | src/ | KEEP | Adapt |
| `validation.ts` | src/ | KEEP | For schemas |
| `metrics.ts` | src/ | KEEP | For monitoring |
| `performance.ts` | src/ | KEEP | For optimization |
| `security.ts` | src/security/ | KEEP | Adapt |

### 5.2 Test Utilities

| Utility | Location | Keep? | Notes |
|---------|----------|-------|-------|
| `test-helpers/` | src/ | KEEP | Essential |
| `fixtures/` | test/ | KEEP | For testing |
| `mocks/` | test/ | KEEP | For testing |

---

## 6. Testing Infrastructure

### 6.1 Test Files

| Category | Files | Lines | Keep? |
|----------|-------|-------|-------|
| Unit tests | ~1,500 | ~30,000 | KEEP (adapt) |
| Integration tests | ~300 | ~10,000 | KEEP (adapt) |
| E2E tests | ~100 | ~5,000 | REMOVE (channel-specific) |
| Live tests | ~50 | ~2,000 | REMOVE (channel-specific) |
| Performance tests | ~20 | ~1,000 | KEEP (adapt) |

**Total:** ~2,000 test files
**Target:** ~500 test files (75% reduction)

### 6.2 Test Framework

| Component | Keep? | Notes |
|-----------|-------|-------|
| `vitest` | YES | Test runner |
| `vitest.config.ts` | KEEP | Adapt |
| Test helpers | KEEP | Adapt |
| Fixtures | KEEP | Simplify |
| Mocks | KEEP | Simplify |

---

## Summary Statistics

### File Count Summary

| Category | Before | After | Reduction |
|----------|--------|-------|-----------|
| **Core Modules** | ~500 files | ~100 files | 80% |
| **Extensions** | 70 extensions | 11 extensions | 84% |
| **Configuration** | ~50 files | ~10 files | 80% |
| **Tests** | ~2,000 files | ~500 files | 75% |
| **Total** | ~2,600 files | ~620 files | 76% |

### Line Count Summary

| Category | Before | After | Reduction |
|----------|--------|-------|-----------|
| **Core Code** | ~75,000 lines | ~5,000 lines | 93% |
| **Extensions** | ~25,000 lines | ~3,000 lines | 88% |
| **Tests** | ~48,000 lines | ~10,000 lines | 79% |
| **Total** | ~150,000 lines | ~18,000 lines | 88% |

---

## Conversion Priority

### Phase 2: Strip (Week 2-3)

**Remove First:**
1. All channel integrations (40 extensions)
2. All apps/ directory
3. All ui/ directory
4. CLI/TUI interfaces
5. Plugin system
6. Bash execution
7. PI agent integration

**Remove Second:**
1. Complex auth profiles
2. Multi-account support
3. Webhook infrastructure
4. Daemon process
5. Process management
6. Unused utilities

### Phase 3: Implement (Week 4-6)

**Implement First:**
1. Claw class (minimal)
2. Model integration
3. Seed learning
4. Equipment system
5. State machine

**Implement Second:**
1. Social architecture
2. Performance optimizations
3. Observability
4. Testing infrastructure

---

**Inventory Complete:** 2026-03-15
**Next:** Phase 2 - Stripping unnecessary components
