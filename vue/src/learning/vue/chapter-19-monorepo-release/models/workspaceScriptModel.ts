export type WorkspaceScriptCommandType = "typecheck" | "test" | "build" | "lint";

export interface WorkspaceScript {
  readonly packageName: string;
  readonly scriptName: string;
  readonly commandType: WorkspaceScriptCommandType;
  readonly required: boolean;
}

export const workspaceScripts: readonly WorkspaceScript[] = [
  {
    packageName: "@vue-lab/design-system",
    scriptName: "typecheck",
    commandType: "typecheck",
    required: true,
  },
  {
    packageName: "@vue-lab/design-system",
    scriptName: "test",
    commandType: "test",
    required: true,
  },
  {
    packageName: "@vue-lab/admin-app",
    scriptName: "build",
    commandType: "build",
    required: true,
  },
];

export function findMissingRequiredScripts(
  scripts: readonly WorkspaceScript[],
  packageNames: readonly string[],
  commandType: WorkspaceScriptCommandType,
): readonly string[] {
  return packageNames.filter(
    (packageName) =>
      !scripts.some(
        (script) =>
          script.packageName === packageName &&
          script.commandType === commandType &&
          script.required,
      ),
  );
}

export function shouldRunSequentially(commandType: WorkspaceScriptCommandType): boolean {
  return commandType === "build" || commandType === "typecheck";
}

