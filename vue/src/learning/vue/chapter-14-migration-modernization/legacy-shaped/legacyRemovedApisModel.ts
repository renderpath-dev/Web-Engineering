export type LegacyRemovedApi =
  | "$children"
  | "$set"
  | "$delete"
  | "$destroy"
  | "events-api"
  | "propsData";

export interface LegacyRemovedApiUsage {
  readonly api: LegacyRemovedApi;
  readonly legacyIntent: string;
  readonly hiddenRisk: string;
}

export const legacyRemovedApiUsages: ReadonlyArray<LegacyRemovedApiUsage> = [
  {
    api: "$children",
    legacyIntent: "Reach a child instance by render order.",
    hiddenRisk: "The target changes when conditional rendering or fragments are introduced.",
  },
  {
    api: "$set",
    legacyIntent: "Add a dynamic reactive field.",
    hiddenRisk: "The object shape stays unclear to TypeScript and reviewers.",
  },
  {
    api: "$delete",
    legacyIntent: "Remove a dynamic reactive field.",
    hiddenRisk: "Derived output may keep stale optional-field assumptions.",
  },
  {
    api: "$destroy",
    legacyIntent: "Force component teardown from imperative code.",
    hiddenRisk: "Cleanup ownership is detached from render ownership.",
  },
  {
    api: "events-api",
    legacyIntent: "Use $on and $off on an instance event bus.",
    hiddenRisk: "Publisher and subscriber ownership is hidden from the component tree.",
  },
  {
    api: "propsData",
    legacyIntent: "Mount tests with initial props.",
    hiddenRisk: "Test helpers drift from current Vue Test Utils options.",
  },
];
