import { defineConfig } from "vite";

export default defineConfig({
  tests: {
    coverage: {
      reporter: ["text", "lcov"],
    },
    setupFiles: "./tests/setupTests.js",
  },
});
