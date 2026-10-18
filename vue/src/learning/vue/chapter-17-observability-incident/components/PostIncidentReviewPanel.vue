<script setup lang="ts">
import {
  isPostIncidentReviewComplete,
  type PostIncidentReview,
} from "../models/postIncidentReviewModel";

const review: PostIncidentReview = {
  incidentId: "incident-local-17",
  timelineComplete: true,
  blameless: true,
  actionItems: [
    {
      id: "action-1",
      owner: "release-owner",
      evidence: "Add rollback drill to release checklist.",
      dueInDays: 7,
    },
  ],
};
</script>

<template>
  <section class="observability-card" aria-labelledby="post-incident-title">
    <h3 id="post-incident-title">Post-incident review</h3>
    <p>
      Complete:
      <span class="observability-badge">{{ isPostIncidentReviewComplete(review) }}</span>
    </p>
    <ul class="observability-list">
      <li v-for="item in review.actionItems" :key="item.id">
        {{ item.owner }}: {{ item.evidence }}
      </li>
    </ul>
  </section>
</template>
