import { prisma } from "./prisma.js";

export async function checkDatabase(): Promise<"ready" | "unavailable"> {
  try {
    await prisma.$queryRawUnsafe("SELECT 1");
    return "ready";
  } catch {
    return "unavailable";
  }
}
