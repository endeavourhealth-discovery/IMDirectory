describe("creator", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.preventRouterNewTab();
    cy.acceptLicenseAndLogin();
    cy.get("#shortcuts-container", { timeout: 60000 }).find(".shortcut").contains("Creator").click();
    cy.visitNewTab("/#/creator/");
    cy.get(".type-buttons-container", { timeout: 60000 }).contains("Data model/Node shape").click();
  });
  describe("data model creator", () => {
    it("can navigate to data model creator", () => {
      cy.get(".creator-layout-container", { timeout: 60000 });
    });
    it("is populated correctly", () => {
      cy.getByTestId("entity-combo-box", { timeout: 60000 }).should("have.value", "");
      cy.getByTestId("iri-builder-dropdown").should("not.be.empty");
      cy.getByTestId("iri-builder-input").should("be.empty");
      cy.getByTestId("text-display").should("be.disabled").should("be.empty");
      cy.getByTestId("text-input").should("be.empty");
      cy.getByTestId("html-input").should("be.empty");
      cy.get(".entity-single-dropdown-container", { timeout: 60000 }).getByTestId("entity-single-dropdown").contains("Draft");
      cy.getByTestId("search-input").should("have.value", "");
      cy.getByTestId("property-builder").get(".property").should("not.exist");
    });
    it("updates code with iri", () => {
      cy.getByTestId("iri-builder-input").type("test");
      cy.getByTestId("text-display").should("have.value", "test");
      cy.get(".iri-builder-container").contains("http://endhealth.info/im#test");
    });
    it("updates status", () => {
      cy.get(".entity-single-dropdown-container", { timeout: 60000 })
        .getByTestId("entity-single-dropdown")
        .click()
        .get(".p-select-option")
        .contains("Active")
        .click();
      cy.getByTestId("entity-single-dropdown").contains("Active");
    });
    it("can add and delete contained in", () => {
      cy.get(".array-builder-container").contains("Contained in").parent().parent().find('[data-testid="add-button"]').click();
      cy.get(".array-builder-container").contains("Contained in").parent().parent().find(".entity-search-item-container").should("have.length", 2);
      cy.get(".array-builder-container").contains("Contained in").parent().parent().find('[data-testid="delete-button"]').first().click();
      cy.get(".array-builder-container").contains("Contained in").parent().parent().find(".entity-search-item-container").should("have.length", 1);
    });
    it("can add and delete subclass of", () => {
      cy.get(".array-builder-container").contains("Subclass of").parent().parent().find('[data-testid="add-button"]').click();
      cy.get(".array-builder-container").contains("Subclass of").parent().parent().find(".entity-search-item-container").should("have.length", 2);
      cy.get(".array-builder-container").contains("Subclass of").parent().parent().find('[data-testid="delete-button"]').first().click();
      cy.get(".array-builder-container").contains("Subclass of").parent().parent().find(".entity-search-item-container").should("have.length", 1);
    });
    it("can add, select, and delete properties", () => {
      cy.getByTestId("property-builder").getByTestId("add-property-button").click();
      cy.getByTestId("property-builder").find(".property").should("have.length", 1);
      cy.getByTestId("property-builder").find(".property").find("#autocomplete-search").first().click();
      cy.getByTestId("property-builder").find(".property").find("#autocomplete-search").first().type("and");
      cy.get(".listbox-item").first().click();
      cy.getByTestId("property-builder").find(".property").find("#autocomplete-search").get(2).type("and");
    });
  });
});