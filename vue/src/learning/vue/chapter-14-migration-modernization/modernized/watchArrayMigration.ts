export interface ArrayWatchChange {
  readonly replaced: boolean;
  readonly mutated: boolean;
  readonly deep: boolean;
}

export function shouldArrayWatcherRun(change: ArrayWatchChange): boolean {
  if (change.replaced) {
    return true;
  }

  return change.mutated && change.deep;
}

export function describeArrayWatchMode(deep: boolean): "replacement-only" | "deep-mutation" {
  return deep ? "deep-mutation" : "replacement-only";
}

export function calculateVisibleItemCount(
  items: ReadonlyArray<{ readonly visible: boolean }>,
): number {
  return items.filter((item) => item.visible).length;
}
