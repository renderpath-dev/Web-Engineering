export type TemplateDirectiveTopic =
  | "v-model"
  | "key"
  | "v-if-v-for"
  | "v-bind"
  | "keyCode";

export interface TemplateDirectiveMigrationItem {
  readonly topic: TemplateDirectiveTopic;
  readonly legacyPattern: string;
  readonly modernReplacement: string;
  readonly runtimeBehaviorPreserved: string;
  readonly typeBoundary: string;
  readonly evidence: string;
  readonly failureSignal: string;
  readonly rollbackStrategy: string;
}

export const templateDirectiveMigrationItems: ReadonlyArray<TemplateDirectiveMigrationItem> =
  [
    {
      topic: "v-model",
      legacyPattern: "value prop plus input event or model option",
      modernReplacement: "modelValue prop plus update:modelValue event",
      runtimeBehaviorPreserved: "The parent still owns the source value and the child requests updates.",
      typeBoundary: "defineEmits can type the update payload but cannot execute user input.",
      evidence: "tests/templateDirectiveMigration.test.ts",
      failureSignal: "Input edits do not update the parent value.",
      rollbackStrategy: "Keep a wrapper that emits both contracts during caller migration.",
    },
    {
      topic: "key",
      legacyPattern: "Reused or missing keys across conditional branches and lists",
      modernReplacement: "Stable unique keys per branch and per item identity",
      runtimeBehaviorPreserved: "DOM reuse matches data identity instead of branch position.",
      typeBoundary: "TypeScript can type ids but cannot prove DOM reuse intent.",
      evidence: "legacy-shaped/legacyTemplateDirectiveExamples.ts",
      failureSignal: "Input state appears under the wrong row after reordering.",
      rollbackStrategy: "Migrate one list or branch owner at a time.",
    },
    {
      topic: "v-if-v-for",
      legacyPattern: "v-if and v-for on the same element with implicit priority",
      modernReplacement: "Computed filtered list or wrapper-level condition",
      runtimeBehaviorPreserved: "The rendered collection still matches the same condition.",
      typeBoundary: "The filtered collection type is checked after extraction.",
      evidence: "modernized/templateDirectiveMigration.ts",
      failureSignal: "The template cannot access the loop variable or renders extra rows.",
      rollbackStrategy: "Keep the old condition as a named predicate and test it first.",
    },
    {
      topic: "v-bind",
      legacyPattern: "Mixed static attributes and object v-bind with order-dependent override assumptions",
      modernReplacement: "Explicit merge order based on the visual owner of each prop",
      runtimeBehaviorPreserved: "The final DOM prop value still comes from the intended owner.",
      typeBoundary: "Object shape is checked, but override order is runtime template behavior.",
      evidence: "tests/templateDirectiveMigration.test.ts",
      failureSignal: "Classes, ids, or aria attributes are overridden unexpectedly.",
      rollbackStrategy: "Split bound props into named groups before changing order.",
    },
    {
      topic: "keyCode",
      legacyPattern: "Numeric keyboard modifiers such as keyCode 13",
      modernReplacement: "Named key modifiers or explicit KeyboardEvent.key checks",
      runtimeBehaviorPreserved: "The same keyboard shortcut triggers the same action.",
      typeBoundary: "KeyboardEvent is typed, but platform key labels still need browser testing.",
      evidence: "models/templateDirectiveMigrationModel.ts",
      failureSignal: "Shortcut works in one browser and fails in another.",
      rollbackStrategy: "Use a named predicate while migrating template listeners.",
    },
  ];

export function getTemplateDirectiveMigration(
  topic: TemplateDirectiveTopic,
): TemplateDirectiveMigrationItem {
  const item = templateDirectiveMigrationItems.find((entry) => entry.topic === topic);

  if (!item) {
    throw new Error(`Missing directive migration topic: ${topic}`);
  }

  return item;
}
