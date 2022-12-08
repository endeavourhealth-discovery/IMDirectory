import { defineConfig } from "vite";
import path from "path";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    outDir: "dist",
    sourcemap: true,
    lib: {
      formats: ["cjs", "es"],
      entry: {
        "im-library": "./src/index.ts",
        config: "./src/config/index.ts",
        constants: "./src/constants/index.ts",
        enums: "./src/enums/index.ts",
        helpers: "./src/helpers/index.ts",
        interfaces: "./src/interfaces/index.ts",
        models: "./src/models/index.ts",
        vocabulary: "./src/vocabulary/index.ts"
      }
    },
    rollupOptions: { output: { preserveModules: true, exports: "named" }, external: ["d3", "uuid-random", "lodash"] }
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") }
  },
  tests: {
    globals: true,
    coverage: {
      reporter: ["text", "lcov"]
    },
    setupFiles: "./tests/setupTests.js"
  },
  plugins: [dts({ outputDir: "./dist/types" })]
});
