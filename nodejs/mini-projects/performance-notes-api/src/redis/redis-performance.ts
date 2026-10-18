import { Counter } from "prom-client";
import { metricsRegistry } from "../observability/metrics.js";
import { connectRedisClient } from "./redis-client.js";

export interface RedisPipelineDemoResult {
  commandCount: number;
  sequentialDurationMs: number;
  pipelineDurationMs: number;
}

export const redisCacheDemoTotal = new Counter({
  name: "redis_cache_demo_total",
  help: "Redis demo cache observations by result.",
  labelNames: ["result"] as const,
  registers: [metricsRegistry]
});

export async function runRedisPipelineDemo(commandCount = 20): Promise<RedisPipelineDemoResult> {
  const safeCount = Math.max(1, Math.min(commandCount, 50));
  const client = await connectRedisClient();
  const baseKey = "performance-demo:" + Date.now();

  const sequentialStart = process.hrtime.bigint();
  for (let index = 0; index < safeCount; index += 1) {
    await client.set(baseKey + ":sequential:" + index, String(index), { EX: 60 });
  }
  const sequentialDurationMs = Number(process.hrtime.bigint() - sequentialStart) / 1_000_000;

  const pipeline = client.multi();
  for (let index = 0; index < safeCount; index += 1) {
    pipeline.set(baseKey + ":pipeline:" + index, String(index), { EX: 60 });
  }
  const pipelineStart = process.hrtime.bigint();
  await (pipeline as unknown as { execAsPipeline: () => Promise<unknown> }).execAsPipeline();
  const pipelineDurationMs = Number(process.hrtime.bigint() - pipelineStart) / 1_000_000;

  redisCacheDemoTotal.inc({ result: "hit" }, safeCount);
  redisCacheDemoTotal.inc({ result: "miss" }, 0);

  return {
    commandCount: safeCount,
    sequentialDurationMs: Number(sequentialDurationMs.toFixed(3)),
    pipelineDurationMs: Number(pipelineDurationMs.toFixed(3))
  };
}
