<script setup lang="ts">
import "./design-system-library.css";
import AccessibilityContractPanel from "./components/AccessibilityContractPanel.vue";
import ComponentContractPanel from "./components/ComponentContractPanel.vue";
import ComponentPlaygroundPanel from "./components/ComponentPlaygroundPanel.vue";
import ComponentStateMatrixPanel from "./components/ComponentStateMatrixPanel.vue";
import DesignSystemReleaseDashboard from "./components/DesignSystemReleaseDashboard.vue";
import DesignTokenExplorer from "./components/DesignTokenExplorer.vue";
import DocumentationStoryPanel from "./components/DocumentationStoryPanel.vue";
import LibraryBuildBoundaryPanel from "./components/LibraryBuildBoundaryPanel.vue";
import PackageExportPanel from "./components/PackageExportPanel.vue";
import SecurityTokenBoundaryPanel from "./components/SecurityTokenBoundaryPanel.vue";
import ThemePreviewPanel from "./components/ThemePreviewPanel.vue";
import VersioningDeprecationPanel from "./components/VersioningDeprecationPanel.vue";
import DsAlert from "./library/DsAlert.vue";
import DsButton from "./library/DsButton.vue";
import DsCard from "./library/DsCard.vue";
import DsDialogShell from "./library/DsDialogShell.vue";
import DsStack from "./library/DsStack.vue";
import DsTextField from "./library/DsTextField.vue";
import DsVisuallyHidden from "./library/DsVisuallyHidden.vue";
import { ref } from "vue";

const fieldValue = ref("Design system input");
const dialogOpen = ref(false);
</script>

<template>
  <section class="chapter-section chapter-18" aria-labelledby="chapter-18-title">
    <header class="hero">
      <p class="eyebrow">Chapter 18</p>
      <h2 id="chapter-18-title">
        Design System, Reusable Component Library, Design Tokens, Documentation,
        and Package Boundary
      </h2>
      <p>
        Build a local design-system evidence lab with typed tokens, stable
        component contracts, safe customization, documentation models, and
        package-boundary checks.
      </p>
    </header>

    <div class="design-system-grid">
      <DesignTokenExplorer />
      <ThemePreviewPanel />
      <ComponentContractPanel />
      <ComponentPlaygroundPanel />
      <ComponentStateMatrixPanel />
      <DocumentationStoryPanel />
      <AccessibilityContractPanel />
      <SecurityTokenBoundaryPanel />
      <PackageExportPanel />
      <LibraryBuildBoundaryPanel />
      <VersioningDeprecationPanel />
      <DesignSystemReleaseDashboard />
    </div>

    <DsCard>
      <template #header>
        <h3>Library component preview</h3>
      </template>
      <DsStack gap="md">
        <DsButton>Native button action</DsButton>
        <DsTextField
          id="chapter-18-field"
          v-model="fieldValue"
          label="Library text field"
          description="Connected label and description contract."
        />
        <DsAlert status="info" announce>
          Component status is separate from announcement policy.
        </DsAlert>
        <DsDialogShell v-model:open="dialogOpen" title="Dialog shell contract">
          <template #trigger="{ open }">
            <DsButton variant="secondary" @press="open">Open dialog shell</DsButton>
          </template>
          <p>Focus trapping remains delegated to the Chapter 15 concept.</p>
          <template #footer="{ close }">
            <DsButton variant="secondary" @press="close">Close shell</DsButton>
          </template>
        </DsDialogShell>
        <DsVisuallyHidden>Hidden accessible helper text</DsVisuallyHidden>
      </DsStack>
      <template #footer>
        <p>
          This lab does not publish a package, install Storybook, or claim
          visual regression coverage.
        </p>
      </template>
    </DsCard>
  </section>
</template>
