<script setup lang="ts">
import { computed, ref } from "vue";
import {
  classifyDependencyRisk,
  type DependencyRiskCategory,
} from "../models/dependencyRiskModel";

const packageName = ref("@scope/ui-widget");
const category = ref<DependencyRiskCategory>("general-ui");
const changesLockfile = ref(false);

const review = computed(() =>
  classifyDependencyRisk({
    packageName: packageName.value,
    category: category.value,
    changesLockfile: changesLockfile.value,
  }),
);
</script>

<template>
  <section class="security-card" aria-labelledby="dependency-risk-title">
    <h3 id="dependency-risk-title">Dependency risk review</h3>

    <label class="security-field">
      <span>Package name</span>
      <input v-model="packageName" />
    </label>

    <label class="security-field">
      <span>Category</span>
      <select v-model="category">
        <option value="general-ui">general-ui</option>
        <option value="routing">routing</option>
        <option value="auth">auth</option>
        <option value="storage">storage</option>
        <option value="rich-text">rich-text</option>
        <option value="dom-rendering">dom-rendering</option>
      </select>
    </label>

    <label class="security-field">
      <span>
        <input v-model="changesLockfile" type="checkbox" />
        Changes lockfile
      </span>
    </label>

    <p>
      Risk:
      <span
        class="security-badge"
        :class="{ blocked: review.risk === 'high', review: review.risk === 'medium' }"
      >
        {{ review.risk }}
      </span>
    </p>
    <p>{{ review.reviewAction }}</p>
  </section>
</template>
