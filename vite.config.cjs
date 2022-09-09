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
        exclude: ["im-library"]
    },
    resolve: {
        dedupe: ["vue"],
        alias: {"@": path.resolve(__dirname, "./src"), "./runtimeConfig": "./runtimeConfig.browser"}
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
        setupFiles: './tests/setupTests.js',
    },
    server: {
        proxy: {
            '/nodeapi': {
                target: 'http://127.0.0.1:3000',
                changeOrigin: true,
                secure: false,
                ws: true,
                rewrite: (p) => p.replace(/^\/nodeapi/, '')
            },
            '/imapi': {
                target: 'http://127.0.0.1:8080',
                changeOrigin: true,
                secure: false,
                ws: true,
                rewrite: (p) => p.replace(/^\/imapi/, '')
            }
        }
    }
});
