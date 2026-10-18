import test from "node:test";
import assert from "node:assert/strict";
import { classifyCompatibilityChange } from "../src/contracts/compatibility-classifier.js";

test("compatibility classifier handles representative cases", () => {
  assert.equal(classifyCompatibilityChange("additive_field").result, "compatible");
  assert.equal(classifyCompatibilityChange("enum_value_added").result, "potentially_compatible");
  assert.equal(classifyCompatibilityChange("field_removed").result, "breaking");
});
