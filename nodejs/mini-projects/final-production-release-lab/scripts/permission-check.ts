import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fromProjectRoot } from "../src/release/artifact-hash.js";

const target = fromProjectRoot("dist", "src", "security", "node-permission-demo.js");

if (!existsSync(target)) {
  console.log(JSON.stringify({
    status: "UNKNOWN",
    reason: "Build output is missing. Run npm run build before checking runtime permission flags."
  }, null, 2));
  process.exit(0);
}

const result = spawnSync(process.execPath, ["--permission", target], {
  cwd: fromProjectRoot(),
  encoding: "utf8"
});

const combinedOutput = (result.stdout ?? "") + (result.stderr ?? "");
if (/bad option|unknown option|not allowed in NODE_OPTIONS/i.test(combinedOutput)) {
  console.log(JSON.stringify({
    status: "UNKNOWN",
    reason: "This Node runtime does not support the permission flag used by the demo."
  }, null, 2));
  process.exit(0);
}

console.log(JSON.stringify({
  status: result.status === 0 ? "PASS" : "FAIL",
  exitCode: result.status,
  output: combinedOutput.trim()
}, null, 2));
process.exit(result.status === 0 ? 0 : 1);
