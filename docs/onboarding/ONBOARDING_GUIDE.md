# Claw Engine Onboarding Package

## 🎯 Mission
Convert the existing OpenCLAW codebase into a minimal, high-performance Rust cellular agent engine optimized for deployment within spreadsheet-moment cells.

## 🗺️ Conversion Roadmap
1. **Phase 1: Extraction (Current)** - Identify and strip OpenCLAW-specific abstractions.
2. **Phase 2: Rust Core Implementation** - Rebuild the core agent loop, event system, and memory management in Rust.
3. **Phase 3: Schema Integration** - Implement strict validation using the defined JSON schemas.
4. **Phase 4: Equipment & Social Modules** - Add dynamic module loading (Memory, Reasoning, etc.) and agent-to-agent communication protocols.

## 🏗️ Architecture Overview
- **Cellular Logic:** One Claw instance per spreadsheet cell.
- **Event-Driven:** Reactive triggers (periodic, sensor, or cell-change).
- **Resource Efficiency:** Minimal footprint to allow 100+ concurrent agents on local hardware.

## 📋 Implementation Checklist
- [ ] Core Agent Loop (Rust)
- [ ] JSON Schema Validation Layer
- [ ] Equipment Slot Management System
- [ ] Seed-to-Claw Training Bridge
- [ ] WebSocket/REST API Handlers

## 📐 Schema Reference
Refer to \`../../schemas/\` for strict type definitions:
- \`claw-schema.json\`: Core agent state and identity.
- \`bot-schema.json\`: Deterministic automation loops.
- \`seed-schema.json\`: ML behavior definitions.
