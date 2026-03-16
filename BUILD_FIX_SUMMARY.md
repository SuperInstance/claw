# Build Error Fix Summary - Day 13-14 ACP Simplification

**Date:** 2026-03-16
**Status:** EXTENSIVE ISSUES DISCOVERED - Much larger than initially reported
**Branch:** day-13-14-acp-simplification

---

## Problem Identified

The build was failing because `src/plugin-sdk/index.ts` still contained hundreds of imports from extension modules that were removed during Day 11-12 channel simplification.

### Initial Error Pattern
```
[UNRESOLVED_IMPORT] Error: Could not resolve '../../extensions/{channel}/src/{file}.js'
```

### Current Error Pattern (After Investigation)
```
[UNRESOLVED_IMPORT] Error: Could not resolve '../../extensions/{channel}/src/{file}.js'
[UNRESOLVED_IMPORT] Error: Could not resolve '../../agents/pi-embedded-helpers.js'
[UNRESOLVED_IMPORT] Error: Could not resolve '../../cli/{file}.js'
[UNRESOLVED_IMPORT] Error: Could not resolve '../channels/allow-from.js'
```

---

## Issue Scope Evolution

### Initially Reported: 34 errors
### After Investigation: 69+ errors (and growing)

**The issue is MUCH larger than initially reported.** As we fix imports in one layer, we uncover more dependencies in deeper layers.

---

## Fixes Applied (Commit: IN_PROGRESS)

### 1. tsconfig.json - Attempted Exclusions
```json
"exclude": [
  "node_modules",
  "dist",
  "extensions/**/*",
  "**/*.test.ts",
  "**/*.test.tsx",
  "src/cli/**",
  "src/agents/model-fallback.ts",
  "src/agents/failover-error.ts",
  "src/auto-reply/reply/normalize-reply.ts",
  "src/commands/agent/delivery.ts",
  "src/plugins/runtime/runtime-tools.ts"
]
```
**Result:** ❌ FAILED - rolldown build system doesn't respect tsconfig exclusions

### 2. src/commands/agent.ts - Commented Out Problematic Imports
```typescript
// import { FailoverError } from "../agents/failover-error.js"; // REMOVED: Missing pi-embedded-helpers.js
// import { runWithModelFallback } from "../agents/model-fallback.js"; // REMOVED: Missing pi-embedded-helpers.js
// import { normalizeReplyPayload } from "../auto-reply/reply/normalize-reply.js"; // REMOVED: Missing pi-embedded-helpers.js
// import { deliverAgentCommandResult } from "./agent/delivery.js"; // REMOVED: Missing cli/outbound-send-deps.js
```

### 3. src/plugins/runtime/runtime-tools.ts - Commented Out Memory CLI
```typescript
// import { registerMemoryCli } from "../../cli/memory-cli.js"; // REMOVED: Missing file
```

### 4. src/plugin-sdk/outbound-media.ts - Commented Out WhatsApp Dependency
```typescript
// import { loadWebMedia } from "../../extensions/whatsapp/src/media.js"; // REMOVED: WhatsApp extension removed
```

### 5. src/plugin-sdk/slack-message-actions.ts - Commented Out Slack Dependency
```typescript
// import { parseSlackBlocksInput } from "../../extensions/slack/src/blocks-input.js"; // REMOVED: Slack extension removed
```

### 6. src/plugin-sdk/channel-config-helpers.ts - Commented Out iMessage/WhatsApp Dependencies
```typescript
// import { resolveIMessageAccount } from "../../extensions/imessage/src/accounts.js"; // REMOVED: iMessage extension removed
// import { resolveWhatsAppAccount } from "../../extensions/whatsapp/src/accounts.js"; // REMOVED: WhatsApp extension removed
// import { normalizeWhatsAppAllowFromEntries } from "../channels/plugins/normalize/whatsapp.js"; // REMOVED: WhatsApp extension removed
```

