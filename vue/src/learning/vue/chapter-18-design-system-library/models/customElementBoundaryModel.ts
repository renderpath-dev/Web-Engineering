export type CustomElementConsumer =
  | "vue-consumer"
  | "cross-framework-consumer"
  | "not-needed";

export interface CustomElementDecision {
  readonly consumer: CustomElementConsumer;
  readonly needsShadowDom: boolean;
  readonly needsVueSlots: boolean;
}

export function shouldUseCustomElement(
  decision: CustomElementDecision,
): boolean {
  return decision.consumer === "cross-framework-consumer" && !decision.needsVueSlots;
}
