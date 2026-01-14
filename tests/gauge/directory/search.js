/* globals gauge */

const assert = require("node:assert");
const { pw } = require("../playwright");

step("Results page contains rows greater than <num>", async (num) => {
  const rows = pw.page.locator(".p-datatable-selectable-row");
  const count = await rows.count();
  assert(count > Number(num), `Expected more than ${num} rows, but got ${count}`);
});

step("Click next page button", async () => {
  await pw.page.locator(".p-paginator-next").click();
  await pw.page.waitForTimeout(1000);
  const mask = pw.page.locator(".p-datatable-mask");
  await mask.waitFor({ state: "hidden"});
  await pw.page.waitForTimeout(1000);
});

step("Page results are different from previous page", async () => {
  const rows = pw.page.locator(".p-datatable-selectable-row");
  const texts = [];
  for (const row of await rows.all()) {
    texts.push(await row.innerText());
  }
  pw.context.pageResults = texts;
});

step("Filter <filterType> by <filterValue>", async (filterType, filterValue) => {
  const filterMap = {
    "status": "status-filter",
    "scheme": "scheme-filter",
    "type": "type-filter"
  };
  const testId = filterMap[filterType.toLowerCase()];
  if (!testId) {
    throw new Error(`Unknown filter type: ${filterType}`);
  }
  
  await pw.page.locator(`[data-testid="${testId}"]`).locator(".p-multiselect-dropdown").click();
  await pw.page.locator(".p-multiselect-overlay").filter({ hasText: filterValue }).click();
  await pw.page.locator(`[data-testid="${testId}"]`).locator(".p-multiselect-dropdown").click();
  await pw.page.waitForTimeout(1000);
  const mask = pw.page.locator(".p-datatable-mask");
  await mask.waitFor({ state: "hidden"});
  await pw.page.waitForTimeout(1000);
});

step("Total results count changed", async () => {
  const resultsElement = pw.page.locator('[data-testid="total-results"]');
  const newCount = await resultsElement.textContent();
  const previousCount = pw.context.resultsCount;
  assert.notStrictEqual(newCount.trim(), previousCount, "Results count should have changed");
});

step("Store current total results count", async () => {
  const resultsElement = pw.page.locator('[data-testid="total-results"]');
  const count = await resultsElement.textContent();
  pw.context.resultsCount = count.trim();
});
