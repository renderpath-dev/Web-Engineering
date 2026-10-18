export type WorkspaceLinkKind = "npm-workspace" | "pnpm-workspace" | "manual-link";

export type InstallEvidenceStatus = "present" | "missing" | "unknown";

export type LinkProofScope = "local-consumption" | "published-consumption" | "unknown";

export interface WorkspaceLink {
  readonly sourcePackage: string;
  readonly targetPackage: string;
  readonly linkKind: WorkspaceLinkKind;
  readonly installEvidenceStatus: InstallEvidenceStatus;
  readonly lockfileChanged: boolean;
}

export const workspaceLinks: readonly WorkspaceLink[] = [
  {
    sourcePackage: "@vue-lab/admin-app",
    targetPackage: "@vue-lab/design-system",
    linkKind: "npm-workspace",
    installEvidenceStatus: "present",
    lockfileChanged: true,
  },
  {
    sourcePackage: "@vue-lab/admin-app",
    targetPackage: "@vue-lab/theme-tools",
    linkKind: "manual-link",
    installEvidenceStatus: "unknown",
    lockfileChanged: false,
  },
];

export function getWorkspaceLinkProofScope(link: WorkspaceLink): LinkProofScope {
  if (link.installEvidenceStatus === "missing") {
    return "unknown";
  }

  if (link.linkKind === "manual-link") {
    return "local-consumption";
  }

  return "local-consumption";
}

export function provesPublishedPackageCompatibility(link: WorkspaceLink): boolean {
  return getWorkspaceLinkProofScope(link) === "published-consumption";
}

export function requiresInstallEvidenceReview(link: WorkspaceLink): boolean {
  return link.installEvidenceStatus !== "present" || !link.lockfileChanged;
}

