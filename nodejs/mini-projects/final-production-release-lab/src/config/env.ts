import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3050),
  API_ORIGIN: z.string().min(1).default("http://localhost:8080"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(120),
  RELEASE_ENVIRONMENT: z.string().min(1).default("local"),
  RELEASE_OWNER: z.string().min(1).default("local-release-owner"),
  RELEASE_VERSION: z.string().min(1).default("1.0.0"),
  COMMIT_SHA: z.string().min(1).default("placeholder-commit-sha"),
  BUILD_ID: z.string().min(1).default("placeholder-build-id")
});

export type AppEnv = z.infer<typeof envSchema>;
export const env: AppEnv = envSchema.parse(process.env);
