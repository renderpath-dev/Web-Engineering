import { prisma } from "./prisma.js";
import { classifyDatabaseError } from "./db-error-classifier.js";

export interface DependencyHealth {
  name: "postgres" | "redis";
  healthy: boolean;
  required: boolean;
  detail: string;
}

export async function checkDatabaseHealth(): Promise<DependencyHealth> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { name: "postgres", healthy: true, required: true, detail: "ok" };
  } catch (error) {
    const classification = classifyDatabaseError(error);
    return { name: "postgres", healthy: false, required: true, detail: classification.kind };
  }
}
