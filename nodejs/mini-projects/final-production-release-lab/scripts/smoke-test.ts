import http from "node:http";
import https from "node:https";

const target = process.env.SMOKE_BASE_URL ?? "http://localhost:8080";
const endpoints = [
  "/v1/health/ready",
  "/v1/release/manifest",
  "/v1/security/policy"
];

function requestEndpoint(url: URL): Promise<{ status: number; ok: boolean; bytes: number }> {
  const transport = url.protocol === "https:" ? https : http;
  return new Promise((resolve, reject) => {
    const request = transport.get(url, (response) => {
      const chunks: Buffer[] = [];
      response.on("data", (chunk: Buffer) => chunks.push(chunk));
      response.on("end", () => {
        const status = response.statusCode ?? 0;
        resolve({
          status,
          ok: status >= 200 && status < 300,
          bytes: Buffer.concat(chunks).length
        });
      });
    });

    request.setTimeout(5_000, () => {
      request.destroy(new Error("smoke request timed out"));
    });
    request.on("error", reject);
  });
}

const results = [];
for (const endpoint of endpoints) {
  const result = await requestEndpoint(new URL(endpoint, target));
  results.push({ endpoint, ...result });
}

const failed = results.filter((result) => !result.ok);
console.log(JSON.stringify({
  status: failed.length === 0 ? "PASS" : "FAIL",
  target,
  results
}, null, 2));
process.exit(failed.length === 0 ? 0 : 1);
