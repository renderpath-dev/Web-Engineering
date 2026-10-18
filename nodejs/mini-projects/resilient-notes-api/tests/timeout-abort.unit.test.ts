import assert from "node:assert/strict";
import test from "node:test";
import { abortableDelay } from "../src/reliability/abortable.js";
import { TimeoutError, withTimeout } from "../src/reliability/timeout.js";

test("AbortSignal.timeout cancels a timer-backed operation", async () => {
  await assert.rejects(
    () => withTimeout((signal) => abortableDelay(50, signal, "unit_delay"), 5, "unit_delay"),
    TimeoutError
  );
});
