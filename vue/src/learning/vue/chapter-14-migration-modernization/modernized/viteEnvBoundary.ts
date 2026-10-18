export interface ViteEnvBoundaryResult {
  readonly apiBaseUrl: string;
  readonly mode: string;
  readonly isProduction: boolean;
}

export function readViteEnvBoundary(
  env: ImportMetaEnv = import.meta.env,
): ViteEnvBoundaryResult {
  return {
    apiBaseUrl: env.VITE_API_BASE_URL ?? "/api",
    mode: env.MODE,
    isProduction: env.PROD,
  };
}

export function describeAssetImport(assetUrl: string): string {
  return assetUrl.startsWith("/") ? "root-relative asset" : "module asset";
}
