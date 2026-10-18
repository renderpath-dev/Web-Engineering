import { AsyncLocalStorage } from "node:async_hooks";

export type RequestContext = {
  requestId: string;
  startedAt: number;
  traceId?: string;
  spanId?: string;
};

const storage = new AsyncLocalStorage<RequestContext>();

export function runWithRequestContext<T>(context: RequestContext, callback: () => T): T {
  return storage.run(context, callback);
}

export function getRequestContext(): RequestContext | undefined {
  return storage.getStore();
}

export function getRequestId(): string | undefined {
  return getRequestContext()?.requestId;
}

export function attachTraceContext(traceId?: string, spanId?: string): void {
  const context = getRequestContext();
  if (!context) return;
  context.traceId = traceId;
  context.spanId = spanId;
}
