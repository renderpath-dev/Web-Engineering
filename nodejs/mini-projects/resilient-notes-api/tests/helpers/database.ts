import { prisma } from "../../src/db/prisma.js";

export async function resetReliabilityTables(): Promise<void> {
  await prisma.idempotencyRecord.deleteMany();
}

export async function closeDatabase(): Promise<void> {
  await prisma.$disconnect();
}
