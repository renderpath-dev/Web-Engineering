import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: ["dist", "**/*.ts", "**/*.tsx"],
  },
  {
    ...js.configs.recommended,
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
      },
    },
  },
];
