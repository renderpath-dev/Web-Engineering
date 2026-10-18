import { pathToFileURL } from "node:url";

export interface SmokeTarget {
  name: "live" | "ready";
  url: string;
}

export interface SmokeResult {
  name: string;
  status: number;
  ok: boolean;
}

export function createSmokeTargets(baseUrl: string): SmokeTarget[] {
  const normalized = baseUrl.replace(/\/$/, "");
  return [
    { name: "live", url: `${normalized}/health/live` },
    { name: "ready", url: `${normalized}/health/ready` }
  ];
}

export function evaluateSmokeResults(results: SmokeResult[]): boolean {
  return results.every((result) => result.ok && result.status === 200);
}

export async function runSmokeTest(baseUrl = process.env.SMOKE_BASE_URL ?? "http://localhost:8080"): Promise<SmokeResult[]> {
  const results: SmokeResult[] = [];

  for (const target of createSmokeTargets(baseUrl)) {
    const response = await fetch(target.url);
    results.push({
      name: target.name,
      status: response.status,
      ok: response.ok
    });
  }

  if (!evaluateSmokeResults(results)) {
    throw new Error(`Smoke test failed: ${JSON.stringify(results)}`);
  }

  return results;
}

function isMainModule(): boolean {
  const entry = process.argv[1];
  return Boolean(entry) && import.meta.url === pathToFileURL(entry).href;
}

if (isMainModule()) {
  runSmokeTest()
    .then((results) => {
      console.log(JSON.stringify({ ok: true, results }));
    })
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}
