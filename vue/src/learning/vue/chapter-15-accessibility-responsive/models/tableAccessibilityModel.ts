export type SortDirection = "ascending" | "descending";

export interface ResultRow {
  readonly id: string;
  readonly name: string;
  readonly status: string;
  readonly score: number;
}

export interface SortState {
  readonly column: "name" | "score";
  readonly direction: SortDirection;
}

export const initialResultRows: ReadonlyArray<ResultRow> = [
  { id: "result-1", name: "Audit dashboard", status: "Ready", score: 92 },
  { id: "result-2", name: "Modal workflow", status: "Review", score: 81 },
  { id: "result-3", name: "Responsive table", status: "Ready", score: 88 },
];

export function sortRows(
  rows: ReadonlyArray<ResultRow>,
  state: SortState,
): ReadonlyArray<ResultRow> {
  const multiplier = state.direction === "ascending" ? 1 : -1;

  return [...rows].sort((left, right) => {
    const leftValue = left[state.column];
    const rightValue = right[state.column];

    if (leftValue < rightValue) {
      return -1 * multiplier;
    }

    if (leftValue > rightValue) {
      return 1 * multiplier;
    }

    return 0;
  });
}

export function toggleSortDirection(direction: SortDirection): SortDirection {
  return direction === "ascending" ? "descending" : "ascending";
}

export function createSortButtonLabel(column: string, direction: SortDirection): string {
  return `Sort by ${column}, ${direction}`;
}

