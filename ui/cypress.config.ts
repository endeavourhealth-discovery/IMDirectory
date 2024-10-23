import { defineConfig } from "cypress";
import "dotenv/config";
import awsConfig from "./src/aws-exports";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:8082",
    setupNodeEvents(on, config) {
      on("before:browser:launch", (browser, launchOptions) => {
        if (browser.family === "chromium") {
          launchOptions.args.push("--disable-gpu");
        }
        return launchOptions;
      });
    }
  },
  env: { CYPRESS_LOGIN_USERNAME: process.env.CYPRESS_LOGIN_USERNAME, CYPRESS_LOGIN_PASSWORD: process.env.CYPRESS_LOGIN_PASSWORD, awsConfig: awsConfig },
  reporter: "junit",
  reporterOptions: {
    mochaFile: "cypress/e2e-tests.xml"
  }
});
