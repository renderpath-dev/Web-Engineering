import type { NextFunction, Request, Response } from "express";
import { getQueryMetricSummary } from "../../db/query-metrics.js";
import { readEventLoopSnapshot } from "../../observability/event-loop-metrics.js";
import { runRedisPipelineDemo } from "../../redis/redis-performance.js";
import { sendOk } from "../../shared/responses/send-response.js";
import { runCpuTaskInWorker, runCpuTaskSync } from "./cpu-task.service.js";
import { readMemorySample } from "./memory-sample.service.js";
import { workSizeSchema } from "./performance.schema.js";
import { createStreamBackpressureReport } from "./stream-report.service.js";

export function eventLoop(_request: Request, response: Response): void {
  sendOk(response, readEventLoopSnapshot());
}

export function memory(_request: Request, response: Response): void {
  sendOk(response, readMemorySample());
}

export function cpuSync(request: Request, response: Response): void {
  const query = workSizeSchema.parse(request.query);
  sendOk(response, runCpuTaskSync(query.size));
}

export async function cpuWorker(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const query = workSizeSchema.parse(request.query);
    sendOk(response, await runCpuTaskInWorker(query.size));
  } catch (error) {
    next(error);
  }
}

export async function streamReport(_request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    sendOk(response, await createStreamBackpressureReport());
  } catch (error) {
    next(error);
  }
}

export async function redisPipelineDemo(_request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    sendOk(response, await runRedisPipelineDemo());
  } catch (error) {
    next(error);
  }
}

export function querySummary(_request: Request, response: Response): void {
  sendOk(response, {
    queries: getQueryMetricSummary()
  });
}
