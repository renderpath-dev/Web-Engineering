export interface LegacyWebpackEnvRead {
  readonly expression: string;
  readonly expectedValue: string;
  readonly migrationRisk: string;
}

export const legacyWebpackEnvReads: ReadonlyArray<LegacyWebpackEnvRead> = [
  {
    expression: "process.env.VUE_APP_API_BASE_URL",
    expectedValue: "client public API base URL",
    migrationRisk: "Vite only exposes VITE-prefixed client env values.",
  },
  {
    expression: "require('./profile.svg')",
    expectedValue: "bundled asset URL",
    migrationRisk: "Vite prefers ESM asset imports and production build proof.",
  },
];
