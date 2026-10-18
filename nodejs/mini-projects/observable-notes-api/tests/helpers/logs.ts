import { Writable } from "node:stream";

export function createLogCapture() {
  const chunks: string[] = [];
  const stream = new Writable({
    write(chunk, _encoding, callback) {
      chunks.push(String(chunk));
      callback();
    }
  });

  return {
    stream,
    read() {
      return chunks.join("");
    }
  };
}
