<script setup lang="ts">
import { computed, reactive, ref, useId } from "vue";
import {
  createFieldIds,
  getDescribedByIds,
  validateSearchForm,
  type SearchFormState,
} from "../models/formAccessibilityModel";

const prefix = useId();
const state = reactive<SearchFormState>({
  query: "",
  status: "",
});
const submitted = ref(false);
const errors = computed(() => validateSearchForm(state));
const queryField = computed(() => {
  return errors.value.find((error) => error.fieldId === "query") ??
    createFieldIds(prefix, "query");
});
const statusField = computed(() => {
  return errors.value.find((error) => error.fieldId === "status") ??
    createFieldIds(prefix, "status");
});

function submitSearch(): void {
  submitted.value = true;
}
</script>

<template>
  <form class="a11y-card" aria-labelledby="search-form-title" @submit.prevent="submitSearch">
    <h3 id="search-form-title">Accessible search form</h3>
    <div class="a11y-field">
      <label :id="queryField.labelId" :for="queryField.inputId">
        Search term
      </label>
      <input
        :id="queryField.inputId"
        v-model="state.query"
        type="search"
        :aria-labelledby="queryField.labelId"
        :aria-describedby="getDescribedByIds(queryField)"
        :aria-invalid="queryField.invalid ? 'true' : 'false'"
        autocomplete="off"
      />
      <span :id="queryField.descriptionId">Enter at least two characters.</span>
      <strong v-if="queryField.invalid" :id="queryField.errorId" class="a11y-error">
        {{ queryField.message }}
      </strong>
    </div>

    <div class="a11y-field">
      <label :id="statusField.labelId" :for="statusField.inputId">
        Result status
      </label>
      <select
        :id="statusField.inputId"
        v-model="state.status"
        :aria-labelledby="statusField.labelId"
        :aria-describedby="getDescribedByIds(statusField)"
        :aria-invalid="statusField.invalid ? 'true' : 'false'"
      >
        <option value="">Choose status</option>
        <option value="ready">Ready</option>
        <option value="review">Review</option>
      </select>
      <span :id="statusField.descriptionId">Choose the result status filter.</span>
      <strong v-if="statusField.invalid" :id="statusField.errorId" class="a11y-error">
        {{ statusField.message }}
      </strong>
    </div>

    <button class="a11y-button" type="submit">Search</button>
    <p v-if="submitted" class="a11y-status" role="status">
      {{ errors.length === 0 ? "Search submitted." : "Fix the listed fields." }}
    </p>
  </form>
</template>

