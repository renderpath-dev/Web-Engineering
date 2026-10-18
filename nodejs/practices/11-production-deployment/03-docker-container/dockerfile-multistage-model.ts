export interface DockerStage {
  name: "deps" | "builder" | "runtime";
  owns: string[];
}

export const dockerStages: DockerStage[] = [
  { name: "deps", owns: ["package.json", "package-lock.json", "node_modules"] },
  { name: "builder", owns: ["src", "prisma", "dist"] },
  { name: "runtime", owns: ["dist", "prisma/migrations", "production node_modules"] }
];

export function stageContainsSource(stage: DockerStage): boolean {
  return stage.owns.includes("src");
}
