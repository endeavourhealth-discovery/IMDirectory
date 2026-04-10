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
    prismjs({ languages: ["sql"], theme: "default", css: true, plugins: ["line-numbers", "normalize-whitespace"] }),
    {
      name: "prismjs-global-fix",
      transform(code: string, id: string) {
        if (/node_modules\/prismjs\/components\/prism-/.test(id)) {
          return {
            code: `import _prism from 'prismjs';\nvar Prism = _prism;\n${code}`,
            map: null
          };
        }
      }
    }
  ],
  optimizeDeps: {
    include: ["prismjs", "prismjs/components/*.js"],
    rolldownOptions: {
      plugins: [esbuildCommonjs(["google-palette"])]
    }
  },
  build: {
    target: "esnext",
    outDir: ".output",
    emptyOutDir: true
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "./runtimeConfig": "./runtimeConfig.browser"
    },
    dedupe: ["vue", "primevue", "@primeuix/themes", "pinia"]
  },
  test: {
    dir: "./tests",
    globals: true,
    environment: "happy-dom",
    coverage: {
      include: ["./tests/**/*.{js,ts}"],
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
