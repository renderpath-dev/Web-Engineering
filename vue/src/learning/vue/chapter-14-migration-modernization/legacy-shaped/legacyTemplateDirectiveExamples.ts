export interface LegacyModelContract {
  readonly prop: string;
  readonly event: string;
}

export interface LegacyDirectiveExample {
  readonly topic: string;
  readonly legacyPattern: string;
  readonly risk: string;
}

export interface LegacyKeyExample {
  readonly index: number;
  readonly reusedKey: string;
  readonly label: string;
}

export const legacyModelContract: LegacyModelContract = {
  prop: "value",
  event: "input",
};

export const legacyIndexKeyExamples: ReadonlyArray<LegacyKeyExample> = [
  {
    index: 0,
    reusedKey: "row",
    label: "Primary row",
  },
  {
    index: 1,
    reusedKey: "row",
    label: "Secondary row",
  },
];

export const legacyTemplateDirectiveExamples: ReadonlyArray<LegacyDirectiveExample> =
  [
    {
      topic: "v-model",
      legacyPattern: "value prop plus input event",
      risk: "Parent state stops syncing when the child emits the old event only.",
    },
    {
      topic: "key",
      legacyPattern: "Index key or reused key across rows",
      risk: "DOM state can move to the wrong row after reordering.",
    },
    {
      topic: "v-if-v-for",
      legacyPattern: "Filter and iterate on the same element",
      risk: "The template owner hides filtering logic and loop scope changes during migration.",
    },
    {
      topic: "v-bind",
      legacyPattern: "Static attrs rely on old merge priority over object binding",
      risk: "The final attribute owner changes when order is not reviewed.",
    },
    {
      topic: "keyCode",
      legacyPattern: "Numeric keyCode modifier controls shortcut behavior",
      risk: "Keyboard handling becomes browser-fragile after numeric modifiers are removed.",
    },
  ];

export function getLegacyTemplateDirectiveRisk(topic: string): string {
  const example = legacyTemplateDirectiveExamples.find((entry) => entry.topic === topic);

  if (!example) {
    throw new Error(`Missing legacy directive topic: ${topic}`);
  }

  return example.risk;
}
