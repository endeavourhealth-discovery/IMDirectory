import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import eslint from "@eslint/js";
import typescriptEslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import pluginCypress from "eslint-plugin-cypress/flat";
import pluginPrettier from "eslint-plugin-prettier/recommended";
import eslintPluginVueScopedCSS from "eslint-plugin-vue-scoped-css";
import css from "@eslint/css";

export default defineConfig([
  globalIgnores(["src/components/imquery/**/*"]),
  {
    files: ["src/**/*"],
    extends: [
      eslint.configs.recommended,
      ...typescriptEslint.configs.recommended,
      ...pluginVue.configs["flat/essential"],
      ...eslintPluginVueScopedCSS.configs["flat/recommended"],
      pluginCypress.configs.recommended,
      css.configs.recommended,
      pluginPrettier
    ],
    languageOptions: {
      globals: {
        ...globals.browser
      },
      ecmaVersion: 2020,
      sourceType: "script",
      parserOptions: {
        parser: "@typescript-eslint/parser"
      }
    },

    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "no-console": "off",
      "no-unused-vars": "off",
      "no-use-before-define": "off",
      "no-debugger": "off",
      "vue/multi-word-component-names": "off",
      "no-redeclare": "off"
    }
  }
]);
