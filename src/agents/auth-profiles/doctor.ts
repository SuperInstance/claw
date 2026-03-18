// Stub file for auth profile doctor
// TODO: Implement actual auth profile doctor

export interface AuthProfileDoctorHint {
  message: string;
}

export function formatAuthProfileDoctorHint(
  profileId: string,
): AuthProfileDoctorHint {
  return { message: `Profile ${profileId} needs configuration` };
}
