import test from "node:test"; import assert from "node:assert/strict";
import { deserializeBundle, serializeBundle } from "../../lib/cache/client-signal-cache"; import type { SignalBundle } from "../../lib/signals/types";
test("cache serialization validates round trips", () => { const bundle: SignalBundle = { generatedAt: "2026-07-18T12:00:00.000Z", sources: [], signals: [] }; assert.deepEqual(deserializeBundle(serializeBundle(bundle)), bundle); assert.equal(deserializeBundle("not json"), null); });
