import { ref } from "vue";
import {
  normalizeGlobalErrorSignal,
  type GlobalErrorSignal,
} from "../models/globalErrorModel";

type BrowserErrorTarget = Pick<Window, "addEventListener" | "removeEventListener">;

export function useGlobalErrorListeners() {
  const signals = ref<ReadonlyArray<GlobalErrorSignal>>([]);

  function registerGlobalErrorListeners(target: BrowserErrorTarget = window): () => void {
    const handleError = (event: ErrorEvent): void => {
      signals.value = [
        ...signals.value,
        normalizeGlobalErrorSignal({
          kind: "window-error",
          message: event.message,
          source: event.filename || "browser-window",
        }),
      ];
    };
    const handleRejection = (event: PromiseRejectionEvent): void => {
      signals.value = [
        ...signals.value,
        normalizeGlobalErrorSignal({
          kind: "unhandled-rejection",
          reason: event.reason as unknown,
          source: "promise",
        }),
      ];
    };

    target.addEventListener("error", handleError);
    target.addEventListener("unhandledrejection", handleRejection);

    return () => {
      target.removeEventListener("error", handleError);
      target.removeEventListener("unhandledrejection", handleRejection);
    };
  }

  return {
    signals,
    registerGlobalErrorListeners,
  };
}
