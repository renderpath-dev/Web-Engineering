export interface LockfileChange {
  readonly filePath: string;
  readonly packageName: string;
  readonly addedPackages: readonly string[];
  readonly removedPackages: readonly string[];
  readonly versionChanged: boolean;
}

export const lockfileChange: LockfileChange = {
  filePath: "package-lock.json",
  packageName: "@vue-lab/admin-app",
  addedPackages: ["@vue-lab/design-system"],
  removedPackages: [],
  versionChanged: true,
};

export function requiresLockfileReview(change: LockfileChange): boolean {
  return (
    change.addedPackages.length > 0 ||
    change.removedPackages.length > 0 ||
    change.versionChanged
  );
}

export function countLockfilePackageMovement(change: LockfileChange): number {
  return change.addedPackages.length + change.removedPackages.length;
}

