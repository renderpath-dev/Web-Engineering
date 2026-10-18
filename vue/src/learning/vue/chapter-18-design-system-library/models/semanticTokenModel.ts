import { toCssVariableName } from "./cssVariableModel";
import {
  primitiveDesignTokens,
  requireDesignToken,
  type DesignToken,
} from "./designTokenModel";

export interface SemanticToken {
  readonly name: string;
  readonly primitiveTokenName: string;
  readonly intent: string;
  readonly deprecated: boolean;
}

export interface ResolvedSemanticToken {
  readonly name: string;
  readonly primitiveTokenName: string;
  readonly cssVariableName: string;
  readonly value: string;
  readonly deprecated: boolean;
}

export const semanticDesignTokens: readonly SemanticToken[] = [
  {
    name: "color.surface",
    primitiveTokenName: "color.gray.0",
    intent: "Default component surface.",
    deprecated: false,
  },
  {
    name: "color.text",
    primitiveTokenName: "color.gray.900",
    intent: "Default readable text.",
    deprecated: false,
  },
  {
    name: "color.action",
    primitiveTokenName: "color.blue.600",
    intent: "Primary action background.",
    deprecated: false,
  },
  {
    name: "color.danger",
    primitiveTokenName: "color.red.600",
    intent: "Danger and destructive status.",
    deprecated: false,
  },
  {
    name: "radius.control",
    primitiveTokenName: "radius.md",
    intent: "Default control radius.",
    deprecated: false,
  },
];

export function resolveSemanticToken(
  name: string,
  semanticTokens: readonly SemanticToken[] = semanticDesignTokens,
  primitiveTokens: readonly DesignToken[] = primitiveDesignTokens,
): ResolvedSemanticToken {
  const semanticToken = semanticTokens.find((token) => token.name === name);

  if (!semanticToken) {
    throw new Error(`Unknown semantic token: ${name}`);
  }

  const primitiveToken = requireDesignToken(
    primitiveTokens,
    semanticToken.primitiveTokenName,
  );

  return {
    name: semanticToken.name,
    primitiveTokenName: primitiveToken.name,
    cssVariableName: toCssVariableName(semanticToken.name),
    value: primitiveToken.value,
    deprecated: semanticToken.deprecated || primitiveToken.deprecated,
  };
}
