export type MotionPreference = "no-preference" | "reduce";

export interface MotionPolicy {
  readonly preference: MotionPreference;
  readonly transitionName: string;
  readonly durationMs: number;
  readonly contentVisible: boolean;
}

export function createMotionPolicy(preference: MotionPreference): MotionPolicy {
  if (preference === "reduce") {
    return {
      preference,
      transitionName: "no-motion",
      durationMs: 0,
      contentVisible: true,
    };
  }

  return {
    preference,
    transitionName: "fade-slide",
    durationMs: 160,
    contentVisible: true,
  };
}

export function keepsContentVisible(policy: MotionPolicy): boolean {
  return policy.contentVisible;
}

