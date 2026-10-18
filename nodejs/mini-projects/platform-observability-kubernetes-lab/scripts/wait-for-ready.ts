import { baseUrl } from "./check-utils.js";

const target = baseUrl() + "/v1/health/ready";
const deadline = Date.now() + Number(process.env.READY_TIMEOUT_MS ?? 30_000);

while (Date.now() < deadline) {
  try {
    const response = await fetch(target);
    if (response.ok) {
      console.log("ready");
      process.exit(0);
    }
  } catch {
  }
  await new Promise((resolve) => setTimeout(resolve, 500));
}

throw new Error("Service did not become ready: " + target);
