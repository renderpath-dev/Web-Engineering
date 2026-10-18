import "dotenv/config";
import { z } from "zod";

const BooleanEnv = z.preprocess((value) => {
  if (value === undefined) {
    return undefined;
  }
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    return ["1", "true", "yes", "on"].includes(value.toLowerCase());
  }
  return value;
}, z.boolean()).default(false);

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3040),
  SERVICE_NAME: z.string().min(1).default("platform-observability-kubernetes-lab"),
  DATABASE_URL: z.string().min(1).default("postgresql://app:app@localhost:5432/platform_observability_kubernetes_lab"),
  REDIS_URL: z.string().min(1).default("redis://localhost:6379"),
  CORS_ORIGIN: z.string().min(1).default("http://localhost:8080"),
  READINESS_TIMEOUT_MS: z.coerce.number().int().positive().default(800),
  STARTUP_GRACE_MS: z.coerce.number().int().positive().default(1000),
  SHUTDOWN_GRACE_MS: z.coerce.number().int().positive().default(8000),
  SKIP_DEPENDENCY_CHECKS: BooleanEnv
});

export type AppConfig = z.infer<typeof EnvSchema>;

export function loadConfig(input: NodeJS.ProcessEnv = process.env): AppConfig {
  return EnvSchema.parse(input);
}
