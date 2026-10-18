<script setup lang="ts">
import "./accessibility-responsive.css";
import { accessibilityPrinciples } from "./models/accessibilityPrincipleModel";
import AccessibleDialog from "./components/AccessibleDialog.vue";
import AccessibleDisclosure from "./components/AccessibleDisclosure.vue";
import AccessibleSearchForm from "./components/AccessibleSearchForm.vue";
import AccessibilityVerificationDashboard from "./components/AccessibilityVerificationDashboard.vue";
import AsyncStatusLiveRegion from "./components/AsyncStatusLiveRegion.vue";
import ContrastReviewPanel from "./components/ContrastReviewPanel.vue";
import LandmarkLayoutDemo from "./components/LandmarkLayoutDemo.vue";
import NativeControlBoundaryDemo from "./components/NativeControlBoundaryDemo.vue";
import ReducedMotionTransitionDemo from "./components/ReducedMotionTransitionDemo.vue";
import ResponsiveNavigationDemo from "./components/ResponsiveNavigationDemo.vue";
import RouteFocusRestoreDemo from "./components/RouteFocusRestoreDemo.vue";
import RovingTabindexTabs from "./components/RovingTabindexTabs.vue";
import SkipLinkDemo from "./components/SkipLinkDemo.vue";
import SortableResultsTable from "./components/SortableResultsTable.vue";
import ValidationErrorSummary from "./components/ValidationErrorSummary.vue";
</script>

<template>
  <section class="chapter-section chapter-15" aria-labelledby="chapter-15-title">
    <header id="chapter-15-banner" class="hero">
      <p class="eyebrow">Chapter 15</p>
      <h2 id="chapter-15-title">
        Accessibility, Responsive Interaction, and Inclusive UI Verification
      </h2>
      <p>
        Build Vue interfaces whose DOM semantics, focus behavior, responsive
        layout, motion policy, and verification evidence are inspectable.
      </p>
    </header>

    <section class="a11y-card" aria-labelledby="principles-title">
      <h3 id="principles-title">Accessibility principle overview</h3>
      <div class="a11y-grid">
        <article v-for="principle in accessibilityPrinciples" :key="principle.id">
          <h4>{{ principle.label }}</h4>
          <p>{{ principle.question }}</p>
          <p>{{ principle.releaseSignal }}</p>
        </article>
      </div>
    </section>

    <SkipLinkDemo />
    <LandmarkLayoutDemo />

    <section id="chapter-15-main" tabindex="-1" aria-labelledby="chapter-15-title">
      <div class="a11y-grid">
        <RouteFocusRestoreDemo />
        <AccessibleSearchForm />
        <ValidationErrorSummary />
        <NativeControlBoundaryDemo />
        <AccessibleDisclosure />
        <AccessibleDialog />
        <RovingTabindexTabs />
        <SortableResultsTable />
        <AsyncStatusLiveRegion />
        <ContrastReviewPanel />
        <ReducedMotionTransitionDemo />
        <ResponsiveNavigationDemo />
      </div>
    </section>

    <AccessibilityVerificationDashboard />

    <footer id="chapter-15-footer" class="a11y-card">
      <p>
        This lab records evidence. It does not claim WCAG conformance or screen
        reader certification.
      </p>
    </footer>
  </section>
</template>
