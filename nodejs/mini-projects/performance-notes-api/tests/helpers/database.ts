import { connect } from "node:net";

export async function canReachTcpPort(host: string, port: number, timeoutMs = 500): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = connect({ host, port });
    const timer = setTimeout(() => {
      socket.destroy();
      resolve(false);
    }, timeoutMs);

    socket.once("connect", () => {
      clearTimeout(timer);
      socket.end();
      resolve(true);
    });

    socket.once("error", () => {
      clearTimeout(timer);
      resolve(false);
    });
  });
}

export function databaseUrlForTests(): string {
  return process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/performance_notes_api";
}
