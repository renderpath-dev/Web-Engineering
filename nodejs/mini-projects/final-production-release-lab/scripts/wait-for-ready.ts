const target = process.env.SMOKE_BASE_URL ?? "http://localhost:8080";
const deadline = Date.now() + 30_000;

while (Date.now() < deadline) {
  try {
    const response = await fetch(target + "/v1/health/ready");
    if (response.ok) {
      console.log(JSON.stringify({ status: "PASS", target }));
      process.exit(0);
    }
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}

console.log(JSON.stringify({ status: "FAIL", target, reason: "readiness endpoint did not become ready" }));
process.exit(1);
