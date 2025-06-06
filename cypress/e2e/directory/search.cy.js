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
    cy.get(".p-datatable-selectable-row", { timeout: 60000 }).then(page1Rows => {
      expect(page1Rows.length).to.be.greaterThan(1);
      cy.get(".p-paginator-page").contains("1").click();
      cy.get(".p-datatable-selectable-row", { timeout: 60000 }).then(page2Rows => {
        const page1Texts = [...page1Rows].map(el => el.innerText);
        const page2Texts = [...page2Rows].map(el => el.innerText);
        page2Texts.forEach(text => {
          expect(page1Texts).to.not.include(text);
        });
      });
    });
  });
  it("filters by status", () => {
    cy.getByTestId("search-input", { timeout: 60000 }).type("scoliosis");
    cy.getByTestId("total-results", { timeout: 60000 }).invoke("text").then(parseFloat).as("startCount", { type: "static" }).should("be.gt", 0);
    cy.getByTestId("status-filter").find(".p-multiselect-dropdown").click();
    cy.get(".p-multiselect-overlay").contains("Inactive").click();
    cy.getByTestId("status-filter").find(".p-multiselect-dropdown").click();
    cy.wait(1000);
    cy.get("p-datatable-mask").should("not.exist");
    cy.wait(1000);
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
    cy.wait(1000);
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
    cy.wait(1000);
    cy.getByTestId("total-results", { timeout: 60000 })
      .invoke("text")
      .then(parseFloat)
      .then(newCount => {
        cy.get("@startCount", { timeout: 60000 }).then(startCount => {
          expect(newCount).not.equal(startCount);
        });
      });
  });
});
