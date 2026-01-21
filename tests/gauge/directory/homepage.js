/* globals gauge */

const assert = require("node:assert");
const { pw } = require("../playwright");

step("Landing page is displayed", async () => {
  await pw.page.waitForSelector("#landing-content");
  const spinner = pw.page.locator(".p-progressspinner");
  await spinner.waitFor({ state: "hidden"});
});

step("Suggested section exists", async () => {
  const suggested = pw.page.locator(".title").filter({ hasText: "Suggested" });
  await suggested.waitFor({ state: "visible"});
});

step("Quick links section exists", async () => {
  const quickLinks = pw.page.locator("h2").filter({ hasText: "Quick links" });
  await quickLinks.waitFor({ state: "visible"});
});

step("Favourites section exists", async () => {
  const favourites = pw.page.locator(".favourites-container").locator(".title").filter({ hasText: "Favourites" });
  await favourites.waitFor({ state: "visible"});
});

step("Right panel contains <text>", async (text) => {
  const iriLabel = pw.page.locator(".splitter-right").filter({ hasText: text });
  await iriLabel.waitFor({ state: "visible"});
  });

step("Login required message appears", async () => {
  const popup = pw.page.locator(".swal2-popup").filter({ hasText: "Please Login to continue" });
  await popup.waitFor({ state: "visible"});
});

step("Close tab", async () => {
  await pw.page.close();
  const pages = pw.context.pages();
  if (pages.length > 0) {
    pw.page = pages[pages.length - 1];
  }
});

step("Creator page title is displayed", async () => {
  const title = pw.page.locator("#topbar-content").filter({ hasText: "IM Entity Creator" });
  await title.waitFor({ state: "visible"});
});

step("UPRN page title is displayed", async () => {
  const title = pw.page.locator("#topbar-content").filter({ hasText: "ASSIGN-UPRN" });
  await title.waitFor({ state: "visible"});
});

step("Code generator page title is displayed", async () => {
  const title = pw.page.locator("#topbar-content").filter({ hasText: "Code Generator" });
  await title.waitFor({ state: "visible"});
});

step("Suggested section contains <text>", async (text) => {
  const suggested = pw.page.locator(".activity-container").filter({ hasText: text });
  await suggested.waitFor({ state: "visible"});
});

step("Click favourite button", async () => {
  await pw.page.waitForSelector('[data-testid="favourite-button"]');
  await pw.page.locator('[data-testid="favourite-button"]').click();
});

step("Click unfavourite button", async () => {
  await pw.page.waitForSelector('[data-testid="unfavourite-button"]');
  await pw.page.locator('[data-testid="unfavourite-button"]').click();
});

step("Favourites section contains <text>", async (text) => {
  const favourites = pw.page.locator(".favourites-container").filter({ hasText: text });
  await favourites.waitFor({ state: "visible"});
});

step("Click <text>", async (text) => {
  const button = pw.page.locator(`[data-testid="${text.toLowerCase().replace(/ /g, "-")}-button"]`);
  await button.click();
});
