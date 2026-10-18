<script setup lang="ts">
defineProps<{
  readonly open: boolean;
  readonly title: string;
}>();

const emit = defineEmits<{
  "update:open": [open: boolean];
  close: [];
}>();

function closeDialog(): void {
  emit("update:open", false);
  emit("close");
}
</script>

<template>
  <div class="ds-dialog-contract">
    <slot name="trigger" :open="() => emit('update:open', true)" />
    <section v-if="open" class="ds-dialog" aria-modal="true" role="dialog">
      <header class="ds-dialog__header">
        <h3>{{ title }}</h3>
        <button type="button" @click="closeDialog">Close</button>
      </header>
      <div class="ds-dialog__body">
        <slot />
      </div>
      <footer class="ds-dialog__footer">
        <slot name="footer" :close="closeDialog" />
      </footer>
    </section>
  </div>
</template>
