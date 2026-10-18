import diagnosticsChannel from "node:diagnostics_channel";
import { getRequestContext } from "./request-context.js";
import { redactSensitiveData } from "./log-redaction.js";

const appChannel = diagnosticsChannel.channel("observable-notes-api.lifecycle");

export function publishDiagnosticEvent(name: string, payload: Record<string, unknown>): void {
  appChannel.publish({
    name,
    requestId: getRequestContext()?.requestId,
    payload: redactSensitiveData(payload),
    time: new Date().toISOString()
  });
}

export function subscribeDiagnosticEvents(listener: (message: unknown) => void): () => void {
  const subscriber = (message: unknown) => listener(message);
  appChannel.subscribe(subscriber);
  return () => appChannel.unsubscribe(subscriber);
}
