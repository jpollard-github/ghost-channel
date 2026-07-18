import { spawnSync } from "node:child_process";
const [script, ...args] = process.argv.slice(2);
if (!script) throw new Error("Provide an npm script name.");
const started = performance.now();
const result = spawnSync("npm", ["run", script, ...args], { stdio: "inherit" });
console.log(
  `${script} completed in ${((performance.now() - started) / 1000).toFixed(1)}s`,
);
process.exit(result.status ?? 1);
