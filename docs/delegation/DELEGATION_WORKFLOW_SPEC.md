# Agent Delegation Workflow Specification

## 🎯 Objective
Establish a standardized protocol for the Orchestrator to distribute tasks to specialized sub-agents (Code Architects, Rust Engineers, Implementation Agents, QA Agents) to ensure consistent results and minimize context loss.

## 🛠️ Task Type Taxonomy

| Task Type | Description | Primary Specialist | Toolsets Required |
|-----------|-------------|--------------------|-------------------|
| **Architectural** | Schema design, contract definition, high-level logic. | Schema Architect | `file`, `search`, `read` |
| **Implementation** | Writing code, refactoring, translating logic. | Implementation Agent | `file`, `code_exec`, `terminal` |
| **Validation** | Testing, bug finding, performance auditing. | QA Engineer | `terminal`, `code_exec`, `file` |
| **Research** | Exploring new libraries, investigating theory. | Research Specialist | `web`, `browser`, `search` |

## 🔄 Delegation Lifecycle
1. **Decomposition:** Orchestrator breaks a high-level goal into atomic, verifiable tasks.
2. **Assignment:** Sub-agent is spawned with a specific `goal`, `context`, and `role`.
3. **Execution:** Sub-agent works in an isolated sandbox.
4. **Reporting:** Sub-agent returns a **Self-Report Summary**.
5. **Verification:** Orchestrator validates the summary against the original goal and the physical filesystem.
6. **Closed Loop:** If failed, task is reassigned with error logs as new context.

## 🚦 Feedback & Escalation
- **Successful Completion:** Task marked `completed` in the master todo list.
- **Ambiguity Block:** Sub-agent must request `clarify` (Note: Sub-agents cannot use `clarify` currently; Orchestrator must monitor).
- **Technical Blocker:** Sub-agent returns an error report; Orchestrator analyzes and attempts a pivot or escalates to User.
