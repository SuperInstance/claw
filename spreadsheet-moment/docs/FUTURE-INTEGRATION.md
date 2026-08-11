# Future Integration: Spreadsheet-moment

## Current State
A modern spreadsheet platform built on Univer with TypeScript/React. Features a full formula engine, real-time collaboration, state management, extensible API, and plugin system. MVP status with 90%+ test pass rate. Live at spreadsheet-moment.pages.dev.

## Integration Opportunities

### With room-as-codespace frontend
Spreadsheet-moment's Univer-based UI becomes the room visualization frontend. Each room's ternary cell grid is rendered as an interactive spreadsheet where cells = ternary agents, rows = strategies, columns = environments. Real-time collaboration means multiple users (or agents) can observe and modify the same room simultaneously. The plugin system allows room-specific extensions: a Kalman filter room gets a custom "signal" column type; a music room gets a custom "harmony" cell renderer.

### With ternary-spreadsheet
ternary-spreadsheet provides the backend computation (ternary agents evolving in a grid). Spreadsheet-moment provides the frontend rendering (Univer UI showing the grid). The bridge: WebSocket connection where ternary-spreadsheet pushes cell updates and Spreadsheet-moment renders them in real-time.

### With superinstance-spreadsheet
Spreadsheet-moment is the production UI for superinstance-spreadsheet's browser demo. The current `browser/index.html` proves the concept; Spreadsheet-moment provides the industrial-strength frontend with collaboration, persistence, and plugin extensibility.

## Dormant Ideas Now Unlockable
The collaboration features were built for human teams. Now they apply to agent teams: multiple ensigns in the same room can collaborate on the same spreadsheet view, each seeing the other's changes in real-time. The plugin system was generic; now it has a concrete domain (ternary physics) with rich extensions.

## Potential in Mature Systems
Every room has a Spreadsheet-moment view. When you "look" at a room, you see its cell grid in a familiar spreadsheet interface. You can sort cells by fitness, filter by strategy species, add custom formulas for room physics, and watch the room evolve in real-time. The spreadsheet IS the room.

## Cross-Pollination Ideas
- **spreadsheet-formulas**: Formula engine provides the room's physics rules
- **spreadsheet-cells**: Cell model defines what each spreadsheet cell contains
- **Polln**: Polln's visualization techniques inform Spreadsheet-moment's ternary rendering

## Dependencies for Next Steps
- WebSocket bridge from ternary-cell to Univer
- Ternary-specific Univer plugins (strategy renderer, fitness heatmap, evolution controls)
- Room-specific customization API
