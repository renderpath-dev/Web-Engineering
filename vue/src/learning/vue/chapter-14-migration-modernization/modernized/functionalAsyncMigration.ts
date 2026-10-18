import { defineAsyncComponent, type Component } from "vue";

export type ModernComponentTarget = "ordinary-sfc" | "function-component";

export interface ComponentModule {
  readonly default: Component;
}

export type ComponentLoader = () => Promise<ComponentModule>;

export function chooseModernFunctionalTarget(
  usesSlots: boolean,
): ModernComponentTarget {
  return usesSlots ? "ordinary-sfc" : "function-component";
}

export function createGeneralAsyncComponent(loader: ComponentLoader): Component {
  return defineAsyncComponent(loader);
}

export function createRouteLazyComponent(loader: ComponentLoader): ComponentLoader {
  return loader;
}

export function describeAsyncMigrationTarget(
  target: "general" | "route",
): "defineAsyncComponent" | "route-lazy-loader" {
  return target === "general" ? "defineAsyncComponent" : "route-lazy-loader";
}
