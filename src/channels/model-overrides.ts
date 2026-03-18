// Stub file for model overrides
// TODO: Implement actual model override logic

export interface ResolveChannelModelOverrides {
  modelId?: string;
  temperature?: number;
  maxTokens?: number;
}

export async function resolveChannelModelOverrides(
  channelId: string,
): Promise<ResolveChannelModelOverrides> {
  return {};
}
