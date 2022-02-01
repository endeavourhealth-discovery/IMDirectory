module.exports = {
  root: true,

  env: {
    node: true
  },

  extends: [
    "plugin:vue/vue3-essential",
    "eslint:recommended",
    "@vue/typescript/recommended",
    "@vue/prettier",
    "@vue/prettier/@typescript-eslint",
    "plugin:cypress/recommended",
    "@vue/typescript"
  ],

  plugins: ["prettier"],

  parserOptions: {
    ecmaVersion: 2020,
    parser: "@typescript-eslint/parser"
  },

  ignorePatterns: ["src/discovery-syntax/*", "tests/*"],

  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-unused-vars": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-use-before-define": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    "@typescript-eslint/no-var-requires": 0,
    "@typescript-eslint/no-explicit-any": "off"
  }
};
