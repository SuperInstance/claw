# Build Error Solutions - Innovative Approaches Research

**Date:** 2026-03-16
**Author:** R&D Build Systems Researcher
**Status:** Research Complete - 7 Solutions Analyzed

---

## Executive Summary

After analyzing the claw build errors (69+ unresolved imports), I have identified **7 potential solutions** ranging from fully automated approaches to hybrid strategies. The recommended solution combines AST-based automation with selective manual cleanup for a **4-6 hour resolution time** with low risk.

### Key Findings

- **275 extension imports** across the codebase
- **38 pi-embedded-helpers references** (core utility module missing)
- **3,848 TypeScript files** in src/ directory
- **5 core error categories** identified

### Recommended Solution: Option F - AST-Based Automated Import Cleanup

**Time:** 4-6 hours
**Risk:** LOW
**Effectiveness:** HIGH (95%+ automation)

---

## Error Analysis

### Error Categories

| Category | Count | Root Cause | Complexity |
|----------|-------|------------|------------|
| **Extension Imports** | 275 | Removed extensions still referenced | HIGH |
| **PI Embedded Helpers** | 38 | Core utility file deleted | MEDIUM |
| **Channel System** | ~20 | allow-from.js and normalize/* missing | MEDIUM |
| **CLI/Embedded Code** | ~15 | CLI files removed but referenced | LOW |
| **Test Mocks** | ~50 | Mock references to removed code | LOW |

### Dependency Graph Analysis

```
src/plugin-sdk/index.ts (ENTRY POINT)
    ├── src/channels/plugins/* (MISSING DEPENDENCIES)
    │   ├── allow-from.js (MISSING)
    │   ├── normalize/whatsapp.js (MISSING)
    │   └── actions/* (MISSING)
    ├── src/auto-reply/reply/* (USES EXTENSIONS)
    │   ├── route-reply.ts → extensions/slack/*
    │   ├── reply-payloads.ts → pi-embedded-helpers
    │   └── dispatch-from-config.ts → extensions/discord/*
    ├── src/security/dm-policy-shared.ts (MISSING)
    │   └── channels/allow-from.js (MISSING)
    └── src/agents/tools/* (USES PI-HELPERS)
        └── sessions-helpers.ts → pi-embedded-helpers
```

---

## Solution Options

### Option A: Manual Import Cleanup (Baseline - NOT RECOMMENDED)

**Approach:** Manually comment out or remove each broken import

| Metric | Value |
|--------|-------|
| Time | 8-16 hours |
| Risk | HIGH (cascading errors) |
| Automation | 0% |
| Technical Debt | HIGH |

**Pros:**
- Complete control over changes
- Can add stubs manually

**Cons:**
- Very time-consuming
- High error rate
- Creates technical debt (commented code)
- No automation

**Verdict:** NOT RECOMMENDED - Use only as fallback

---

### Option B: tsconfig Exclusion (ATTEMPTED - FAILED)

**Approach:** Exclude problematic files in tsconfig.json

**Status:** ALREADY ATTEMPTED
**Result:** FAILED - rolldown/tsdown build system ignores tsconfig exclusions

**Verdict:** NOT VIABLE

---

### Option C: Stub File Generation

**Approach:** Create stub files for all missing modules

```typescript
// Example stub: src/channels/allow-from.ts
export function mergeDmAllowFromSources() { return {}; }
export function resolveGroupAllowFromSources() { return {}; }
```

| Metric | Value |
|--------|-------|
| Time | 2-4 hours (with automation) |
| Risk | MEDIUM |
| Automation | 50% |
| Technical Debt | HIGH (dead stubs) |

**Pros:**
- Quick to implement
- Build passes immediately
- No code deletion

**Cons:**
- 50+ stub files needed
- Dead code accumulation
- Runtime errors possible
- Doesn't solve root cause

**Verdict:** ACCEPTABLE as temporary measure, but creates technical debt

---

### Option D: Comprehensive Manual Cleanup (Current Plan)

**Approach:** Systematic removal of ALL extension dependencies

| Metric | Value |
|--------|-------|
| Time | 8-16 hours |
| Risk | MEDIUM |
| Automation | 10% |
| Technical Debt | LOW |

**Pros:**
- Clean final state
- No dead code
- Complete understanding of changes

**Cons:**
- Time-consuming
- Manual error risk
- Requires deep codebase knowledge

**Verdict:** GOOD for long-term, but slow

---

### Option E: Fork Strategy (Alternative)

**Approach:** Create clean fork from original OpenCLAW

| Metric | Value |
|--------|-------|
| Time | 2-4 weeks |
| Risk | MEDIUM |
| Automation | 0% |
| Technical Debt | LOWEST |

**Pros:**
- Cleanest architecture
- No accumulated debt
- Can be more selective

**Cons:**
- Much longer timeline
- Redo some work
- Merge complexity later

**Verdict:** GOOD for new projects, not ideal for current sprint

---

### Option F: AST-Based Automated Import Cleanup (RECOMMENDED)

**Approach:** Use TypeScript Compiler API to automatically analyze and remove/replace broken imports

```typescript
// Pseudocode for AST Import Cleaner
import * as ts from 'typescript';

function cleanBrokenImports(sourceFile: ts.SourceFile) {
  const brokenPatterns = [
    /extensions\//,
    /pi-embedded-helpers/,
    /channels\/allow-from/,
  ];

  // Visit each import declaration
  ts.forEachChild(sourceFile, (node) => {
    if (ts.isImportDeclaration(node)) {
      const moduleSpecifier = node.moduleSpecifier.getText();
      if (brokenPatterns.some(p => p.test(moduleSpecifier))) {
        // Remove import and track used identifiers
        markForRemoval(node);
        trackExportedIdentifiers(node);
      }
    }
  });

  // Remove usages of removed imports
  removeIdentifierUsages();
}
```

| Metric | Value |
|--------|-------|
| Time | 4-6 hours (2hr tool + 4hr verification) |
| Risk | LOW |
| Automation | 95% |
| Technical Debt | LOW |

**Pros:**
- Fast execution
- Consistent changes
- Low error rate
- Creates reusable tool
- Can be run multiple times

**Cons:**
- Requires tool development
- May need manual fixes for edge cases
- Need to verify semantic correctness

**Verdict:** RECOMMENDED - Best balance of speed and quality

---

### Option G: Hybrid Stub + Incremental Cleanup (FASTEST)

**Approach:** Generate stubs immediately to unblock build, then incrementally clean up

**Phase 1: Stub Generation (1-2 hours)**
```bash
# Auto-generate stubs for all missing modules
node scripts/generate-stubs.mjs
```

**Phase 2: Incremental Cleanup (ongoing)**
- Replace stubs with real implementations
- Remove unused stub code
- Track progress in cleanup backlog

| Metric | Value |
|--------|-------|
| Time | 2 hours (to unblock) + ongoing |
| Risk | LOW |
| Automation | 80% |
| Technical Debt | MEDIUM (temporary) |

**Pros:**
- Build unblocks immediately
- Can continue development
- Incremental cleanup spreads work
- Low risk

**Cons:**
- Creates temporary technical debt
- Need tracking system
- Some stubs may persist

**Verdict:** GOOD for urgent situations, acceptable debt

---

## Solution Comparison Matrix

| Solution | Time | Risk | Automation | Tech Debt | Build Unblock | Long-term Quality |
|----------|------|------|------------|-----------|---------------|-------------------|
| A: Manual Cleanup | 8-16h | HIGH | 0% | HIGH | Slow | LOW |
| B: tsconfig Exclude | 0.5h | - | 0% | - | FAILED | - |
| C: Stub Files | 2-4h | MED | 50% | HIGH | Fast | LOW |
| D: Comprehensive | 8-16h | MED | 10% | LOW | Slow | HIGH |
| E: Fork Strategy | 2-4wk | MED | 0% | LOWEST | Very Slow | HIGHEST |
| **F: AST Automation** | **4-6h** | **LOW** | **95%** | **LOW** | **Fast** | **HIGH** |
| G: Hybrid Stub | 2h+ | LOW | 80% | MED | Fastest | MED |

---

## Recommended Implementation: Option F

### Phase 1: Build AST Cleaner Tool (2 hours)

Create `scripts/ast-import-cleaner.mjs`:

```javascript
#!/usr/bin/env node
/**
 * AST-Based Import Cleaner for Claw
 *
 * Automatically removes/fixes broken imports caused by
 * Day 11-12 simplification extension removal.
 */

