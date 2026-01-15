import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: [
    "build/**",
    "dist/**", 
    "coverage/**",
    "node_modules/**",
    "src/tester/**",
    "**/*.config.*",
    "script/**"
  ] },
  
  js.configs.recommended,
  ...tseslint.configs.recommended,
  
  // Type-aware rules OFF rakha (simple start ke liye)
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      // YE REMOVE KAR DIYA - type checking ke liye problem
      // "@typescript-eslint/no-floating-promises": "warn",
      "no-console": "off",
    },
  }
);
 