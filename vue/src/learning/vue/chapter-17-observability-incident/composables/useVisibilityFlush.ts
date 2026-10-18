import { ref } from "vue";
import { decideBeaconFlush, type BeaconFlushDecision } from "../models/beaconFlushModel";

type VisibilityDocument = Pick<Document, "addEventListener" | "removeEventListener" | "visibilityState">;

export function useVisibilityFlush(payloadBytes: number) {
  const lastDecision = ref<BeaconFlushDecision>(decideBeaconFlush(payloadBytes, false));

  function registerVisibilityFlush(
    documentRef: VisibilityDocument = document,
  ): () => void {
    const handleVisibilityChange = (): void => {
      lastDecision.value = decideBeaconFlush(
        payloadBytes,
        documentRef.visibilityState === "hidden",
      );
    };

    documentRef.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      documentRef.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }

  return {
    lastDecision,
    registerVisibilityFlush,
  };
}
