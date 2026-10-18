export type ViteAssetTopic =
  | "env-prefix"
  | "mode"
  | "source-import"
  | "public-directory"
  | "new-url"
  | "worker-query";

export interface ViteAssetMigrationItem {
  readonly topic: ViteAssetTopic;
  readonly legacyPattern: string;
  readonly modernReplacement: string;
  readonly runtimeBehaviorPreserved: string;
  readonly typeBoundary: string;
  readonly evidence: string;
  readonly failureSignal: string;
  readonly rollbackStrategy: string;
}

export const viteAssetMigrationItems: ReadonlyArray<ViteAssetMigrationItem> = [
  {
    topic: "env-prefix",
    legacyPattern: "process.env exposes client values by project convention",
    modernReplacement: "import.meta.env exposes only VITE_ public values to client code",
    runtimeBehaviorPreserved: "Public configuration still reaches the browser bundle.",
    typeBoundary: "Env values are strings and need parsing before domain use.",
    evidence: "tests/viteAssetBoundary.test.ts",
    failureSignal: "A client variable becomes undefined or a secret is exposed.",
    rollbackStrategy: "Add an env adapter that validates public keys.",
  },
  {
    topic: "mode",
    legacyPattern: "NODE_ENV is used as the only environment switch",
    modernReplacement: "Use Vite mode plus import.meta.env.MODE for project modes",
    runtimeBehaviorPreserved: "Development, staging, and production behavior stay selectable.",
    typeBoundary: "Mode strings need a typed allowlist.",
    evidence: "models/viteAssetMigrationModel.ts",
    failureSignal: "The app reads production endpoints during staging.",
    rollbackStrategy: "Keep mode parsing behind one config module.",
  },
  {
    topic: "source-import",
    legacyPattern: "Webpack loader paths are embedded in component code",
    modernReplacement: "Import assets from source so Vite can fingerprint them",
    runtimeBehaviorPreserved: "Bundled URLs still point to the same visual asset.",
    typeBoundary: "Asset imports are typed by Vite client declarations.",
    evidence: "tests/viteAssetBoundary.test.ts",
    failureSignal: "The production bundle references a missing file.",
    rollbackStrategy: "Migrate one asset family at a time.",
  },
  {
    topic: "public-directory",
    legacyPattern: "Static files are resolved through loader aliases",
    modernReplacement: "Use public directory root paths for files that must keep stable names",
    runtimeBehaviorPreserved: "Robots, icons, and direct public files keep stable URLs.",
    typeBoundary: "Public paths are string URLs and need smoke testing.",
    evidence: "modernized/viteAssetBoundary.ts",
    failureSignal: "A direct public URL returns a bundler path instead of root path.",
    rollbackStrategy: "Keep a public asset checklist during deployment.",
  },
  {
    topic: "new-url",
    legacyPattern: "Runtime string concatenation builds nearby asset URLs",
    modernReplacement: "new URL(relativePath, import.meta.url).href for static relative assets",
    runtimeBehaviorPreserved: "The component can still locate its nearby asset after build.",
    typeBoundary: "The literal path must be statically analyzable by the bundler.",
    evidence: "tests/viteAssetBoundary.test.ts",
    failureSignal: "The built URL points to the source path instead of the emitted file.",
    rollbackStrategy: "Keep dynamic file names behind an explicit import map.",
  },
  {
    topic: "worker-query",
    legacyPattern: "Webpack worker loader syntax",
    modernReplacement: "Vite worker query or Worker constructor with import.meta.url",
    runtimeBehaviorPreserved: "The worker still loads from the built bundle.",
    typeBoundary: "Worker message payloads need explicit types.",
    evidence: "models/viteAssetMigrationModel.ts",
    failureSignal: "The worker script is not emitted or cannot load.",
    rollbackStrategy: "Keep worker migration separate from UI component rewrites.",
  },
];

export function getViteAssetMigration(topic: ViteAssetTopic): ViteAssetMigrationItem {
  const item = viteAssetMigrationItems.find((entry) => entry.topic === topic);

  if (!item) {
    throw new Error(`Missing Vite asset migration topic: ${topic}`);
  }

  return item;
}
