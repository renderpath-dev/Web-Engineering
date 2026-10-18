export interface DynamicRecord {
  readonly [key: string]: string | undefined;
}

export interface ChildCapability {
  readonly id: string;
  readonly canFocus: boolean;
}

export interface ChildRegistry {
  readonly children: ReadonlyArray<ChildCapability>;
  readonly findById: (id: string) => ChildCapability;
}

export interface CleanupOwner {
  readonly registeredLabels: ReadonlyArray<string>;
  readonly registerCleanup: (label: string) => CleanupOwner;
}

export function setReactiveField(
  record: DynamicRecord,
  key: string,
  value: string,
): DynamicRecord {
  return {
    ...record,
    [key]: value,
  };
}

export function deleteReactiveField(record: DynamicRecord, key: string): DynamicRecord {
  const nextRecord: Record<string, string | undefined> = { ...record };
  delete nextRecord[key];
  return nextRecord;
}

export function createChildRegistry(
  children: ReadonlyArray<ChildCapability>,
): ChildRegistry {
  return {
    children,
    findById(id: string): ChildCapability {
      return selectChildById(children, id);
    },
  };
}

export function selectChildById(
  children: ReadonlyArray<ChildCapability>,
  id: string,
): ChildCapability {
  const child = children.find((entry) => entry.id === id);

  if (!child) {
    throw new Error(`Missing child capability: ${id}`);
  }

  return child;
}

export function createTestMountProps<TProps extends Record<string, unknown>>(
  props: TProps,
): { readonly props: TProps } {
  return { props };
}

export function createCleanupOwner(
  registeredLabels: ReadonlyArray<string> = [],
): CleanupOwner {
  return {
    registeredLabels,
    registerCleanup(label: string): CleanupOwner {
      return createCleanupOwner([...registeredLabels, label]);
    },
  };
}
