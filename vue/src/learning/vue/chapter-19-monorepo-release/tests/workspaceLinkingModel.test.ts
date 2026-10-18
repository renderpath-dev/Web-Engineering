import { describe, expect, it } from "vitest";
import {
  getWorkspaceLinkProofScope,
  provesPublishedPackageCompatibility,
  workspaceLinks,
} from "../models/workspaceLinkingModel";

describe("workspaceLinkingModel", () => {
  it("treats workspace links as local consumption evidence", () => {
    expect(getWorkspaceLinkProofScope(workspaceLinks[0])).toBe("local-consumption");
  });

  it("does not treat local links as published compatibility proof", () => {
    expect(provesPublishedPackageCompatibility(workspaceLinks[0])).toBe(false);
  });
});

