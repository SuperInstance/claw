/**
 * CLI Respawn Policy
 * 
 * This file was removed during Phase 2 simplification but is still
 * referenced in src/entry.ts.
 * 
 * TODO: Update src/entry.ts to remove this dependency.
 */

export function shouldSkipRespawn() {
  return false;
}

// Alias for backward compatibility
export function shouldSkipRespawnForArgv() {
  return shouldSkipRespawn();
}
