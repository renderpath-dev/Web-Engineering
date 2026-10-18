export type ReleaseGateName =
  | "install"
  | "generate"
  | "typecheck"
  | "test"
  | "build"
  | "migration-readiness"
  | "smoke"
  | "rollback-note";

export interface ReleaseGate {
  name: ReleaseGateName;
  command: string;
  requiredBeforeRelease: boolean;
}

export const releaseChecklist: ReleaseGate[] = [
  { name: "install", command: "npm ci", requiredBeforeRelease: true },
  { name: "generate", command: "npm run prisma:generate", requiredBeforeRelease: true },
  { name: "typecheck", command: "npm run typecheck", requiredBeforeRelease: true },
  { name: "test", command: "npm test", requiredBeforeRelease: true },
  { name: "build", command: "npm run build", requiredBeforeRelease: true },
  { name: "migration-readiness", command: "npm run prisma:migrate:deploy", requiredBeforeRelease: true },
  { name: "smoke", command: "npm run smoke", requiredBeforeRelease: true },
  { name: "rollback-note", command: "record rollback boundary", requiredBeforeRelease: true }
];

export function missingRequiredGates(completed: Set<ReleaseGateName>): ReleaseGateName[] {
  return releaseChecklist
    .filter((gate) => gate.requiredBeforeRelease && !completed.has(gate.name))
    .map((gate) => gate.name);
}
