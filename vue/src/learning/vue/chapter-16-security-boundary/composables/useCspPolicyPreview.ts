import { computed, ref } from "vue";
import { buildCspPolicy, type CspMode } from "../models/cspPolicyModel";

export function useCspPolicyPreview() {
  const mode = ref<CspMode>("report-only");
  const allowImagesFromDataSource = ref(false);
  const blockEmbedding = ref(true);

  const policy = computed(() =>
    buildCspPolicy({
      mode: mode.value,
      allowImagesFromDataSource: allowImagesFromDataSource.value,
      blockEmbedding: blockEmbedding.value,
    }),
  );

  function useReportOnlyMode(): void {
    mode.value = "report-only";
  }

  function useEnforceMode(): void {
    mode.value = "enforce";
  }

  return {
    mode,
    allowImagesFromDataSource,
    blockEmbedding,
    policy,
    useReportOnlyMode,
    useEnforceMode,
  };
}
