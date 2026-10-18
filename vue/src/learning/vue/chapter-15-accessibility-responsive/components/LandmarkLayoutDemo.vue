<script setup lang="ts">
import {
  chapterLandmarks,
  findHeadingRankSkips,
  hasMainLandmark,
  type HeadingRecord,
} from "../models/landmarkModel";

const headingOutline: ReadonlyArray<HeadingRecord> = [
  { id: "chapter-15-title", rank: 2, text: "Chapter title" },
  { id: "chapter-15-section", rank: 3, text: "Demo region" },
  { id: "chapter-15-subsection", rank: 4, text: "Evidence panel" },
];

const skippedHeadingIds = findHeadingRankSkips(headingOutline);
</script>

<template>
  <section class="a11y-card" aria-labelledby="landmark-demo-title">
    <h3 id="landmark-demo-title">Landmarks and heading order</h3>
    <p>
      Main landmark present:
      <strong>{{ hasMainLandmark(chapterLandmarks) ? "yes" : "no" }}</strong>
    </p>
    <p>
      Heading rank skips:
      <strong>{{ skippedHeadingIds.length }}</strong>
    </p>
    <nav class="a11y-nav" aria-label="Landmark examples">
      <a
        v-for="region in chapterLandmarks"
        :key="region.id"
        :href="`#${region.id}`"
      >
        {{ region.label }}
      </a>
    </nav>
  </section>
</template>

