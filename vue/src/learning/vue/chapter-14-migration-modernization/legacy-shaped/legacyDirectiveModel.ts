export type LegacyDirectiveHook =
  | "bind"
  | "inserted"
  | "update"
  | "componentUpdated"
  | "unbind";

export interface LegacyDirectiveHookMapping {
  readonly legacyHook: LegacyDirectiveHook;
  readonly modernHook: string;
  readonly lifecycleMeaning: string;
}

export interface LegacyCustomElementRule {
  readonly tagName: string;
  readonly shouldBeCustomElement: boolean;
}

export interface LegacyAttributeCoercionCheck {
  readonly attributeName: string;
  readonly legacyValue: string | false;
  readonly expectedDomValue: string | null;
}

export const legacyDirectiveHookMappings: ReadonlyArray<LegacyDirectiveHookMapping> =
  [
    {
      legacyHook: "bind",
      modernHook: "beforeMount",
      lifecycleMeaning: "Prepare DOM integration before the element is inserted.",
    },
    {
      legacyHook: "inserted",
      modernHook: "mounted",
      lifecycleMeaning: "Run DOM integration after the element is in the document.",
    },
    {
      legacyHook: "update",
      modernHook: "updated",
      lifecycleMeaning: "React after the bound value changes.",
    },
    {
      legacyHook: "componentUpdated",
      modernHook: "updated",
      lifecycleMeaning: "Use one updated hook after component and children patch.",
    },
    {
      legacyHook: "unbind",
      modernHook: "unmounted",
      lifecycleMeaning: "Clean up external DOM integration.",
    },
  ];

export const legacyCustomElementRules: ReadonlyArray<LegacyCustomElementRule> = [
  {
    tagName: "design-card",
    shouldBeCustomElement: true,
  },
  {
    tagName: "profile-card",
    shouldBeCustomElement: false,
  },
];

export const legacyAttributeCoercionChecks: ReadonlyArray<LegacyAttributeCoercionCheck> =
  [
    {
      attributeName: "draggable",
      legacyValue: false,
      expectedDomValue: null,
    },
    {
      attributeName: "aria-hidden",
      legacyValue: "false",
      expectedDomValue: "false",
    },
  ];
