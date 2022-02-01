module.exports = {
  preset: "@vue/cli-plugin-unit-jest/presets/typescript-and-babel",
  globals: {},
  transform: {
    "^.+\\.vue$": "vue-jest"
  },
  transformIgnorePatterns: ["<rootDir>/node_modules/(?!primevue|d3|d3-array|internmap|delaunator|robust-predicates)"],
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.{js,vue,ts}",
    "!src/main.ts", // No need to cover bootstrap file
    "!src/aws-exports.js",
    "!**/@types/**",
    "!**/discovery-syntax/**",
    "!**/typings/**"
  ],
  setupFiles: ["<rootDir>/.jest/setEnvVars.js"]
};
