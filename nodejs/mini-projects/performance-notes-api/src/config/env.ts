import "dotenv/config";
import { z } from "zod";

export type TrustProxyValue = boolean | number;

function numberFromEnv(defaultValue: number) {
  return z.preprocess((value) => {
    if (value === undefined || value === "") return defaultValue;
    return Number(value);
  }, z.number().int().positive());
}

function optionalBooleanFromEnv() {
  return z.preprocess((value) => {
    if (value === undefined || value === "") return undefined;
    if (typeof value === "boolean") return value;
    if (value === "true") return true;
    if (value === "false") return false;
    return value;
  }, z.boolean().optional());
}

function trustProxyFromEnv(defaultValue: TrustProxyValue) {
  return z.preprocess((value) => {
    if (value === undefined || value === "") return defaultValue;
    if (typeof value === "boolean" || typeof value === "number") return value;
    if (value === "true") return true;
    if (value === "false") return false;
    const numericValue = Number(value);
    if (Number.isInteger(numericValue) && numericValue >= 0) return numericValue;
    return value;
  }, z.union([z.boolean(), z.number().int().nonnegative()]));
}

function splitOrigins(value: string): string[] {
  return value.split(",").map((origin) => origin.trim()).filter(Boolean);
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: numberFromEnv(3020),
  DATABASE_URL: z.string().min(1).default("postgresql://postgres:postgres@localhost:5432/performance_notes_api"),
  REDIS_URL: z.string().min(1).default("redis://localhost:6379"),
  SESSION_COOKIE_NAME: z.string().min(1).default("performance_notes_session"),
  SESSION_SECRET: z.string().min(32).default("development-session-secret-change-me-32"),
  SESSION_TTL_SECONDS: numberFromEnv(604800),
  CSRF_COOKIE_NAME: z.string().min(1).default("performance_notes_csrf"),
  ALLOWED_ORIGINS: z.string().default("http://localhost:8080,http://127.0.0.1:8080"),
  TRUST_PROXY: trustProxyFromEnv(1),
  COOKIE_SECURE: optionalBooleanFromEnv(),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
  SHUTDOWN_TIMEOUT_MS: numberFromEnv(10000)
});

export type RawAppConfig = z.infer<typeof envSchema>;

export interface AppConfig extends Omit<RawAppConfig, "ALLOWED_ORIGINS" | "COOKIE_SECURE"> {
  ALLOWED_ORIGINS: string[];
  COOKIE_SECURE: boolean;
}

export function loadEnv(source: NodeJS.ProcessEnv = process.env): AppConfig {
  const parsed = envSchema.parse(source);

  if (parsed.NODE_ENV === "production" && parsed.SESSION_SECRET.includes("development")) {
    throw new Error("SESSION_SECRET must be replaced before production startup.");
  }

  return {
    ...parsed,
    ALLOWED_ORIGINS: splitOrigins(parsed.ALLOWED_ORIGINS),
    COOKIE_SECURE: parsed.COOKIE_SECURE ?? parsed.NODE_ENV === "production"
  };
}

export const config = loadEnv();
