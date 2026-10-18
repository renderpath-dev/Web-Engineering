import { Writable } from "node:stream";
import { once } from "node:events";

export async function writeWithBackpressure(chunks: Buffer[]): Promise<number> {
  const writable = new Writable({
    highWaterMark: 16,
    write(_chunk, _encoding, callback) {
      setImmediate(callback);
    }
  });

  let drains = 0;
  for (const chunk of chunks) {
    if (!writable.write(chunk)) {
      drains += 1;
      await once(writable, "drain");
    }
  }
  writable.end();
  return drains;
}
