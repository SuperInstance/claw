// Stub file for auth profile paths
// TODO: Implement actual auth profile paths

export function resolveAuthStorePathForDisplay(profileId: string): string {
  return `~/.openclaw/auth-profiles/${profileId}`;
}

export function resolveAuthStorePathDispaly(profileId: string): string {
  return resolveAuthStorePathForDisplay(profileId);
}
