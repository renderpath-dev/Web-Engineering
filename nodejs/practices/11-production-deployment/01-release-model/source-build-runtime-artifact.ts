export type ArtifactKind = "source" | "build-output" | "runtime-artifact" | "release-artifact";

export interface ArtifactBoundary {
  path: string;
  kind: ArtifactKind;
  sourceControlled: boolean;
  producedBy: string;
}

export const artifactBoundaries: ArtifactBoundary[] = [
  { path: "src/server.ts", kind: "source", sourceControlled: true, producedBy: "developer edit" },
  { path: "dist/src/server.js", kind: "build-output", sourceControlled: false, producedBy: "npm run build" },
  { path: "deployable-notes-api:chapter-11", kind: "runtime-artifact", sourceControlled: false, producedBy: "docker build" },
  { path: "prisma/migrations/0001_init/migration.sql", kind: "release-artifact", sourceControlled: true, producedBy: "prisma migrate dev" },
  { path: ".github/workflows/ci.yml", kind: "release-artifact", sourceControlled: true, producedBy: "developer edit" }
];

export function sourceControlledArtifacts(boundaries: ArtifactBoundary[]): ArtifactBoundary[] {
  return boundaries.filter((boundary) => boundary.sourceControlled);
}
