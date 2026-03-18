/**
 * IRC Accounts
 *
 * This file was extracted to claw-extensions repository.
 * TODO: Import from claw-extensions or re-implement.
 */

export type IRCAccountConfig = unknown;
export type ResolvedIRCAccount = unknown;

export function listIRCAccountIds(): string[] {
  return [];
}

export function resolveDefaultIRCAccountId(): string | null {
  return null;
}

export function resolveIRCAccount(_accountId: string): ResolvedIRCAccount | null {
  return null;
}

export const ircSetupAdapter = () => null;
export const ircSetupWizard = () => null;
