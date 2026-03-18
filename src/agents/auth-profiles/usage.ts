// Stub file for auth profile usage
// TODO: Implement actual auth profile usage

export interface AuthProfileUsage {
  profileId: string;
  lastUsed: Date;
}

export function getAuthProfileUsage(profileId: string): AuthProfileUsage {
  return {
    profileId,
    lastUsed: new Date(),
  };
}
