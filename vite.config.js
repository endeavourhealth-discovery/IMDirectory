import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
const path = require("path");
import { esbuildCommonjs } from "@originjs/vite-plugin-commonjs";

export default defineConfig({
  plugins: [vue()],
  optimizeDeps: {
    esbuildOptions: {
      plugins: [esbuildCommonjs(["google-palette"])]
    },
    exclude: [
      'im-library',
    ]
  },
  resolve: {
    dedupe: ["vue"],
    alias: { "@": path.resolve(__dirname, "./src"), "./runtimeConfig": "./runtimeConfig.browser" }
  },
  test: {
    globals: true,
    environment: "jsdom",
    environmentOptions: {
      jsdom: {
        url: "http://localhost"
      }
    }
  }
});
