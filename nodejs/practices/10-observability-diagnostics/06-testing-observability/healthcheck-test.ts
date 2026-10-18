import test from "node:test";
import assert from "node:assert/strict";
function live() { return { ok: true, data: { status: "live" } }; }
test("live check does not require dependencies", () => { assert.deepEqual(live(), { ok: true, data: { status: "live" } }); });
