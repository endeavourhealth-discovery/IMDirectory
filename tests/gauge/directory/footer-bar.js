/* globals gauge */

const assert = require("node:assert");
const { pw } = require("../playwright");

step("Click footer link <text>", async (text) => {
  await pw.page.waitForSelector("#footer-bar");
  await pw.page.locator(".footer-link").filter({ hasText: text }).click();
});

step("Title <text> is displayed", async (text) => {
  const titleElement = pw.page.locator(".topbar-content > .title > strong");
  const titleText = await titleElement.textContent();
  assert.strictEqual(titleText, text);
});

step("Click cookie settings button", async () => {
  await pw.page.waitForSelector("#footer-bar");
  await pw.page.locator('[data-testid="cookie-settings-button"]').click();
});

step("Cookie settings drawer is displayed", async () => {
  const drawer = pw.page.locator(".p-drawer");
  await drawer.waitFor({ state: "visible"});
  const heading = drawer.locator("h1");
  const text = await heading.textContent();
  assert.strictEqual(text, "Our use of cookies");
});
