import { invalidateSummary, getProjectSummary } from "../projects/projects.service.js";

export async function getCacheDemoSummary(projectId: string) {
  return getProjectSummary(projectId);
}

export async function invalidateCacheDemoSummary(projectId: string): Promise<{ invalidated: boolean }> {
  return { invalidated: await invalidateSummary(projectId) };
}
