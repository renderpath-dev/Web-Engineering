import Link from "next/link";
import { connection } from "next/server";
import { ClientStoragePanel } from "@/components/ClientStoragePanel";
import { HydrationClock } from "@/components/HydrationClock";
import { getServerEnvironmentStatus } from "@/lib/serverEnv";

export default async function HomePage() {
  await connection();

  const serverRenderedAt = new Date().toISOString();
  const serverEnvironment = getServerEnvironmentStatus();

  return (
    <main>
      <h1>Next Boundary Lab</h1>
      <p>
        This page is a Server Component rendered for the current request.
      </p>

      <section>
        <h2>Server runtime</h2>
        <p>
          Request timestamp: <code>{serverRenderedAt}</code>
        </p>
        <p>
          {serverEnvironment.variableName}:{" "}
          {serverEnvironment.isConfigured ? "configured" : "not configured"}
        </p>
        <p>The secret value is never returned.</p>
      </section>

      <HydrationClock />
      <ClientStoragePanel />

      <nav aria-label="Learning routes">
        <ul>
          <li>
            <Link href="/boundary-report">Boundary report</Link>
          </li>
          <li>
            <a href="/api/runtime-check">Runtime check JSON</a>
          </li>
        </ul>
      </nav>
    </main>
  );
}
