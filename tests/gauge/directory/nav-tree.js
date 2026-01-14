/* globals gauge */

const assert = require("node:assert");
const { pw } = require("../playwright");

step("Expand tree node <text>", async (text) => {
  await pw.page.waitForSelector("#hierarchy-tree-bar-container", { timeout: 60000 });
  const node = pw.page.locator(".p-tree-node-content").filter({ hasText: text }).first();
  await node.locator("button").click();
  await pw.page.waitForLoadState("networkidle");
});

step("Tree contains <text>", async (text) => {
  const treeContent = pw.page.locator("#hierarchy-tree-bar-container").filter({ hasText: text });
  await treeContent.waitFor({ state: "visible", timeout: 60000 });
});

step("<text> has at most <num> children", async (text, num) => {
  const node = pw.page.locator("#hierarchy-tree-bar-container")
    .locator("li").filter({ hasText: text }).first();
  const children = node.locator(".. >> .p-tree-node-children").locator(".p-tree-node");
  const count = await children.count();
  assert(count <= Number(num), `Expected at most ${num} children, but got ${count}`);
});

step("Scroll down tree", async () => {
  const treeContainer = pw.page.locator("#hierarchy-tree-bar-container");
  await treeContainer.evaluate(el => {
    el.scrollTop = el.scrollHeight;
  });
  await pw.page.waitForLoadState("networkidle");
});

step("Click tree node <text>", async (text) => {
  await pw.page.waitForSelector("#hierarchy-tree-bar-container", { timeout: 60000 });
  await pw.page.locator("#hierarchy-tree-bar-container").locator("li").filter({ hasText: text }).first().click();
  await pw.page.waitForLoadState("networkidle");
});

step("Scroll up tree", async () => {
  const treeContainer = pw.page.locator("#hierarchy-tree-bar-container");
  await treeContainer.evaluate(el => {
    el.scrollTop = 0;
  });
});

step("<text> has at least <num> children", async (text, num) => {
  const node = pw.page.locator("#hierarchy-tree-bar-container")
    .locator("li").filter({ hasText: text }).first();
  const children = node.locator(".. >> .p-tree-node-children").locator(".p-tree-node");
  const count = await children.count();
  assert(count >= Number(num), `Expected at least ${num} children, but got ${count}`);
});

step("Directory table contains <text>", async (text) => {
  const table = pw.page.locator("#directory-table-container")
    .locator(".parent-header-container").filter({ hasText: text });
  await table.waitFor({ state: "visible", timeout: 60000 });
});

step("Hover over tree node <text>", async (text) => {
  await pw.page.locator("#hierarchy-tree-bar-container").locator("li").filter({ hasText: text }).first().hover();
});

step("Overlay panel contains <text>", async (text) => {
  const overlay = pw.page.locator("#overlay-panel").filter({ hasText: text });
  await overlay.waitFor({ state: "visible", timeout: 60000 });
});
