export type RollbackState = "available" | "missing" | "verified";

export interface RollbackItem {
  readonly artifact: string;
  readonly owner: string;
  readonly state: RollbackState;
  readonly restoreSignal: string;
}

export const rollbackItems: ReadonlyArray<RollbackItem> = [
  {
    artifact: "LegacyOptionsProfile.vue",
    owner: "component owner",
    state: "verified",
    restoreSignal: "Modern profile form fails characterization.",
  },
  {
    artifact: "legacyRouterConfig.ts",
    owner: "router owner",
    state: "available",
    restoreSignal: "History fallback or guard redirect regresses.",
  },
  {
    artifact: "legacyVuexModuleModel.ts",
    owner: "state owner",
    state: "available",
    restoreSignal: "Pinia store transition loses domain state.",
  },
  {
    artifact: "legacyWebpackEnvModel.ts",
    owner: "build owner",
    state: "available",
    restoreSignal: "Vite preview differs from old production output.",
  },
];
