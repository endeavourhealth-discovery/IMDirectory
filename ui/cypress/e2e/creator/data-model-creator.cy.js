describe("creator", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.preventRouterNewTab();
    cy.acceptLicenseAndLogin();
    cy.get("#shortcuts-container", { timeout: 60000 }).find(".shortcut").contains("Creator").click();
    cy.visitNewTab("/#/creator/");
    cy.get(".type-buttons-container", { timeout: 60000 }).contains("Data model/Node shape").click();
    cy.get(".creator-layout-container", { timeout: 60000 });
  });
  describe("data model creator", () => {
    it("is populated correctly", () => {
      cy.getByTestId("entity-combo-box").should("have.value", "");
      cy.getByTestId("iri-builder-dropdown").should("not.be.empty");
      cy.getByTestId("iri-builder-input").should("be.empty");
      cy.getByTestId("text-display").should("be.disabled").should("be.empty");
      cy.getByTestId("text-input").should("be.empty");
      cy.getByTestId("html-input").should("be.empty");
      cy.get(".entity-single-dropdown-container", { timeout: 60000 }).getByTestId("entity-single-dropdown").contains("Draft");
      cy.getByTestId("search-input").should("have.value", "");
      cy.getByTestId("property-builder").get(".property").should("not.exist");
    });
  });
});
