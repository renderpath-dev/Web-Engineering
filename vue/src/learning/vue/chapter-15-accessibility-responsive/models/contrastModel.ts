export interface ContrastPair {
  readonly id: string;
  readonly foreground: string;
  readonly background: string;
  readonly ratio: number;
  readonly target: number;
}

export const contrastPairs: ReadonlyArray<ContrastPair> = [
  {
    id: "light-body-text",
    foreground: "#213547",
    background: "#ffffff",
    ratio: 11.7,
    target: 4.5,
  },
  {
    id: "dark-focus-ring",
    foreground: "#9bf2c8",
    background: "#16241f",
    ratio: 10.9,
    target: 3,
  },
  {
    id: "warning-chip",
    foreground: "#3b2300",
    background: "#ffd88a",
    ratio: 9.1,
    target: 4.5,
  },
];

export function passesContrast(pair: ContrastPair): boolean {
  return pair.ratio >= pair.target;
}

export function getContrastFailureIds(
  pairs: ReadonlyArray<ContrastPair>,
): ReadonlyArray<string> {
  return pairs.filter((pair) => !passesContrast(pair)).map((pair) => pair.id);
}

