export type NodeEnvironment = "development" | "test" | "production";

export interface RuntimeModeConfig {
  nodeEnv: NodeEnvironment;
  enableDebugErrors: boolean;
  useSecureCookies: boolean;
}

export function createRuntimeModeConfig(nodeEnv: NodeEnvironment): RuntimeModeConfig {
  return {
    nodeEnv,
    enableDebugErrors: nodeEnv !== "production",
    useSecureCookies: nodeEnv === "production"
  };
}
