
export interface MessageBoundaryDecision {
  payloadKind: "plain-object" | "array-buffer";
  mechanism: "structured-clone" | "transfer";
  ownershipAfterPostMessage: "copied" | "moved";
}

export function decideMessageBoundary(payload: unknown): MessageBoundaryDecision {
  if (payload instanceof ArrayBuffer) {
    return {
      payloadKind: "array-buffer",
      mechanism: "transfer",
      ownershipAfterPostMessage: "moved"
    };
  }

  return {
    payloadKind: "plain-object",
    mechanism: "structured-clone",
    ownershipAfterPostMessage: "copied"
  };
}
