/* globals gauge */

const assert = require("node:assert");
const { pw } = require("../playwright");

step("Concept title displays <text>", async (text) => {
  const title = pw.page.locator(".parent-header-container").filter({ hasText: text });
  await title.waitFor({ state: "visible"});
});

step("Click find in tree button", async () => {
  await pw.page.locator(".entity-buttons-container").locator(".fa-list-tree").click();
});

step("Hierarchy tree contains <text>", async (text) => {
  const tree = pw.page.locator("#hierarchy-tree-bar-container").filter({ hasText: text });
  await tree.waitFor({ state: "visible"});
});

step("Click download button", async () => {
  await pw.page.locator('[data-testid="download-button"]').click();
});

step("Confirm download dialog", async () => {
  await pw.page.locator(".p-confirmdialog").locator(".p-confirmdialog-accept-button").click();
});

step("Tree node <text> has children", async (text) => {
  const node = pw.page.locator("#hierarchy-tree-bar-container >> li")
    .filter({ hasText: text })
    .first()
    .locator("button");
  await node.waitFor({ state: "visible"});
});

step("Breadcrumb contains <text>", async (text) => {
  const breadcrumb = pw.page.locator(".breadcrumb-container").filter({ hasText: text });
  await breadcrumb.waitFor({ state: "visible"});
});

step("Click breadcrumb ellipsis", async () => {
  await pw.page.locator(".breadcrumb-container").locator("span").filter({ hasText: "..." }).click();
});

step("Breadcrumb overlay menu has items", async () => {
  const menu = pw.page.locator("#path_overlay_menu >> .p-menu-item");
  const count = await menu.count();
  assert(count > 0, `Breadcrumb overlay menu should have items, but has ${count}`);
});

step("Click breadcrumb term <text>", async (text) => {
  await pw.page.locator(".breadcrumb-container").filter({ hasText: text }).first().click();
});

step("Click breadcrumb menu item <text>", async (text) => {
  const mi = pw.page.locator("#path_overlay_menu >> .p-menu-item").filter({ hasText: text });
  await mi.waitFor({ state: "visible"});
  await mi.click();
});

step("Details container has tree nodes", async () => {
  await pw.page.waitForSelector(".details-container .p-tree-node");
  const nodes = pw.page.locator(".details-container .p-tree-node");
  const count = await nodes.count();
  assert(count > 0, `Details container should have tree nodes, but has ${count}`);
});

step("Click expand details button", async () => {
  await pw.page.locator('[data-testid="expand-details-button"]').click();
});

step("Details container has expanded nodes", async () => {
  const expanded = pw.page.locator(".details-container").locator(".p-tree-node-children");
  const count = await expanded.count();
  assert(count > 0, `Details container should have expanded nodes, but has ${count}`);
});

step("Click collapse details button", async () => {
  await pw.page.locator('[data-testid="collapse-details-button"]').click();
});

step("Details container has no expanded nodes", async () => {
  const expanded = pw.page.locator(".details-container >> .p-tree-node-children");
  const count = await expanded.count();
  assert(count === 0, `Details container should have no expanded nodes, but has ${count}`);
});

step("Click tab <text>", async (text) => {
  await pw.page.locator(".p-tablist-tab-list >> .p-tab").filter({ hasText: text }).click();
  await pw.page.waitForLoadState("networkidle");
});

step("Terms table has rows", async () => {
  await pw.page.waitForSelector(".term-code-table tr");
  const rows = pw.page.locator(".term-code-table tr");
  const count = await rows.count();
  assert(count > 0, `Terms table should have rows, but has ${count}`);
});

step("Has map table <text>", async (text) => {
  await pw.page.waitForSelector(`[data-testid="mappings"]`);
  const table = pw.page.locator(`[data-testid="${text}"]`).locator("tr");
  const count = await table.count();
  assert(count > 0, `Map table "${text}" should have rows, but has ${count}`);
});

