import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, copyFileSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { git, canReveal } from "./review-utils";

const root = process.cwd();
const files = git(["ls-files", "--cached", "--others", "--exclude-standard"])
  .split("\n")
  .filter(Boolean);
const excluded =
  /^(node_modules|\.next|out|dist|\.vercel|playwright-report|test-results|coverage|repo-reviews|review-artifacts)\//;
const secret = /(^|\/)(id_rsa|id_ed25519|.*\.(pem|key|p12|pfx|crt))$/i;
const selected = files.filter(
  (file) =>
    !excluded.test(file) &&
    (!file.startsWith(".env") || file === ".env.example"),
);
const suspicious = selected.filter((file) => secret.test(file));
if (suspicious.length)
  throw new Error(
    `Refusing to package suspicious secret files: ${suspicious.join(", ")}`,
  );
const temp = mkdtempSync(path.join(tmpdir(), "ghost-channel-repo-"));
for (const file of selected) {
  const destination = path.join(temp, file);
  mkdirSync(path.dirname(destination), { recursive: true });
  copyFileSync(path.join(root, file), destination);
}
mkdirSync(path.join(root, "repo-reviews"), { recursive: true });
const stamp = new Date()
  .toISOString()
  .replace(/[-:]/g, "")
  .replace("T", "-")
  .slice(0, 15);
const archive = path.join(root, "repo-reviews", `ghost-channel-${stamp}.zip`);
execFileSync("zip", ["-qr", archive, "."], { cwd: temp });
const images = selected.filter((file) =>
  /\.(png|jpe?g|gif|webp|svg)$/i.test(file),
).length;
console.log(
  `Archive: ${archive}\nFiles: ${selected.length}\nImages: ${images}\nSize: ${statSync(archive).size} bytes`,
);
if (canReveal()) {
  execFileSync("open", ["-R", archive]);
  console.log("Finder reveal requested for the exact archive.");
} else console.log(`Archive available at ${archive}`);
