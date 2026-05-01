/* globals gauge */

const { pw } = require("../playwright");
const assert = require("node:assert");

step("Verify query editor is displayed", async () => {
  await pw.page.waitForSelector("#query-builder-dialog");
});

step("Check editor is prepopulated with <text>", async text => {
  const match = await pw.page.locator(".match-container").textContent();
  assert(match.includes(text));
});

step("Click delete button", async () => {
  const edit = await pw.page.locator(".delete-button");
  await edit.click();
});

step("Verify query display no longer contains clause <text>", async text => {
  const match = await pw.page.locator(".query-display-content").textContent();
  assert(!match.includes(text));
});

step("Confirm item selected updated", async () => {
  await pw.page.waitForTimeout(2000);
});

step("Verify base type is now <text>", async text => {
  const base = await pw.page.locator(".type-of").textContent();
  assert(base.includes(text));
});

step("Fill out <n> instance of age value <equality>, <value>, <unit>", async (n, equality, value, unit) => {
  const container = pw.page.locator(".value-input-container").nth(parseInt(n));
  await container.locator(".p-inputwrapper").nth(0).click();
  await container.locator(".p-select-option").filter({ hasText: equality }).click();

  await pw.page.locator(".p-select-opon").click();
});
