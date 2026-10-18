import type {
  LegacyAttributeCoercionCheck,
  LegacyCustomElementRule,
  LegacyDirectiveHook,
  LegacyDirectiveHookMapping,
} from "../legacy-shaped/legacyDirectiveModel";
import {
  legacyAttributeCoercionChecks,
  legacyCustomElementRules,
  legacyDirectiveHookMappings,
} from "../legacy-shaped/legacyDirectiveModel";

export interface CustomElementCompilerConfig {
  readonly customElementTags: ReadonlyArray<string>;
}

export function mapLegacyDirectiveHook(
  legacyHook: LegacyDirectiveHook,
): LegacyDirectiveHookMapping {
  const mapping = legacyDirectiveHookMappings.find(
    (entry) => entry.legacyHook === legacyHook,
  );

  if (!mapping) {
    throw new Error(`Missing directive hook mapping: ${legacyHook}`);
  }

  return mapping;
}

export function createCustomElementCompilerConfig(
  rules: ReadonlyArray<LegacyCustomElementRule> = legacyCustomElementRules,
): CustomElementCompilerConfig {
  return {
    customElementTags: rules
      .filter((rule) => rule.shouldBeCustomElement)
      .map((rule) => rule.tagName),
  };
}

export function findAttributeCoercionCheck(
  attributeName: string,
  checks: ReadonlyArray<LegacyAttributeCoercionCheck> = legacyAttributeCoercionChecks,
): LegacyAttributeCoercionCheck {
  const check = checks.find((entry) => entry.attributeName === attributeName);

  if (!check) {
    throw new Error(`Missing attribute coercion check: ${attributeName}`);
  }

  return check;
}
