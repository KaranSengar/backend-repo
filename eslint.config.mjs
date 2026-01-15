// @ts-check
import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import globals from "globals";

export default defineConfig(
  eslint.configs.recommended,
  {
    ignores: ["dist/**", "node_modules/**", "eslint.config.mjs"],
  },

  {
    files: ["src/**/*.ts"],
    languageOptions: {
      globals: {
        ...globals.node,
        // Jest globals
        describe: "readonly",
        it: "readonly",
        expect: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // @ts-ignore
      ...tseslint.configs.recommendedTypeChecked.rules,
    },
  },
);
