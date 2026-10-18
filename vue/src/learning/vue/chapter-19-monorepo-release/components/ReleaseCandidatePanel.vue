<script setup lang="ts">
import { changelogEntry, isChangelogEntryComplete } from "../models/changelogModel";
import { isReleaseCandidateBlocked, releaseCandidate } from "../models/releaseCandidateModel";
</script>

<template>
  <section class="monorepo-card">
    <h3>Release candidate and changelog model</h3>
    <p>Candidate: {{ releaseCandidate.id }}</p>
    <p>Blocked: {{ isReleaseCandidateBlocked(releaseCandidate) }}</p>
    <p>Changelog ready: {{ isChangelogEntryComplete(changelogEntry) }}</p>
  </section>
</template>

