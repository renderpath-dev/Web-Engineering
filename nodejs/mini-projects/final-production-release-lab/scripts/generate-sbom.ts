import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fromProjectRoot } from "../src/release/artifact-hash.js";

const npmCliPath = process.env.npm_execpath;
const command = npmCliPath ? process.execPath : process.platform === "win32" ? "npm.cmd" : "npm";
const args = npmCliPath
  ? [npmCliPath, "sbom", "--sbom-format=cyclonedx", "--json"]
  : ["sbom", "--sbom-format=cyclonedx", "--json"];
const result = spawnSync(command, args, {
  cwd: fromProjectRoot(),
  encoding: "utf8",
  maxBuffer: 10 * 1024 * 1024
});

if (result.status !== 0 || !result.stdout.trim()) {
  console.log(JSON.stringify({
    status: "UNKNOWN",
    reason: (result.error?.message || result.stderr || result.stdout || "npm sbom did not produce output").trim()
  }, null, 2));
  process.exit(0);
}

const target = fromProjectRoot("release", "sbom.cdx.json");
mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, result.stdout, "utf8");
console.log(JSON.stringify({
  status: "PASS",
  path: "release/sbom.cdx.json"
}, null, 2));
