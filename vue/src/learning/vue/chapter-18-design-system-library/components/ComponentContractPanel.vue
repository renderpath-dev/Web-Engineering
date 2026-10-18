<script setup lang="ts">
import {
  buttonContract,
  detectBreakingContractChange,
  findContractDocumentationGaps,
} from "../models/componentContractModel";
import { assessAttrForwarding } from "../models/fallthroughAttrsModel";

const gaps = findContractDocumentationGaps(buttonContract);
const removalImpact = detectBreakingContractChange({
  removedProp: true,
  removedEmit: false,
  removedSlot: false,
  visualDefaultChanged: false,
});
const attrsRisk = assessAttrForwarding({
  componentName: "DsButton",
  target: "native-control",
  multiRoot: false,
  forwardsListeners: true,
});
</script>

<template>
  <section class="design-card">
    <h3>Component contract</h3>
    <p>{{ buttonContract.componentName }} forwards attrs to {{ buttonContract.attrsTarget }}.</p>
    <p>Documentation gaps: {{ gaps.length }}</p>
    <p>Removing variant impact: {{ removalImpact }}</p>
    <p>Attrs forwarding risk: {{ attrsRisk }}</p>
  </section>
</template>
