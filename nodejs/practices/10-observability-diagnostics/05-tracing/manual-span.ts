type Span = { setAttribute(name: string, value: string | number | boolean): void; recordException(error: Error): void; end(): void };
export async function runWithManualSpan<T>(span: Span, operation: () => Promise<T>): Promise<T> {
  try { span.setAttribute("app.operation", "notes.list"); return await operation(); }
  catch (error) { span.recordException(error as Error); throw error; }
  finally { span.end(); }
}
await runWithManualSpan({ setAttribute() {}, recordException() {}, end() { console.log("span ended"); } }, async () => "ok");
