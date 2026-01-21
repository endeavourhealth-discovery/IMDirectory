/* globals gauge */

const assert = require("node:assert");
const { pw } = require("../playwright");

step("Set tab is active", async () => {
  const activeTab = pw.page.locator("#viewer-tabs").locator(".p-tab-active").filter({ hasText: "Set" });
  await activeTab.waitFor({ state: "visible"});
});

step("Click set download button", async () => {
  await pw.page.locator('[data-testid="set-download-button"]').click();
});

step("Select download format <text>", async (text) => {
  await pw.page.locator('[data-testid="download-by-query-options-dialog"]').filter({ hasText: text }).click();
});

step("Click download confirmation", async () => {
  await pw.page.locator('[data-testid="download-by-query-options-dialog"]').locator("button").filter({ hasText: "Download" }).click();
});
