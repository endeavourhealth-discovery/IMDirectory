/* globals gauge */

const { pw } = require("../playwright");
const assert = require("node:assert");

step("Click account menu logged out", async () => {
  await pw.page.waitForSelector('[data-testid="account-menu"]');
  await pw.page.locator('[data-testid="account-menu"]').click();
});

step("Click account menu", async () => {
  await pw.page.waitForSelector('[data-testid="account-menu-logged-in"]');
  await pw.page.locator('[data-testid="account-menu-logged-in"]').click();
});

step("Click <text> in account menu", async text => {
  await pw.page.locator("#account-menu").locator("span").filter({ hasText: text }).click();
  await pw.page.waitForLoadState("networkidle");
});

step("URL contains <text>", async text => {
  await pw.page.waitForURL(`**${text}**`);
});

step("Confirm dialog", async () => {
  await pw.page.locator(".alert-confirm").click();
});

step("Login button is displayed", async () => {
  await pw.page.waitForSelector('[data-testid="account-menu"]');
  await pw.page.locator('[data-testid="account-menu"]').click();
  await pw.page.locator("#account-menu").locator("span").filter({ hasText: "Login" }).waitFor({ state: "visible" });
});