### 7. src/plugins/runtime/runtime-channel.ts - Commented Out ALL Extension Imports
**54+ imports commented out** for Discord, iMessage, Signal, Slack, Telegram, WhatsApp, Line

### 8. src/plugins/runtime/runtime-media.ts - Commented Out WhatsApp Media
```typescript
// import { loadWebMedia } from "../../../extensions/whatsapp/src/media.js"; // REMOVED: WhatsApp extension removed
```

### 9. src/auto-reply/reply/normalize-reply.ts - Commented Out PI Helpers
```typescript
// import { sanitizeUserFacingText } from "../../agents/pi-embedded-helpers.js"; // REMOVED: Missing file
```

### 10. src/auto-reply/reply/dispatch-from-config.ts - Commented Out Discord Dependency
```typescript
// import { shouldSuppressLocalDiscordExecApprovalPrompt } from "../../../extensions/discord/src/exec-approvals.js"; // REMOVED: Discord extension removed
```

**Total Files Modified:** 11 files
**Total Imports Commented Out:** 100+ import statements

---

## Current Build Status

### Initial State: ❌ 37 errors
### After First Fix: ❌ 34 errors (CLI/embedded issues exposed)
### After Second Fix: ❌ 32 errors (Plugin SDK issues exposed)
### After Third Fix: ❌ 69 errors (Deep dependencies exposed)

**Pattern:** Each fix layer exposes more errors deeper in the dependency chain.

---

## Remaining Build Errors (69+ total)

### Extension Import Errors (30+)
- src/auto-reply/reply/route-reply.ts - Slack imports
- src/security/dm-policy-shared.ts - Channels imports
- Multiple files still importing from removed extensions

### PI Embedded Helpers Errors (10+)
- src/auto-reply/reply/reply-payloads.ts
- src/agents/tools/sessions-helpers.ts
- src/agents/tools/slack-actions.ts
- Other files importing pi-embedded-helpers.js

