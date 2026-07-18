import { execFileSync, spawnSync } from "node:child_process";
import {
  mkdirSync,
  existsSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import {
  loadReviewDevices,
  REVIEW_PROJECT_NAMES,
  type ReviewDevices,
} from "../lib/review/review-devices";
import { canReveal, currentHead, git, readBaseline } from "./review-utils";

const root = process.cwd();
const current = path.join(root, "review-artifacts/screenshots/current");
const packets = path.join(root, "review-artifacts/screenshot-packets");
const scenarios = ["local", "weather", "earthquake", "diagnostics"];
const devices = loadReviewDevices(root);

rmSync(current, { recursive: true, force: true });
mkdirSync(current, { recursive: true });

const result = spawnSync("npm", ["run", "test:responsive"], {
  cwd: root,
  env: { ...process.env, GHOST_REVIEW_SCREENSHOT_DIR: current },
  stdio: "inherit",
});
if (result.status !== 0) process.exit(result.status ?? 1);

let baseline: ReturnType<typeof readBaseline> | null = null;
try {
  baseline = readBaseline();
} catch {}

const packageLock = JSON.parse(
  readFileSync(path.join(root, "package-lock.json"), "utf8"),
) as { packages?: Record<string, { version?: string }> };
const projects = (Object.keys(devices) as Array<keyof ReviewDevices>).map(
  (key) => ({
    name: REVIEW_PROJECT_NAMES[key],
    ...devices[key],
  }),
);
const filenames = projects.flatMap(({ name }) =>
  scenarios.map((scenario) => `${name}--${scenario}.png`),
);
const missing = filenames.filter((filename) => !existsSync(path.join(current, filename)));
if (missing.length) {
  throw new Error(`Responsive review did not create: ${missing.join(", ")}`);
}
const manifest = {
  generatedAt: new Date().toISOString(),
  gitHead: currentHead(root),
  gitStatus: git(["status", "--short"], root),
  reviewBaseline: baseline,
  playwrightVersion:
    packageLock.packages?.["node_modules/@playwright/test"]?.version ?? "unknown",
  projects,
  scenarios,
  screenshots: filenames,
};
writeFileSync(
  path.join(current, "manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
);

mkdirSync(packets, { recursive: true });
const stamp = new Date()
  .toISOString()
  .replace(/[-:]/g, "")
  .replace("T", "-")
  .slice(0, 15);
const archive = path.join(
  packets,
  `ghost-channel-screenshots-${stamp}.zip`,
);
execFileSync("zip", ["-qr", archive, "."], { cwd: current });
execFileSync("unzip", ["-t", archive], { stdio: "ignore" });

console.log(
  `Screenshot packet: ${archive}\nScreenshots: ${filenames.length}\nSize: ${statSync(archive).size} bytes`,
);
if (canReveal()) {
  execFileSync("open", ["-R", archive]);
  console.log("Finder reveal requested for the exact screenshot packet.");
} else {
  console.log(`Screenshot packet available at ${archive}`);
}
