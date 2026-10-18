export type LandmarkKind = "header" | "nav" | "main" | "aside" | "footer";

export interface LandmarkRegion {
  readonly id: string;
  readonly kind: LandmarkKind;
  readonly label: string;
}

export interface HeadingRecord {
  readonly id: string;
  readonly rank: number;
  readonly text: string;
}

export const chapterLandmarks: ReadonlyArray<LandmarkRegion> = [
  { id: "chapter-15-banner", kind: "header", label: "Chapter introduction" },
  { id: "chapter-15-navigation", kind: "nav", label: "Chapter demo navigation" },
  { id: "chapter-15-main", kind: "main", label: "Chapter 15 interactive demos" },
  { id: "chapter-15-verification", kind: "aside", label: "Verification evidence" },
  { id: "chapter-15-footer", kind: "footer", label: "Chapter completion notes" },
];

export function hasMainLandmark(regions: ReadonlyArray<LandmarkRegion>): boolean {
  return regions.some((region) => region.kind === "main");
}

export function findHeadingRankSkips(
  headings: ReadonlyArray<HeadingRecord>,
): ReadonlyArray<string> {
  const failures: Array<string> = [];

  headings.reduce((previousRank, heading) => {
    if (heading.rank > previousRank + 1) {
      failures.push(heading.id);
    }

    return heading.rank;
  }, 0);

  return failures;
}

export function createSkipLinkTarget(targetId: string): string {
  return `#${targetId}`;
}

