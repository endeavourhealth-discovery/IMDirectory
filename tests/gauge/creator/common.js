/* globals gauge */

const { chromium } = require("@playwright/test");
const { pw } = require("./playwright");

const BASE_URL = process.env.BASE_URL || "http://localhost:8082";

beforeScenario(async () => {
  pw.browser = await chromium.launch({
    headless: process.env.headless_chrome === "true" || false
  });
  pw.context = await pw.browser.newContext();
  pw.page = await pw.context.newPage();
  pw.page.setDefaultTimeout(5000);
  pw.page.setDefaultNavigationTimeout(5000);
});

afterScenario(async () => {
  await pw.context.close();
  await pw.browser.close();
});

step("Open IMDirectory", async () => {
  await pw.page.goto(`${BASE_URL}/`);
  await pw.page.waitForSelector('[data-testid="license-dialog"]');
  await pw.page.click('[data-testid="agree-button"]');
  await pw.page.waitForSelector("#cookies-sidebar");
  await pw.page.click('[data-testid="accept-all-cookies"]');
  await pw.page.waitForSelector("#cookies-sidebar", { state: "hidden" });
});

step("Login", async () => {
  await pw.page.waitForSelector('[data-testid="account-menu"]');
  await pw.page.click('[data-testid="account-menu"]');
  await pw.page.click("#account-menu >> text=Login");

  const username = process.env.TEST_USERNAME || "testuser";
  const password = process.env.TEST_PASSWORD || "testpass";

  await pw.page.fill('input[placeholder="username, Email or phone"]', username);
  await pw.page.fill('input[placeholder="Password"]', password);
  await pw.page.click("button >> text=Sign In");

  await pw.page.waitForSelector("#topbar", { timeout: 60000 });
});

step("Click shortcut <text>", async text => {
  await pw.page.waitForSelector("#shortcuts-container", { timeout: 60000 });
  const pagePromise = pw.context.waitForEvent("page");
  await pw.page.click("#shortcuts-container >> .shortcut >> text=" + text);
  // Switch to new tab!
  pw.page = await pagePromise;
  await pw.page.waitForLoadState("networkidle");
});

step("Click <text> button", async text => {
  await pw.page.getByRole("button", { name: text }).click();
});

step("Type <text> into <input>", async (text, input) => {
  await pw.page.getByPlaceholder(input).fill(text);
})