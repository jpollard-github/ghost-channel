import test from "node:test";
import assert from "node:assert/strict";
import {
  nextScheduledRefresh,
  shouldRefreshWhenVisible,
  SIGNAL_REFRESH_INTERVAL_MS,
  VISIBLE_REFRESH_STALE_MS,
  withoutExpiredSignals,
} from "../../lib/refresh/signal-refresh";
import type { Signal, SignalBundle } from "../../lib/signals/types";

const signal = (id: string, expiresAt?: string): Signal => ({
  id,
  channelId: "test",
  sourceId: "test",
  label: "Test",
  title: id,
  fetchedAt: "2026-07-18T12:00:00.000Z",
  expiresAt,
  priority: 1,
  dwellMs: 5000,
});

test("refresh timing is deterministic with a fake clock", (context) => {
  const start = new Date("2026-07-18T12:00:00.000Z").getTime();
  context.mock.timers.enable({ apis: ["Date"], now: start });

  assert.equal(
    nextScheduledRefresh(Date.now()),
    start + SIGNAL_REFRESH_INTERVAL_MS,
  );
  assert.equal(shouldRefreshWhenVisible(Date.now(), Date.now()), false);

  context.mock.timers.tick(VISIBLE_REFRESH_STALE_MS);
  assert.equal(shouldRefreshWhenVisible(Date.now(), start), true);
});

test("expiresAt is an exclusive playback eligibility boundary", () => {
  const now = new Date("2026-07-18T12:10:00.000Z").getTime();
  const expired = signal("expired", "2026-07-18T12:10:00.000Z");
  const fresh = signal("fresh", "2026-07-18T12:10:00.001Z");
  const durable = signal("durable");
  const bundle: SignalBundle = {
    generatedAt: "2026-07-18T12:00:00.000Z",
    sources: [
      {
        sourceId: "test",
        status: "fresh",
        fetchedAt: "2026-07-18T12:00:00.000Z",
        signals: [expired, fresh, durable],
      },
    ],
    signals: [expired, fresh, durable],
  };

  const result = withoutExpiredSignals(bundle, now);
  assert.deepEqual(
    result.signals.map((item) => item.id),
    ["fresh", "durable"],
  );
  assert.deepEqual(
    result.sources[0].signals.map((item) => item.id),
    ["fresh", "durable"],
  );
  assert.equal(result.sources[0].status, "fresh");
});
