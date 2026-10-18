import { legacyTransitionClassMappings } from "../legacy-shaped/legacyTransitionClassModel";

export function mapLegacyTransitionClass(legacyClass: string): string {
  const mapping = legacyTransitionClassMappings.find(
    (entry) => entry.legacyClass === legacyClass,
  );

  if (!mapping) {
    throw new Error(`Missing transition class mapping: ${legacyClass}`);
  }

  return mapping.modernClass;
}

export function requiresStableTransitionGroupKey(changeType: string): boolean {
  return changeType === "move" || changeType === "reorder";
}

export function hasStableTransitionGroupKeys(
  keys: ReadonlyArray<string>,
): boolean {
  return new Set(keys).size === keys.length && keys.every((key) => key.length > 0);
}
