export type OpenApiRoot = {
  openapi: string;
  info: { title: string; version: string };
  servers: Array<{ url: string }>;
  paths: Record<string, unknown>;
  components: Record<string, unknown>;
};

export function hasRequiredOpenApiRoot(document: OpenApiRoot): boolean {
  return Boolean(document.openapi && document.info.title && document.paths && document.components);
}
