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

  it("add feature by searching for a set (click on Add button)", () => {
    cy.populateBaseType();
    cy.get(".add-feature-button").contains("Add feature").click();
    cy.get(".p-dialog-content").find("[data-testid=search-input]").type("diabetes");
    cy.get(".datatable-flex-cell")
      .contains("Diabetes mellitus type 2 or Diabetes mellitus in remission + more...")
      .parent()
      .parent()
      .parent()
      .find(".p-button")
      .contains("Add")
      .click();
    cy.wait(1000);
    cy.getByTestId("add-feature-ok-button").contains("OK").click();
    cy.getByTestId("add-feature-save-button").contains("Save").click();
    cy.get(".edit-match-container").contains("Condition");
    cy.get(".edit-match-container").contains("Diabetes");
  });

  it("add feature by searching for a set - add two sets", () => {
    cy.populateBaseType();
    cy.get(".add-feature-button").contains("Add feature").click();
    cy.get(".p-dialog-content").find("[data-testid=search-input]").type("diabetes");
    cy.get(".datatable-flex-cell").contains("Diabetes mellitus type 2 or Diabetes mellitus in remission + more...").click();
    cy.get(".parent-header-container").find(".p-button-label").contains("Add").click();
    cy.get("[data-testid=back-to-search-results]").click();
    cy.get(".datatable-flex-cell").contains("Diabetes mellitus in remission (NHS GP value set) | 999025931000230108").click();
    cy.get(".parent-header-container").find(".p-button-label").contains("Add").click();
    cy.wait(1000);
    cy.getByTestId("add-feature-ok-button").contains("OK").click();
    cy.getByTestId("add-feature-save-button").contains("Save").click();
    cy.get(".edit-match-container").contains("Condition");
    cy.get(".edit-match-container").contains("Diabetes");
    cy.get(".edit-match-container").contains("or");
  });

  it("add feature by searching for a set - add two sets, then edit and remove one set", () => {
    cy.populateBaseType();
    cy.get(".add-feature-button").contains("Add feature").click();
    cy.get(".p-dialog-content").find("[data-testid=search-input]").type("diabetes");
    cy.get(".datatable-flex-cell").contains("Diabetes mellitus type 2 or Diabetes mellitus in remission + more...").click();
    cy.get(".parent-header-container").find(".p-button-label").contains("Add").click();
    cy.get("[data-testid=back-to-search-results]").click();
    cy.get(".datatable-flex-cell").contains("Diabetes mellitus in remission (NHS GP value set) | 999025931000230108").click();
    cy.get(".parent-header-container").find(".p-button-label").contains("Add").click();
    cy.wait(1000);
    cy.getByTestId("add-feature-ok-button").contains("OK").click();
    cy.getByTestId("add-feature-save-button").contains("Save").click();
    cy.get(".edit-match-container").contains("Condition");
    cy.get(".edit-match-container").contains("Diabetes");
    cy.get(".edit-match-container").contains("or");

    cy.get(".edit-match-container").contains("Condition").click();
    cy.get("[data-testid=edit-list-button]").click();
    cy.get(".p-listbox-option")
      .contains("Diabetes mellitus type 2 or Diabetes mellitus in remission + more...")
      .parent()
      .parent()
      .find("[data-testid=remove-member-button]")
      .click();
    cy.getByTestId("add-feature-save-button").contains("Save").click();
    cy.getByTestId("save-feature-button").contains("Save").click();
    cy.wait(1000);
    cy.get(".edit-match-container").contains("Condition");
    cy.get(".edit-match-container").contains("in set");
    cy.contains(".edit-match-container", "Diabetes").should("not.exist");
    cy.contains(".edit-match-container", "or").should("not.exist");
  });

  it("add feature by searching for a set and adding a date property", () => {
    cy.populateBaseType();
    cy.get(".add-feature-button").contains("Add feature").click();
    cy.get(".p-dialog-content").find("[data-testid=search-input]").type("diabetes");
    cy.get(".datatable-flex-cell").contains("Diabetes mellitus type 2 or Diabetes mellitus in remission + more...").click();
    cy.get(".parent-header-container").find(".p-button-label").contains("Add").click();
    cy.wait(1000);
    cy.getByTestId("add-feature-ok-button").contains("OK").click();
    cy.get(".p-dialog-content").find(".add-property-button").click();
    cy.get(".p-tree-node-selectable").contains("date").click();
    cy.get(".datatype-select").find(".p-datepicker-input").click({ force: true });
    cy.get(".p-datepicker-day-cell").contains("1").click();
    cy.getByTestId("add-property-dialog-save").contains("Save").click();
    cy.getByTestId("add-feature-save-button").contains("Save").click();
    cy.get(".edit-match-container").contains("Condition");
    cy.get(".edit-match-container").contains("Diabetes");
    cy.get(".edit-match-container").contains("date");
  });

  it("add feature by searching for a set and adding a string property", () => {
    cy.populateBaseType();
    cy.get(".add-feature-button").contains("Add feature").click();
    cy.get(".p-dialog-content").find("[data-testid=search-input]").type("diabetes");
    cy.get(".datatable-flex-cell").contains("Diabetes mellitus type 2 or Diabetes mellitus in remission + more...").click();
    cy.get(".parent-header-container").find(".p-button-label").contains("Add").click();
    cy.wait(1000);
    cy.getByTestId("add-feature-ok-button").contains("OK").click();
    cy.get(".p-dialog-content").find(".add-property-button").click();
    cy.get(".p-tree-node-selectable").contains("description").click();
    cy.get(".datatype-select").find(".p-select-dropdown").click({ force: true });
    cy.get(".p-select-option").contains("starts with").click();
    cy.get(".datatype-select").find(".p-select-dropdown").parent().siblings().last().type("test desc");
    cy.getByTestId("add-property-dialog-save").contains("Save").click();
    cy.getByTestId("add-feature-save-button").contains("Save").click();
    cy.get(".edit-match-container").contains("Condition");
    cy.get(".edit-match-container").contains("Diabetes");
    cy.get(".edit-match-container").contains("description");
    cy.get(".edit-match-container").contains("test desc");
  });

  it("add feature by searching for a set and adding a numeric property", () => {
    cy.populateBaseType();
    cy.get(".add-feature-button").contains("Add feature").click();
    cy.get(".p-dialog-content").find("[data-testid=search-input]").type("blood pressure");
    cy.get(".datatable-flex-cell").first().click();
    cy.get(".parent-header-container").find(".p-button-label").contains("Add").click();
    cy.wait(1000);
    cy.get(".p-listbox").last().find(".p-listbox-option").contains("patient -> Numeric measurement . concept").click();
    cy.getByTestId("add-feature-ok-button").contains("OK").click();
    cy.get(".p-dialog-content").find(".add-property-button").click();

    cy.get(".p-tree-node-selectable").contains("value").click();
    cy.get(".datatype-select").find("[placeholder=value]").type("140");
    cy.getByTestId("add-property-dialog-save").contains("Save").click();
    cy.getByTestId("add-feature-save-button").contains("Save").click();
    cy.get(".edit-match-container").contains("Numeric measurement");
    cy.get(".edit-match-container").contains("blood pressure");
    cy.get(".edit-match-container").contains("value");
    cy.get(".edit-match-container").contains("140");
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
    cy.get(".property-input-container", { timeout: 60000 }).find("[data-testid=property-value-input]").type("123456789");
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
    cy.getByTestId("add-feature-save-query-button", { timeout: 60000 }).contains("Save").click();
    cy.get(".edit-match-container").contains("in the cohort");
    cy.get(".edit-match-container").contains("Active Diabetes (Latest entry for diabetes not followed by a resolution)");
  });

  it("add feature by searching for a feature", () => {
    cy.populateBaseType();
    cy.get(".add-feature-button").contains("Add feature").click();
    cy.get("#Cohort").click();
    cy.get(".p-dialog-content").find("[data-testid=search-input]").type("patient");
    cy.get(".datatable-flex-cell").contains("Patients registered for GMS services on the reference date").click();
    cy.getByTestId("add-feature-save-query-button", { timeout: 60000 }).contains("Save").click();
    cy.get(".edit-match-container").contains("in the cohort");
    cy.get(".edit-match-container").contains("Patients registered for GMS services on the reference date");
  });
});
