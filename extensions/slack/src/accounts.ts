/**
 * Slack Accounts
 *
 * This file was extracted to claw-extensions repository.
 * TODO: Import from claw-extensions or re-implement.
 */

export type SlackAccountConfig = unknown;
export type ResolvedSlackAccount = unknown;
export type InspectedSlackAccount = unknown;

export function listSlackAccountIds(): string[] {
  return [];
}

export function resolveDefaultSlackAccountId(): string | null {
  return null;
}

export function resolveSlackAccount(_accountId: string): ResolvedSlackAccount | null {
  return null;
}

export function resolveSlackReplyToMode(_config: SlackAccountConfig): string {
  return 'parent';
}
