import { readFile } from "node:fs/promises";
import YAML from "yaml";
import { assertCondition } from "./check-utils.js";

const compose = YAML.parse(await readFile(new URL("../compose.yaml", import.meta.url), "utf8")) as any;
const dockerfile = await readFile(new URL("../Dockerfile", import.meta.url), "utf8");

for (const service of ["api", "postgres", "redis", "prometheus", "nginx"]) {
  assertCondition(compose.services?.[service], "Missing Compose service: " + service);
}

assertCondition(JSON.stringify(compose.services.nginx.ports).includes("8080:80"), "NGINX must expose host port 8080");
assertCondition(JSON.stringify(compose.services.postgres.volumes).includes("/var/lib/postgresql"), "PostgreSQL 18 volume target is invalid");
assertCondition(compose.services.api.depends_on.postgres.condition === "service_healthy", "API must wait for PostgreSQL health");
assertCondition(compose.services.api.depends_on.redis.condition === "service_healthy", "API must wait for Redis health");
assertCondition(compose.services.prometheus.volumes.some((value: string) => value.includes("prometheus.yml")), "Prometheus config volume is missing");
assertCondition((dockerfile.match(/^FROM /gm) ?? []).length >= 2, "Dockerfile is not multi-stage");
assertCondition(dockerfile.includes("CMD [\"node\", \"dist/src/api/server.js\"]"), "Runtime start must use built JavaScript");

console.log("docker config ok");
