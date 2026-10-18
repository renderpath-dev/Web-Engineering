import { AsyncLocalStorage } from "node:async_hooks";
type Context = { requestId: string; traceId?: string };
const storage = new AsyncLocalStorage<Context>();
await storage.run({ requestId: "req_123", traceId: "trace_abc" }, async () => { await Promise.resolve(); console.log(storage.getStore()); });
