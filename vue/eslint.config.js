import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import pluginVue from "eslint-plugin-vue";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: [
      "coverage/**",
      "dist/**",
      "node_modules/**",
      "**/.nuxt/**",
      "**/.output/**",
      "playwright-report/**",
      "test-results/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs["flat/recommended"],
  {
    files: ["**/*.{js,mjs,cjs,ts,vue}"],
    languageOptions: {
      globals: {
        AbortController: "readonly",
        console: "readonly",
        document: "readonly",
        Element: "readonly",
        Event: "readonly",
        File: "readonly",
        FormData: "readonly",
        Headers: "readonly",
        HTMLElement: "readonly",
        HTMLInputElement: "readonly",
        HTMLSelectElement: "readonly",
        KeyboardEvent: "readonly",
        localStorage: "readonly",
        MouseEvent: "readonly",
        navigator: "readonly",
        process: "readonly",
        Request: "readonly",
        Response: "readonly",
        setTimeout: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
        window: "readonly",
      },
      parserOptions: {
        parser: tseslint.parser,
        sourceType: "module",
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "vue/multi-word-component-names": "off",
      "vue/v-bind-style": "off",
    },
  },
  {
    files: ["nuxt-labs/**/app/**/*.{ts,vue}"],
    languageOptions: {
      globals: {
        $fetch: "readonly",
        clearError: "readonly",
        computed: "readonly",
        createError: "readonly",
        definePageMeta: "readonly",
        navigateTo: "readonly",
        onMounted: "readonly",
        reactive: "readonly",
        useAsyncData: "readonly",
        useFetch: "readonly",
        useHead: "readonly",
        useRoute: "readonly",
        useRuntimeConfig: "readonly",
        useSeoMeta: "readonly",
        useState: "readonly",
      },
    },
  },
  {
    files: ["nuxt-labs/chapter-12-nuxt-fullstack-boundary-lab/app/**/*.{ts,vue}"],
    languageOptions: {
      globals: {
        useBrowserViewport: "readonly",
        useProductDetail: "readonly",
        useProductList: "readonly",
        useSafeNow: "readonly",
      },
    },
  },
  {
    files: ["nuxt-labs/chapter-13-nuxt-advanced-production-lab/app/**/*.{ts,vue}"],
    languageOptions: {
      globals: {
        queryCollection: "readonly",
        toContentCardItem: "readonly",
        useAccountProfile: "readonly",
        useAdminReport: "readonly",
        useContentNavigation: "readonly",
        useGalleryImage: "readonly",
        useGalleryImages: "readonly",
        useLayerTheme: "readonly",
        useLoginForm: "readonly",
        useSessionStatus: "readonly",
        useUserSession: "readonly",
      },
    },
  },
  eslintConfigPrettier,
];
