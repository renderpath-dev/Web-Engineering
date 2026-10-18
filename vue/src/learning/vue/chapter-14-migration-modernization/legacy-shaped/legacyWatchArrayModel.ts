export interface LegacyWatchArrayAssumption {
  readonly sourceName: string;
  readonly mutationName: string;
  readonly expectedTrigger: boolean;
}

export const legacyWatchArrayAssumptions: ReadonlyArray<LegacyWatchArrayAssumption> =
  [
    {
      sourceName: "selectedProfiles",
      mutationName: "push",
      expectedTrigger: true,
    },
    {
      sourceName: "selectedProfiles",
      mutationName: "splice",
      expectedTrigger: true,
    },
  ];

export function getLegacyWatchArrayAssumption(
  mutationName: string,
): LegacyWatchArrayAssumption {
  const assumption = legacyWatchArrayAssumptions.find(
    (entry) => entry.mutationName === mutationName,
  );

  if (!assumption) {
    throw new Error(`Missing watch array mutation: ${mutationName}`);
  }

  return assumption;
}
