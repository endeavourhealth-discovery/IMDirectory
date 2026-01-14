/* globals gauge */

const assert = require("node:assert");
const { pw } = require("../playwright");

step("Open filters", async () => {
  await pw.page.locator('[data-testid="filters-open-button"]').click();
  await pw.page.locator('[data-testid="filters"]').waitFor({ state: "visible"});
});

step("Close filters", async () => {
  await pw.page.locator('[data-testid="filters-open-button"]').click();
  await pw.page.locator('[data-testid="filters"]').waitFor({ state: "hidden"});
});

step("Select concept type <text>", async (text) => {
  await pw.page.waitForSelector('[data-testid="concept-type-multiselect"] .p-multiselect-chip');
  await pw.page.locator('[data-testid="concept-type-multiselect"] .p-multiselect-dropdown').click();
  await pw.page.locator(".p-multiselect-overlay li").filter({ hasText: text }).first().click();
});

step("Query tab is active", async () => {
  const activeTab = pw.page.locator("#viewer-tabs").locator(".p-tab-active").filter({ hasText: "Query" });
  await activeTab.waitFor({ state: "visible"});
});

step("Query container displays", async () => {
  const container = pw.page.locator("#query-container").locator(".rec-query-display");
  await container.waitFor({ state: "visible"});
});
