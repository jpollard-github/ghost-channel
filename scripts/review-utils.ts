import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

export const EMPTY_TREE = "4b825dc642cb6eb9a060e54bf8d69288fbee4904";
export type Baseline = { sha: string; timestamp: string; label: string };
export function git(args: string[], cwd = process.cwd()) {
  return execFileSync("git", args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}
export function currentHead(cwd = process.cwd()) {
  try {
    return git(["rev-parse", "HEAD"], cwd);
  } catch {
    return EMPTY_TREE;
  }
}
export function readBaseline(file = ".review-baseline.json"): Baseline {
  if (!existsSync(file))
    throw new Error(
      'No review baseline. Run npm run review:mark -- "before descriptive prompt" from a clean tree.',
    );
  return JSON.parse(readFileSync(file, "utf8")) as Baseline;
}
export function changedPaths(baseline: string, cwd = process.cwd()) {
  const committed = git(
    ["diff", "--name-only", "--diff-filter=ACMRTUXB", baseline],
    cwd,
  )
    .split("\n")
    .filter(Boolean);
  const untracked = git(["ls-files", "--others", "--exclude-standard"], cwd)
    .split("\n")
    .filter(Boolean);
  return [...new Set([...committed, ...untracked])].sort();
}
export function canReveal() {
  return process.platform === "darwin";
}
