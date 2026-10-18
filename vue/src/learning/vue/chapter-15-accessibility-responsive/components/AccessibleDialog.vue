<script setup lang="ts">
import { useDialogFocusTrap } from "../composables/useDialogFocusTrap";

const focusIds = [
  "accessibility-dialog-confirm",
  "accessibility-dialog-cancel",
] as const;
const {
  open,
  triggerRef,
  dialogRef,
  firstFocusableRef,
  lastFocusableRef,
  openDialog,
  closeDialog,
  handleDialogKeydown,
} = useDialogFocusTrap(focusIds);
</script>

<template>
  <section class="a11y-card" aria-labelledby="dialog-demo-title">
    <h3 id="dialog-demo-title">Accessible dialog</h3>
    <button
      id="open-accessibility-dialog"
      ref="triggerRef"
      class="a11y-button"
      type="button"
      @click="openDialog"
    >
      Open dialog
    </button>

    <Teleport to="body">
      <div v-if="open" class="a11y-dialog-backdrop">
        <section
          ref="dialogRef"
          class="a11y-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="accessibility-dialog-title"
          aria-describedby="accessibility-dialog-description"
          @keydown="handleDialogKeydown"
        >
          <h2 id="accessibility-dialog-title">Keyboard verification dialog</h2>
          <p id="accessibility-dialog-description">
            Focus starts inside the dialog, Tab cycles through dialog actions,
            Escape closes it, and focus returns to the trigger.
          </p>
          <div class="a11y-actions">
            <button
              id="accessibility-dialog-confirm"
              ref="firstFocusableRef"
              class="a11y-button"
              type="button"
              @click="closeDialog('confirm')"
            >
              Confirm
            </button>
            <button
              id="accessibility-dialog-cancel"
              ref="lastFocusableRef"
              class="a11y-button secondary"
              type="button"
              @click="closeDialog('cancel')"
            >
              Cancel
            </button>
          </div>
        </section>
      </div>
    </Teleport>
  </section>
</template>
