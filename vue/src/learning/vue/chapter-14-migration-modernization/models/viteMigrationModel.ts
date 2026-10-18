export interface ViteMigrationCheck {
  readonly legacyAssumption: string;
  readonly viteBoundary: string;
  readonly requiredEvidence: string;
  readonly failureSignal: string;
}

export const viteMigrationChecks: ReadonlyArray<ViteMigrationCheck> = [
  {
    legacyAssumption: "process.env exposes client config",
    viteBoundary: "import.meta.env exposes VITE-prefixed client values",
    requiredEvidence: "typecheck and production build",
    failureSignal: "Public value is undefined or a secret is exposed.",
  },
  {
    legacyAssumption: "file-loader emits asset URLs",
    viteBoundary: "ESM asset imports return resolved URLs",
    requiredEvidence: "build output and preview smoke",
    failureSignal: "Image URL works in dev but fails after build.",
  },
  {
    legacyAssumption: "webpack dev server bundles before serve",
    viteBoundary: "Vite serves source over native ESM in dev",
    requiredEvidence: "dev smoke plus build smoke",
    failureSignal: "Dev HMR works but production chunk fails.",
  },
];
