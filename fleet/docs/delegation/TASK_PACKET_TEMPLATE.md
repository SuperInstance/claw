# Task Delegation Packet Template v1.0
**Format:** USCP-compatible (Universal Sensory/Command Packet)  
**Used by:** Hermes → subagent dispatch  
**Fleet protocol:** CNS packet structure

---

## How This Works

When a task is dispatched to a subagent (Rust Engineer, TS Developer, QA, etc.), it arrives as a **Task Packet**. This packet is self-contained — the subagent receives everything it needs and nothing it doesn't.

```
Hermes writes packet  →  CNS delivers  →  Subagent reads + executes
```

---

## Packet JSON Structure

```json
{
  "header": {
    "packet_id": "task-pack-<uuid>",
    "version": "1.0",
    "created_at": "<ISO timestamp>",
    "dispatcher": "hermes",
    "intent": "<REQUEST_REASONING | EXECUTE_PLAN | SENSORY_DATA>",
    "priority": "P0 | P1 | P2 | P3",
    "deadline": "<ISO timestamp | null>"
  },
  "body": {
    "task_id": "<unique task id>",
    "goal": "<one-line description of what to do>",
    "context": "<narrative context: why this matters, what's been done, what's blocked>",
    "repo": "claw | constrainttheory | spreadsheet-moment | dodecet-encoder",
    "module": "claw-core | claw-api | claw-schema | agent-core | cudaclaw-bridge",
    "acceptance_criteria": [
      "<criteria checklist — each item must be verifiable>",
      "<e.g., 'cargo test passes', 'no TypeScript errors', 'benchmark < 10ms'>"
    ],
    "constraints": {
      "schema_file": "<relative path to governing schema>",
      "tests_must_pass": true,
      "benchmarks_required": ["<benchmark name>"],
      "max_loc_per_module": 500,
      "no_legacy_imports": true,
      "origin_tracking_required": true
    },
    "artifacts_to_create": [
      "<file path the subagent must create or modify>"
    ],
    "toolsets": ["terminal", "file", "web"]
  },
  "signature": {
    "dispatcher_id": "hermes-default",
    "schema_hash": "<SHA-256 of governing schema file>",
    "trace_chain": "<parent task id if this is sub-task>"
  }
}
```

---

## Intent Definitions

| Intent | Meaning | Subagent Action |
|--------|---------|-----------------|
| `REQUEST_REASONING` | Analyze, design, propose. No code changes expected. | Return analysis document |
| `EXECUTE_PLAN` | Implement a known plan. Code changes required. | Return code + test output |
| `SENSORY_DATA` | Inspect the repo/file system and report back. | Return structured observation |

---

## Priority Levels

| Priority | Deadline Behavior | Escalation |
|----------|------------------|------------|
| **P0** | Immediate. Blocking other work. | Notify Hermes on failure |
| **P1** | Within current sprint. | Notify on missed deadline |
| **P2** | Within 1 week. | Weekly check-in |
| **P3** | Backlog. | No notification |

---

## Dispatch Example

**Scenario:** Implement dynamic equip in `claw-core/src/equipment.rs`

```json
{
  "header": {
    "packet_id": "task-pack-a1b2c3",
    "intent": "EXECUTE_PLAN",
    "priority": "P1",
    "deadline": "2026-03-21T00:00:00Z"
  },
  "body": {
    "task_id": "equip-dynamic",
    "goal": "Implement dynamic equip/unequip on Claw struct with muscle memory extraction",
    "context": "Current equipment.rs defines slots and trait signatures. Implementations are stubs. This is Phase 4 of the Claw Conversion Roadmap.",
    "repo": "claw",
    "module": "claw-core/src/equipment.rs",
    "acceptance_criteria": [
      "Claw::equip(slot, module) compiles without error",
      "Claw::unequip(slot) returns TriggerPattern struct",
      "TriggerPattern can be registered as re-equip trigger",
      "Equip/unequip cycle benchmark < 1ms",
      "All tests pass: cargo test --workspace"
    ],
    "constraints": {
      "schema_file": "claw-schema/src/lib.rs",
      "tests_must_pass": true,
      "benchmarks_required": ["equip_cycle_ms"],
      "max_loc_per_module": 500,
      "no_legacy_imports": true,
      "origin_tracking_required": true
    },
    "artifacts_to_create": [
      "claw-core/src/equipment/equip_impl.rs",
      "claw-core/tests/equipment_integration_test.rs",
      "EQUIP_DYNAMIC_IMPLEMENTATION.md"
    ]
  },
  "signature": {
    "dispatcher_id": "hermes-default",
    "schema_hash": "sha256-<hash>",
    "trace_chain": null
  }
}
```

---

## Subagent Response Format

Subagents must return responses in this shape:

```json
{
  "task_id": "equip-dynamic",
  "status": "COMPLETED | FAILED | BLOCKED",
  "summary": "<2-3 sentence summary of what was done>",
  "artifacts": [
    { "path": "claw-core/src/equipment/equip_impl.rs", "action": "created" }
  ],
  "verification": {
    "tests_passed": true,
    "benchmark_results": { "equip_cycle_ms": 0.34 },
    "schema_valid": true
  },
  "blocker": null,
  "next_recommended_task": "<optional>"
}
```

---

## Tracking

All task packets and responses are logged to:
- **Outbound (dispatch):** `fleet/docs/delegation/task_log.jsonl`
- **Inbound (response):** `~/.hermes/cns_inbox/`

Hermes reads `task_log.jsonl` for state tracking. CNS monitors inbound.

---

*Packets ship. Code compiles. Tests pass. No filler.*
