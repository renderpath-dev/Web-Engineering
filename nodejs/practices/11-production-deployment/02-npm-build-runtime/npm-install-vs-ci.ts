export interface InstallCommandModel {
  command: "npm install" | "npm ci";
  requiresLockfile: boolean;
  mayRewriteLockfile: boolean;
  removesExistingNodeModules: boolean;
}

export const installCommands: InstallCommandModel[] = [
  { command: "npm install", requiresLockfile: false, mayRewriteLockfile: true, removesExistingNodeModules: false },
  { command: "npm ci", requiresLockfile: true, mayRewriteLockfile: false, removesExistingNodeModules: true }
];

export function selectInstallCommand(hasLockfile: boolean, inContinuousIntegration: boolean): "npm install" | "npm ci" {
  if (inContinuousIntegration && hasLockfile) return "npm ci";
  return "npm install";
}
