import { describe, expect, it } from "vitest";
import {
  createChildRegistry,
  createCleanupOwner,
  createTestMountProps,
  deleteReactiveField,
  selectChildById,
  setReactiveField,
  type ChildCapability,
  type DynamicRecord,
} from "../modernized/removedApiReplacement";

describe("removed API replacements", () => {
  it("replaces set and delete helpers with explicit record operations", () => {
    const initialRecord: DynamicRecord = { name: "Ada" };
    const withRole = setReactiveField(initialRecord, "role", "admin");
    const withoutName = deleteReactiveField(withRole, "name");

    expect(withRole).toEqual({ name: "Ada", role: "admin" });
    expect(withoutName).toEqual({ role: "admin" });
  });

  it("selects child capability by explicit id instead of render order", () => {
    const children: ReadonlyArray<ChildCapability> = [
      { id: "search", canFocus: true },
      { id: "submit", canFocus: false },
    ];

    expect(selectChildById(children, "search")).toEqual({
      id: "search",
      canFocus: true,
    });

    expect(createChildRegistry(children).findById("submit")).toEqual({
      id: "submit",
      canFocus: false,
    });
  });

  it("registers cleanup ownership without manual destroy", () => {
    const cleanupOwner = createCleanupOwner().registerCleanup("profile-listener");

    expect(cleanupOwner.registeredLabels).toEqual(["profile-listener"]);
  });

  it("uses props instead of propsData for test mount input", () => {
    expect(createTestMountProps({ title: "Profile" })).toEqual({
      props: { title: "Profile" },
    });
  });
});
