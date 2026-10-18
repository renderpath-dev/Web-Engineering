import { defineStore } from "pinia";

export interface ProfileStoreState {
  profileId: string;
  displayName: string;
  revision: number;
}

export const useProfileStore = defineStore("chapter14Profile", {
  state: (): ProfileStoreState => ({
    profileId: "profile-001",
    displayName: "Ada Lovelace",
    revision: 1,
  }),
  getters: {
    profileLabel: (state): string =>
      `${state.profileId} / ${state.displayName} / r${state.revision}`,
  },
  actions: {
    updateDisplayName(displayName: string): void {
      this.displayName = displayName.trim();
      this.revision += 1;
    },
    resetProfile(): void {
      this.profileId = "profile-001";
      this.displayName = "Ada Lovelace";
      this.revision = 1;
    },
  },
});
