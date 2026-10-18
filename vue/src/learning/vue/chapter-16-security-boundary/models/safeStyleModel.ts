export type ColorToken = "default" | "success" | "warning";
export type DensityToken = "comfortable" | "compact";
export type StyleReviewStatus = "allowed" | "blocked";

export interface SafeStyleInput {
  readonly colorToken: ColorToken;
  readonly backgroundToken: ColorToken;
  readonly density: DensityToken;
}

export interface StyleReview {
  readonly status: StyleReviewStatus;
  readonly style: Readonly<Record<string, string>>;
  readonly reason: string;
}

const colorValues: Readonly<Record<ColorToken, string>> = {
  default: "#213547",
  success: "#166534",
  warning: "#92400e",
};

const backgroundValues: Readonly<Record<ColorToken, string>> = {
  default: "#ffffff",
  success: "#ecfdf5",
  warning: "#fffbeb",
};

export function createSafeStyle(input: SafeStyleInput): StyleReview {
  return {
    status: "allowed",
    style: {
      color: colorValues[input.colorToken],
      backgroundColor: backgroundValues[input.backgroundToken],
      padding: input.density === "compact" ? "0.5rem" : "0.85rem",
    },
    reason: "Only reviewed design tokens are converted to inline style values.",
  };
}

export function reviewRawStyleString(rawStyle: string): StyleReview {
  return {
    status: "blocked",
    style: {},
    reason: `Raw style string length ${rawStyle.length} is not accepted.`,
  };
}
