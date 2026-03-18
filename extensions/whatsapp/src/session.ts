// Stub file for session functionality
// TODO: Implement actual session management

export const WA_WEB_AUTH_DIR = ".whatsapp";

export async function createWaSocket(): Promise<void> {
  throw new Error("Not implemented: WhatsApp session management removed in refactor");
}

export function formatError(err: unknown): string {
  return String(err);
}

export function getStatusCode(err: unknown): number {
  return 500;
}

export async function logoutWeb(): Promise<void> {
  throw new Error("Not implemented: WhatsApp session management removed in refactor");
}

export async function logWebSelfId(): Promise<void> {
  throw new Error("Not implemented: WhatsApp session management removed in refactor");
}

export function pickWebChannel(): string {
  throw new Error("Not implemented: WhatsApp session management removed in refactor");
}

export async function waitForWaConnection(): Promise<void> {
  throw new Error("Not implemented: WhatsApp session management removed in refactor");
}

export function webAuthExists(): boolean {
  return false;
}
