
import express from "express";

export const boundedJsonParser = express.json({ limit: "1mb" });

export function estimateJsonParseCost(payload: string) {
  const startedAt = process.hrtime.bigint();
  const parsed = JSON.parse(payload) as unknown;
  const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;

  return {
    bytes: Buffer.byteLength(payload),
    durationMs: Number(durationMs.toFixed(3)),
    valueType: Array.isArray(parsed) ? "array" : typeof parsed
  };
}
