# Phase 2 Implementation Plan: OpenCLAW Code Removal

**Project:** SuperInstance Claw - Minimal Cellular Agent Engine
**Start Date:** 2026-03-15
**Status:** IN PROGRESS
**Branch:** `phase-2-stripping`

---

## Executive Summary

Phase 2 systematically removes 80-90% of OpenCLAW codebase to create a minimal ~500-line cellular agent engine for spreadsheet deployment.

**Target Metrics:**
- Files: 2,393 → ~300 (87% reduction)
- Lines: ~150K → ~5K (97% reduction)
- Dependencies: 100+ → 20 (80% reduction)

---

## Week 1: Remove Channel Integrations

### Day 1-2: Channel Extensions (40+ extensions)

**Extensions to Remove:**
```
extensions/discord/
extensions/telegram/
extensions/slack/
extensions/whatsapp/
extensions/signal/
extensions/imessage/
extensions/feishu/
extensions/googlechat/
extensions/msteams/
extensions/mattermost/
extensions/matrix/
extensions/irc/
extensions/nextcloud-talk/
extensions/synology-chat/
extensions/bluebubbles/
extensions/zalo/
extensions/line/
extensions/twitch/
extensions/nostr/
extensions/tlon/
extensions/byteplus/
extensions/kilocode/
extensions/kimi-coding/
extensions/moonshot/
extensions/minimax/
extensions/modelstudio/
extensions/qianfan/
extensions/copilot-proxy/
extensions/device-pair/
extensions/diagnostics-otel/
extensions/diffs/
extensions/llm-task/
extensions/lobster/
extensions/phone-control/
extensions/acpx/
extensions/open-prose/
extensions/thread-ownership/
extensions/voice-call/
extensions/github-copilot/
extensions/minimax-portal-auth/
extensions/qwen-portal-auth/
```

**Extensions to Keep:**
```
extensions/openai/          # OpenAI models
extensions/anthropic/       # Anthropic models
extensions/deepseek/        # DeepSeek models
extensions/google/          # Google models
extensions/mistral/         # Mistral models
extensions/ollama/          # Local models
extensions/cloudflare-ai-gateway/  # Cloudflare gateway
extensions/huggingface/     # HuggingFace models (maybe)
extensions/openrouter/      # OpenRouter (maybe)
extensions/perplexity/      # Perplexity (maybe)
extensions/memory-core/     # Memory (convert to equipment)
extensions/brave/           # Brave search (maybe)
extensions/nvidia/          # NVIDIA models (maybe)
extensions/opencode/        # OpenCode (maybe)
extensions/opencode-go/     # OpenCode Go (maybe)
```

**Dependencies to Remove:**
```json
{
  "remove": [
    "@slack/bolt",
    "@slack/web-api",
    "discord-api-types",
    "@discordjs/voice",
    "grammy",
    "@grammyjs/runner",
    "@grammyjs/transformer-throttler",
    "@whiskeysockets/baileys",
    "@line/bot-sdk",
    "@larksuiteoapi/node-sdk",
    "@buape/carbon",
    "@matrix-org/matrix-sdk-crypto-nodejs",
    "@tloncorp/api"
  ]
}
```

**Action Items:**
- [ ] Create `phase-2-stripping` branch
- [ ] Remove 40+ channel extensions
- [ ] Remove channel SDK dependencies from package.json
- [ ] Update tsconfig.json paths
- [ ] Update vitest.config.ts test paths
- [ ] Test TypeScript compilation
- [ ] Document removed extensions in CHANGELOG.md

---

### Day 3-4: Remove src/channels/

**Directory to Remove Entirely:**
```
src/channels/
├── channel-config.ts
├── account-snapshot-fields.ts
├── allowlist-*.ts
├── command-gating.ts
├── mention-gating.ts
├── conversation-label.ts
├── draft-stream-*.ts
├── inbound-debounce-policy.ts
├── location.ts
├── logging.ts
├── model-overrides.ts
├── plugins/
└── transport/
```

**Files to Update (remove imports from):**
- `src/agents/` - Remove channel-specific tool imports
- `src/gateway/` - Remove channel plugin imports
- `src/plugins/` - Remove channel plugin registrations
- `test/` - Remove channel-specific tests

**Action Items:**
- [ ] Delete src/channels/ directory
- [ ] Update all import statements
- [ ] Remove channel-specific tests
- [ ] Test TypeScript compilation
- [ ] Document changes

---

### Day 5: Remove src/cli/, src/tui/, src/daemon/

**Directories to Remove:**
```
src/cli/        # Command-line interface
src/tui/        # Terminal UI
src/daemon/     # Daemon process
```

**Files to Update:**
- `package.json` - Remove CLI scripts
- `src/index.ts` - Remove CLI exports
- `scripts/` - Update build scripts

**Action Items:**
- [ ] Delete src/cli/ directory
- [ ] Delete src/tui/ directory
- [ ] Delete src/daemon/ directory
- [ ] Update package.json scripts
- [ ] Update src/index.ts
- [ ] Test compilation

---

## Week 2: Remove Applications and UI

### Day 6-7: Remove apps/

**Directory to Remove:**
```
apps/
├── android/      # Android application
├── ios/          # iOS application
├── macos/        # macOS application
└── shared/       # Shared native code
```

**Files to Update:**
- `package.json` - Remove mobile build scripts
- `tsconfig.json` - Remove app paths
- `scripts/` - Remove mobile build scripts

