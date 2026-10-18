<script setup lang="ts">
import { computed } from "vue";
import { validateSearchForm } from "../models/formAccessibilityModel";

const errors = computed(() =>
  validateSearchForm({
    query: "",
    status: "",
  }),
);
</script>

<template>
  <section class="a11y-card" aria-labelledby="error-summary-title">
    <h3 id="error-summary-title">Validation error summary</h3>
    <div v-if="errors.length > 0" role="alert" tabindex="-1">
      <p>Form cannot be submitted yet.</p>
      <ul>
        <li v-for="error in errors" :key="error.fieldId">
          <a :href="`#${error.inputId}`">{{ error.message }}</a>
        </li>
      </ul>
    </div>
  </section>
</template>

