import type { EmitContract } from "./emitContractModel";
import type { ModelValueContract } from "./modelValueContractModel";
import type { PropContract } from "./propContractModel";
import { findUndocumentedRequiredProps } from "./propContractModel";
import type { SlotContract } from "./slotContractModel";

export interface ComponentContract {
  readonly componentName: string;
  readonly props: readonly PropContract[];
  readonly emits: readonly EmitContract[];
  readonly slots: readonly SlotContract[];
  readonly model?: ModelValueContract;
  readonly attrsTarget: string;
  readonly public: boolean;
}

export type ContractChangeImpact = "patch" | "minor" | "major";

export const buttonContract: ComponentContract = {
  componentName: "DsButton",
  props: [
    {
      name: "variant",
      typeLabel: "primary | secondary | danger",
      required: false,
      defaultValue: "primary",
      description: "Controls visual intent through semantic tokens.",
      deprecated: false,
    },
    {
      name: "loading",
      typeLabel: "boolean",
      required: false,
      defaultValue: "false",
      description: "Disables press events while work is pending.",
      deprecated: false,
    },
  ],
  emits: [
    {
      name: "press",
      payloadLabel: "MouseEvent",
      description: "Emitted after a native button click is accepted.",
    },
  ],
  slots: [
    {
      name: "default",
      required: true,
      slotProps: [],
      description: "Button label content.",
    },
  ],
  attrsTarget: "button",
  public: true,
};

export function findContractDocumentationGaps(
  contract: ComponentContract,
): readonly string[] {
  return findUndocumentedRequiredProps(contract.props);
}

export function detectBreakingContractChange(change: {
  readonly removedProp: boolean;
  readonly removedEmit: boolean;
  readonly removedSlot: boolean;
  readonly visualDefaultChanged: boolean;
}): ContractChangeImpact {
  if (change.removedProp || change.removedEmit || change.removedSlot) {
    return "major";
  }

  if (change.visualDefaultChanged) {
    return "minor";
  }

  return "patch";
}
