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

step("Fill out <n> instance of age value <equality>, <value>", async (n, equality, value) => {
  const reg = new RegExp("^" + equality + "$");
  const container = pw.page.locator(".value-input-container").nth(parseInt(n));
  await container.locator(".p-inputwrapper").filter({ hasText: "equal to" }).click();
  await pw.page.waitForTimeout(2000);
  await pw.page.locator(".p-select-option").filter({ hasText: reg }).click();
  await container.locator(".p-inputtext").fill(value);
});

step("Fill in description with <text>", async text => {
  await pw.page.locator(".match-content-display").locator(".p-inputtext").nth(0).fill(text);
});

step("Search for <text> and select", async text => {
  await pw.page.locator(".match-content-display").locator("#autocomplete-search").nth(0).fill(text);
  await pw.page.waitForTimeout(3000);
  await pw.page.locator(".p-listbox-option").filter({ hasText: "Prediabetes (disorder)" }).click();
  await pw.page.locator(".p-inputwrapper").filter({ hasText: "+ children" }).click();
  await pw.page.waitForTimeout(2000);
  await pw.page.locator(".p-select-option").filter({ hasText: "children only" }).click();
});

step("Check <n> match checkbox", async n => {
  await pw.page.locator(".match-clause-inner").nth(parseInt(n)).locator(".p-checkbox-input").check();
});

step("test", async () => {
  await pw.page.locator(".p-select-opon").click();
});