step("Maps are in priority order", async () => {
  const priorities = [];
  const elements = pw.page.locator('[data-testid="priority"]');
  for (const el of await elements.all()) {
    const text = await el.textContent();
    priorities.push(parseFloat(text));
  }
  const sorted = [...priorities].sort((a, b) => a - b);
  assert.deepStrictEqual(priorities, sorted, `Maps should be in priority order`);
});

step("Contents table has rows", async () => {
  await pw.page.waitForSelector("#content-table-container >> table");
  const rows = pw.page.locator("#content-table-container >> table >> tr");
  const count = await rows.count();
  assert(count > 0, `Contents table should have rows, but has ${count}`);
});

step("Used in table has rows", async () => {
  await pw.page.waitForSelector('[data-testid="used-in-table"]');
  const rows = pw.page.locator('[data-testid="used-in-table"] >> tr');
  const count = await rows.count();
  assert(count > 0, `Used in table should have rows, but has ${count}`);
});

step("Current node is selected <text>", async (text) => {
  const node = pw.page.locator(".p-tree-node-selected").filter({ hasText: text });
  await node.waitFor({ state: "visible"});
});

step("Hierarchy tree has <num> nodes", async (num) => {
  await pw.page.waitForSelector("#secondary-tree-bar-container .tree-row");
  const nodes = pw.page.locator("#secondary-tree-bar-container .tree-row");
  const count = await nodes.count();
  assert.strictEqual(count, Number(num), `Hierarchy tree should have ${num} nodes, but has ${count}`);
});

step("Click load more in hierarchy", async () => {
  await pw.page.waitForSelector("#secondary-tree-bar-container");
  const loadMore = pw.page.locator("#secondary-tree-bar-container .tree-row").filter({ hasText: "Load more..." }).first();
  await loadMore.waitFor({ state: "visible"});
  await loadMore.click();
  await loadMore.waitFor({ state: "hidden"});
});

step("Hierarchy tree has more than <num> nodes", async (num) => {
  await pw.page.waitForSelector("#secondary-tree-bar-container .tree-row");
  const nodes = pw.page.locator("#secondary-tree-bar-container .tree-row");
  const count = await nodes.count();
  assert(count > Number(num), `Hierarchy tree should have more than ${num} nodes, but has ${count}`);
});

step("Click parent button", async () => {
  await pw.page.locator('[data-testid="parent"]').click();
});

step("Parent hierarchy changed", async () => {
  await pw.page.waitForLoadState("networkidle");
});

step("Click hierarchy node <text>", async (text) => {
  await pw.page.waitForSelector("#secondary-tree-bar-container .tree-row");
  await pw.page.locator("#secondary-tree-bar-container .tree-row").filter({ hasText: text }).first().click();
});

step("Entity chart has <text> rows", async (text) => {
  await pw.page.waitForSelector(`[data-testid="${text}"] tr`);
  const rows = pw.page.locator(`[data-testid="${text}"] tr`);
  const count = await rows.count();
  assert(count > 0, `Entity chart "${text}" should have rows, but has ${count}`);
});

step("Click subtype row <text>", async (text) => {
  await pw.page.waitForSelector('[data-testid="subtype"] tr');
  await pw.page.locator('[data-testid="subtype"] tr').filter({ hasText: text }).first().click();
});

step("Graph container contains <text>", async (text) => {
  const graph = pw.page.locator("#graph-container").filter({ hasText: text });
  await graph.waitFor({ state: "visible"});
});

step("JSON container contains <text>", async (text) => {
  const json = pw.page.locator("#json-container").filter({ hasText: text });
  await json.waitFor({ state: "visible"});
});

step("Provenance table has rows", async () => {
  const rows = pw.page.locator('[data-testid="provenance-table"]').locator("tr");
  const count = await rows.count();
  assert(count > 0, `Provenance table should have rows, but has ${count}`);
});
