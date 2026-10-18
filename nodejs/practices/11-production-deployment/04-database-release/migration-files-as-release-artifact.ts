export interface MigrationArtifact {
  path: string;
  committed: boolean;
  appliedBy: "prisma migrate deploy";
}

export const firstMigration: MigrationArtifact = {
  path: "prisma/migrations/0001_init/migration.sql",
  committed: true,
  appliedBy: "prisma migrate deploy"
};

export function isReleaseMigration(artifact: MigrationArtifact): boolean {
  return artifact.committed && artifact.path.endsWith("migration.sql");
}
