import { createCssVariableDeclaration } from "./cssVariableModel";
import {
  resolveSemanticToken,
  semanticDesignTokens,
  type ResolvedSemanticToken,
} from "./semanticTokenModel";

export type ThemeVariantName = "light" | "dark" | "high-contrast";

export interface ThemeVariant {
  readonly name: ThemeVariantName;
  readonly label: string;
  readonly semanticOverrides: Readonly<Record<string, string>>;
}

export const themeVariants: readonly ThemeVariant[] = [
  {
    name: "light",
    label: "Light",
    semanticOverrides: {},
  },
  {
    name: "dark",
    label: "Dark",
    semanticOverrides: {
      "color.surface": "#111827",
      "color.text": "#f9fafb",
      "color.action": "#60a5fa",
    },
  },
  {
    name: "high-contrast",
    label: "High Contrast",
    semanticOverrides: {
      "color.surface": "#000000",
      "color.text": "#ffffff",
      "color.action": "#facc15",
      "color.danger": "#f87171",
    },
  },
];

export function getThemeVariant(name: ThemeVariantName): ThemeVariant {
  const variant = themeVariants.find((candidate) => candidate.name === name);

  if (!variant) {
    throw new Error(`Unknown theme variant: ${name}`);
  }

  return variant;
}

export function resolveThemeTokens(
  variantName: ThemeVariantName,
): readonly ResolvedSemanticToken[] {
  const variant = getThemeVariant(variantName);

  return semanticDesignTokens.map((semanticToken) => {
    const resolved = resolveSemanticToken(semanticToken.name);
    const override = variant.semanticOverrides[semanticToken.name];

    return {
      ...resolved,
      value: override ?? resolved.value,
    };
  });
}

export function createThemeCssDeclarations(
  variantName: ThemeVariantName,
): readonly string[] {
  return resolveThemeTokens(variantName).map((token) => {
    const declaration = createCssVariableDeclaration(token.name, token.value);

    return `${declaration.name}: ${declaration.value};`;
  });
}
