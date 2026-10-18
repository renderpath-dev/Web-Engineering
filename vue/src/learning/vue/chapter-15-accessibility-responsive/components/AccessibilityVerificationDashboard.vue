<script setup lang="ts">
import {
  accessibilityIssues,
  canReleaseAccessibilityWork,
  getBlockedAccessibilityIssues,
} from "../models/accessibilityIssueModel";

const blockedIssues = getBlockedAccessibilityIssues(accessibilityIssues);
const releaseReady = canReleaseAccessibilityWork(accessibilityIssues);
</script>

<template>
  <aside
    id="chapter-15-verification"
    class="a11y-card"
    aria-labelledby="verification-dashboard-title"
  >
    <h3 id="verification-dashboard-title">Accessibility verification dashboard</h3>
    <p class="a11y-status">
      Release ready: {{ releaseReady ? "yes" : "no" }}.
      Blocked issues: {{ blockedIssues.length }}.
    </p>
    <ul class="a11y-dashboard-list">
      <li v-for="issue in accessibilityIssues" :key="issue.id">
        <strong>{{ issue.title }}</strong>
        <p>{{ issue.wcagCriterion }} · {{ issue.owner }} · {{ issue.severity }}</p>
        <p>{{ issue.evidence }}</p>
      </li>
    </ul>
  </aside>
</template>