import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

// Broken import patterns to match
const BROKEN_PATTERNS = [
  /extensions\/(?!anthropic|brave|cloudflare-ai-gateway|discord|feishu|google|huggingface|memory-core|mistral|nvidia|ollama|openai|opencode|opencode-go|openrouter|perplexity|shared|telegram|test-utils|together)/,
  /pi-embedded-helpers/,
  /channels\/allow-from/,
  /channels\/plugins\/normalize\//,
  /channels\/plugins\/actions\//,
  /cli\/outbound-send-deps/,
  /cli\/memory-cli/,
];

// Track all changes for reporting
const changes = {
  removed: [],
  replaced: [],
  stubbed: [],
};

async function main() {
  console.log('[AST Cleaner] Starting import cleanup...');

  // Find all TypeScript files
  const files = await glob('src/**/*.ts', {
    ignore: ['**/*.test.ts', '**/*.test-helpers.ts', '**/test-*/**']
  });

  console.log(`[AST Cleaner] Found ${files.length} files to process`);

  for (const file of files) {
    await processFile(file);
  }

  // Generate report
  generateReport();
}

async function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true
  );

  const brokenImports = findBrokenImports(sourceFile);
  if (brokenImports.length === 0) return;

  // Transform the file
  const result = ts.transform(sourceFile, [createTransformer(brokenImports)]);
  const printer = ts.createPrinter();
  const newContent = printer.printNode(
    ts.EmitHint.Unspecified,
    result.transformed[0],
    sourceFile
  );

  // Write back
  fs.writeFileSync(filePath, newContent);
  changes.removed.push({ file: filePath, imports: brokenImports });
}

