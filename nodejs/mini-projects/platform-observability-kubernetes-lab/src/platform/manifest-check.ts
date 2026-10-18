export type ManifestCheck = {
  hasProbes: boolean;
  hasResourceRequests: boolean;
  hasResourceLimits: boolean;
  serviceSelectorMatches: boolean;
};

export function manifestCheckPassed(check: ManifestCheck): boolean {
  return check.hasProbes && check.hasResourceRequests && check.hasResourceLimits && check.serviceSelectorMatches;
}
