# Hermes Memory MCP: The Cognitive Substrate

A high-fidelity, multi-tier memory system designed for the **SuperInstance Ecosystem**. This Model Context Protocol (MCP) server provides a standardized interface for autonomous agents to persist, retrieve, and manage cognitive states across different levels of abstraction.

## 🧠 The Multi-Tier Memory Matrix

The core innovation of this system is its non-linear, multi-tier storage architecture. Rather than a flat "key-value" store, Hermes organizes intelligence into three distinct tiers:

| Tier | Cognitive Level | Description | Use Case |
| :--- | :--- | :--- | :--- |
| **Semantic** | **The "Why" & "How"** | High-level reasoning, design principles, and philosophical intent. | "Why was the sensor fusion logic implemented this way?" |
| **Structural** | **The "Who" & "What"** | Entity maps, agent taxonomies, repo structures, and SOPs. | "What is the current hierarchy of the Claw fleet?" |
| **Technical** | **The "Where" & "How Much"** | Absolute paths, API schemas, hardware constraints, and environmental facts. | "What is the absolute path to the sonar logs?" |

---

## 🛠 Agent Capabilities (Tools)

Agents interacting with this server have two primary superpowers:

### 1. 
**Purpose:** Commit a new piece of intelligence to the substrate.
- **Parameters:**
  - : ( |  | ) — The ownership domain.
  - : ( | No files replaced | ) — The modification type.
  - : ( |  | ) — The cognitive layer.
  - : The actual declarative fact or instruction.
  - : Metadata for high-speed retrieval.

### 2. 
**Purpose:** Perform targeted retrieval of intelligence.
- **Parameters:**
  - : Natural language or keyword search.
  - : Filter by cognitive level to reduce noise.
  - : Filter by ownership.

---

## 🤖 Agent-to-Agent (A2A) Native Instructions

To maximize the efficacy of this memory center, agents must adhere to these **Communication Protocols**:

### A. The "Declarative Fact" Protocol (DFP)
Agents must avoid writing "intent" or "transient thought" to the memory substrate. Memory should only contain **stabilized intelligence**.

| Bad Practice (Transient/Intent) | Good Practice (Declarative Fact) |
| :--- | :--- |
| "I am going to try to find the log file." | "Target: Log directory identified at ." |
| "I think the user wants concise answers." | "User preference: Concise, technical-first communication styles." |
| "I will record the sensor data every 10m." | "SOP: Sensor telemetry is recorded at 10-minute intervals." |

### B. The "Handover Pattern"
When an agent enters a "Task Completion" state, it must perform a **Memory Handover** to ensure its successor doesn't start from zero.

1. **Identify:** What was learned? (e.g., a new API endpoint).
2. **Tier:** Which tier does it belong to? (e.g., ).
3. **Commit:** Call .

---

## 🚀 Installation & Setup

1. **Install Dependencies:** 
up to date, audited 18 packages in 949ms

3 packages are looking for funding
  run `npm fund` for details

1 high severity vulnerability

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
2. **Build:** 
> hermes-memory-mcp@1.0.0 build
> tsc
3. **Configure MCP Client:** Add the following to your configuration (e.g. Claude Desktop):
