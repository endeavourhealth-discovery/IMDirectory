const { pw } = require("../playwright");
const { expect } = require("@playwright/test");

step("Display can be undefined", async () => {
  const container = pw.page.locator("#set-definition-container").locator("#query-display");
  await container.waitFor({ state: "visible" });
  await expect(container).toContainText("No expression or query definition found.");
});
