<script setup lang="ts">
import { ref } from "vue";
import {
  createLiveRegionText,
  shouldAnnounceMessage,
  type LiveRegionMessage,
} from "../models/liveRegionModel";

const currentMessage = ref<LiveRegionMessage | null>(null);
const previousMessage = ref<LiveRegionMessage | null>(null);
const counter = ref(0);

function publishStatus(priority: "polite" | "assertive"): void {
  const nextMessage: LiveRegionMessage = {
    id: `message-${counter.value}`,
    text: priority === "assertive" ? "Save failed." : "Results updated.",
    priority,
    createdAtMs: Date.now(),
  };

  if (shouldAnnounceMessage(previousMessage.value, nextMessage, 700)) {
    currentMessage.value = nextMessage;
    previousMessage.value = nextMessage;
  }

  counter.value += 1;
}
</script>

<template>
  <section class="a11y-card" aria-labelledby="live-region-title">
    <h3 id="live-region-title">Async status and live region</h3>
    <div class="a11y-actions">
      <button class="a11y-button" type="button" @click="publishStatus('polite')">
        Publish polite status
      </button>
      <button class="a11y-button secondary" type="button" @click="publishStatus('assertive')">
        Publish alert status
      </button>
    </div>
    <p class="a11y-status" role="status" aria-live="polite">
      {{ createLiveRegionText(currentMessage) || "No status yet." }}
    </p>
  </section>
</template>

