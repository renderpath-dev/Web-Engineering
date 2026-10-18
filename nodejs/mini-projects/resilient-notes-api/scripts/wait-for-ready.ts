const defaultBaseUrl = "http://localhost:8080";

export async function waitForReady(baseUrl = process.env.SMOKE_BASE_URL ?? defaultBaseUrl): Promise<void> {
  const deadline = Date.now() + 30_000;
  let lastError: unknown;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/health/ready`);
      if (response.ok) return;
      lastError = new Error(`Ready check returned ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw lastError instanceof Error ? lastError : new Error("Readiness check timed out");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await waitForReady();
}
