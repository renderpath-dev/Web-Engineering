import { computed, ref } from "vue";
import {
  createThemeCssDeclarations,
  type ThemeVariantName,
} from "../models/themeVariantModel";

export function useThemeTokens(initialVariant: ThemeVariantName = "light") {
  const currentVariant = ref<ThemeVariantName>(initialVariant);

  const cssText = computed(() =>
    createThemeCssDeclarations(currentVariant.value).join("\n"),
  );

  function setThemeVariant(nextVariant: ThemeVariantName): void {
    currentVariant.value = nextVariant;
  }

  return {
    currentVariant,
    cssText,
    setThemeVariant,
  };
}
