import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import pluginCypress from "eslint-plugin-cypress/flat";
import pluginPrettier from "eslint-plugin-prettier/recommended";
import eslintPluginVueScopedCSS from "eslint-plugin-vue-scoped-css";
import css from "@eslint/css";
import vueParser from "vue-eslint-parser";

export default defineConfig([
  globalIgnores(["src/components/imquery/", "cypress/snapshots/"]),
  {
    files: ["src/**/*.ts", "src/**/*.js", "cyress/**/*.ts", "cypress/**/*.js", "tests/**/*.ts", "tests/**/*.js"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...pluginVue.configs["flat/essential"],
      ...eslintPluginVueScopedCSS.configs["flat/base"],
      pluginCypress.configs.recommended,
      css.configs.recommended,
      pluginPrettier
    ],
    plugins: {
      "typescript-eslint": tseslint.plugin
    },
    languageOptions: {
      globals: {
        ...globals.browser
      },
      ecmaVersion: 2020,
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        project: "./tsconfig.json",
        extraFileExtensions: [".vue"],
        sourceType: "module"
      }
    },

    rules: {
      "cypress/no-unnecessary-waiting": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-floating-promises": "warn",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/require-await": "off",
      "no-console": "off",
      "no-debugger": "off",
      "no-redeclare": "off",
      "no-unused-vars": "off",
      "no-use-before-define": "off",
      "require-await": "warn",
      "vue/multi-word-component-names": "off",
      "vue/no-mutating-props": "off" // TODO: Remove!!!
    }
  }
]);
