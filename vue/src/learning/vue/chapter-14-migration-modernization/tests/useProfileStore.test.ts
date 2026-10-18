import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";
import { useProfileStore } from "../modernized/useProfileStore";

describe("profile store migration", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("updates display name and revision through a Pinia action", () => {
    const store = useProfileStore();

    store.updateDisplayName(" Grace Hopper ");

    expect(store.displayName).toBe("Grace Hopper");
    expect(store.revision).toBe(2);
    expect(store.profileLabel).toBe("profile-001 / Grace Hopper / r2");
  });

  it("restores the known baseline state", () => {
    const store = useProfileStore();

    store.updateDisplayName("Grace Hopper");
    store.resetProfile();

    expect(store.displayName).toBe("Ada Lovelace");
    expect(store.revision).toBe(1);
  });
});
