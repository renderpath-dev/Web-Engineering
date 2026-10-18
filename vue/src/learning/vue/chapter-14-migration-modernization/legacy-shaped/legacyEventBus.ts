export interface ProfileSavedPayload {
  readonly profileId: string;
  readonly displayName: string;
}

type ProfileSavedHandler = (payload: ProfileSavedPayload) => void;

const profileSavedHandlers = new Set<ProfileSavedHandler>();

export const legacyProfileEventBus = {
  onProfileSaved(handler: ProfileSavedHandler): void {
    profileSavedHandlers.add(handler);
  },
  offProfileSaved(handler: ProfileSavedHandler): void {
    profileSavedHandlers.delete(handler);
  },
  emitProfileSaved(payload: ProfileSavedPayload): void {
    profileSavedHandlers.forEach((handler) => {
      handler(payload);
    });
  },
  listenerCount(): number {
    return profileSavedHandlers.size;
  },
};
