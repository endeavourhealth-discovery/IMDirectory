describe("Query builder", () => {
  beforeEach(() => {
    cy.preventRouterNewTab();
    cy.acceptLicenseAndLogin();
    cy.visit("/");
    cy.getByTestId("apps-button", { timeout: 60000 }).click();
    cy.get("#apps-menu").find(".shortcut-container").contains("Creator").click();
    cy.visitNewTab("/#/creator/");
    cy.url().should("include", "/creator");
    cy.get(".type-selector").find(".custom-button").contains("Cohort Query").click();
  });

  it("starts with empty base type", () => {
    cy.get("#im-query-editor-container").getByTestId("search-input").should("have.value", "");
  });

  it("populate base from search dialog", () => {
    cy.get("#im-query-editor-container").find("[data-testid=autocomplete-search-button]").click();
    cy.get(".p-dialog-content").find("[data-testid=search-input]").type("patient");
    cy.get(".datatable-flex-cell").contains("Patient").click();
    cy.wait(1000);
    cy.get(".p-dialog-footer").find("[data-testid=search-dialog-select-button]").contains("Select").click();
    cy.get("#im-query-editor-container").find("[data-testid=search-input]").should("have.value", "Patient");
  });

  it("add feature by searching for a set", () => {
    cy.populateBaseType();
    cy.get(".add-feature-button").contains("Add feature").click();
    cy.get(".p-dialog-content").find("[data-testid=search-input]").type("diabetes");
    cy.get(".datatable-flex-cell").contains("Diabetes mellitus type 2 or Diabetes mellitus in remission + more...").click();
    cy.get(".parent-header-container").find(".p-button-label").contains("Add").click();
    cy.wait(1000);
    cy.getByTestId("add-feature-ok-button").contains("OK").click();
    cy.getByTestId("add-feature-save-button").contains("Save").click();
    cy.get(".edit-match-container").contains("Condition");
    cy.get(".edit-match-container").contains("Diabetes");
  });

  it("add feature by searching for a concept", () => {
    cy.populateBaseType();
    cy.get(".add-feature-button").contains("Add feature").click();
    cy.get("#Concept").click();
    cy.get(".p-dialog-content").find("[data-testid=search-input]").type("asthma");
    cy.get(".datatable-flex-cell").contains("Asthma (disorder)").click();
    cy.get(".parent-header-container").find(".p-button-label").contains("Add").click();
    cy.wait(1000);
    cy.getByTestId("add-feature-ok-button").contains("OK").click();
    cy.getByTestId("add-feature-save-button").contains("Save").click();
    cy.get(".edit-match-container").contains("Condition");
    cy.get(".edit-match-container").contains("Asthma (disorder)");
  });

  it("add feature by searching for a property", () => {
    cy.populateBaseType();
    cy.get(".add-feature-button").contains("Add feature").click();
    cy.get("#Property").click();
    cy.get(".p-dialog-content").find("[data-testid=search-input]").type("nhs number");
    cy.get(".datatable-flex-cell").contains("nhs number", { matchCase: false }).click();
    cy.getByTestId("add-feature-ok-button").contains("OK").click();
    cy.get(".property-input-container", { timeout: 1000 }).find("[data-testid=property-value-input]").type("123456789");
    cy.getByTestId("add-feature-save-button").contains("Save").click();
    cy.get(".edit-match-container").contains("Patient personal and demographics");
    cy.get(".edit-match-container").contains("nhs number 123456789", { matchCase: false });
  });

  it("add feature by searching for a feature", () => {
    cy.populateBaseType();
    cy.get(".add-feature-button").contains("Add feature").click();
    cy.get("#Feature").click();
    cy.get(".p-dialog-content").find("[data-testid=search-input]").type("diabetes");
    cy.get(".datatable-flex-cell").contains("Active Diabetes (Latest entry for diabetes not followed by a resolution)").click();
    cy.getByTestId("add-feature-save-query-button", { timeout: 1000 }).contains("Save").click();
    cy.get(".edit-match-container").contains("in the cohort");
    cy.get(".edit-match-container").contains("Active Diabetes (Latest entry for diabetes not followed by a resolution)");
  });

  it("add feature by searching for a feature", () => {
    cy.populateBaseType();
    cy.get(".add-feature-button").contains("Add feature").click();
    cy.get("#Cohort").click();
    cy.get(".p-dialog-content").find("[data-testid=search-input]").type("patient");
    cy.get(".datatable-flex-cell").contains("Patients registered for GMS services on the reference date").click();
    cy.getByTestId("add-feature-save-query-button", { timeout: 1000 }).contains("Save").click();
    cy.get(".edit-match-container").contains("in the cohort");
    cy.get(".edit-match-container").contains("Patients registered for GMS services on the reference date");
  });
});
