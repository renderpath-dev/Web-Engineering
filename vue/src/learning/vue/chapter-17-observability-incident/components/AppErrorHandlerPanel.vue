<script setup lang="ts">
import { createErrorTelemetryRecord } from "../models/errorTelemetryModel";

const record = createErrorTelemetryRecord({
  source: "app-handler",
  error: new Error("Checkout panel failed for redacted contact"),
  componentName: "CheckoutPanel",
  info: "render",
  releaseId: "release-17-local",
});
</script>

<template>
  <section class="observability-card" aria-labelledby="app-error-handler-title">
    <h3 id="app-error-handler-title">App error handler model</h3>
    <p>
      The app-level handler creates a report event. It does not create fallback
      UI by itself.
    </p>
    <p class="observability-output">{{ record.message }}</p>
    <p>
      Source:
      <span class="observability-badge">{{ record.source }}</span>
      Redacted:
      <span class="observability-badge">{{ record.redacted }}</span>
    </p>
  </section>
</template>
