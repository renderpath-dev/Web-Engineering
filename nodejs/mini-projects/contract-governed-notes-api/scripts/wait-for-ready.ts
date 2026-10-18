const baseUrl = process.env.SMOKE_BASE_URL ?? "http://localhost:8080";
const deadline = Date.now() + 30_000;

while (Date.now() < deadline) {
  const response = await fetch(new URL("/v1/health/ready", baseUrl)).catch(() => undefined);
  if (response?.ok) {
    console.log(`ready at ${baseUrl}`);
    process.exit(0);
  }
  await new Promise((resolve) => setTimeout(resolve, 500));
}

throw new Error(`ready endpoint timed out for ${baseUrl}`);
