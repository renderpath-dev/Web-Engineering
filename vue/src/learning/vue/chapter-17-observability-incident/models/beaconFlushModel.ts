export type FlushMethod = "send-beacon" | "fetch-keepalive" | "drop";

export interface BeaconFlushDecision {
  readonly method: FlushMethod;
  readonly queued: boolean;
  readonly deliveryVerified: false;
  readonly reason: string;
}

export function decideBeaconFlush(payloadBytes: number, pageHidden: boolean): BeaconFlushDecision {
  if (payloadBytes > 64000) {
    return {
      method: "drop",
      queued: false,
      deliveryVerified: false,
      reason: "Payload is too large for a page-leave beacon model.",
    };
  }

  if (pageHidden) {
    return {
      method: "send-beacon",
      queued: true,
      deliveryVerified: false,
      reason: "Beacon can be queued during page hide, but delivery remains unknown.",
    };
  }

  return {
    method: "fetch-keepalive",
    queued: true,
    deliveryVerified: false,
    reason: "Keepalive fetch model can be used before page leave.",
  };
}
