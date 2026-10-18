import assert from "node:assert/strict";
import test from "node:test";
import { env } from "../src/config/env.js";

test("env parser provides local release defaults", () => {
  assert.equal(typeof env.PORT, "number");
  assert.equal(env.RELEASE_VERSION.length > 0, true);
});
