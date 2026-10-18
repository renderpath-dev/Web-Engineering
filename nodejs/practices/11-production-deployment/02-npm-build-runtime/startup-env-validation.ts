import { z } from "zod";

const startupEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  SESSION_SECRET: z.string().min(32),
  PORT: z.coerce.number().int().min(1).max(65535)
});

export type StartupEnv = z.infer<typeof startupEnvSchema>;

export function parseStartupEnv(source: NodeJS.ProcessEnv): StartupEnv {
  return startupEnvSchema.parse(source);
}
