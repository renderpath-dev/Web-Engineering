import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import YAML from "yaml";

export type OpenApiOperation = {
  operationId?: string;
  deprecated?: boolean;
  responses?: Record<string, unknown>;
};

export type OpenApiDocument = {
  openapi?: string;
  info?: { title?: string; version?: string };
  servers?: Array<{ url?: string }>;
  paths?: Record<string, Record<string, OpenApiOperation>>;
  components?: {
    schemas?: Record<string, unknown>;
    responses?: Record<string, unknown>;
    parameters?: Record<string, unknown>;
    headers?: Record<string, unknown>;
    securitySchemes?: Record<string, unknown>;
  };
};

export const openApiPath = resolve(process.cwd(), "openapi", "openapi.yaml");

export async function readOpenApiYaml(): Promise<string> {
  return readFile(openApiPath, "utf8");
}

export async function loadOpenApiDocument(): Promise<OpenApiDocument> {
  return YAML.parse(await readOpenApiYaml()) as OpenApiDocument;
}
