/* globals gauge */

const assert = require("node:assert");
const { pw } = require("../playwright");
const { expect } = require("@playwright/test");

async function getNodeByText(text) {
  await pw.page.waitForSelector("#hierarchy-tree-bar-container");
  const node = pw.page
    .locator("#hierarchy-tree-bar-container li")
    .filter({ hasText: text })
    .filter({ hasNot: pw.page.locator("ul").filter({ hasText: text }) });

  await node.highlight();

  return node;
}

step("Expand tree node <text>", async text => {
  const node = await getNodeByText(text);
  await node.locator("button").click();
  await node.locator("ul").waitFor();
  await pw.page.waitForLoadState("networkidle");
});

step("Tree contains <text>", async text => {
  const node = await getNodeByText(text);
  await node.waitFor({ state: "visible" });
});

step("Parent <text> has child <text>", async (parent, child) => {
  const parentElement = await getNodeByText(parent);
  await parentElement.waitFor({ state: "visible" });
  const childElement = parentElement.locator("li").filter({ hasText: child });
  await childElement.waitFor({ state: "visible" });
});

step("Parent <text> has no children", async parent => {
  const parentElement = await getNodeByText(parent);
  await parentElement.waitFor({ state: "visible" });
  await expect(parentElement.locator("li")).toHaveCount(0);
});

step("<text> has at most <num> children", async (text, num) => {
  const node = await getNodeByText(text);
  const children = node.locator("ul li");
  const count = await children.count();
  assert(count <= Number(num), `Expected at most ${num} children, but got ${count}`);
});

step("Scroll <text> into view", async text => {
  const node = await getNodeByText(text);
  await node.evaluate(el => {
    el.scrollIntoView({ block: "center", behavior: "smooth" });
  });
  await pw.page.waitForLoadState("networkidle");
});

step("Load more children of <text>", async text => {
  const node = await getNodeByText(text);
  const count = await node.locator("ul li").count();
  const btn = await node.locator("li").filter({ hasText: "Load more..." });
  await btn.click();
  await node
    .locator("ul li")
    .nth(count + 1)
    .waitFor();
  await pw.page.waitForLoadState("networkidle");
});

step("Click tree node <text>", async text => {
  const node = await getNodeByText(text);
  await node.click();
  await pw.page.waitForLoadState("networkidle");
});

step("Scroll up tree", async () => {
  const treeContainer = pw.page.locator("#hierarchy-tree-bar-container").locator(".tree-root");
  await treeContainer.evaluate(el => {
    el.scrollIntoView({ block: "center", behavior: "smooth" });
  });
  await pw.page.waitForLoadState("networkidle");
});

step("<text> has at least <num> children", async (text, num) => {
  const node = await getNodeByText(text);
  const children = node.locator(".. >> .p-tree-node-children").locator(".p-tree-node");
  const count = await children.count();
  assert(count >= Number(num), `Expected at least ${num} children, but got ${count}`);
});

step("Directory table contains <text>", async text => {
  const table = pw.page.locator("#directory-table-container").locator(".parent-header-container").filter({ hasText: text });
  await table.waitFor({ state: "visible" });
});

step("Hover over tree node <text>", async text => {
  const node = await getNodeByText(text);
  await node.hover();
});

step("Overlay panel contains <text>", async text => {
  const overlay = pw.page.locator("#overlay-panel").filter({ hasText: text });
  await overlay.waitFor({ state: "visible" });
});
