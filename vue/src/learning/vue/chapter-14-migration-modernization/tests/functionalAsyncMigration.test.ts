import { defineComponent } from "vue";
import { describe, expect, it } from "vitest";
import { getLegacyFunctionalAsyncShape } from "../legacy-shaped/legacyFunctionalAsyncModel";
import {
  chooseModernFunctionalTarget,
  createRouteLazyComponent,
  describeAsyncMigrationTarget,
  type ComponentLoader,
} from "../modernized/functionalAsyncMigration";

describe("functional and async migration", () => {
  it("keeps functional and async risks separated", () => {
    expect(getLegacyFunctionalAsyncShape("functional").kind).toBe("functional");
    expect(chooseModernFunctionalTarget(true)).toBe("ordinary-sfc");
    expect(chooseModernFunctionalTarget(false)).toBe("function-component");
  });

  it("keeps route lazy loading as a router-owned loader", () => {
    const loadedComponent = defineComponent({
      name: "LoadedPanel",
      setup() {
        return () => "Loaded";
      },
    });
    const loader: ComponentLoader = async () => ({ default: loadedComponent });

    expect(createRouteLazyComponent(loader)).toBe(loader);
    expect(describeAsyncMigrationTarget("general")).toBe("defineAsyncComponent");
    expect(describeAsyncMigrationTarget("route")).toBe("route-lazy-loader");
  });
});
