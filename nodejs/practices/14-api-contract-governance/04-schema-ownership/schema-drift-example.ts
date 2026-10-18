export type RuntimeSchemaField = "title" | "body";
export type OpenApiSchemaField = "title" | "body" | "archived";

export function findMissingRuntimeFields(openApiFields: OpenApiSchemaField[], runtimeFields: RuntimeSchemaField[]): string[] {
  return openApiFields.filter((field) => !runtimeFields.includes(field as RuntimeSchemaField));
}
