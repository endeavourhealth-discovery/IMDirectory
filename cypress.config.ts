import { defineConfig } from "cypress";
import "dotenv/config";
import { addCucumberPreprocessorPlugin } from "@badeball/cypress-cucumber-preprocessor";
import createBundler from "@bahmutov/cypress-esbuild-preprocessor";
import { createEsbuildPlugin } from "@badeball/cypress-cucumber-preprocessor/esbuild";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:8082",
    supportFile: "cypress/support/e2e.ts",
    async setupNodeEvents(on, config) {
      await addCucumberPreprocessorPlugin(on, config);

      on(
        "file:preprocessor",

        // FIX: This is the esbuild version, not Vite
        createBundler({
          plugins: [createEsbuildPlugin(config)]
        })
      );

      on("before:browser:launch", (browser, launchOptions) => {
        if (browser.family === "chromium") {
          launchOptions.args.push("--disable-gpu");
        }
        return launchOptions;
      });

      return config;
    },
    defaultCommandTimeout: 10000,
    experimentalRunAllSpecs: true,
    specPattern: ["cypress/e2e/**/*.feature", "cypress/e2e/**/*.cy.*"],
    fixturesFolder: "cypress"
  },
  env: { CYPRESS_LOGIN_USERNAME: process.env.CYPRESS_LOGIN_USERNAME, CYPRESS_LOGIN_PASSWORD: process.env.CYPRESS_LOGIN_PASSWORD },
  reporter: "junit",
  reporterOptions: {
    mochaFile: "cypress/e2e-tests.xml"
  }
});
