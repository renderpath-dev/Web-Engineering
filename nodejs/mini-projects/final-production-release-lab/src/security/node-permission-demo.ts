interface PermissionApi {
  has(scope: string, reference?: string): boolean;
}

type ProcessWithPermission = typeof process & {
  permission?: PermissionApi;
};

export interface PermissionDemoResult {
  model: string;
  permissionApiAvailable: boolean;
  fsReadAllowedForEntry: boolean | "UNKNOWN";
  runtimeBoundary: string;
  typeScriptBoundary: string;
}

export function runPermissionDemo(): PermissionDemoResult {
  const permission = (process as ProcessWithPermission).permission;
  return {
    model: "Node executes trusted JavaScript by default.",
    permissionApiAvailable: Boolean(permission),
    fsReadAllowedForEntry: permission ? permission.has("fs.read") : "UNKNOWN",
    runtimeBoundary: "Permission flags can restrict selected runtime resources when Node starts.",
    typeScriptBoundary: "TypeScript types do not grant or deny runtime operating-system permissions."
  };
}

if (import.meta.url === new URL(process.argv[1] ?? "", "file:").href) {
  console.log(JSON.stringify(runPermissionDemo(), null, 2));
}
