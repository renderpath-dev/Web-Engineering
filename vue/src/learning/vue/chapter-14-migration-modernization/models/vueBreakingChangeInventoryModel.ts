export type MigrationLayer =
  | "app"
  | "template"
  | "component"
  | "instance"
  | "render"
  | "directive"
  | "transition"
  | "watcher"
  | "tooling";

export type MigrationGate = "ready" | "compat-required" | "blocked";

export interface VueBreakingChangeInventoryItem {
  readonly id: string;
  readonly layer: MigrationLayer;
  readonly legacyPattern: string;
  readonly modernReplacement: string;
  readonly preservedBehavior: string;
  readonly typeBoundary: string;
  readonly evidence: string;
  readonly failureSignal: string;
  readonly rollbackStrategy: string;
  readonly gate: MigrationGate;
}

export const vueBreakingChangeInventory: ReadonlyArray<VueBreakingChangeInventoryItem> =
  [
    {
      id: "global-api",
      layer: "app",
      legacyPattern: "Vue.use, Vue.mixin, Vue.component, and new Vue",
      modernReplacement: "createApp plus app.use, app.mixin, app.component, and app.mount",
      preservedBehavior: "Plugin and root component registration still happen before mount.",
      typeBoundary: "Application instance typing is local to one app owner.",
      evidence: "models/vueBreakingChangeInventoryModel.ts",
      failureSignal: "Plugin state leaks across roots or mount cannot find the target element.",
      rollbackStrategy: "Keep the old bootstrap entry until the app-level inventory is clean.",
      gate: "compat-required",
    },
    {
      id: "template-directives",
      layer: "template",
      legacyPattern: "Vue 2 v-model, key reuse, v-if with v-for, v-bind merge order, and keyCode modifiers",
      modernReplacement: "modelValue/update:modelValue, unique keys, explicit computed lists, controlled v-bind order, and named key modifiers",
      preservedBehavior: "User input, list identity, conditional rendering, and event handling stay equivalent.",
      typeBoundary: "Template diagnostics can catch event payload drift only after contracts are explicit.",
      evidence: "tests/templateDirectiveMigration.test.ts",
      failureSignal: "Input stops updating, DOM nodes are reused incorrectly, or shortcuts no longer fire.",
      rollbackStrategy: "Keep legacy-shaped examples and migrate one directive family at a time.",
      gate: "blocked",
    },
    {
      id: "component-contracts",
      layer: "component",
      legacyPattern: ".native listeners, implicit $listeners, broad $attrs, and undeclared events",
      modernReplacement: "defineEmits, emits option, fallthrough attrs review, and explicit wrapper events",
      preservedBehavior: "Parent-to-child event and attribute ownership stays visible.",
      typeBoundary: "Event payloads become typed only when the emitted contract is declared.",
      evidence: "models/componentContractMigrationModel.ts",
      failureSignal: "Parent handlers fire twice, never fire, or land on the wrong root node.",
      rollbackStrategy: "Add a temporary wrapper adapter before deleting the legacy contract.",
      gate: "compat-required",
    },
    {
      id: "removed-instance-apis",
      layer: "instance",
      legacyPattern: "$children, $set, $delete, $destroy, $on, $off, $once, and propsData",
      modernReplacement: "template refs, proxy assignment, conditional rendering, external emitter, and test props",
      preservedBehavior: "Parent access, reactive mutation, teardown, event dispatch, and test setup stay intentional.",
      typeBoundary: "TypeScript cannot prove runtime child order or dynamic key existence.",
      evidence: "tests/removedApiReplacement.test.ts",
      failureSignal: "Parent logic depends on child order, dynamic fields stop updating, or tests cannot mount.",
      rollbackStrategy: "Keep a local adapter and remove each instance API after its caller is owned.",
      gate: "blocked",
    },
    {
      id: "render-function",
      layer: "render",
      legacyPattern: "Vue 2 render arguments, slot arrays, and VNode lifecycle event names",
      modernReplacement: "imported h, slot functions, onVnode hooks, and normalized children",
      preservedBehavior: "Manual render output and lifecycle side effects stay equivalent.",
      typeBoundary: "VNode props and slot function signatures need typed wrappers.",
      evidence: "modernized/renderFunctionMigration.ts",
      failureSignal: "Slots render as plain objects or lifecycle hooks never run.",
      rollbackStrategy: "Keep the legacy render adapter until all slot callers are converted.",
      gate: "compat-required",
    },
    {
      id: "custom-directive",
      layer: "directive",
      legacyPattern: "bind, inserted, update, componentUpdated, and unbind directive hooks",
      modernReplacement: "beforeMount, mounted, updated, and unmounted directive hooks",
      preservedBehavior: "DOM setup, update, and cleanup stay attached to the same element lifecycle.",
      typeBoundary: "Directive binding values need explicit value types outside the template compiler.",
      evidence: "modernized/directiveMigration.ts",
      failureSignal: "DOM integration initializes too early or cleanup is skipped.",
      rollbackStrategy: "Keep old and modern hook names in a small translation map during review.",
      gate: "compat-required",
    },
    {
      id: "transition",
      layer: "transition",
      legacyPattern: "v-enter, v-leave, and legacy TransitionGroup class assumptions",
      modernReplacement: "v-enter-from, v-leave-from, and explicit TransitionGroup move classes",
      preservedBehavior: "Enter, leave, and list movement animations keep the same visual phases.",
      typeBoundary: "CSS class names are build-time strings and need visual or DOM evidence.",
      evidence: "modernized/transitionMigration.ts",
      failureSignal: "Animation starts in the wrong phase or moved items jump.",
      rollbackStrategy: "Ship dual class aliases until the visual smoke test passes.",
      gate: "compat-required",
    },
    {
      id: "watch-array",
      layer: "watcher",
      legacyPattern: "Array watcher that expects mutation callbacks without deep option",
      modernReplacement: "watch array replacement by default and add deep when mutation tracking is needed",
      preservedBehavior: "Replacement and mutation observers are chosen deliberately.",
      typeBoundary: "Types describe array shape but not watcher trigger semantics.",
      evidence: "tests/watchArrayMigration.test.ts",
      failureSignal: "Push or splice no longer triggers the expected effect.",
      rollbackStrategy: "Keep the old callback behind an adapter until trigger intent is verified.",
      gate: "blocked",
    },
  ];

export function getBreakingChangesByGate(
  gate: MigrationGate,
): ReadonlyArray<VueBreakingChangeInventoryItem> {
  return vueBreakingChangeInventory.filter((item) => item.gate === gate);
}

export function countBreakingChangesByLayer(
  items: ReadonlyArray<VueBreakingChangeInventoryItem>,
): Record<MigrationLayer, number> {
  const counts: Record<MigrationLayer, number> = {
    app: 0,
    template: 0,
    component: 0,
    instance: 0,
    render: 0,
    directive: 0,
    transition: 0,
    watcher: 0,
    tooling: 0,
  };

  for (const item of items) {
    counts[item.layer] += 1;
  }

  return counts;
}