### Channel/System Errors (20+)
- Missing ../channels/allow-from.js
- Missing channels/plugins/normalize/* files
- Missing channels/plugins/actions/* files

### Missing CLI/Embedded Code (9+)
- Missing pi-embedded-helpers.js (PI embedded system)
- Missing cli/outbound-send-deps.js
- Missing cli/memory-cli.js

---

## Root Cause Analysis

**The problem is not just "34 errors" - it's a SYSTEMIC ARCHITECTURE ISSUE:**

1. **Day 11-12 Simplification Removed 80-90% of Code**
   - 52 extensions removed
   - 629K lines deleted
   - BUT: Import cleanup was incomplete

2. **Deep Dependency Coupling**
   - Extension code was deeply integrated into core systems
   - Auto-reply system depends on extensions
   - Security system depends on extensions
   - Plugin runtime depends on extensions
   - Agent tools depend on extensions

3. **Cascading Failure Pattern**
   ```
   Fix layer 1 → Exposes layer 2 → Exposes layer 3 → Exposes layer N
   ```

4. **Build System Limitations**
   - rolldown/tsdown doesn't respect tsconfig exclusions
   - Can't easily exclude subdirectories
   - Must fix imports at source

---

## Recommended Approach - REVISED

### ❌ Option A: Targeted Fixes (1-2 hours)
**Status:** NOT FEASIBLE - Issue is too extensive
**Reason:** Each fix uncovers 10+ more errors

### ❌ Option B: Exclude CLI and Embedded Code (30 minutes)
**Status:** NOT FEASIBLE - Build system doesn't support it
**Reason:** rolldown ignores tsconfig exclusions

### ⚠️ Option C: Create Stub Files (2-3 hours)
**Status:** PARTIALLY WORKABLE - But would need 50+ stub files
**Reason:** Would need stubs for every removed extension function

### ✅ Option D: Comprehensive Cleanup (8-16 hours) - RECOMMENDED
**Approach:** Systematic removal of ALL extension dependencies

**Steps:**
1. **Audit all imports** from removed extensions (estimate: 2-4 hours)
   - Search for all imports from extensions/ directory
   - Map dependency graph
   - Identify all files that need fixing

2. **Remove extension-dependent code** (estimate: 4-8 hours)
   - Comment out/remove all extension imports
   - Stub out extension-dependent functions
   - Update type definitions
   - Fix compilation errors incrementally

3. **Verify build** (estimate: 1-2 hours)
   - Run build after each major change
   - Test core functionality still works
   - Document what was removed

4. **Create migration guide** (estimate: 1-2 hours)
   - Document what extensions were removed
   - Provide upgrade path for users
   - List deprecated features

**Total Estimated Time:** 8-16 hours
**Risk:** MEDIUM - Systematic approach reduces risk

---

## Alternative: Option E - Fork Strategy (2-4 weeks)

Given the extensive nature of the issues, consider:

1. **Create new clean fork** from original OpenCLAW
2. **Apply only core simplifications** needed for ACP
3. **Leave extensions intact** temporarily
4. **Migrate incrementally** rather than big-bang removal

**Pros:**
- Cleaner architecture
- Less technical debt
- Can test incrementally

**Cons:**
- Takes longer
- Need to redo some work
- Merge complexity later

---

## Files Modified So Far

1. **tsconfig.json** - Added exclusions (ineffective)
2. **src/commands/agent.ts** - Commented 4 problematic imports
3. **src/plugins/runtime/runtime-tools.ts** - Commented 1 import
4. **src/plugin-sdk/outbound-media.ts** - Commented 1 import + 1 function
5. **src/plugin-sdk/slack-message-actions.ts** - Commented 1 import + 2 uses
6. **src/plugin-sdk/channel-config-helpers.ts** - Commented 3 imports + 5 functions
7. **src/plugins/runtime/runtime-channel.ts** - Commented 50+ imports + entire export sections
8. **src/plugins/runtime/runtime-media.ts** - Commented 1 import + 1 export
9. **src/auto-reply/reply/normalize-reply.ts** - Commented 1 import + 1 use
10. **src/auto-reply/reply/dispatch-from-config.ts** - Commented 1 import + 1 use

**Total:** 10 files modified, ~100 imports commented out

---

## Commit History

- **IN_PROGRESS** - "fix: Begin comprehensive extension import cleanup (69+ errors remaining)"

---

## Technical Debt Accumulated

**Current State:**
- 100+ import statements commented out
- 10+ files partially modified
- Unknown how many more files need fixing
- Build still failing with 69+ errors

**Risk:**
- Partial cleanup makes code harder to understand
- Commented-out code creates confusion
- No clear path to completion
- Technical debt accumulating rapidly

---

## Decision Required

**The build fix effort has revealed that this is not a simple "34 error" issue but a systemic architectural problem requiring comprehensive cleanup.**

**Recommended Next Steps:**

1. **STOP incremental patching** - It's creating more technical debt
2. **Choose between:**
   - **Option D:** Comprehensive 8-16 hour cleanup
   - **Option E:** Clean fork strategy (2-4 weeks)
3. **Document decision** and create detailed plan
4. **Execute systematically** rather than reactively

---

## Notes

- The issue is MUCH larger than initially reported (34 → 69+ errors)
- Day 11-12 simplification removed extensions but didn't clean up dependencies
- Extension code was deeply integrated throughout the codebase
- Build system limitations (rolldown) make exclusion strategies ineffective
- Each fix uncovers more issues in a cascading pattern
- Current approach of commenting out imports is creating technical debt
- Need comprehensive strategy rather than incremental fixes

---

**Last Updated:** 2026-03-16
**Status:** Build still failing with 69+ errors
**Errors:** Increasing as we dig deeper (34 → 37 → 32 → 69)
**Recommendation:** Stop incremental fixes, choose comprehensive strategy
**Estimated Time to Complete:** 8-16 hours (Option D) or 2-4 weeks (Option E)
**Current Technical Debt:** 10 files partially modified, 100+ imports commented out
