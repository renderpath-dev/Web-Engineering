import { randomUUID } from "node:crypto";

export function chooseCorrelationId(headerValue: string | undefined): string {
  if (headerValue && /^[a-zA-Z0-9_.:-]{8,128}$/.test(headerValue)) return headerValue;
  return randomUUID();
}
