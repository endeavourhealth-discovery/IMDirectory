import { defineConfig } from "vitest/config";
import { VitePluginNode } from "vite-plugin-node";
import * as path from "path";

export default defineConfig({
  server: {
    port: 3000
  },
  plugins: [
    ...VitePluginNode({
      adapter: "express",
      appPath: "./src/server.ts",
      exportName: "viteNodeApp",
      tsCompiler: "esbuild",
      swcOptions: {}
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@im-library": path.resolve(__dirname, "./../im_library/src"),
      "./runtimeConfig": "./runtimeConfig.browser"
    }
  },
  test: {
    globals: true,
    environment: "happy-dom",
    coverage: {
      reporter: ["text", "lcov"]
    },
    setupFiles: "./tests/setupTests.js"
  }
});
