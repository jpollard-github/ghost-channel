import { execFileSync } from "node:child_process";
import {
  appendFileSync,
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { canReveal, changedPaths, git, readBaseline } from "./review-utils";

const root = process.cwd();
const baseline = readBaseline();
const changed = changedPaths(baseline.sha);
const deleted = git(["diff", "--name-only", "--diff-filter=D", baseline.sha])
  .split("\n")
  .filter(Boolean);
const temp = mkdtempSync(path.join(tmpdir(), "ghost-channel-change-"));
try {
  const status = git(["status", "--short"]);
  const stat = git(["diff", "--stat", baseline.sha]);
  writeFileSync(
    path.join(temp, "REVIEW.md"),
    `# Ghost Channel change review\n\nBaseline: ${baseline.label}\nSHA: ${baseline.sha}\nMarked: ${baseline.timestamp}\n\n## Status\n\n\`\`\`\n${status}\n\`\`\`\n\n## Diff stat\n\n\`\`\`\n${stat}\n\`\`\`\n\n## Changed files\n${changed.map((file) => `- ${file}`).join("\n")}\n\n## Deleted files\n${deleted.map((file) => `- ${file}`).join("\n") || "- None"}\n\nReview changes.patch, then inspect copied files in current/.\n`,
  );
  const patch = execFileSync("git", ["diff", "--binary", baseline.sha], {
    encoding: "buffer",
    maxBuffer: 50 * 1024 * 1024,
  });
  writeFileSync(path.join(temp, "changes.patch"), patch);
  for (const file of changed) {
    const source = path.join(root, file);
    if (!statSync(source).isFile()) continue;
    if (
      /\.(png|jpe?g|gif|webp|svg)$/i.test(file) &&
      statSync(source).size > 10 * 1024 * 1024
    ) {
      appendFileSync(
        path.join(temp, "REVIEW.md"),
        `\nSkipped oversized image: ${file}\n`,
      );
      continue;
    }
    const destination = path.join(temp, "current", file);
    mkdirSync(path.dirname(destination), { recursive: true });
    copyFileSync(source, destination);
  }
  for (const file of [
    "AGENTS.md",
    "README.md",
    "TODO.md",
    "package.json",
    "docs/architecture.md",
    "docs/sources.md",
  ]) {
    try {
      const destination = path.join(temp, "context", file);
      mkdirSync(path.dirname(destination), { recursive: true });
      writeFileSync(destination, readFileSync(path.join(root, file)));
    } catch {}
  }
  const shots = path.join(root, "review-artifacts/screenshots");
  try {
    execFileSync("cp", ["-R", shots, path.join(temp, "screenshots")]);
  } catch {}
  mkdirSync(path.join(root, "repo-reviews"), { recursive: true });
  const stamp = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace("T", "-")
    .slice(0, 15);
  const archive = path.join(
    root,
    "repo-reviews",
    `ghost-channel-change-${stamp}.zip`,
  );
  execFileSync("zip", ["-qr", archive, "."], { cwd: temp });
  console.log(
    `Archive: ${archive}\nChanged files: ${changed.length}\nSize: ${statSync(archive).size} bytes`,
  );
  if (canReveal()) {
    execFileSync("open", ["-R", archive]);
    console.log("Finder reveal requested for the exact archive.");
  } else console.log(`Archive available at ${archive}`);
} finally {
  rmSync(temp, { recursive: true, force: true });
}
