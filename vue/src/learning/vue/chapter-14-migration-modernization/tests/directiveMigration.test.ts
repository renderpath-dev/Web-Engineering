import { describe, expect, it } from "vitest";
import {
  createCustomElementCompilerConfig,
  findAttributeCoercionCheck,
  mapLegacyDirectiveHook,
} from "../modernized/directiveMigration";

describe("directive migration", () => {
  it("maps legacy directive hooks to modern hooks", () => {
    expect(mapLegacyDirectiveHook("bind").modernHook).toBe("beforeMount");
    expect(mapLegacyDirectiveHook("inserted").modernHook).toBe("mounted");
    expect(mapLegacyDirectiveHook("unbind").modernHook).toBe("unmounted");
  });

  it("builds custom element compiler config from review rules", () => {
    expect(createCustomElementCompilerConfig().customElementTags).toEqual([
      "design-card",
    ]);
  });

  it("keeps attribute coercion checks explicit", () => {
    expect(findAttributeCoercionCheck("aria-hidden").expectedDomValue).toBe(
      "false",
    );
  });
});
