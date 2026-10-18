import type { AppConfig } from "../config/env.js";
import type { DependencyProbe } from "./postgres.js";
import { createPostgresProbe } from "./postgres.js";
import { createRedisProbe } from "./redis.js";

export function createDependencyProbes(config: AppConfig): DependencyProbe[] {
  return [
    createPostgresProbe(config),
    createRedisProbe(config)
  ];
}
