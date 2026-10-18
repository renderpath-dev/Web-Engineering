export type ViteAssetReferenceKind =
  | "public-root"
  | "source-import"
  | "new-url"
  | "worker-query"
  | "unsupported-dynamic";

export interface ViteAssetReference {
  readonly value: string;
  readonly kind: ViteAssetReferenceKind;
}

export function isPublicClientEnvKey(key: string): boolean {
  return key.startsWith("VITE_");
}

export function classifyViteAssetReference(value: string): ViteAssetReference {
  if (value.startsWith("/")) {
    return { value, kind: "public-root" };
  }

  if (value.includes("new URL(") && value.includes("import.meta.url")) {
    return { value, kind: "new-url" };
  }

  if (value.includes("?worker")) {
    return { value, kind: "worker-query" };
  }

  if (value.startsWith("./") || value.startsWith("../")) {
    return { value, kind: "source-import" };
  }

  return { value, kind: "unsupported-dynamic" };
}
