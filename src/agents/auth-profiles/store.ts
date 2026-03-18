// Stub file for auth profile store
// TODO: Implement actual auth profile store

export interface AuthProfileStore {
  getProfile(profileId: string): Promise<unknown>;
  setProfile(profileId: string, data: unknown): Promise<void>;
}

export function ensureAuthProfileStore(profileId: string): AuthProfileStore {
  throw new Error("Not implemented: Auth profile store removed in refactor");
}
