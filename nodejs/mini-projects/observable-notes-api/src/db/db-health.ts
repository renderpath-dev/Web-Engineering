import { prisma } from "./prisma.js";
import { withDependencySpan } from "../observability/spans.js";

export type DependencyStatus = "ready" | "unavailable";

export async function checkPostgresReadiness(): Promise<DependencyStatus> {
  try {
    await withDependencySpan("postgres", "SELECT 1", () => prisma.$queryRaw`SELECT 1`);
    return "ready";
  } catch {
    return "unavailable";
  }
}
