<script setup lang="ts">
import ClassStyleBinding from "./ClassStyleBinding.vue";
import ConditionalRendering from "./ConditionalRendering.vue";
import CounterBasic from "./CounterBasic.vue";
import FormBinding from "./FormBinding.vue";
import ListRendering from "./ListRendering.vue";
import TaskBoardBasic from "./TaskBoardBasic.vue";
import TemplateBinding from "./TemplateBinding.vue";
import ReactivityChapterApp from "../chapter-02-reactivity-system/ReactivityChapterApp.vue";
import ComponentsChapterApp from "../chapter-03-component-communication/ComponentsChapterApp.vue";
import ComposablesChapterApp from "../chapter-04-composables-architecture/ComposablesChapterApp.vue";
import VueTypeScriptChapterApp from "../chapter-05-vue-typescript-boundaries/VueTypeScriptChapterApp.vue";
import VueRouterChapterApp from "../chapter-06-vue-router-permission/VueRouterChapterApp.vue";
import PiniaChapterApp from "../chapter-07-pinia-state-management/PiniaChapterApp.vue";
import AdminUiChapterApp from "../chapter-08-admin-ui-forms/AdminUiChapterApp.vue";
import ApiRuntimeChapterApp from "../chapter-09-api-runtime-boundary/ApiRuntimeChapterApp.vue";
import TestingQualityChapterApp from "../chapter-10-testing-quality/TestingQualityChapterApp.vue";
import ProductionDeploymentChapterApp from "../chapter-11-production-deployment/ProductionDeploymentChapterApp.vue";
import NuxtSsrBoundaryChapterApp from "../chapter-12-nuxt-ssr-boundary/NuxtSsrBoundaryChapterApp.vue";
import NuxtAdvancedProductionChapterApp from "../chapter-13-nuxt-advanced-production/NuxtAdvancedProductionChapterApp.vue";
import MigrationModernizationChapterApp from "../chapter-14-migration-modernization/MigrationModernizationChapterApp.vue";
import AccessibilityResponsiveChapterApp from "../chapter-15-accessibility-responsive/AccessibilityResponsiveChapterApp.vue";
import SecurityBoundaryChapterApp from "../chapter-16-security-boundary/SecurityBoundaryChapterApp.vue";
import ObservabilityIncidentChapterApp from "../chapter-17-observability-incident/ObservabilityIncidentChapterApp.vue";
import DesignSystemLibraryChapterApp from "../chapter-18-design-system-library/DesignSystemLibraryChapterApp.vue";
import MonorepoReleaseChapterApp from "../chapter-19-monorepo-release/MonorepoReleaseChapterApp.vue";
</script>

<template>
  <main class="learning-page">
    <section class="chapter-section" aria-labelledby="chapter-01-title">
      <header class="hero">
        <p class="eyebrow">Vue + TypeScript Learning Lab</p>
        <h1 id="chapter-01-title">
          Chapter 01: Application Boundary, Vite, SFC, and createApp
        </h1>
        <p>
          Explore how the browser entry, Vite, Vue runtime, SFC compiler, and
          root component connect before moving into deeper reactivity.
        </p>
      </header>

      <section
        class="learning-grid"
        aria-label="Chapter 01 practice components"
      >
        <CounterBasic />
        <TemplateBinding />
        <ConditionalRendering />
        <ListRendering />
        <FormBinding />
        <ClassStyleBinding />
      </section>

      <TaskBoardBasic />
    </section>

    <div class="chapter-divider" role="separator"></div>

    <ReactivityChapterApp />

    <div class="chapter-divider" role="separator"></div>

    <ComponentsChapterApp />

    <div class="chapter-divider" role="separator"></div>

    <ComposablesChapterApp />

    <div class="chapter-divider" role="separator"></div>

    <VueTypeScriptChapterApp />

    <div class="chapter-divider" role="separator"></div>

    <VueRouterChapterApp />

    <div class="chapter-divider" role="separator"></div>

    <PiniaChapterApp />

    <div class="chapter-divider" role="separator"></div>

    <AdminUiChapterApp />

    <div class="chapter-divider" role="separator"></div>

    <ApiRuntimeChapterApp />

    <div class="chapter-divider" role="separator"></div>

    <TestingQualityChapterApp />

    <div class="chapter-divider" role="separator"></div>

    <ProductionDeploymentChapterApp />

    <div class="chapter-divider" role="separator"></div>

    <NuxtSsrBoundaryChapterApp />

    <div class="chapter-divider" role="separator"></div>

    <NuxtAdvancedProductionChapterApp />

    <div class="chapter-divider" role="separator"></div>

    <MigrationModernizationChapterApp />

    <div class="chapter-divider" role="separator"></div>

    <AccessibilityResponsiveChapterApp />

    <div class="chapter-divider" role="separator"></div>

    <SecurityBoundaryChapterApp />

    <div class="chapter-divider" role="separator"></div>

    <ObservabilityIncidentChapterApp />

    <div class="chapter-divider" role="separator"></div>

    <DesignSystemLibraryChapterApp />

    <div class="chapter-divider" role="separator"></div>

    <MonorepoReleaseChapterApp />
  </main>
</template>

<style scoped>
:global(*) {
  box-sizing: border-box;
}

:global(body) {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
  background:
    radial-gradient(
      circle at top left,
      rgba(66, 184, 131, 0.18),
      transparent 34rem
    ),
    #f5f7f9;
  color: #213547;
  font-family:
    Inter,
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
}

:global(button),
:global(input),
:global(select) {
  font: inherit;
}

.learning-page {
  width: min(1180px, calc(100% - 2rem));
  margin: 0 auto;
  padding: 3rem 0 4rem;
}

.chapter-section {
  display: grid;
  gap: 1rem;
}

.hero {
  padding: 2rem;
  border: 1px solid #d8e4de;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 1rem 2.5rem rgba(33, 53, 71, 0.08);
}

.hero h1 {
  max-width: 860px;
  margin: 0.4rem 0 0.8rem;
  font-size: clamp(2rem, 5vw, 3.6rem);
  line-height: 1.08;
}

.hero p {
  max-width: 800px;
  margin-bottom: 0;
  line-height: 1.7;
}

.eyebrow {
  color: #18794e;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.learning-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(290px, 1fr));
  gap: 1rem;
}

.chapter-divider {
  height: 1px;
  margin: 3rem 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(24, 121, 78, 0.65),
    transparent
  );
}

@media (max-width: 640px) {
  .learning-page {
    width: min(100% - 1rem, 1180px);
    padding-top: 1rem;
  }

  .hero {
    padding: 1.25rem;
  }
}
</style>
