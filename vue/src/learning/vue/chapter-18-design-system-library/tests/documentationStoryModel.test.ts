import { describe, expect, it } from "vitest";
import { findMissingStoryStates } from "../models/documentationStoryModel";

describe("documentationStoryModel", () => {
  it("requires meaningful state stories", () => {
    expect(
      findMissingStoryStates(
        [
          {
            title: "Button default",
            componentName: "DsButton",
            state: "default",
            args: { variant: "primary" },
            purpose: "Document default action.",
            antiExample: false,
          },
        ],
        ["default", "loading"],
      ),
    ).toEqual(["loading"]);
  });
});
