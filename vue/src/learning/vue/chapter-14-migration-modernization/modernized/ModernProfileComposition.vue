<script setup lang="ts">
import { useProfileForm } from "./useProfileForm";

const emit = defineEmits<{
  save: [
    payload: {
      readonly displayName: string;
      readonly role: string;
    },
  ];
}>();

const {
  displayName,
  role,
  profileLabel,
  isDirty,
  resetForm,
  createSnapshot,
} = useProfileForm({
  displayName: "Ada Lovelace",
  role: "Analyst",
});

function saveProfile(): void {
  emit("save", createSnapshot());
}
</script>

<template>
  <article class="migration-card">
    <p class="card-eyebrow">Modern Composition API</p>
    <h3>Profile editor after refactor</h3>
    <label>
      Display name
      <input v-model="displayName" />
    </label>
    <label>
      Role
      <input v-model="role" />
    </label>
    <div class="actions">
      <button type="button" @click="saveProfile">Save modern profile</button>
      <button type="button" class="secondary" @click="resetForm">
        Reset form
      </button>
    </div>
    <p>Current label: {{ profileLabel }}</p>
    <p>Dirty state: {{ isDirty ? "changed" : "clean" }}</p>
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
  color: #047857;
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

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

button {
  width: fit-content;
  padding: 0.55rem 0.8rem;
  border: 0;
  border-radius: 0.55rem;
  background: #047857;
  color: #ffffff;
  font-weight: 800;
}

.secondary {
  background: #334155;
}
</style>
