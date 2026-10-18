<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "LegacyOptionsProfile",
  data() {
    return {
      displayName: "Ada Lovelace",
      role: "Analyst",
      savedLabel: "Ada Lovelace - Analyst",
    };
  },
  computed: {
    profileLabel(): string {
      return `${this.displayName} - ${this.role}`;
    },
  },
  methods: {
    saveProfile(): void {
      this.savedLabel = this.profileLabel;
    },
  },
});
</script>

<template>
  <article class="migration-card">
    <p class="card-eyebrow">Legacy-shaped Options API</p>
    <h3>Profile editor before refactor</h3>
    <label>
      Display name
      <input v-model="displayName" />
    </label>
    <label>
      Role
      <input v-model="role" />
    </label>
    <button type="button" @click="saveProfile">Save legacy profile</button>
    <p>Current label: {{ profileLabel }}</p>
    <p>Saved label: {{ savedLabel }}</p>
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
  color: #7c3aed;
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
  background: #6d28d9;
  color: #ffffff;
  font-weight: 800;
}
</style>
