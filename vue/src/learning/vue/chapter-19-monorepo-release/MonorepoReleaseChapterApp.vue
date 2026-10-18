<script setup lang="ts">
import "./monorepo-release.css";
import BuildOrderPanel from "./components/BuildOrderPanel.vue";
import CiPipelineEvidencePanel from "./components/CiPipelineEvidencePanel.vue";
import ConsumerSmokeTestPanel from "./components/ConsumerSmokeTestPanel.vue";
import CssExportContractPanel from "./components/CssExportContractPanel.vue";
import DependencyPolicyPanel from "./components/DependencyPolicyPanel.vue";
import ImportGatePanel from "./components/ImportGatePanel.vue";
import MonorepoReleaseDashboard from "./components/MonorepoReleaseDashboard.vue";
import OwnershipReviewPanel from "./components/OwnershipReviewPanel.vue";
import PackageBoundaryPanel from "./components/PackageBoundaryPanel.vue";
import PackageExportSurfacePanel from "./components/PackageExportSurfacePanel.vue";
import PeerDependencyPanel from "./components/PeerDependencyPanel.vue";
import PublishBoundaryPanel from "./components/PublishBoundaryPanel.vue";
import ReleaseCandidatePanel from "./components/ReleaseCandidatePanel.vue";
import RollbackHotfixPanel from "./components/RollbackHotfixPanel.vue";
import TestBuildMatrixPanel from "./components/TestBuildMatrixPanel.vue";
import TypeScriptProjectBoundaryPanel from "./components/TypeScriptProjectBoundaryPanel.vue";
import VersionMigrationPanel from "./components/VersionMigrationPanel.vue";
import WorkspaceGraphPanel from "./components/WorkspaceGraphPanel.vue";
import WorkspaceLinkingPanel from "./components/WorkspaceLinkingPanel.vue";
import WorkspaceScriptsPanel from "./components/WorkspaceScriptsPanel.vue";
</script>

<template>
  <section class="chapter-section chapter-19" aria-labelledby="chapter-19-title">
    <header class="hero">
      <p class="eyebrow">Chapter 19</p>
      <h2 id="chapter-19-title">
        Monorepo, Workspace Packages, Internal Consumer App, Release Automation,
        and CI Evidence
      </h2>
      <p>
        Model workspace graph ownership, package links, public export paths,
        consumer smoke evidence, CI matrix state, release candidate review, and
        rollback gates without converting this app into a real workspace.
      </p>
    </header>

    <div class="monorepo-grid">
      <WorkspaceGraphPanel />
      <PackageBoundaryPanel />
      <WorkspaceLinkingPanel />
      <ImportGatePanel />
      <PackageExportSurfacePanel />
      <CssExportContractPanel />
      <PeerDependencyPanel />
      <BuildOrderPanel />
      <TypeScriptProjectBoundaryPanel />
      <ConsumerSmokeTestPanel />
      <WorkspaceScriptsPanel />
      <DependencyPolicyPanel />
      <CiPipelineEvidencePanel />
      <TestBuildMatrixPanel />
      <ReleaseCandidatePanel />
      <VersionMigrationPanel />
      <PublishBoundaryPanel />
      <RollbackHotfixPanel />
      <OwnershipReviewPanel />
      <MonorepoReleaseDashboard />
    </div>
  </section>
</template>

