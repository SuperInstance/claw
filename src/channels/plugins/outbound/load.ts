// Stub file for outbound channel loading
// TODO: Implement actual outbound channel loading

export interface ChannelOutboundAdapter {
  send: (message: unknown) => Promise<void>;
}

export async function loadChannelOutbound(
  channelId: string,
): Promise<ChannelOutboundAdapter> {
  throw new Error("Not implemented: Outbound channel loading removed in refactor");
}
