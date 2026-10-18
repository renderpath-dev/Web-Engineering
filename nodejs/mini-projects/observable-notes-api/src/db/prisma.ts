import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
import { config } from "../config/env.js";
import { logger } from "../observability/logger.js";
import { redactSensitiveData } from "../observability/log-redaction.js";

const adapter = new PrismaPg({
  connectionString: config.DATABASE_URL
});

export const prisma = new PrismaClient({
  adapter,
  log: ["warn", "error"]
});

process.on("warning", (warning) => {
  logger.warn({
    warning: redactSensitiveData({
      name: warning.name,
      message: warning.message
    })
  }, "process warning observed near database client");
});

export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
}
