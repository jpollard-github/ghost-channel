import type { SignalBundle } from "@/lib/signals/types";

export const SIGNAL_REFRESH_INTERVAL_MS = 10 * 60_000;
export const VISIBLE_REFRESH_STALE_MS = 5 * 60_000;

export function nextScheduledRefresh(
  completedAtMs: number,
  intervalMs = SIGNAL_REFRESH_INTERVAL_MS,
) {
  return completedAtMs + intervalMs;
}

export function shouldRefreshWhenVisible(
  nowMs: number,
  lastSuccessfulRefreshMs: number | null,
  staleMs = VISIBLE_REFRESH_STALE_MS,
) {
  return (
    lastSuccessfulRefreshMs === null ||
    nowMs - lastSuccessfulRefreshMs >= staleMs
  );
}

export function withoutExpiredSignals(
  bundle: SignalBundle,
  nowMs: number,
): SignalBundle {
  const isEligible = (expiresAt?: string) =>
    expiresAt === undefined || new Date(expiresAt).getTime() > nowMs;

  return {
    ...bundle,
    sources: bundle.sources.map((source) => ({
      ...source,
      signals: source.signals.filter((signal) => isEligible(signal.expiresAt)),
    })),
    signals: bundle.signals.filter((signal) => isEligible(signal.expiresAt)),
  };
}
