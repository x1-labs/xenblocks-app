import { fileURLToPath } from "node:url";
import { includeIgnoreFile } from "@eslint/compat";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import jsxA11y from "eslint-plugin-jsx-a11y";

// Untracked-but-present files would otherwise be linted locally and not in CI.
// Reading .gitignore keeps the two scopes identical rather than duplicating
// those paths here.
const gitignorePath = fileURLToPath(new URL(".gitignore", import.meta.url));

export default tseslint.config(
  includeIgnoreFile(gitignorePath),

  js.configs.recommended,
  tseslint.configs.recommended,

  // Application source: browser globals, React rules.
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      globals: globals.browser,
    },
    extends: [
      // `configs.flat.recommended` is the flat-config entrypoint; the
      // similarly-named `recommended-latest` is still eslintrc-shaped and
      // ESLint 10 rejects it.
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      jsxA11y.flatConfigs.recommended,
    ],
  },

  // Config files at the repo root execute in Node, not the browser.
  {
    files: ["*.config.{ts,js,mjs}"],
    languageOptions: {
      globals: globals.node,
    },
  },

  {
    rules: {
      // `_`-prefixed bindings are the documented way to mark something
      // intentionally unused.
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      // Warn rather than error: the hard ban is stated as an invariant in
      // AGENTS.md, and a warning-free run is the bar. Erroring here would make
      // an in-progress edit unrunnable.
      "@typescript-eslint/no-explicit-any": "warn",
    },
  }
);