function findBrokenImports(sourceFile) {
  const broken = [];

  ts.forEachChild(sourceFile, (node) => {
    if (ts.isImportDeclaration(node)) {
      const specifier = node.moduleSpecifier.getText(sourceFile);
      if (BROKEN_PATTERNS.some(p => p.test(specifier))) {
        broken.push({
          node,
          specifier,
          identifiers: getIdentifiers(node),
        });
      }
    }
  });

  return broken;
}

function createTransformer(brokenImports) {
  return (context) => {
    return (sourceFile) => {
      const brokenSpecifiers = new Set(
        brokenImports.map(i => i.specifier)
      );

      function visit(node) {
        if (ts.isImportDeclaration(node)) {
          const specifier = node.moduleSpecifier.getText(sourceFile);
          if (brokenSpecifiers.has(specifier)) {
            // Remove this import
            return undefined;
          }
        }
        return ts.visitEachChild(node, visit, context);
      }

      return ts.visitNode(sourceFile, visit);
    };
  };
}

function getIdentifiers(importNode) {
  const identifiers = [];
  const bindings = importNode.importClause?.namedBindings;
  if (bindings && ts.isNamedImports(bindings)) {
    bindings.elements.forEach(e => {
      identifiers.push(e.name.getText());
    });
  }
  return identifiers;
}

function generateReport() {
  console.log('\n[AST Cleaner] Cleanup Complete!');
  console.log(`  Files modified: ${changes.removed.length}`);
  console.log(`  Imports removed: ${changes.removed.reduce((a, b) => a + b.imports.length, 0)}`);

  fs.writeFileSync(
    'ast-cleanup-report.json',
    JSON.stringify(changes, null, 2)
  );
}

main().catch(console.error);
```

### Phase 2: Run Tool and Verify (2 hours)

```bash
# Run AST cleaner
node scripts/ast-import-cleaner.mjs

# Verify build
pnpm build

# Run type check
pnpm tsc --noEmit

# Run tests
pnpm test:fast
```

### Phase 3: Manual Fixes for Edge Cases (1-2 hours)

The AST tool will handle 95% of cases. Manual fixes needed for:

1. **Runtime usages** of removed identifiers
2. **Type references** in type definitions
3. **Export statements** re-exporting removed items
4. **Complex conditional imports**

### Phase 4: Verification and Testing (1 hour)

```bash
# Full build verification
pnpm build

# Run all tests
pnpm test

# Check for runtime errors
node dist/index.js --version
```

---

## Alternative: Option G Implementation (Fastest Path)

If build must be unblocked immediately:

### Step 1: Generate Stubs (30 minutes)

```bash
# Create stub generator
node scripts/generate-stubs.mjs

