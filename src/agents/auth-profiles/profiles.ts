// Stub file for auth profiles
// TODO: Implement actual auth profile management

export interface AuthProfile {
  id: string;
  name: string;
}

export function listProfilesForProvider(providerId: string): AuthProfile[] {
  return [];
}
