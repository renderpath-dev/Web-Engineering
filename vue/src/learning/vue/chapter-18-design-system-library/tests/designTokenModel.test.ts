import { describe, expect, it } from "vitest";
import {
  findDesignToken,
  listDeprecatedTokens,
  primitiveDesignTokens,
} from "../models/designTokenModel";

describe("designTokenModel", () => {
  it("finds primitive tokens by stable name", () => {
    expect(findDesignToken(primitiveDesignTokens, "color.blue.600")?.value).toBe("#2563eb");
  });

  it("reports deprecated primitive tokens", () => {
    expect(listDeprecatedTokens(primitiveDesignTokens).map((token) => token.name)).toContain(
      "color.brand.old",
    );
  });
});
