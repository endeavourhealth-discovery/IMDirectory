import { defineConfig } from "cypress";
import "dotenv/config";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:8082",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    }
  },
  env: { CYPRESS_LOGIN_USERNAME: process.env.CYPRESS_LOGIN_USERNAME, CYPRESS_LOGIN_PASSWORD: process.env.CYPRESS_LOGIN_PASSWORD }
});
