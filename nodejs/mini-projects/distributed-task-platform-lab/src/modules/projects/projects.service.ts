import { readCacheAside } from "../../cache/cache-aside.js";
import { invalidateProjectSummary } from "../../cache/cache-invalidation.js";
import { prisma } from "../../db/prisma.js";
import { HttpError } from "../../shared/errors/http-error.js";
import type { CreateProjectInput } from "./projects.schema.js";

export type ProjectDto = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProjectSummaryDto = {
  projectId: string;
  taskCount: number;
  completedTaskCount: number;
  cacheStatus: "hit" | "miss";
};

function toProjectDto(project: { id: string; name: string; description: string | null; createdAt: Date; updatedAt: Date }): ProjectDto {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString()
  };
}

export async function listProjects(): Promise<ProjectDto[]> {
  const projects = await prisma.project.findMany({ orderBy: { createdAt: "asc" } });
  return projects.map(toProjectDto);
}

export async function createProject(input: CreateProjectInput): Promise<ProjectDto> {
  const project = await prisma.project.create({
    data: {
      name: input.name,
      description: input.description
    }
  });
  return toProjectDto(project);
}

export async function getProjectById(projectId: string): Promise<ProjectDto> {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new HttpError(404, "project_not_found", "Project not found");
  return toProjectDto(project);
}

export async function getProjectSummary(projectId: string): Promise<ProjectSummaryDto> {
  await getProjectById(projectId);
  const cached = await readCacheAside(projectId, async () => {
    const [taskCount, completedTaskCount] = await Promise.all([
      prisma.task.count({ where: { projectId } }),
      prisma.task.count({ where: { projectId, completed: true } })
    ]);
    return { projectId, taskCount, completedTaskCount };
  });

  return {
    ...cached.value,
    cacheStatus: cached.cacheStatus
  };
}

export async function invalidateSummary(projectId: string): Promise<boolean> {
  await getProjectById(projectId);
  return invalidateProjectSummary(projectId);
}
