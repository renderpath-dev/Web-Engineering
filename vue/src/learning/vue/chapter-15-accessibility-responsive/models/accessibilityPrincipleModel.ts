export type AccessibilityPrinciple = "perceivable" | "operable" | "understandable" | "robust";

export interface AccessibilityPrincipleRecord {
  readonly id: AccessibilityPrinciple;
  readonly label: string;
  readonly question: string;
  readonly releaseSignal: string;
}

export const accessibilityPrinciples: ReadonlyArray<AccessibilityPrincipleRecord> = [
  {
    id: "perceivable",
    label: "Perceivable",
    question: "Can users detect the content through available senses or assistive output?",
    releaseSignal: "Labels, contrast, error text, and live status are visible or exposed.",
  },
  {
    id: "operable",
    label: "Operable",
    question: "Can users reach and activate every task with keyboard and pointer input?",
    releaseSignal: "Focus order, keyboard activation, and dialog escape behavior are verified.",
  },
  {
    id: "understandable",
    label: "Understandable",
    question: "Can users predict what each control does and recover from errors?",
    releaseSignal: "Names, instructions, validation messages, and summary links match the task.",
  },
  {
    id: "robust",
    label: "Robust",
    question: "Does the rendered DOM expose stable role, name, state, and relationship data?",
    releaseSignal: "Native semantics are preferred and ARIA is used only for missing semantics.",
  },
];

export function getPrincipleById(
  id: AccessibilityPrinciple,
): AccessibilityPrincipleRecord {
  const principle = accessibilityPrinciples.find((item) => item.id === id);

  if (!principle) {
    throw new Error("Unknown accessibility principle");
  }

  return principle;
}

