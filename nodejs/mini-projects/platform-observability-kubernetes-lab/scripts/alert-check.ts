import { readFile } from "node:fs/promises";
import YAML from "yaml";
import { assertCondition } from "./check-utils.js";

type AlertRule = {
  alert?: string;
  expr?: string;
  for?: string;
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
};

const doc = YAML.parse(await readFile(new URL("../prometheus/alert-rules.yml", import.meta.url), "utf8")) as { groups?: Array<{ rules?: AlertRule[] }> };
assertCondition(Array.isArray(doc.groups) && doc.groups.length > 0, "Alert groups are missing");

const forbiddenLabelNames = ["user_id", "request_id", "trace_id", "span_id", "email", "raw_url", "token", "redis_key", "database_url"];

for (const group of doc.groups) {
  assertCondition(Array.isArray(group.rules), "Alert group rules are missing");
  for (const rule of group.rules ?? []) {
    assertCondition(typeof rule.alert === "string" && rule.alert.length > 0, "Alert name is missing");
    assertCondition(typeof rule.expr === "string" && rule.expr.length > 0, "Alert expression is missing");
    assertCondition(typeof rule.for === "string" && rule.for.length > 0, "Alert duration is missing");
    assertCondition(rule.labels?.severity !== undefined, "Alert severity label is missing");
    assertCondition(rule.annotations?.summary !== undefined, "Alert summary annotation is missing");
    assertCondition(rule.annotations?.runbook !== undefined, "Alert runbook annotation is missing");
    for (const labelName of Object.keys(rule.labels ?? {})) {
      assertCondition(!forbiddenLabelNames.includes(labelName), "Forbidden alert label: " + labelName);
    }
  }
}

console.log("alerts ok");
