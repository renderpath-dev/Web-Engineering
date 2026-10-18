export interface LegacyTransitionClassMapping {
  readonly legacyClass: string;
  readonly modernClass: string;
  readonly phase: string;
}

export const legacyTransitionClassMappings: ReadonlyArray<LegacyTransitionClassMapping> =
  [
    {
      legacyClass: "fade-enter",
      modernClass: "fade-enter-from",
      phase: "Initial enter state before the first frame.",
    },
    {
      legacyClass: "fade-leave",
      modernClass: "fade-leave-from",
      phase: "Initial leave state before the first frame.",
    },
    {
      legacyClass: "list-move",
      modernClass: "list-move",
      phase: "TransitionGroup movement phase that still needs stable item keys.",
    },
  ];
