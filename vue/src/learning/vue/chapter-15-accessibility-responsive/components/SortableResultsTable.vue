<script setup lang="ts">
import { computed, ref } from "vue";
import {
  createSortButtonLabel,
  initialResultRows,
  sortRows,
  toggleSortDirection,
  type SortDirection,
} from "../models/tableAccessibilityModel";

const sortDirection = ref<SortDirection>("ascending");
const sortedRows = computed(() =>
  sortRows(initialResultRows, {
    column: "score",
    direction: sortDirection.value,
  }),
);

function toggleScoreSort(): void {
  sortDirection.value = toggleSortDirection(sortDirection.value);
}
</script>

<template>
  <section class="a11y-card" aria-labelledby="table-demo-title">
    <h3 id="table-demo-title">Sortable results table</h3>
    <div class="a11y-overflow">
      <table class="a11y-table">
        <caption>
          Accessibility review results
        </caption>
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Status</th>
            <th scope="col" :aria-sort="sortDirection">
              <button class="a11y-button secondary" type="button" @click="toggleScoreSort">
                {{ createSortButtonLabel("score", sortDirection) }}
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in sortedRows" :key="row.id">
            <td>{{ row.name }}</td>
            <td>{{ row.status }}</td>
            <td>{{ row.score }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

