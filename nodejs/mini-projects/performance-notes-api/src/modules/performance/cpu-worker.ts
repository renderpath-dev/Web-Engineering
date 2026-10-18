import { parentPort } from "node:worker_threads";

function runBoundedCpuWork(iterations: number): number {
  const safeIterations = Math.max(1, Math.min(iterations, 5_000_000));
  let value = 0;
  for (let index = 0; index < safeIterations; index += 1) {
    value = (value + Math.sqrt(index + 1)) % 1_000_000;
  }
  return Number(value.toFixed(3));
}

if (!parentPort) {
  throw new Error("cpu-worker requires parentPort");
}

parentPort.on("message", (message: { id: number; iterations: number }) => {
  try {
    parentPort?.postMessage({
      id: message.id,
      result: runBoundedCpuWork(message.iterations)
    });
  } catch (error) {
    parentPort?.postMessage({
      id: message.id,
      error: error instanceof Error ? error.message : "Worker task failed"
    });
  }
});
