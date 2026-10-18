<script setup lang="ts">
import {
  redactTelemetryContext,
  redactionDemoContext,
} from "../models/telemetryRedactionModel";

const result = redactTelemetryContext(redactionDemoContext);
</script>

<template>
  <section class="observability-card" aria-labelledby="redaction-title">
    <h3 id="redaction-title">Telemetry redaction</h3>
    <p class="observability-output">{{ result.context.path }}</p>
    <p>
      Redacted fields:
      <span class="observability-badge">{{ result.redactedFields.join(", ") }}</span>
    </p>
  </section>
</template>
