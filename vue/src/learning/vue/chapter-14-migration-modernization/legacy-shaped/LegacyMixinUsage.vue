<script lang="ts">
import { defineComponent } from "vue";

const profileDraftMixin = defineComponent({
  name: "ProfileDraftMixinShape",
  data() {
    return {
      draftName: "Grace Hopper",
      initialName: "Grace Hopper",
    };
  },
  computed: {
    isDirty(): boolean {
      return this.draftName !== this.initialName;
    },
  },
  methods: {
    resetDraft(): void {
      this.draftName = this.initialName;
    },
  },
});

export default defineComponent({
  name: "LegacyMixinUsage",
  mixins: [profileDraftMixin],
});
</script>

<template>
  <article class="migration-card">
    <p class="card-eyebrow">Legacy-shaped mixin</p>
    <h3>Implicit merge example</h3>
    <label>
      Draft name
      <input v-model="draftName" />
    </label>
    <p>Dirty state: {{ isDirty ? "changed" : "clean" }}</p>
    <button type="button" @click="resetDraft">Reset draft</button>
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
  color: #be123c;
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
  background: #be123c;
  color: #ffffff;
  font-weight: 800;
}
</style>
