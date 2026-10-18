<script setup lang="ts">
import { createTelemetryEvent } from "../models/telemetryEventModel";
import { useTelemetryQueue } from "../composables/useTelemetryQueue";

const { drain, enqueue, queueState } = useTelemetryQueue(3);

function addEvent(): void {
  enqueue(
    createTelemetryEvent({
      eventName: "queued-local-event",
      source: "incident",
      severity: "warning",
      routeName: "chapter-17",
      releaseId: "release-17-local",
    }),
  );
}
</script>

<template>
  <section class="observability-card" aria-labelledby="offline-queue-title">
    <h3 id="offline-queue-title">Offline telemetry queue</h3>
    <div class="observability-actions">
      <button class="observability-button" type="button" @click="addEvent">
        Add local event
      </button>
      <button class="observability-button secondary" type="button" @click="drain">
        Drain
      </button>
    </div>
    <p>Queued: {{ queueState.events.length }}</p>
    <p>Dropped: {{ queueState.droppedCount }}</p>
    <p>{{ queueState.dropReason }}</p>
  </section>
</template>
