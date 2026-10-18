import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Worker } from "node:worker_threads";

export interface WorkerTask {
  iterations: number;
}

interface PendingTask {
  id: number;
  task: WorkerTask;
  resolve: (value: number) => void;
  reject: (error: Error) => void;
}

interface WorkerState {
  worker: Worker;
  activeTask?: PendingTask;
}

interface WorkerLocation {
  url: URL;
  execArgv: string[];
}

function resolveWorkerLocation(workerUrl?: URL): WorkerLocation {
  if (workerUrl) {
    return { url: workerUrl, execArgv: [] };
  }

  const compiledWorkerUrl = new URL("./cpu-worker.js", import.meta.url);
  if (existsSync(fileURLToPath(compiledWorkerUrl))) {
    return { url: compiledWorkerUrl, execArgv: [] };
  }

  return {
    url: new URL("./cpu-worker.ts", import.meta.url),
    execArgv: ["--import", "tsx"]
  };
}

export class WorkerPool {
  private nextId = 1;
  private readonly queue: PendingTask[] = [];
  private readonly workers: WorkerState[];
  private readonly workerLocation: WorkerLocation;

  constructor(size = 2, workerUrl?: URL) {
    this.workerLocation = resolveWorkerLocation(workerUrl);
    this.workers = Array.from({ length: size }, () => this.createWorker());
  }

  get size(): number {
    return this.workers.length;
  }

  get pendingCount(): number {
    return this.queue.length + this.workers.filter((state) => state.activeTask).length;
  }

  run(task: WorkerTask): Promise<number> {
    return new Promise((resolve, reject) => {
      const pendingTask = {
        id: this.nextId,
        task,
        resolve,
        reject
      };
      this.nextId += 1;
      this.queue.push(pendingTask);
      this.dispatch();
    });
  }

  async close(): Promise<void> {
    for (const pending of this.queue.splice(0)) {
      pending.reject(new Error("Worker pool closed before task execution"));
    }
    await Promise.all(this.workers.map((state) => state.worker.terminate()));
  }

  private createWorker(): WorkerState {
    const state: WorkerState = {
      worker: new Worker(this.workerLocation.url, { execArgv: this.workerLocation.execArgv })
    };

    state.worker.on("message", (message: { id: number; result?: number; error?: string }) => {
      const activeTask = state.activeTask;
      if (!activeTask || activeTask.id !== message.id) return;
      state.activeTask = undefined;
      if (message.error) {
        activeTask.reject(new Error(message.error));
      } else {
        activeTask.resolve(message.result ?? 0);
      }
      this.dispatch();
    });

    state.worker.on("error", (error) => {
      const activeTask = state.activeTask;
      state.activeTask = undefined;
      activeTask?.reject(error instanceof Error ? error : new Error("Worker failed"));
      this.dispatch();
    });

    return state;
  }

  private dispatch(): void {
    for (const state of this.workers) {
      if (state.activeTask || this.queue.length === 0) continue;
      const nextTask = this.queue.shift();
      if (!nextTask) return;
      state.activeTask = nextTask;
      state.worker.postMessage({
        id: nextTask.id,
        iterations: nextTask.task.iterations
      });
    }
  }
}
