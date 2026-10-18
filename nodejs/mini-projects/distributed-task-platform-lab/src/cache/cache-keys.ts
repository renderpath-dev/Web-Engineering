export const PROJECT_SUMMARY_CACHE_NAME = "project_summary";

export function projectSummaryCacheKey(projectId: string): string {
  return `cache:v1:project-summary:${projectId}`;
}
