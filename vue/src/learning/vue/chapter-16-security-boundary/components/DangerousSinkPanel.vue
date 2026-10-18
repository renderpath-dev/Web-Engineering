<script setup lang="ts">
import {
  dangerousSinkReviews,
  getSinkReviewAction,
} from "../models/dangerousSinkModel";
</script>

<template>
  <section class="security-card" aria-labelledby="dangerous-sinks-title">
    <h3 id="dangerous-sinks-title">Dangerous sink inventory</h3>
    <p>
      The inventory names risky sink classes without executing code or rendering
      markup.
    </p>

    <ul class="security-list">
      <li v-for="sink in dangerousSinkReviews" :key="sink.id">
        <h4>{{ sink.label }}</h4>
        <p>
          <span class="security-badge blocked">{{ sink.risk }}</span>
          {{ sink.kind }}
        </p>
        <p>{{ getSinkReviewAction(sink.kind) }}</p>
      </li>
    </ul>
  </section>
</template>
