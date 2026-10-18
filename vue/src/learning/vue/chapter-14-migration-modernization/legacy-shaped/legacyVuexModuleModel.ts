export interface LegacyVuexProfileState {
  readonly profileId: string;
  readonly displayName: string;
  readonly revision: number;
}

export interface LegacyVuexProfileModule {
  readonly namespaced: true;
  readonly state: LegacyVuexProfileState;
  readonly mutations: {
    readonly setDisplayName: string;
  };
  readonly actions: {
    readonly saveDisplayName: string;
  };
}

export const legacyVuexProfileModule: LegacyVuexProfileModule = {
  namespaced: true,
  state: {
    profileId: "profile-001",
    displayName: "Ada Lovelace",
    revision: 1,
  },
  mutations: {
    setDisplayName: "profile/setDisplayName",
  },
  actions: {
    saveDisplayName: "profile/saveDisplayName",
  },
};