# Generates:
# - src/channels/allow-from.ts
# - src/agents/pi-embedded-helpers.ts
# - src/channels/plugins/normalize/whatsapp.ts
# - etc.
```

### Step 2: Build and Continue (immediate)

```bash
pnpm build  # Should pass now
```

### Step 3: Track Cleanup Tasks

Create `CLEANUP_BACKLOG.md`:
```markdown
## Cleanup Backlog

### High Priority
- [ ] Replace pi-embedded-helpers stub with minimal implementation
- [ ] Remove allow-from.ts stub, update callers
- [ ] Clean up normalize/* stubs

### Medium Priority
- [ ] Remove extension-related code paths
- [ ] Update documentation

### Low Priority
- [ ] Remove dead code from plugin-sdk
```

---

## Tool Specifications

### AST Import Cleaner

**Input:** TypeScript source files
**Output:** Cleaned TypeScript files, JSON report

**Features:**
1. Pattern matching for broken imports
2. Identifier tracking and usage removal
3. Comment preservation
4. Source map generation
5. Dry-run mode
6. Selective file processing

**Dependencies:**
- typescript ^5.0.0
- glob ^10.0.0

### Stub Generator

**Input:** List of missing module paths
**Output:** Stub TypeScript files

**Features:**
1. Type inference from usage
2. Default export generation
3. Named export generation
4. JSDoc documentation
5. Warning comments

---

## Risk Assessment

### Option F (Recommended) Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| AST tool misses edge cases | 30% | MEDIUM | Manual review + testing |
| Runtime errors after cleanup | 20% | HIGH | Comprehensive test suite |
| Type errors after cleanup | 40% | LOW | TypeScript compiler catches |
| Semantic behavior change | 10% | HIGH | Code review + integration tests |

### Rollback Plan

```bash
# Git-based rollback
git checkout -- src/

# Or use backup
cp -r src.backup/ src/
```

---

## Decision Matrix

### Choose Option F (AST Automation) if:
- Build can wait 4-6 hours
- Quality is important
- Want reusable tool
- Comfortable with TypeScript Compiler API

### Choose Option G (Hybrid) if:
- Build must be unblocked NOW
- Can accept temporary technical debt
- Have ongoing cleanup capacity

### Choose Option D (Comprehensive) if:
- Have 8-16 hours available
- Want zero technical debt
- Prefer manual control

### Choose Option E (Fork) if:
- Timeline is 2-4 weeks
- Want cleanest architecture
- Starting fresh is acceptable

---

## Implementation Checklist

### Pre-Implementation
- [ ] Create git branch: `fix/build-error-automation`
- [ ] Backup current state: `cp -r src src.backup`
- [ ] Document current error count: 69

### AST Tool Development
- [ ] Create `scripts/ast-import-cleaner.mjs`
- [ ] Add broken pattern detection
- [ ] Add identifier tracking
- [ ] Add usage removal
- [ ] Add dry-run mode
- [ ] Test on single file

### Execution
- [ ] Run AST tool in dry-run mode
- [ ] Review planned changes
- [ ] Run AST tool in live mode
- [ ] Verify build: `pnpm build`
- [ ] Run type check: `pnpm tsc --noEmit`
- [ ] Run tests: `pnpm test:fast`

### Post-Implementation
- [ ] Fix any edge cases manually
- [ ] Run full test suite
- [ ] Update documentation
- [ ] Create PR with report

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Build Success | Yes | `pnpm build` exits 0 |
| Error Count | 0 | Build output |
| Test Pass Rate | 95%+ | `pnpm test:fast` |
| Files Modified | <100 | Git diff |
| Time to Complete | <6 hours | Stopwatch |

---

## Conclusion

**Recommended Solution: Option F - AST-Based Automated Import Cleanup**

This approach provides the best balance of:
- **Speed:** 4-6 hours vs 8-16 hours manual
- **Quality:** Low technical debt, clean codebase
- **Risk:** Low, with automated consistency
- **Reusability:** Tool can be used for future cleanups

**Alternative for Urgent Situations: Option G - Hybrid Stub + Incremental**

If the build must be unblocked immediately, generate stubs first (2 hours), then incrementally clean up over time.

---

**Last Updated:** 2026-03-16
**Status:** Research Complete
**Next Step:** Implement Option F or G based on urgency requirements
**Estimated Resolution Time:** 4-6 hours (Option F) or 2 hours (Option G)
