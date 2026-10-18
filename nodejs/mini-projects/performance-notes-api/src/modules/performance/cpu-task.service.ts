import { WorkerPool } from "./worker-pool.js";
import type { CpuTaskResult, WorkSize } from "./performance.types.js";

let cpuWorkerPool: WorkerPool | undefined;

function getCpuWorkerPool(): WorkerPool {
  cpuWorkerPool ??= new WorkerPool(2);
  return cpuWorkerPool;
}

export function iterationsForSize(size: WorkSize): number {
  return size === "medium" ? 90_000 : 25_000;
}

export function runBoundedCpuWork(iterations: number): number {
  let total = 0;
  for (let index = 1; index <= iterations; index += 1) {
    total += Math.sqrt(index) % 7;
  }
  return Number(total.toFixed(3));
}

export function runCpuTaskSync(size: WorkSize): CpuTaskResult {
  const iterations = iterationsForSize(size);
  const startedAt = process.hrtime.bigint();
  const result = runBoundedCpuWork(iterations);
  const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
  return {
    size,
    iterations,
    result,
    durationMs: Number(durationMs.toFixed(3)),
    mode: "sync"
  };
}

export async function runCpuTaskInWorker(size: WorkSize): Promise<CpuTaskResult> {
  const iterations = iterationsForSize(size);
  const startedAt = process.hrtime.bigint();
  const result = await getCpuWorkerPool().run({ iterations });
  const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
  return {
    size,
    iterations,
    result,
    durationMs: Number(durationMs.toFixed(3)),
    mode: "worker"
  };
}

export async function closeCpuWorkerPool(): Promise<void> {
  await cpuWorkerPool?.close();
  cpuWorkerPool = undefined;
}
