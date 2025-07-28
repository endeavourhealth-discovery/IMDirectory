describe("creator", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.preventRouterNewTab();
    cy.acceptLicenseAndLogin();
    cy.get("#shortcuts-container", { timeout: 60000 }).find(".shortcut").contains("Creator").click();
    cy.visitNewTab("/#/creator/");
    cy.get(".type-buttons-container", { timeout: 60000 }).contains("Type model /Node shape").click();
  });
  describe("data model creator", () => {
    it("can navigate to data model creator", () => {
      cy.get(".creator-layout-container", { timeout: 60000 });
    });
    it("is populated correctly", () => {
      cy.findByTestId("entity-combo-box", { timeout: 60000 }).should("have.value", "");
      cy.findByTestId("iri-builder-dropdown").should("not.be.empty");
      cy.findByTestId("iri-builder-input").should("be.empty");
      cy.findByTestId("text-display").should("be.disabled").should("be.empty");
      cy.findAllByTestId("text-input").should("be.empty");
      cy.findByTestId("html-input").should("be.empty");
      cy.get(".entity-single-dropdown-container", { timeout: 60000 }).findByTestId("entity-single-dropdown").contains("Draft");
      cy.findAllByTestId("search-input").should("have.value", "");
      cy.findByTestId("property-builder").get(".property").should("not.exist");
    });
    it("updates code with iri", () => {
      cy.findByTestId("iri-builder-input").type("test");
      cy.findByTestId("text-display").should("have.value", "test");
      cy.get(".iri-builder-container").contains("http://endhealth.info/im#test");
    });
    it("updates status", () => {
      cy.get(".entity-single-dropdown-container", { timeout: 60000 }).findByTestId("entity-single-dropdown").click();
      cy.get(".p-select-option").contains("Active").click();
      cy.findByTestId("entity-single-dropdown").contains("Active");
    });
    it("can add, select, and delete contained in", () => {
      cy.get(".array-builder-container").contains("Contained in").parent().parent().as("containedIn");
      cy.get("@containedIn").find("#autocomplete-search").click();
      cy.get("@containedIn").find("#autocomplete-search").type("all");
      cy.get(".listbox-item").first().click();
      cy.get("@containedIn").find('[data-testid="add-button"]').click();
      cy.get("@containedIn").find(".entity-search-item-container").should("have.length", 2);
      cy.get("@containedIn").find('[data-testid="delete-button"]').first().click();
      cy.get("@containedIn").find(".entity-search-item-container").should("have.length", 1);
    });
    it("can add and delete subclass of", () => {
      cy.get(".array-builder-container").contains("Subclass of").parent().parent().as("subclassOf");
      cy.get("@subclassOf").find("#autocomplete-search").click();
      cy.get("@subclassOf").find("#autocomplete-search").type("pat");
      cy.get(".listbox-item").first().click();
      cy.get("@subclassOf").find('[data-testid="add-button"]').click();
      cy.get("@subclassOf").find(".entity-search-item-container").should("have.length", 2);
      cy.get("@subclassOf").find('[data-testid="delete-button"]').first().click();
      cy.get("@subclassOf").find(".entity-search-item-container").should("have.length", 1);
    });
    it("can add, select, and delete properties", () => {
      cy.findByTestId("property-builder").findByTestId("add-property-button").click();
      cy.findByTestId("property-builder").find(".property").as("property");
      cy.get("@property").should("have.length", 1);
      cy.get("@property").find('[data-testid="property-autocomplete"]').find("#autocomplete-search").click();
      cy.get("@property").find('[data-testid="property-autocomplete"]').find("#autocomplete-search").type("and");
      cy.get(".listbox-item").first().click();
      cy.get("@property").find('[data-testid="range-autocomplete"]').find("#autocomplete-search").type("and");
      cy.get(".listbox-item").first().click();
      cy.findByTestId("property-builder").findByTestId("add-property-button").click();
      cy.get("@property").first().find('[data-testid="delete-property-button"').click();
    });
  });
});
