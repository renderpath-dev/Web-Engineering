import { computed, ref } from "vue";

export interface ProfileFormSnapshot {
  readonly displayName: string;
  readonly role: string;
}

export function useProfileForm(initialProfile: ProfileFormSnapshot) {
  const displayName = ref(initialProfile.displayName);
  const role = ref(initialProfile.role);

  const profileLabel = computed(
    () => `${displayName.value.trim()} - ${role.value.trim()}`,
  );

  const isDirty = computed(
    () =>
      displayName.value !== initialProfile.displayName ||
      role.value !== initialProfile.role,
  );

  function resetForm(): void {
    displayName.value = initialProfile.displayName;
    role.value = initialProfile.role;
  }

  function createSnapshot(): ProfileFormSnapshot {
    return {
      displayName: displayName.value,
      role: role.value,
    };
  }

  return {
    displayName,
    role,
    profileLabel,
    isDirty,
    resetForm,
    createSnapshot,
  };
}
