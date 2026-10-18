import { describe, expect, it } from "vitest";
import {
  createAsyncComponentState,
  retryAsyncComponent,
  transitionAsyncComponent,
} from "../models/asyncComponentRecoveryModel";

describe("asyncComponentRecoveryModel", () => {
  it("creates report state for timeout transitions", () => {
    const state = transitionAsyncComponent(createAsyncComponentState(), "timeout");

    expect(state.phase).toBe("timeout");
    expect(state.reportCreated).toBe(true);
  });

  it("increments retry count and clears report state", () => {
    const failed = transitionAsyncComponent(createAsyncComponentState(), "error");
    const retrying = retryAsyncComponent(failed);

    expect(retrying.phase).toBe("loading");
    expect(retrying.retryCount).toBe(1);
    expect(retrying.reportCreated).toBe(false);
  });
});
