export type ReadPath = "primary-db" | "cache" | "replica";

export function canGuaranteeReadYourWrites(path: ReadPath): boolean {
  return path === "primary-db";
}
