import { assertCondition, baseUrl, fetchJson } from "./check-utils.js";

const result = await fetchJson<{ traceId: string; spanId: string; traceparent: string }>(baseUrl() + "/v1/simulate/trace-work", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ operationName: "check-trace-work", steps: 2 })
});

assertCondition(/^[0-9a-f]{32}$/.test(result.traceId), "traceId shape is invalid");
assertCondition(/^[0-9a-f]{16}$/.test(result.spanId), "spanId shape is invalid");
assertCondition(/^00-[0-9a-f]{32}-[0-9a-f]{16}-[0-9a-f]{2}$/.test(result.traceparent), "traceparent shape is invalid");
assertCondition(!result.traceparent.includes("00000000000000000000000000000000"), "traceparent trace id is empty");

console.log("trace ok");
