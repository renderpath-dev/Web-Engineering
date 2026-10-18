export type DesignTokenType = "color" | "space" | "radius" | "font" | "duration";

export interface DesignToken {
  readonly name: string;
  readonly type: DesignTokenType;
  readonly value: string;
  readonly description: string;
  readonly deprecated: boolean;
}

export const primitiveDesignTokens: readonly DesignToken[] = [
  {
    name: "color.gray.0",
    type: "color",
    value: "#ffffff",
    description: "Base white surface color.",
    deprecated: false,
  },
  {
    name: "color.gray.900",
    type: "color",
    value: "#111827",
    description: "Base dark text color.",
    deprecated: false,
  },
  {
    name: "color.blue.600",
    type: "color",
    value: "#2563eb",
    description: "Interactive brand color.",
    deprecated: false,
  },
  {
    name: "color.red.600",
    type: "color",
    value: "#dc2626",
    description: "Danger foreground color.",
    deprecated: false,
  },
  {
    name: "space.3",
    type: "space",
    value: "0.75rem",
    description: "Medium compact spacing.",
    deprecated: false,
  },
  {
    name: "radius.md",
    type: "radius",
    value: "0.75rem",
    description: "Default component radius.",
    deprecated: false,
  },
  {
    name: "color.brand.old",
    type: "color",
    value: "#1d4ed8",
    description: "Deprecated brand color alias.",
    deprecated: true,
  },
];

export function findDesignToken(
  tokens: readonly DesignToken[],
  name: string,
): DesignToken | undefined {
  return tokens.find((token) => token.name === name);
}

export function requireDesignToken(
  tokens: readonly DesignToken[],
  name: string,
): DesignToken {
  const token = findDesignToken(tokens, name);

  if (!token) {
    throw new Error(`Unknown design token: ${name}`);
  }

  return token;
}

export function listDeprecatedTokens(
  tokens: readonly DesignToken[],
): readonly DesignToken[] {
  return tokens.filter((token) => token.deprecated);
}
