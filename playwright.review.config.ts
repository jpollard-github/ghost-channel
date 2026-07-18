import { defineConfig, devices, type Project } from "@playwright/test";
import {
  loadReviewDevices,
  REVIEW_PROJECT_NAMES,
  type ReviewDevices,
} from "./lib/review/review-devices";

const configured = loadReviewDevices();

function project(
  key: keyof ReviewDevices,
): Project {
  const device = configured[key];
  const webkitBase = device.browser === "webkit" ? devices["iPhone 15 Pro Max"] : {};
  return {
    name: REVIEW_PROJECT_NAMES[key],
    use: {
      ...webkitBase,
      browserName: device.browser,
      channel:
        device.browser === "chromium" && !process.env.CI ? "chrome" : undefined,
      viewport: device.viewport,
      screen: device.screen ?? device.viewport,
      deviceScaleFactor: device.deviceScaleFactor,
      isMobile: device.isMobile,
      hasTouch: device.hasTouch,
    },
  };
}

export default defineConfig({
  testDir: "./tests/responsive",
  outputDir: "./test-results/responsive",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3001",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1 --port 3001",
    env: { GHOST_RESPONSIVE_REVIEW: "1" },
    url: "http://127.0.0.1:3001",
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: (Object.keys(configured) as Array<keyof ReviewDevices>).map(project),
});
