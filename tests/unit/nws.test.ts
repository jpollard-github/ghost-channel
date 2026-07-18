import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { loadNws, normalizeNwsForecast } from "../../lib/adapters/nws";
import { signalBundleSchema } from "../../lib/signals/schema";
import type { SignalBundle } from "../../lib/signals/types";

const config = { label: "Test Harbor", latitude: 42, longitude: -71, userAgent: "tests example@example.com" };

test("NWS normalizer produces a canonical UTC signal bundle", async () => {
  const now = new Date("2026-07-18T12:00:00Z");
  const payload: unknown = JSON.parse(
    await readFile("tests/fixtures/nws-forecast.json", "utf8"),
  );
  const signals = normalizeNwsForecast(payload, config, now);
  const bundle: SignalBundle = {
    generatedAt: now.toISOString(),
    sources: [
      {
        sourceId: "nws",
        status: "fresh",
        fetchedAt: now.toISOString(),
        signals,
      },
    ],
    signals,
  };

  assert.equal(signals[0].channelId, "local-atmosphere");
  assert.match(signals[0].title, /64°F/);
  assert.deepEqual(
    signals.map((signal) => signal.expiresAt),
    ["2026-07-19T10:00:00.000Z", "2026-07-19T22:00:00.000Z"],
  );
  assert.doesNotThrow(() => signalBundleSchema.parse(bundle));
});

test("NWS missing config and fetch errors report failed health", async () => { assert.equal((await loadNws(null)).status, "failed"); const fetcher = (async () => { throw new Error("offline"); }) as typeof fetch; const result = await loadNws(config, fetcher); assert.equal(result.status, "failed"); assert.match(result.message ?? "", /offline/); });
