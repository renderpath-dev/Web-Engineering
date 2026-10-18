<script setup lang="ts">
import { ref } from "vue";
import {
  createAsyncComponentState,
  retryAsyncComponent,
  transitionAsyncComponent,
} from "../models/asyncComponentRecoveryModel";

const state = ref(createAsyncComponentState());

function markTimeout(): void {
  state.value = transitionAsyncComponent(state.value, "timeout");
}

function markError(): void {
  state.value = transitionAsyncComponent(state.value, "error");
}

function retry(): void {
  state.value = retryAsyncComponent(state.value);
}
</script>

<template>
  <section class="observability-card" aria-labelledby="async-recovery-title">
    <h3 id="async-recovery-title">Async component recovery</h3>
    <div class="observability-actions">
      <button class="observability-button" type="button" @click="markTimeout">
        Timeout
      </button>
      <button class="observability-button secondary" type="button" @click="markError">
        Error
      </button>
      <button class="observability-button secondary" type="button" @click="retry">
        Retry
      </button>
    </div>
    <p>
      Phase:
      <span class="observability-badge warning">{{ state.phase }}</span>
      Retry count:
      <span class="observability-badge">{{ state.retryCount }}</span>
    </p>
  </section>
</template>
