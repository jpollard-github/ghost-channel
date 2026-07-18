import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { reviewDevicesSchema } from "../../lib/review/review-devices";

test("tracked responsive review device example is valid", async () => {
  const value: unknown = JSON.parse(
    await readFile("config/review-devices.example.json", "utf8"),
  );
  const devices = reviewDevicesSchema.parse(value);
  assert.deepEqual(devices.desktop.viewport, { width: 1440, height: 900 });
  assert.equal(devices.tabletLandscape.provisional, true);
  assert.equal(devices.iphone17ProMaxPortrait.browser, "webkit");
  assert.equal(Object.keys(devices).length, 3);
});

test("responsive review device validation rejects unexpected profiles", async () => {
  const value = JSON.parse(
    await readFile("config/review-devices.example.json", "utf8"),
  ) as Record<string, unknown>;
  value.unexpectedDevice = value.iphone17ProMaxPortrait;
  assert.equal(reviewDevicesSchema.safeParse(value).success, false);
});

test("responsive review device validation rejects invalid dimensions", () => {
  assert.equal(
    reviewDevicesSchema.safeParse({
      desktop: { viewport: { width: 0, height: 900 } },
    }).success,
    false,
  );
});
