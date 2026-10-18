export type ModuleOwnership = {
  moduleName: string;
  ownsData: string[];
  publicUseCases: string[];
  forbiddenImports: string[];
};

export function describeModularMonolith(modules: ModuleOwnership[]): string[] {
  return modules.map((module) => {
    const data = module.ownsData.join(",");
    const useCases = module.publicUseCases.join(",");
    return `${module.moduleName}:data=${data}:useCases=${useCases}`;
  });
}

export function hasBoundaryLeak(module: ModuleOwnership, importedName: string): boolean {
  return module.forbiddenImports.includes(importedName);
}

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, "/")}`) {
  const result = describeModularMonolith([
    {
      moduleName: "tasks",
      ownsData: ["Task"],
      publicUseCases: ["createTask", "listTasks"],
      forbiddenImports: ["Express.Request"]
    }
  ]);
  console.log(result.join("\n"));
}
