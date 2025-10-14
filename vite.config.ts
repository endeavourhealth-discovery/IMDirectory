import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import { esbuildCommonjs } from "@originjs/vite-plugin-commonjs";
import * as path from "path";
import tailwindcss from "@tailwindcss/vite";
import Components from "unplugin-vue-components/vite";
import { PrimeVueResolver } from "@primevue/auto-import-resolver";
import prismjs from "vite-plugin-prismjs";

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    Components({ resolvers: [PrimeVueResolver()], dts: true, directoryAsNamespace: true, collapseSamePrefixes: true }),
    prismjs({ languages: ["sql"], theme: "default", css: true, plugins: ["line-numbers", "normalize-whitespace"] })
  ],
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
      provider: "v8",
      reporter: ["text", "lcov"]
    },
    setupFiles: "./tests/setupTests.js"
  },
  server: {
    port: 8082,
    hmr: {
      overlay: false
    },
    proxy: {
      "/imapi": {
        target: "http://127.0.0.1:8080",
        changeOrigin: true,
        secure: false,
        ws: true,
        rewrite: p => p.replace(/^\/imapi/, "")
      }
    }
  },
  preview: {
    port: 8082,
    cors: true,
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
