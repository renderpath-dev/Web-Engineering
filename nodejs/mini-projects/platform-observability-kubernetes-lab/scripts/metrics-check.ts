import { assertCondition, baseUrl } from "./check-utils.js";

const response = await fetch(baseUrl() + "/v1/metrics");
assertCondition(response.ok, "Metrics endpoint did not return success");
const text = await response.text();

const required = [
  "http_requests_total",
  "http_request_duration_seconds",
  "dependency_readiness",
  "event_loop_delay_seconds",
  "slo_budget_remaining_ratio"
];

for (const metric of required) {
  assertCondition(text.includes(metric), "Missing metric: " + metric);
}

const forbiddenLabelNames = ["user_id", "job_id", "request_id", "trace_id", "span_id", "email", "raw_url", "query_string", "token", "redis_key", "database_url", "request_body"];
for (const labelName of forbiddenLabelNames) {
  assertCondition(!text.includes(labelName + "="), "Forbidden metric label found: " + labelName);
}

console.log("metrics ok");
