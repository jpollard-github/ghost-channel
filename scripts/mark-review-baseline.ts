import { writeFileSync } from "node:fs";
import { currentHead, git } from "./review-utils";

const label = process.argv.slice(2).join(" ").trim();
if (!label)
  throw new Error('Usage: npm run review:mark -- "before descriptive prompt"');
if (git(["status", "--porcelain"]))
  throw new Error(
    "review:mark requires a clean working tree. Commit or stash changes first.",
  );
const baseline = {
  sha: currentHead(),
  timestamp: new Date().toISOString(),
  label,
};
writeFileSync(
  ".review-baseline.json",
  `${JSON.stringify(baseline, null, 2)}\n`,
);
console.log(`Marked clean baseline ${baseline.sha} (${baseline.label}).`);
