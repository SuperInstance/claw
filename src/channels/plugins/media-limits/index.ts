// Stub file for media limits
// TODO: Implement actual media limit checking

export interface MediaLimits {
  maxSizeBytes: number;
  allowedTypes: string[];
}

export function resolveChannelMediaLimits(channelId: string): MediaLimits {
  return {
    maxSizeBytes: 16 * 1024 * 1024, // 16MB default
    allowedTypes: ["image/*", "video/*", "audio/*"],
  };
}
