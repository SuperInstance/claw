# 🚢 FV-Eileen Intelligence Roster

This registry defines the specialized "Digital Crew" of agents deployed on the FV-Eileen. 
Each entry maps an **Operational Domain** to a specific **Model Target** and an **Optimization Strategy**.

## 🧠 Optimization Philosophy
1. **Specialization:** Rather than using a generalist for everything, we tailor prompts and loops to a model's specific strengths.
2. **Consistency (Caching):** We prioritize maintaining a single model per long-running task to maximize token caching and reduce latency/cost.
3. **Recursive Learning:** As we observe model performance, we update the "Optimization Strategy" in this file to refine the agent's "muscle memory."

---

## 📋 Active Digital Crew

### 🌊 Domain: Navigation & Instrumentation (Nobeltec TZpro)
**Specialist Role:** `TZpro_Observer`
- **Model Target:** `[RESERVED - Needs High Vision Performance]`
- **Primary Task:** Monitor TZpro UI for error states, alarm triggers, and abnormal sensor displays.
- **Optimization Strategy:** 
    - **Loop Type:** Visual Delta Monitoring.
    - **Prompt Tailoring:** Focus on spatial relation and coordinate-based identification.
    - **State Management:** Maintain a "Last Known Good" UI state to detect changes efficiently.

### ⚙️ Domain: Mechanical & Systems (Vessel Health)
**Specialist Role:** `Systems_Analyst`
- **Model Target:** `[RESERVED - Needs High Reasoning/Long Context]`
- **Primary Task:** Correlation of technical logs, sensor telemetry, and maintenance schedules.
- **Optimization Strategy:**
    - **Loop Type:** Trend Analysis.
    - **Prompt Tailoring:** Emphasis on temporal logic and causal relationships.
    - **State Management:** Continuous context window updates for long-term trend detection.

### 📦 Domain: Logistics & Operations (Admin/Manifest)
**Specialist Role:** `Ops_Coordinator`
- **Model Target:** `[RESERVED - Needs Fast/Instruction Following]`
- **Primary Task:** Inventory management, communication, and scheduling.
- **Optimization Strategy:**
    - **Loop Type:** Event-Driven.
    - **Prompt Tailoring:** Highly structured JSON/Markdown output for interoperability.
    - **State Management:** Short-term task-based context.

---

## 🛠️ Implementation Notes
- *All agents are managed via Hermes Agent orchestration.*
- *Updates to this roster must be versioned to ensure subagents are re-prompted correctly.*
