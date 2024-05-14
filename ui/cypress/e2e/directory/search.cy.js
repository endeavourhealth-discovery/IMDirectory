describe("Search", () => {
  beforeEach(() => {
    cy.acceptLicenseAndCookies();
  });
  it("can search", () => {
    cy.get("[data-testid='search-input']", { timeout: 60000 }).type("scoliosis");
    cy.get(".p-selectable-row", { timeout: 60000 }).should("have.length.greaterThan", 1);
  });
  it("pages", () => {
    cy.get("[data-testid='search-input']", { timeout: 60000 }).type("scoliosis");
    const page1Rows = cy.get(".p-selectable-row", { timeout: 60000 });
    page1Rows.should("have.length.greaterThan", 1);
    cy.get(".p-paginator-page").contains("2").click();
    const page2Rows = cy.get(".p-selectable-row", { timeout: 60000 });
    page2Rows.should("not.deep.include", page1Rows.get("span"));
  });
});
