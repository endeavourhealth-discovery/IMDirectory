import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import { esbuildCommonjs } from "@originjs/vite-plugin-commonjs";
import * as path from "path";
import ConditionalCompile from "vite-plugin-conditional-compiler";

export default defineConfig({
  plugins: [ConditionalCompile(), vue()],
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
  },
  optimizeDeps: {
    esbuildOptions: {
      plugins: [esbuildCommonjs(["google-palette"])]
    }
  },
  build: { target: "esnext" },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @use "./node_modules/primevue/resources/primevue.min.css";
          @use "./node_modules/primeflex/primeflex.css";
          @import "./src/assets/layout/sass/_mixins.scss";
          @import "./src/assets/layout/_variables.scss";
        `
      }
    }
  },
  resolve: {
    dedupe: ["vue"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@im-library": path.resolve(__dirname, "./../im_library/src"),
      "./runtimeConfig": "./runtimeConfig.browser"
    }
  },
  test: {
    globals: true,
    environment: "jsdom",
    environmentOptions: {
      jsdom: {
        url: "http://localhost"
      }
    },
    coverage: {
      reporter: ["text", "lcov"]
    },
    setupFiles: "./tests/setupTests.js"
  },
  server: {
    port: 8082,
    proxy: {
      "/nodeapi": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
        ws: true,
        rewrite: p => p.replace(/^\/nodeapi/, "")
      },
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
