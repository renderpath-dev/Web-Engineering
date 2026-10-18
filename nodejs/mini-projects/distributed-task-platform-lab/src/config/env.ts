import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3030),
  DATABASE_URL: z.string().min(1).default("postgresql://postgres:postgres@localhost:5432/distributed_task_platform_lab"),
  REDIS_URL: z.string().url().default("redis://localhost:6379"),
  ALLOWED_ORIGINS: z.string().default("http://localhost:8080,http://127.0.0.1:8080"),
  TRUST_PROXY: z.coerce.number().int().min(0).default(1),
  LOG_LEVEL: z.string().default("info"),
  SHUTDOWN_TIMEOUT_MS: z.coerce.number().int().positive().default(10000),
  HTTP_REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(30000),
  HTTP_HEADERS_TIMEOUT_MS: z.coerce.number().int().positive().default(10000),
  HTTP_KEEP_ALIVE_TIMEOUT_MS: z.coerce.number().int().positive().default(5000),
  DEPENDENCY_TIMEOUT_MS: z.coerce.number().int().positive().default(1000),
  REDIS_CONNECT_TIMEOUT_MS: z.coerce.number().int().positive().default(1000),
  JOB_TIMEOUT_MS: z.coerce.number().int().positive().default(15000),
  WORKER_CONCURRENCY: z.coerce.number().int().min(1).max(16).default(2),
  CACHE_TTL_SECONDS: z.coerce.number().int().positive().default(60),
  SMOKE_BASE_URL: z.string().url().default("http://localhost:8080")
});

export const config = envSchema.parse(process.env);
export type AppConfig = z.infer<typeof envSchema>;

export function parseAllowedOrigins(rawOrigins: string): string[] {
  return rawOrigins.split(",").map((origin) => origin.trim()).filter(Boolean);
}
