<script setup lang="ts">
import { classifyIncidentSeverity } from "../models/incidentSeverityModel";
import { decideRollback } from "../models/rollbackDecisionModel";

const severity = classifyIncidentSeverity({
  affectedUserPercent: 12,
  criticalPathDown: false,
  durationMinutes: 45,
});
const decision = decideRollback({
  severity,
  releaseHealthBlocked: true,
  mitigationAvailable: false,
});
</script>

<template>
  <section class="observability-card" aria-labelledby="incident-rollback-title">
    <h3 id="incident-rollback-title">Incident rollback decision</h3>
    <p>
      Severity:
      <span class="observability-badge warning">{{ severity }}</span>
    </p>
    <p>
      Rollback:
      <span class="observability-badge" :class="{ blocked: decision.recommended }">
        {{ decision.recommended }}
      </span>
    </p>
    <p>{{ decision.reason }}</p>
  </section>
</template>
