const { pw } = require("../playwright");
const { expect } = require("@playwright/test");

step("Properties table has rows", async () => {
  await pw.page.waitForSelector(`[data-testid="grouped-display-table"]`);
  const rows = pw.page.getByTestId("grouped-display-table").locator("tr");
  const count = await rows.count();
  expect(count).toBeGreaterThan(0);
});

step("Can expand properties", async () => {
  const table = pw.page.getByTestId("grouped-display-table");
  await table.waitFor({ state: "visible" });
  const rows = table.locator("tr");
  const initialCount = await rows.count();
  const expandButton = table.locator(".p-datatable-row-toggle-button").first();
  await expandButton.click();
  await pw.page.waitForFunction(
    ({ selector, initialCount }) => {
      return document.querySelectorAll(selector).length > initialCount;
    },
    { selector: `[data-testid="grouped-display-table"] tr`, initialCount }
  );
  const expandedCount = await rows.count();
  expect(expandedCount).toBeGreaterThan(initialCount);
});
