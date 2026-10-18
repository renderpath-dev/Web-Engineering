export type SchemaOwner = "runtime-validator" | "openapi-file" | "database-schema";

export function chooseSchemaOwner(inputSource: "http" | "database" | "client"): SchemaOwner {
  if (inputSource === "http") return "runtime-validator";
  if (inputSource === "database") return "database-schema";
  return "openapi-file";
}
