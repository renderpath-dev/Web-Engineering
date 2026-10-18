import { describe, expect, it } from "vitest";
import { resolveSemanticToken } from "../models/semanticTokenModel";

describe("semanticTokenModel", () => {
  it("resolves semantic token aliases to primitive values", () => {
    const token = resolveSemanticToken("color.action");

    expect(token.primitiveTokenName).toBe("color.blue.600");
    expect(token.cssVariableName).toBe("--ds-color-action");
  });
});
