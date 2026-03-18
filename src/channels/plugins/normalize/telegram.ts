/**
 * Telegram Target Normalization
 *
 * This file was extracted to a separate extension during modularization.
 * TODO: Re-implement or import from claw-extensions repository.
 */

export function looksLikeTelegramTargetId(_targetId: string): boolean {
  return false;
}

export function normalizeTelegramMessagingTarget(_targetId: string): string {
  return _targetId;
}
