describe("Search", () => {
  beforeEach(() => {
    cy.acceptLicenseAndCookies();
  });
  it("can search", () => {
    cy.getByTestId("search-input", { timeout: 60000 }).type("scoliosis");
    cy.get(".p-datatable-selectable-row", { timeout: 60000 }).should("have.length.greaterThan", 1);
  });
  it("pages", () => {
    cy.getByTestId("search-input", { timeout: 60000 }).type("scoliosis");
    const page1Rows = cy.get(".p-datatable-selectable-row", { timeout: 60000 });
    page1Rows.should("have.length.greaterThan", 1);
    cy.get(".p-paginator-page").contains("2").click();
    const page2Rows = cy.get(".p-datatable-selectable-row", { timeout: 60000 });
    page2Rows.should("not.deep.include", page1Rows.get("span"));
  });
  it("filters by status", () => {
    cy.getByTestId("search-input", { timeout: 60000 }).type("scoliosis");
    cy.getByTestId("total-results", { timeout: 60000 }).invoke("text").then(parseFloat).as("startCount", { type: "static" }).should("be.gt", 0);
    cy.getByTestId("status-filter").find(".p-multiselect-dropdown").click();
    cy.get(".p-multiselect-overlay").contains("Inactive").click();
    cy.getByTestId("status-filter").find(".p-multiselect-dropdown").click();
    cy.wait(1000);
    cy.get("p-datatable-mask").should("not.exist");
    cy.getByTestId("total-results", { timeout: 60000 })
      .invoke("text")
      .then(parseFloat)
      .then(newCount => {
        cy.get("@startCount").then(startCount => {
          expect(newCount).not.equal(startCount);
        });
      });
  });
  it("filters by scheme", () => {
    cy.getByTestId("search-input", { timeout: 60000 }).type("scoliosis");
    cy.getByTestId("total-results", { timeout: 60000 }).invoke("text").then(parseFloat).as("startCount", { type: "static" }).should("be.gt", 0);
    cy.getByTestId("scheme-filter").find(".p-multiselect-dropdown").click();
    cy.get(".p-multiselect-overlay").contains("Snomed").click();
    cy.getByTestId("scheme-filter").find(".p-multiselect-dropdown").click();
    cy.wait(1000);
    cy.get("p-datatable-mask").should("not.exist");
    cy.getByTestId("total-results", { timeout: 60000 })
      .invoke("text")
      .then(parseFloat)
      .then(newCount => {
        cy.get("@startCount").then(startCount => {
          expect(newCount).not.equal(startCount);
        });
      });
  });
  it("filters by type", () => {
    cy.getByTestId("search-input", { timeout: 60000 }).type("asthma");
    cy.getByTestId("total-results", { timeout: 60000 }).invoke("text").then(parseFloat).as("startCount", { type: "static" }).should("be.gt", 0);
    cy.getByTestId("type-filter").find(".p-multiselect-dropdown").click();
    cy.get(".p-multiselect-overlay").contains("Terminology concept").click();
    cy.getByTestId("type-filter").find(".p-multiselect-dropdown").click();
    cy.wait(1000);
    cy.get("p-datatable-mask").should("not.exist");
    cy.getByTestId("total-results", { timeout: 60000 })
      .invoke("text")
      .then(parseFloat)
      .then(newCount => {
        cy.get("@startCount").then(startCount => {
          expect(newCount).not.equal(startCount);
        });
      });
  });
});
