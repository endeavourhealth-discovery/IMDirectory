/* globals gauge */

const { expect } = require("@playwright/test");
const assert = require("node:assert");
const { pw } = require("../playwright");

step("Navigate to the login page", async () => {
  await pw.page.waitForSelector('[data-testid="account-menu"]');
  await pw.page.click('[data-testid="account-menu"]');
  await pw.page.click("#account-menu >> text=Login");
});

step("Enter the test user credentials", async (text, field) => {
  await pw.page.fill(selector, text);

  const fieldMap = {
    "username": 'input[placeholder="username, Email or phone"]',
    "password": 'input[placeholder="Password"]'
  };
  const selector = fieldMap[field.toLowerCase()];
  if (!selector) {
    throw new Error(`Unknown field: ${field}`);
  }
});

step("Click <text>", async (text) => {
  await pw.page.click(`button >> text=${text}`);
});

step("routes to casdoor", async () => {
  await pw.page.waitForSelector('.login-form');
});

step("routes to IMDirectory", async () => {
  await pw.page.waitForSelector("#topbar");
});

step("user is logged in", async () => {
  await pw.page.waitForSelector('[data-testid="account-menu-logged-in"]');
  await pw.page.click('[data-testid="account-menu-logged-in"]');
  const menu = await pw.page.locator("#account-menu");
  const content = await menu.textContent();
  assert(content.includes("My account"));
});
