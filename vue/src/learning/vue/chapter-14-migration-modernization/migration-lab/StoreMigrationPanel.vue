<script setup lang="ts">
import { storeToRefs } from "pinia";
import { legacyVuexProfileModule } from "../legacy-shaped/legacyVuexModuleModel";
import { useProfileStore } from "../modernized/useProfileStore";

const profileStore = useProfileStore();
const { displayName, profileLabel, revision } = storeToRefs(profileStore);

function applyStoreUpdate(): void {
  profileStore.updateDisplayName("Grace Hopper");
}
</script>

<template>
  <article class="lab-card">
    <p class="card-eyebrow">State</p>
    <h3>Vuex module model to Pinia store model</h3>
    <p>Legacy action: {{ legacyVuexProfileModule.actions.saveDisplayName }}</p>
    <p>Modern store label: {{ profileLabel }}</p>
    <p>Current name: {{ displayName }} / revision {{ revision }}</p>
    <button type="button" @click="applyStoreUpdate">Apply Pinia update</button>
  </article>
</template>

<style scoped>
.lab-card {
  display: grid;
  gap: 0.7rem;
  padding: 1rem;
  border: 1px solid #d8e4de;
  border-radius: 0.9rem;
  background: #ffffff;
}

.card-eyebrow {
  margin: 0;
  color: #b45309;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

button {
  width: fit-content;
  padding: 0.55rem 0.8rem;
  border: 0;
  border-radius: 0.55rem;
  background: #b45309;
  color: #ffffff;
  font-weight: 800;
}
</style>
