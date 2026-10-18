import { describe, expect, it } from "vitest";
import {
  findMissingRequiredScripts,
  shouldRunSequentially,
  workspaceScripts,
} from "../models/workspaceScriptModel";

describe("workspaceScriptModel", () => {
  it("blocks CI when required package script is missing", () => {
    expect(
      findMissingRequiredScripts(
        workspaceScripts,
        ["@vue-lab/design-system", "@vue-lab/admin-app"],
        "test",
      ),
    ).toEqual(["@vue-lab/admin-app"]);
  });

  it("marks build orchestration as ordered", () => {
    expect(shouldRunSequentially("build")).toBe(true);
  });
});

