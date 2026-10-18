<script setup lang="ts">
import { isProvenanceVerified, provenanceBoundary } from "../models/provenanceBoundaryModel";
import {
  isPublishBoundaryReady,
  listPublishBoundaryGaps,
  publishReadiness,
} from "../models/publishBoundaryModel";
</script>

<template>
  <section class="monorepo-card">
    <h3>Publish boundary and provenance panel</h3>
    <p>Publish ready: {{ isPublishBoundaryReady(publishReadiness) }}</p>
    <p>Gaps: {{ listPublishBoundaryGaps(publishReadiness).join(", ") }}</p>
    <p>Provenance verified: {{ isProvenanceVerified(provenanceBoundary) }}</p>
  </section>
</template>

