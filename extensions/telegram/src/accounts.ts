/**
 * Telegram Accounts
 *
 * This file was extracted to claw-extensions repository.
 * TODO: Import from claw-extensions or re-implement.
 */

export type TelegramAccountConfig = unknown;
export type ResolvedTelegramAccount = unknown;
export type InspectedTelegramAccount = unknown;

export function listTelegramAccountIds(): string[] {
  return [];
}

export function resolveDefaultTelegramAccountId(): string | null {
  return null;
}

export function resolveTelegramAccount(_accountId: string): ResolvedTelegramAccount | null {
  return null;
}
