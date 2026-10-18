import { describe, expect, it } from "vitest";
import { legacyRenderFunctionShapes } from "../legacy-shaped/legacyRenderFunctionModel";
import { migrateRenderFunctionShape } from "../modernized/renderFunctionMigration";

describe("render function migration", () => {
  it("maps slot text and vnode lifecycle ownership", () => {
    expect(migrateRenderFunctionShape({ title: "Profile" })).toEqual({
      importedHelper: "h",
      slotMode: "function",
      mountedHook: "onVnodeMounted",
      unmountedHook: "onVnodeUnmounted",
      slotText: "Profile",
    });
  });

  it("keeps legacy render topics visible for review", () => {
    expect(legacyRenderFunctionShapes.map((shape) => shape.topic)).toEqual([
      "h-argument",
      "scoped-slots",
      "vnode-lifecycle",
    ]);
  });
});
