// @ts-check

import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig([
    {
        ignores: ["dist/**", "node_modules/**"],
    },
    {
        files: ["**/*.{js,ts,mjs,cjs,mts,cts}"],
        extends: [
            js.configs.recommended,
            tseslint.configs.recommended,
        ],
    },
]);