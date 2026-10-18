import { describe, expect, it } from "vitest";
import {
  canReleaseSecurityWork,
  getBlockingSecurityIssues,
  securityIssues,
} from "../models/securityIssueModel";

describe("securityIssueModel", () => {
  it("finds open high-severity issues", () => {
    const blockingIssues = getBlockingSecurityIssues(securityIssues);

    expect(blockingIssues.map((issue) => issue.id)).toEqual(["sec-html-001"]);
  });

  it("blocks release when high-severity issues remain open", () => {
    expect(canReleaseSecurityWork(securityIssues)).toBe(false);
  });
});
