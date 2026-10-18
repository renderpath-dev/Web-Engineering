import "dotenv/config";
import { z } from "zod";

const booleanFromEnv = (defaultValue: boolean) =>
  z.preprocess((value) => {
    if (typeof value !== "string") return value ?? defaultValue;
    return ["1", "true", "yes", "on"].includes(value.toLowerCase());
  }, z.boolean()).default(defaultValue);

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65_535).default(3020),
  DATABASE_URL: z.string().url().default("postgresql://postgres:postgres@localhost:5432/contract_governed_notes_api"),
  REDIS_URL: z.string().url().default("redis://localhost:6379"),
  SESSION_COOKIE_NAME: z.string().min(1).default("contract_notes_session"),
  SESSION_SECRET: z.string().min(16).default("local-development-session-secret-32chars"),
  SESSION_TTL_SECONDS: z.coerce.number().int().positive().default(604_800),
  CSRF_COOKIE_NAME: z.string().min(1).default("contract_notes_csrf"),
  ALLOWED_ORIGINS: z.string().default("http://localhost:8080,http://127.0.0.1:8080"),
  TRUST_PROXY: z.coerce.number().int().min(0).max(1).default(0),
  COOKIE_SECURE: booleanFromEnv(false),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
  SHUTDOWN_TIMEOUT_MS: z.coerce.number().int().positive().default(10_000),
  HTTP_REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(30_000),
  HTTP_HEADERS_TIMEOUT_MS: z.coerce.number().int().positive().default(10_000),
  HTTP_KEEP_ALIVE_TIMEOUT_MS: z.coerce.number().int().positive().default(5_000),
  DEPENDENCY_TIMEOUT_MS: z.coerce.number().int().positive().default(500),
  REDIS_CONNECT_TIMEOUT_MS: z.coerce.number().int().positive().default(1_000)
});

export type AppConfig = z.infer<typeof envSchema>;
export const config: AppConfig = envSchema.parse(process.env);
