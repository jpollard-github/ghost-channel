import test from "node:test"; import assert from "node:assert/strict";
import { signalSchema } from "../../lib/signals/schema";
test("signal schema accepts normalized data and rejects short dwell", () => { const base = { id: "a", channelId: "c", sourceId: "s", label: "Label", title: "Title", fetchedAt: "2026-07-18T12:00:00.000Z", priority: 1, dwellMs: 5000 }; assert.equal(signalSchema.parse(base).id, "a"); assert.equal(signalSchema.safeParse({ ...base, dwellMs: 10 }).success, false); });