**Action Items:**
- [ ] Delete apps/ directory
- [ ] Update package.json (remove android/ios/mac scripts)
- [ ] Update tsconfig.json
- [ ] Update build scripts
- [ ] Test compilation

---

### Day 8-9: Remove ui/

**Directory to Remove:**
```
ui/              # React web UI
```

**Files to Update:**
- `package.json` - Remove UI scripts
- `scripts/` - Remove UI build scripts

**Action Items:**
- [ ] Delete ui/ directory
- [ ] Update package.json (remove ui:* scripts)
- [ ] Update build scripts
- [ ] Test compilation

---

### Day 10: Simplify src/agents/

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

**Action Items:**
- [ ] Remove bash execution code
- [ ] Remove PI agent integration
- [ ] Simplify auth profiles
- [ ] Keep core agent lifecycle
- [ ] Test compilation

---

## Week 3: Simplify Core Modules

### Day 11-12: Simplify src/acp/

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

**Action Items:**
- [ ] Remove ACP protocol code
- [ ] Simplify session management
- [ ] Adapt event mapper
- [ ] Test compilation

---

### Day 13-14: Simplify src/gateway/

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

**Action Items:**
- [ ] Remove HTTP plugin system
- [ ] Simplify WebSocket server
- [ ] Keep core protocol
- [ ] Test compilation

---

### Day 15: Simplify src/config/

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

**Action Items:**
- [ ] Flatten configuration structure
- [ ] Remove hierarchical config loading
- [ ] Create flat claw config schema
- [ ] Test compilation

---

## Week 4: Final Cleanup and Testing

### Day 16-17: Remove Unused Dependencies

**Dependencies to Remove from package.json:**
```json
{
  "remove": [
    "@agentclientprotocol/sdk",
    "@mariozechner/pi-agent-core",
    "@mariozechner/pi-ai",
    "@mariozechner/pi-coding-agent",
    "@mariozechner/pi-tui",
    "@modelcontextprotocol/sdk",
    "playwright-core",
    "pdfjs-dist",
    "sharp",
    "sqlite-vec",
    "linkedom",
    "markdown-it",
    "jszip",
    "file-type",
    "tar",
    "commander",
    "@clack/prompts",
    "qrcode-terminal",
    "osc-progress",
    "chalk",
    "cli-highlight"
  ]
}
```

**Dependencies to Keep:**
```json
{
  "keep": [
    "zod",
    "ws",
    "express",
    "dotenv",
    "undici",
    "yaml",
    "tslog",
    "ajv",
    "@sinclair/typebox",
    "openai",
    "anthropic",
    "@google/generative-ai",
    "@mistralai/mistralai",
    "ollama"
  ]
}
```

**Action Items:**
- [ ] Update package.json
- [ ] Run `pnpm install`
- [ ] Test compilation
- [ ] Fix any breaking changes

---

### Day 18-19: Update Tests

**Test Categories:**
- **Keep:** Unit tests for core logic
- **Remove:** Channel-specific tests
- **Remove:** E2E tests for channels
- **Remove:** Live tests for channels
- **Update:** Integration tests for simplified code

**Action Items:**
- [ ] Remove channel-specific tests
- [ ] Update unit tests
- [ ] Update integration tests
- [ ] Run test suite
- [ ] Fix failing tests

---

### Day 20: Documentation and Validation

**Documentation to Update:**
- `CHANGELOG.md` - Document all changes
- `README.md` - Update project description
- `docs/` - Update technical docs
- Create `docs/PHASE_2_SUMMARY.md`

**Validation Checklist:**
- [ ] TypeScript compiles with zero errors
- [ ] All tests pass
- [ ] No circular dependencies
- [ ] Bundle size reduced by 80%+
- [ ] Startup time < 100ms
- [ ] Memory footprint < 20MB
- [ ] Documentation complete

**Action Items:**
- [ ] Update CHANGELOG.md
- [ ] Update README.md
- [ ] Create PHASE_2_SUMMARY.md
- [ ] Run final validation
- [ ] Create PR to main

---

## Success Metrics

### Code Reduction
- [ ] Files: 2,393 → ~300 (87% reduction)
- [ ] Lines: ~150K → ~5K (97% reduction)
- [ ] Extensions: 70 → 11 (84% reduction)
- [ ] Dependencies: 100+ → 20 (80% reduction)

### Performance Targets
- [ ] Startup time: < 100ms
- [ ] Memory per claw: < 10MB
- [ ] Bundle size: < 50MB

### Functional Completeness
- [ ] Agent lifecycle working
- [ ] Model abstraction working
- [ ] Tool execution working
- [ ] Session management working
- [ ] Streaming working
- [ ] Error handling working

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
- Each week's work is a separate commit
- Can rollback to any previous commit
- Main branch remains stable

---

## Next Steps

### Phase 3: Core Implementation (Week 5-7)
1. Implement Claw class
2. Add model integration
3. Implement seed learning
4. Create equipment system
5. Build state machine

### Phase 4: Testing (Week 8-9)
1. Unit tests
2. Integration tests
3. Performance validation
4. Load testing

### Phase 5: Documentation (Week 10)
1. API docs
2. Deployment guides
3. Migration guides

---

**Phase 2 Start Date:** 2026-03-15
**Target Completion:** 2026-04-05 (3 weeks)
**Status:** IN PROGRESS
**Current Focus:** Removing channel integrations

---

**Last Updated:** 2026-03-15
**Next Update:** End of Week 1 (2026-03-22)
