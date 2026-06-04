# Future Integration: claw

## Current State
The SuperInstance fork of OpenClaw — the open-source personal AI assistant. Multi-channel, multi-model, extensible. This fork tracks upstream OpenClaw with SuperInstance-specific configurations and extensions, used as the cellular logic engine in the fleet infrastructure.

## Integration Opportunities

### With hermit-claw
hermit-claw (ZeroClaw) is the Rust alternative — lighter, cheaper, targeting $10 hardware. The two forks represent different hardware tiers in the construct-core model: claw/OpenClaw = Layer 2 (AsyncConstruct, full compute), hermit-claw/ZeroClaw = Layer 0 (BareMetalConstruct, minimal). The integration: both implement the same construct-core trait interface, so an agent can run on either depending on the room's hardware.

### With room-as-codespace
OpenClaw IS the agent runtime inside each Codespace. When a Codespace spins up for a room, it runs OpenClaw with room-specific skills loaded. The agent walks between rooms by terminating one OpenClaw instance and starting another in a new Codespace, or by reconnecting to a different room's OpenClaw instance.

### With construct-core
The construct-core traits become OpenClaw skill types. An OpenClaw skill that implements BareMetalConstruct runs on ESP32. One that implements AsyncConstruct runs in a Codespace. The OpenClaw skill system becomes the room's equipment rack.

## Dormant Ideas Now Unlockable
OpenClaw was a chat-oriented assistant. The room-as-codespace vision extends it: OpenClaw becomes a room-native agent runtime, not just a chat interface. Skills become room-specific rather than user-specific. The same OpenClaw instance that chats with you also manages your rooms.

## Potential in Mature Systems
OpenClaw is the human-facing layer of the fleet. You talk to OpenClaw; OpenClaw manages rooms, skills, ensigns, and the ternary grid behind the scenes. The chat interface is the control panel; the rooms are the engine room.

## Cross-Pollination Ideas
- **hermit-claw**: Rust alternative for bare-metal rooms — same interface, lighter runtime
- **captains-log**: OpenClaw agent Oracle1 writes to captains-log
- **llm-proxy**: OpenClaw routes LLM calls through the proxy for fleet-wide key management

## Dependencies for Next Steps
- OpenClaw skill → construct-core trait adapter
- Room-specific skill loading on Codespace boot
- Integration with ternary-registry for skill discovery
