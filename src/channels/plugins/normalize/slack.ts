/**
 * Slack Target Normalization
 *
 * This file was extracted to a separate extension during modularization.
 * TODO: Re-implement or import from claw-extensions repository.
 */

export function looksLikeSlackTargetId(_targetId: string): boolean {
  return false;
}

export function normalizeSlackMessagingTarget(_targetId: string): string {
  return _targetId;
}
