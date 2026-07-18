import { test, expect, type Page } from "@playwright/test";

const now = "2026-07-18T12:00:00.000Z";
const localSignal = {
  id: "one",
  channelId: "personal",
  sourceId: "local",
  label: "Field note",
  title: "First transmission",
  body: "A local fallback.",
  media: { kind: "procedural", renderer: "quiet-grid" },
  fetchedAt: now,
  priority: 8,
  dwellMs: 60000,
};
const nwsSignal = {
  id: "two",
  channelId: "local-atmosphere",
  sourceId: "nws",
  label: "Test Harbor · Tonight",
  title: "Second transmission",
  media: { kind: "procedural", renderer: "weather-field" },
  fetchedAt: now,
  expiresAt: "2026-07-19T10:00:00.000Z",
  priority: 7,
  dwellMs: 60000,
};
const bundle = {
  generatedAt: now,
  sources: [
    {
      sourceId: "local",
      status: "fresh",
      fetchedAt: now,
      signals: [localSignal],
    },
    {
      sourceId: "nws",
      status: "fresh",
      fetchedAt: now,
      signals: [nwsSignal],
    },
    {
      sourceId: "usgs",
      status: "failed",
      fetchedAt: now,
      signals: [],
      message: "Fixture source unavailable.",
    },
  ],
  signals: [localSignal, nwsSignal],
};

async function mock(page: Page) {
  await page.route("**/api/signals", (route) => route.fulfill({ json: bundle }));
}

test("valid server bundle replaces fallback and retains every source result", async ({
  page,
}) => {
  await mock(page);
  await page.goto("/?diagnostics=1");

  await expect(page.getByText("Cache: fresh server bundle")).toBeVisible();
  const diagnostics = page.getByRole("complementary", { name: "Diagnostics" });
  await expect(diagnostics.getByRole("cell", { name: "local" })).toBeVisible();
  await expect(diagnostics.getByRole("cell", { name: "nws" })).toBeVisible();
  await expect(diagnostics.getByRole("cell", { name: "usgs" })).toBeVisible();
  await expect(diagnostics.getByRole("cell", { name: "failed" })).toBeVisible();
  await expect(diagnostics.getByText("Last refresh error: none")).toBeVisible();
});

test("failed server and unavailable cache remain distinct in diagnostics", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "indexedDB", {
      configurable: true,
      get() {
        throw new Error("IndexedDB disabled by test");
      },
    });
  });
  await page.route("**/api/signals", (route) =>
    route.fulfill({ status: 503, body: "unavailable" }),
  );
  await page.goto("/?diagnostics=1");

  await expect(
    page.getByText("Last refresh error: Server response failed (HTTP 503)."),
  ).toBeVisible();
  await expect(page.getByText("Cache: IndexedDB cache unavailable")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Leave room for the signal to arrive." }),
  ).toBeVisible();
});

for (const failure of [
  {
    name: "malformed JSON",
    response: { status: 200, contentType: "application/json", body: "{" },
    message: "Server response was not valid JSON.",
  },
  {
    name: "invalid bundle",
    response: { status: 200, contentType: "application/json", body: "{}" },
    message: "Server bundle failed validation.",
  },
]) {
  test(`${failure.name} is reported in diagnostics`, async ({ page }) => {
    await page.route("**/api/signals", (route) =>
      route.fulfill(failure.response),
    );
    await page.goto("/?diagnostics=1");

    await expect(
      page.getByText(`Last refresh error: ${failure.message}`),
    ).toBeVisible();
    await expect(page.getByText("Cache: IndexedDB cache empty")).toBeVisible();
  });
}

test("player controls and keyboard work", async ({ page }) => {
  await mock(page);
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "First transmission" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Next" }).click();
  await expect(
    page.getByRole("heading", { name: "Second transmission" }),
  ).toBeVisible();
  await page.keyboard.press("ArrowLeft");
  await expect(
    page.getByRole("heading", { name: "First transmission" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Pause" }).click();
  await expect(page.getByRole("button", { name: "Resume" })).toBeVisible();
  await page.keyboard.press("Space");
  await expect(page.getByRole("button", { name: "Pause" })).toBeVisible();
  await page.keyboard.press("d");
  await expect(
    page.getByRole("complementary", { name: "Diagnostics" }),
  ).toBeVisible();
});

for (const viewport of [
  { width: 1280, height: 800 },
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
]) {
  test(`has no horizontal overflow at ${viewport.width}x${viewport.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await mock(page);
    await page.goto("/");
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);
  });
}

test("query diagnostics, reduced motion, manifest and service worker resources", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await mock(page);
  await page.goto("/?diagnostics=1");
  await expect(
    page.getByRole("complementary", { name: "Diagnostics" }),
  ).toBeVisible();
  const manifest = await page.request.get("/manifest.webmanifest");
  expect(manifest.ok()).toBe(true);
  expect((await manifest.json()).display).toBe("standalone");
  const sw = await page.request.get("/sw.js");
  expect(sw.ok()).toBe(true);
  expect(sw.headers()["service-worker-allowed"]).toBe("/");
});
