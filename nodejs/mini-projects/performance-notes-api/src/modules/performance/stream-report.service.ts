import { once } from "node:events";
import { Writable } from "node:stream";
import { finished } from "node:stream/promises";

export interface StreamBackpressureReport {
  chunks: number;
  chunkSize: number;
  drains: number;
  bytesWritten: number;
}

export async function createStreamBackpressureReport(): Promise<StreamBackpressureReport> {
  const chunks = 40;
  const chunkSize = 1024;
  const writable = new Writable({
    highWaterMark: 4096,
    write(_chunk, _encoding, callback) {
      setImmediate(callback);
    }
  });

  let drains = 0;
  let bytesWritten = 0;

  for (let index = 0; index < chunks; index += 1) {
    const chunk = Buffer.alloc(chunkSize, "x");
    bytesWritten += chunk.byteLength;
    if (!writable.write(chunk)) {
      drains += 1;
      await once(writable, "drain");
    }
  }

  writable.end();
  await finished(writable);

  return {
    chunks,
    chunkSize,
    drains,
    bytesWritten
  };
}
