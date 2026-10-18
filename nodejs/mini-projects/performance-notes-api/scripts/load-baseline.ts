import { performance } from "node:perf_hooks";
import { pathToFileURL } from "node:url";

export interface LoadProfile {
  totalRequests: number;
  concurrency: number;
}

export interface RequestSample {
  status: number;
  latencyMs: number;
  timedOut: boolean;
}

export interface PercentileSummary {
  p50: number;
  p95: number;
  p99: number;
}

export interface LoadBaselineResult {
  url: string;
  loadProfile: LoadProfile;
  requestsPerSecond: number;
  latencyP95: number;
  errors: number;
  timeouts: number;
}

export function percentile(values: number[], percentileValue: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((left, right) => left - right);
  const index = Math.ceil((percentileValue / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(index, sorted.length - 1))];
}

export function summarizeLatencies(samples: RequestSample[]): PercentileSummary {
  const latencies = samples.map((sample) => sample.latencyMs);
  return {
    p50: percentile(latencies, 50),
    p95: percentile(latencies, 95),
    p99: percentile(latencies, 99)
  };
}

async function runOneRequest(url: string): Promise<RequestSample> {
  const startedAt = performance.now();
  try {
    const response = await fetch(url);
    return {
      status: response.status,
      latencyMs: Number((performance.now() - startedAt).toFixed(3)),
      timedOut: false
    };
  } catch {
    return {
      status: 0,
      latencyMs: Number((performance.now() - startedAt).toFixed(3)),
      timedOut: true
    };
  }
}

async function runBoundedLoad(url: string, profile: LoadProfile): Promise<RequestSample[]> {
  const samples: RequestSample[] = [];
  let nextRequest = 0;

  async function worker(): Promise<void> {
    while (nextRequest < profile.totalRequests) {
      nextRequest += 1;
      samples.push(await runOneRequest(url));
    }
  }

  await Promise.all(Array.from({ length: profile.concurrency }, () => worker()));
  return samples;
}

export async function runLoadBaseline(url = process.env.LOAD_BASE_URL ?? "http://localhost:8080"): Promise<LoadBaselineResult> {
  const normalizedUrl = url.replace(/\/$/, "");
  const targetUrl = normalizedUrl + "/health/ready";
  const loadProfile = {
    totalRequests: 80,
    concurrency: 5
  };
  const startedAt = performance.now();
  const samples = await runBoundedLoad(targetUrl, loadProfile);
  const durationSeconds = Math.max((performance.now() - startedAt) / 1000, 0.001);
  const summary = summarizeLatencies(samples);
  const errors = samples.filter((sample) => sample.status >= 400 || sample.status === 0).length;
  const timeouts = samples.filter((sample) => sample.timedOut).length;

  return {
    url: normalizedUrl,
    loadProfile,
    requestsPerSecond: Number((samples.length / durationSeconds).toFixed(3)),
    latencyP95: summary.p95,
    errors,
    timeouts
  };
}

function isMainModule(): boolean {
  const entry = process.argv[1];
  return Boolean(entry) && import.meta.url === pathToFileURL(entry).href;
}

if (isMainModule()) {
  runLoadBaseline()
    .then((result) => console.log(JSON.stringify(result)))
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}
