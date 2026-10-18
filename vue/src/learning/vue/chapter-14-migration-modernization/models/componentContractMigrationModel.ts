export type ComponentContractTopic =
  | "emits"
  | "native-listener"
  | "listeners"
  | "attrs"
  | "class-style";

export interface ComponentContractMigrationItem {
  readonly topic: ComponentContractTopic;
  readonly legacyPattern: string;
  readonly modernReplacement: string;
  readonly runtimeBehaviorPreserved: string;
  readonly typeBoundary: string;
  readonly evidence: string;
  readonly failureSignal: string;
  readonly rollbackStrategy: string;
}

export const componentContractMigrationItems: ReadonlyArray<ComponentContractMigrationItem> =
  [
    {
      topic: "emits",
      legacyPattern: "Child emits undeclared custom events",
      modernReplacement: "Declare emits or defineEmits with payload types",
      runtimeBehaviorPreserved: "The parent still receives the same domain event.",
      typeBoundary: "Payload drift is visible only after the event contract is declared.",
      evidence: "modernized/ProfileEventContract.vue",
      failureSignal: "The parent handler receives a malformed payload.",
      rollbackStrategy: "Keep a compatibility wrapper that normalizes payloads.",
    },
    {
      topic: "native-listener",
      legacyPattern: ".native forwards a DOM listener to a component root",
      modernReplacement: "The child emits a public event or exposes the DOM target intentionally",
      runtimeBehaviorPreserved: "The parent action still runs after the user interaction.",
      typeBoundary: "DOM event and component event payloads are different contracts.",
      evidence: "models/componentContractMigrationModel.ts",
      failureSignal: "The listener silently stops firing after root markup changes.",
      rollbackStrategy: "Add a wrapper event before changing the component root.",
    },
    {
      topic: "listeners",
      legacyPattern: "$listeners is forwarded separately from $attrs",
      modernReplacement: "Listeners are part of $attrs unless declared in emits",
      runtimeBehaviorPreserved: "Wrapper components still pass intended handlers.",
      typeBoundary: "Fallthrough listeners are runtime attrs, not typed emits.",
      evidence: "models/componentContractMigrationModel.ts",
      failureSignal: "A wrapper passes the same handler twice or drops it.",
      rollbackStrategy: "Declare owned events and forward only the rest.",
    },
    {
      topic: "attrs",
      legacyPattern: "Single-root attr fallthrough is assumed",
      modernReplacement: "Review fallthrough attrs for fragments and inheritAttrs usage",
      runtimeBehaviorPreserved: "Accessibility, id, class, and test hooks land on the intended element.",
      typeBoundary: "Attribute placement is DOM behavior, not a type guarantee.",
      evidence: "models/componentContractMigrationModel.ts",
      failureSignal: "aria or data attributes disappear from the rendered target.",
      rollbackStrategy: "Bind $attrs to a named root while reviewing fragments.",
    },
    {
      topic: "class-style",
      legacyPattern: "Class and style merge rules are treated as implicit wrapper behavior",
      modernReplacement: "Choose the element that owns class and style fallthrough",
      runtimeBehaviorPreserved: "Layout and visual hooks stay on the same public element.",
      typeBoundary: "Class names are strings and need DOM evidence.",
      evidence: "models/componentContractMigrationModel.ts",
      failureSignal: "A wrapper loses spacing, theme, or transition classes.",
      rollbackStrategy: "Keep a snapshot or visual smoke test for the wrapper.",
    },
  ];

export function getComponentContractMigration(
  topic: ComponentContractTopic,
): ComponentContractMigrationItem {
  const item = componentContractMigrationItems.find((entry) => entry.topic === topic);

  if (!item) {
    throw new Error(`Missing component contract migration topic: ${topic}`);
  }

  return item;
}
