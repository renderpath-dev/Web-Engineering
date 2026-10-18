
import { pipeline } from "node:stream/promises";
import { Readable, Writable } from "node:stream";

export async function writeChunksWithPipeline(chunks: Buffer[]): Promise<number> {
  let bytesWritten = 0;
  const readable = Readable.from(chunks);
  const writable = new Writable({
    write(chunk: Buffer, _encoding, callback) {
      bytesWritten += chunk.length;
      callback();
    }
  });

  await pipeline(readable, writable);
  return bytesWritten;
}
