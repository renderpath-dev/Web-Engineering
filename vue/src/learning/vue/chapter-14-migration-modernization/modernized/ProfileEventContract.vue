<script setup lang="ts">
import { computed, provide, ref } from "vue";

export interface ProfileSavePayload {
  readonly profileId: string;
  readonly displayName: string;
}

const emit = defineEmits<{
  save: [payload: ProfileSavePayload];
}>();

const profileId = "profile-001";
const displayName = ref("Ada Lovelace");
const lastSavedName = ref("Not saved");

const eventContractLabel = computed(
  () => `${profileId}:${displayName.value.trim()}`,
);

function saveProfile(): void {
  const payload: ProfileSavePayload = {
    profileId,
    displayName: displayName.value,
  };

  lastSavedName.value = payload.displayName;
  emit("save", payload);
}

provide("profileSaveOwner", "ProfileEventContract");
</script>

<template>
  <article class="migration-card">
    <p class="card-eyebrow">Explicit event contract</p>
    <h3>Event bus replacement boundary</h3>
    <label>
      Display name
      <input v-model="displayName" />
    </label>
    <button type="button" @click="saveProfile">Emit save event</button>
    <p>Contract label: {{ eventContractLabel }}</p>
    <p>Last saved: {{ lastSavedName }}</p>
  </article>
</template>

<style scoped>
.migration-card {
  display: grid;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid #d8e4de;
  border-radius: 0.9rem;
  background: #ffffff;
}

.card-eyebrow {
  margin: 0;
  color: #0369a1;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

label {
  display: grid;
  gap: 0.35rem;
  font-weight: 700;
}

input {
  padding: 0.5rem 0.65rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.55rem;
}

button {
  width: fit-content;
  padding: 0.55rem 0.8rem;
  border: 0;
  border-radius: 0.55rem;
  background: #0369a1;
  color: #ffffff;
  font-weight: 800;
}
</style>
