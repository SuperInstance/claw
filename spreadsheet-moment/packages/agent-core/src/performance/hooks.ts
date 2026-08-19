/**
 * Performance Hooks — TODO stubs
 *
 * NOTE: All React hooks in this file have been moved to
 * packages/agent-ui/src/performance/hooks.ts.
 *
 * agent-core is a backend/engine package. React hooks belong
 * in the browser-layer package.
 *
 * These stubs exist so that any build scripts that import
 * from this path won't hard-fail during the migration.
 */

// TODO(move-to-agent-ui): All hooks below are React-dependent.
// Re-implement in agent-ui/src/performance/hooks.ts
// and remove this file from agent-core entirely.

export function usePerformanceMonitor() {
  // Stub — no-op until moved to agent-ui
  return { metrics: null, start: () => {}, stop: () => {} };
}

export function useCellUpdateOptimization() {
  return { optimize: () => {}, reset: () => {} };
}

export function useLazyLoad() {
  return { load: () => Promise.resolve(null) };
}

export function useDebounce() {
  return [() => {}, () => {}];
}

export function useThrottle() {
  return [() => {}, () => {}];
}

export function useMemoizedCallback() {
  return () => {};
}
