import test from "node:test"; import assert from "node:assert/strict";
import { loadLocalSignals } from "../../lib/adapters/local";
test("local adapter returns validated text and procedural signals", async () => { const result = await loadLocalSignals(new Date("2026-07-18T12:00:00Z")); assert.equal(result.status, "fresh"); assert.ok(result.signals.some((signal) => signal.body)); assert.ok(result.signals.some((signal) => signal.media?.kind === "procedural")); });
