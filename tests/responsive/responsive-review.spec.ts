import { mkdirSync } from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";

const frozenAt = "2026-07-18T12:00:00.000Z";
const screenshotRoot =
  process.env.GHOST_REVIEW_SCREENSHOT_DIR ??
  path.join(process.cwd(), "review-artifacts/screenshots/current");

const localSignal = {
  id: "review-local",
  channelId: "personal",
  sourceId: "local",
  label: "Field note",
  title: "The local frequency is open.",
  body: "A deterministic repository-backed transmission for responsive review.",
  media: { kind: "procedural", renderer: "quiet-grid" },
  fetchedAt: frozenAt,
  priority: 9,
  dwellMs: 60000,
};
const weatherSignal = {
  id: "review-weather",
  channelId: "local-atmosphere",
  sourceId: "nws",
  label: "Test Harbor · Tonight",
  title: "Partly cloudy, 64°F",
  body: "A quiet, partly cloudy night. Wind northeast at 5 mph.",
  media: { kind: "procedural", renderer: "weather-field" },
  sourceUrl: "https://www.weather.gov/",
  attribution: "National Weather Service",
  fetchedAt: frozenAt,
  expiresAt: "2026-07-19T10:00:00.000Z",
  priority: 8,
  dwellMs: 60000,
};
const earthquakeSignal = {
  id: "review-earthquake",
  channelId: "world-pulse",
  sourceId: "usgs",
  label: "World pulse",
  title: "Magnitude 4.6 · Test Island",
  body: "Recorded at 11:30 UTC. Green alert level.",
  media: { kind: "procedural", renderer: "seismic-rings" },
  sourceUrl: "https://earthquake.usgs.gov/earthquakes/eventpage/review",
  attribution: "U.S. Geological Survey",
  fetchedAt: frozenAt,
  expiresAt: "2026-07-19T12:00:00.000Z",
  priority: 7,
  dwellMs: 60000,
};
const signalBundle = {
  generatedAt: frozenAt,
  sources: [
    { sourceId: "local", status: "fresh", fetchedAt: frozenAt, signals: [localSignal] },
    { sourceId: "nws", status: "fresh", fetchedAt: frozenAt, signals: [weatherSignal] },
    { sourceId: "usgs", status: "fresh", fetchedAt: frozenAt, signals: [earthquakeSignal] },
  ],
  signals: [localSignal, weatherSignal, earthquakeSignal],
};

async function assertInsideViewport(page: Page, selector: string) {
  const bounds = await page.locator(selector).boundingBox();
  const viewport = page.viewportSize();
  expect(bounds, `${selector} should have bounds`).not.toBeNull();
  expect(viewport).not.toBeNull();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.y).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(viewport!.width + 0.5);
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(viewport!.height + 0.5);
}

async function assertNormalPlayer(page: Page) {
  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    scrollHeight: document.documentElement.scrollHeight,
    clientHeight: document.documentElement.clientHeight,
  }));
  expect(dimensions.scrollWidth).toBe(dimensions.clientWidth);
  expect(dimensions.scrollHeight).toBeLessThanOrEqual(dimensions.clientHeight);
  await assertInsideViewport(page, '[data-testid="signal-stage"]');
  await assertInsideViewport(page, 'nav[aria-label="Playback controls"]');
  for (const name of ["Previous", "Next"]) {
    await expect(page.getByRole("button", { name, exact: true })).toBeVisible();
  }
  await expect(
    page.getByRole("button", { name: /^(Pause|Resume)$/ }),
  ).toBeVisible();
  await expect(page.locator('[data-testid="signal-stage"] h1')).not.toHaveText("");
}

async function capture(page: Page, project: string, scenario: string) {
  await assertNormalPlayer(page);
  await page.screenshot({
    path: path.join(screenshotRoot, `${project}--${scenario}.png`),
    fullPage: false,
    animations: "disabled",
  });
}

test("captures deterministic responsive review scenarios", async ({ page }, testInfo) => {
  mkdirSync(screenshotRoot, { recursive: true });
  await page.clock.install({ time: new Date(frozenAt) });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.route("**/api/signals", (route) => route.fulfill({ json: signalBundle }));
  await page.goto("/");
  await expect(page.getByText("RECEIVING")).toBeVisible();
  await expect(page.getByRole("heading", { name: localSignal.title })).toBeVisible();
  await page.getByRole("button", { name: "Pause", exact: true }).click();

  await capture(page, testInfo.project.name, "local");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.getByRole("heading", { name: weatherSignal.title })).toBeVisible();
  await capture(page, testInfo.project.name, "weather");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.getByRole("heading", { name: earthquakeSignal.title })).toBeVisible();
  await capture(page, testInfo.project.name, "earthquake");

  await page.keyboard.press("d");
  const diagnostics = page.getByTestId("diagnostics-panel");
  await expect(diagnostics).toBeVisible();
  await assertInsideViewport(page, '[data-testid="diagnostics-panel"]');
  const diagnosticsDimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    panelScrollHeight: document.querySelector('[data-testid="diagnostics-panel"]')?.scrollHeight,
    panelClientHeight: document.querySelector('[data-testid="diagnostics-panel"]')?.clientHeight,
  }));
  expect(diagnosticsDimensions.scrollWidth).toBe(diagnosticsDimensions.clientWidth);
  expect(diagnosticsDimensions.panelScrollHeight).toBeGreaterThanOrEqual(
    diagnosticsDimensions.panelClientHeight ?? 0,
  );
  const close = page.getByRole("button", { name: "Close diagnostics" });
  await expect(close).toBeVisible();
  await assertInsideViewport(page, 'button[aria-label="Close diagnostics"]');
  expect(
    await close.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2) === element;
    }),
  ).toBe(true);
  await page.screenshot({
    path: path.join(screenshotRoot, `${testInfo.project.name}--diagnostics.png`),
    fullPage: false,
    animations: "disabled",
  });
});
