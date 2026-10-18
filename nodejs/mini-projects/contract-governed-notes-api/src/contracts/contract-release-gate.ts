import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { findContractDrift } from "./contract-drift.js";
import { exampleLooksSafe } from "./example-fixtures.js";
import { loadOpenApiDocument } from "./openapi-loader.js";
import { routeInventory } from "./route-inventory.js";
import { recordContractViolation } from "../observability/contract-metrics.js";

export type ReleaseGateResult = {
  passed: boolean;
  failures: string[];
};

export async function runContractReleaseGate(): Promise<ReleaseGateResult> {
  const document = await loadOpenApiDocument();
  const failures: string[] = [];

  if (document.openapi !== "3.1.1") failures.push("openapi_version");
  if (!document.components?.schemas?.ProblemDetails) failures.push("problem_details_schema");
  if (!document.components?.responses?.ProblemResponse) failures.push("problem_response_component");

  const drift = findContractDrift(document);
  failures.push(...drift.map((item) => item.check));

  for (const route of routeInventory) {
    if (!route.path.startsWith("/v1/")) failures.push(`version_path:${route.operationId}`);
  }

  const examplesDir = join(process.cwd(), "openapi", "examples");
  for (const fileName of await readdir(examplesDir)) {
    const content = await readFile(join(examplesDir, fileName), "utf8");
    if (!exampleLooksSafe(fileName, content)) failures.push(`unsafe_example:${fileName}`);
  }

  for (const failure of failures) recordContractViolation(failure);
  return {
    passed: failures.length === 0,
    failures
  };
}
