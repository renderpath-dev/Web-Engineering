import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import YAML from "yaml";

test("alert rules are parseable and include runbooks", async () => {
  const doc = YAML.parse(await readFile(new URL("../prometheus/alert-rules.yml", import.meta.url), "utf8")) as any;
  assert.ok(Array.isArray(doc.groups));
  const rules = doc.groups.flatMap((group: any) => group.rules);
  assert.ok(rules.length >= 4);
  for (const rule of rules) {
    assert.ok(rule.alert);
    assert.ok(rule.expr);
    assert.ok(rule.annotations.runbook);
  }
});
