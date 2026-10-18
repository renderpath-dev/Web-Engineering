
import { Worker } from "node:worker_threads";

export function runCpuTaskInWorker(workerUrl: URL, iterations: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(workerUrl, { execArgv: [] });

    worker.once("message", (message: { result: number }) => {
      resolve(message.result);
    });

    worker.once("error", reject);

    worker.once("exit", (code) => {
      if (code !== 0) {
        reject(new Error("Worker exited with code " + code));
      }
    });

    worker.postMessage({ iterations });
  });
}
