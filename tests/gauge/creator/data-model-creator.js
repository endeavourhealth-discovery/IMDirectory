/* globals gauge */

const { expect } = require("@playwright/test");
const assert = require("node:assert");
const { pw } = require("../playwright");


step("Verify Creator layout is displayed", async () => {
  await pw.page.waitForSelector(".creator-layout-container", { timeout: 60000 });
});

step("Entity combo box is empty", async () => {
  const value = await pw.page.locator('[data-testid="entity-combo-box"]').locator('input').inputValue();
  assert.strictEqual(value, "");
});

step("IRI builder dropdown is not empty", async () => {
  await pw.page.waitForSelector('.iri-builder-container', { timeout: 60000 });
  const element = await pw.page.locator('[data-testid="iri-builder-dropdown"]');
  await expect(element).not.toBeEmpty();
});

step("IRI builder input is empty", async () => {
  const value = await pw.page.locator('[data-testid="iri-builder-input"]').inputValue();
  assert.strictEqual(value, "");
});

step("Text display is disabled and empty", async () => {
  const element = pw.page.locator('[data-testid="text-display"]');
  const isDisabled = await element.evaluate(el => el.disabled);
  assert.strictEqual(isDisabled, true);
  const value = await element.inputValue();
  assert.strictEqual(value, "");
});

step("Text inputs are empty", async () => {
  const elements = await pw.page.locator('[data-testid="text-input"]').all();
  for (const el of elements) {
    const value = await el.inputValue();
    assert.strictEqual(value, "");
  }
});

step("HTML input is empty", async () => {
  const value = await pw.page.locator('[data-testid="html-input"]').inputValue();
  assert.strictEqual(value, "");
});

step("Status is <text>", async (text) => {
  const actual = await pw.page.locator('[data-testid="entity-single-dropdown"]').textContent();
  assert.strictEqual(actual, text);
});

step("Search inputs are empty", async () => {
  const elements = await pw.page.locator('[data-testid="search-input"]').all();
  for (const el of elements) {
    const value = await el.inputValue();
    assert.strictEqual(value, "");
  }
});

step("Property builder has no properties", async () => {
  const properties = await pw.page.locator('[data-testid="property-builder"] .property').all();
  assert.strictEqual(properties.length, 0);
});

step("Type <text> into IRI builder input", async (text) => {
  await pw.page.fill('[data-testid="iri-builder-input"]', text);
});

step("Code has value <text>", async (text) => {
  await pw.page.locator('[data-testid="text-display"]').textContent(text)
});

step("IRI builder container contains <iri>", async (iri) => {
  const text = await pw.page.locator(".iri-builder-container").textContent();
  assert(text.includes(iri));
});

step("Select status <text>", async (text) => {
  await pw.page.waitForSelector(".entity-single-dropdown-container", { timeout: 60000 });
  await pw.page.click('[data-testid="entity-single-dropdown"]');
  await pw.page.click(".p-select-option >> text=" + text);
});

step("<dropdown> array builder has <num> items", async (dropdown, num) => {
  const div = await pw.page
    .locator(".array-builder-container >> text=" + dropdown)
    .locator(".. >> .. >> .children-container >> .builder-child")
    .all();

  assert.strictEqual(div.length, Number.parseInt(num));
});

step("Search <text> in <dropdown> array builder", async (text, dropdown) => {
  await pw.page.fill(".array-builder-container >> text=" + dropdown + " >> .. >> .. >> input", text);
});

step("Select first listbox item", async () => {
  await pw.page.locator(".listbox-item").first().click();
});

step("Click add button in <dropdown> array builder", async (dropdown) => {
  const input = pw.page.locator(".array-builder-container >> text=" + dropdown + " >> .. >> ..");
  await input.locator('[data-testid="add-button"]').first().click();
});

step("Click delete button <index> in <dropdown> array builder", async (index, dropdown) => {
  const input = pw.page.locator(".array-builder-container >> text=" + dropdown + " >> .. >> ..");
  await input.locator('[data-testid="delete-button"]').nth(index).click();
});

step("Property builder has <num> properties", async (num) => {
  const properties = await pw.page.locator('[data-testid="property-builder"] .property').all();
  assert.strictEqual(properties.length, Number.parseInt(num));
})

step("Click delete property button <index>", async (index) => {
  await pw.page.locator('[data-testid="delete-property-button"]').nth(index).click();
});
