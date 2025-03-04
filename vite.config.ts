import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import { esbuildCommonjs } from "@originjs/vite-plugin-commonjs";
import * as path from "path";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  optimizeDeps: {
    esbuildOptions: {
      plugins: [esbuildCommonjs(["google-palette"])]
    }
  },
  build: { target: "esnext" },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
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
  },
  server: {
    port: 8082,
    proxy: {
      "/imapi": {
        target: "http://127.0.0.1:8080",
        changeOrigin: true,
        secure: false,
        ws: true,
        rewrite: p => p.replace(/^\/imapi/, "")
      }
    }
  }
});
