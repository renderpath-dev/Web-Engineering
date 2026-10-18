import { canReachTcpPort } from "./database.js";

export async function canReachRedis(): Promise<boolean> {
  return canReachTcpPort("127.0.0.1", 6379);
}
