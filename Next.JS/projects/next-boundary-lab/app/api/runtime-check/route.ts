import { getServerEnvironmentStatus } from "@/lib/serverEnv";

export const runtime = "nodejs";

export async function GET() {
  const serverEnvironment = getServerEnvironmentStatus();

  return Response.json({
    runtime: "nodejs",
    hasWindow: typeof window !== "undefined",
    hasDocument: typeof document !== "undefined",
    nodeEnv: process.env.NODE_ENV ?? "unknown",
    serverSecretIsConfigured: serverEnvironment.isConfigured,
    generatedAt: new Date().toISOString(),
  });
}
