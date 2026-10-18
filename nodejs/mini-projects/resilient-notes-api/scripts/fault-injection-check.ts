const baseUrl = process.env.SMOKE_BASE_URL ?? "http://localhost:8080";

async function postScenario(scenario: string): Promise<void> {
  const response = await fetch(`${baseUrl}/reliability/fault-injection`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ scenario })
  });
  if (!response.ok) throw new Error(`${scenario} returned ${response.status}`);
}

for (const scenario of ["none", "slow_dependency", "timeout", "redis_outage", "db_conflict", "circuit_open", "none"]) {
  await postScenario(scenario);
}

console.log(`fault injection check ok ${baseUrl}`);
