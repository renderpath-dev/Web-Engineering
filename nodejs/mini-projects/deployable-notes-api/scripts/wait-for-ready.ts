import { setTimeout as delay } from "node:timers/promises";
import { pathToFileURL } from "node:url";

export async function waitForReady(baseUrl: string, attempts = 30, intervalMs = 1000): Promise<void> {
  const url = `${baseUrl.replace(/\/$/, "")}/health/ready`;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      await delay(intervalMs);
      continue;
    }

    await delay(intervalMs);
  }

  throw new Error(`Service did not become ready at ${url}`);
}

function isMainModule(): boolean {
  const entry = process.argv[1];
  return Boolean(entry) && import.meta.url === pathToFileURL(entry).href;
}

if (isMainModule()) {
  waitForReady(process.env.SMOKE_BASE_URL ?? "http://localhost:8080")
    .then(() => console.log("ready"))
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}
