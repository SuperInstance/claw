// Stub file for auth profile display
// TODO: Implement actual auth profile display

export interface AuthProfileDisplayLabel {
  label: string;
}

export function resolveAuthProfileDisplayLabel(
  profileId: string,
): AuthProfileDisplayLabel {
  return { label: profileId };
}
