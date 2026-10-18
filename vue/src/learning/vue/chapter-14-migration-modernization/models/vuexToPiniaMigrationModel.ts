export interface VuexToPiniaMapping {
  readonly vuexConcept: string;
  readonly piniaConcept: string;
  readonly ownershipRule: string;
  readonly riskSignal: string;
}

export const vuexToPiniaMappings: ReadonlyArray<VuexToPiniaMapping> = [
  {
    vuexConcept: "module namespace",
    piniaConcept: "store id",
    ownershipRule: "One domain store owns one domain state slice.",
    riskSignal: "All modules are merged into one oversized store.",
  },
  {
    vuexConcept: "mutation",
    piniaConcept: "action or direct assignment",
    ownershipRule: "Write behavior stays inside the store or caller contract.",
    riskSignal: "Callers mutate state without a reviewable use case.",
  },
  {
    vuexConcept: "nested module",
    piniaConcept: "separate store import",
    ownershipRule: "Split only when lifecycle and caller set are distinct.",
    riskSignal: "Nested state shape is copied without route or UI evidence.",
  },
];
