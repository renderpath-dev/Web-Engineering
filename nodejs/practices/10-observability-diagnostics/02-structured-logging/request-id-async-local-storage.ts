import { AsyncLocalStorage } from "node:async_hooks";
const requestContext = new AsyncLocalStorage<{ requestId: string }>();
async function loadNoteTitle(): Promise<string> {
  await Promise.resolve();
  return `request=${requestContext.getStore()?.requestId ?? "missing"}`;
}
await requestContext.run({ requestId: "req_123" }, async () => console.log(await loadNoteTitle()));
const detachedCallback = () => requestContext.getStore()?.requestId ?? "missing";
console.log(detachedCallback());
