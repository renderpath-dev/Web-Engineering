import { describe, expect, it } from "vitest";
import { createThemeCssDeclarations, resolveThemeTokens } from "../models/themeVariantModel";

describe("themeVariantModel", () => {
  it("overrides semantic values for high contrast", () => {
    const tokens = resolveThemeTokens("high-contrast");

    expect(tokens.find((token) => token.name === "color.action")?.value).toBe("#facc15");
  });

  it("creates CSS custom property declarations", () => {
    expect(createThemeCssDeclarations("light")).toContain("--ds-color-action: #2563eb;");
  });
});
