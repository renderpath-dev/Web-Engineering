
export interface WorkerState {
  id: number;
  activeTaskId?: number;
}

export interface WorkerPoolSnapshot {
  idleWorkerIds: number[];
  activeTaskIds: number[];
  pendingTaskIds: number[];
}

export function assignTask(workers: WorkerState[], pendingTaskIds: number[], taskId: number): WorkerPoolSnapshot {
  const idleWorker = workers.find((worker) => worker.activeTaskId === undefined);
  if (idleWorker) {
    idleWorker.activeTaskId = taskId;
  } else {
    pendingTaskIds.push(taskId);
  }

  return {
    idleWorkerIds: workers.filter((worker) => worker.activeTaskId === undefined).map((worker) => worker.id),
    activeTaskIds: workers.flatMap((worker) => worker.activeTaskId === undefined ? [] : [worker.activeTaskId]),
    pendingTaskIds: [...pendingTaskIds]
  };
}

export function transferBoundary(input: ArrayBuffer): Transferable[] {
  return [input];
}
