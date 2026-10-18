import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { pathToFileURL } from "node:url";
import { runLoadBaseline } from "./load-baseline.js";

const execFileAsync = promisify(execFile);

export async function readDockerStats(): Promise<string> {
  try {
    const { stdout } = await execFileAsync("docker", [
      "stats",
      "--no-stream",
      "--format",
      "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}",
      "performance-notes-api-api-1",
      "performance-notes-api-postgres-1",
      "performance-notes-api-redis-1",
      "performance-notes-api-nginx-1"
    ]);
    return stdout.trim();
  } catch {
    return "docker stats unavailable";
  }
}

export async function createCapacityReport() {
  const baseline = await runLoadBaseline();
  const dockerStats = await readDockerStats();
  return {
    baseline,
    dockerStats,
    observations: [
      "Compare latency p95 with request rate.",
      "Use sampled request durations as the executable p95 budget input.",
      "Check whether errors or timeouts appear before raising concurrency.",
      "Read container CPU and memory as capacity signals, not root cause proof."
    ]
  };
}

function isMainModule(): boolean {
  const entry = process.argv[1];
  return Boolean(entry) && import.meta.url === pathToFileURL(entry).href;
}

if (isMainModule()) {
  createCapacityReport()
    .then((report) => console.log(JSON.stringify(report, null, 2)))
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}
