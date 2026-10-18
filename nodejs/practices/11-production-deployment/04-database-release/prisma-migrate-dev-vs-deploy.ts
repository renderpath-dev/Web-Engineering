export interface PrismaMigrationCommand {
  command: "prisma migrate dev" | "prisma migrate deploy";
  environment: "development" | "production";
  createsMigrationFiles: boolean;
  appliesCommittedMigrations: boolean;
}

export const prismaMigrationCommands: PrismaMigrationCommand[] = [
  { command: "prisma migrate dev", environment: "development", createsMigrationFiles: true, appliesCommittedMigrations: true },
  { command: "prisma migrate deploy", environment: "production", createsMigrationFiles: false, appliesCommittedMigrations: true }
];
