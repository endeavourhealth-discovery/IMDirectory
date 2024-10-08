describe("Query builder", () => {
  Cypress.Commands.add("populateBaseType", () => {
    cy.get("#im-query-editor-container").find("[data-testid=autocomplete-search-button]").click();
    cy.get(".p-dialog-content").find("[data-testid=search-input]").type("patient");
    cy.get(".datatable-flex-cell").contains("Patient").click();
    cy.wait(1000);
    cy.get(".p-dialog-footer").find("[data-testid=search-dialog-select-button]").contains("Select").click();
    cy.get("#im-query-editor-container").find("[data-testid=search-input]").should("have.value", "Patient");
  });

  Cypress.Commands.add("addFeature", (searchTerm, entityToSelect, entityType) => {
    cy.get(".add-feature-button").contains("Add feature").click();
    if (entityType) cy.get(entityType).click();
    cy.get(".p-dialog-content").find("[data-testid=search-input]").type(searchTerm);
    cy.get(".datatable-flex-cell").contains(entityToSelect).click();
    cy.get(".parent-header-container").find(".p-button-label").contains("Add").click();
    cy.wait(1000);
    cy.getByTestId("add-feature-ok-button").contains("OK").click();
    cy.getByTestId("add-feature-save-button").contains("Save").click();
    cy.get(".edit-match-container").contains("Medication");
    cy.get(".edit-match-container").contains("Paracetamol");
  });

  beforeEach(() => {
    cy.preventRouterNewTab();
    cy.acceptLicenseAndLogin();
    cy.visit("/");
    cy.getByTestId("apps-button", { timeout: 60000 }).click();
    cy.get("#apps-menu").find(".shortcut-container").contains("Creator").click();
    cy.visitNewTab("/#/creator/");
    cy.url().should("include", "/creator");
    cy.get(".type-selector", { timeout: 60000 }).find(".custom-button").contains("Cohort Query").click();
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
    cy.wait(10000);
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

  it("add feature to find patients who had headache within 3 days after a medication of paracetamol", () => {
    cy.populateBaseType();
    cy.addFeature("paracetamol", "Paracetamol 500mg tablets", "#Concept");
    cy.get(".edit-match-container").contains("Medication").click();
    cy.get("[placeholder='Keep as reference']").type("med");
    cy.get(".edit-match-container").contains("label as med");
    cy.getByTestId("save-feature-button").contains("Save").click();
    cy.addFeature("adverse reaction paracetamol", "Adverse reaction caused by paracetamol", "#Concept");
    cy.get(".edit-match-container").contains("Condition").click();
    cy.get(".add-property-button").click();
    cy.get(".p-tree-node-selectable").contains("date").click();
    cy.get(".datatype-select").find(".p-select").first().click({ force: true });
    cy.get(".p-select-option").contains("within").click();
    cy.get(".p-togglebutton-label").contains("the next").click();
    cy.get("[inputmode=numeric]").type("10");
    cy.get(".p-select").last().click();
    cy.get(".p-select-option").contains("day(s)").click();
    cy.get("[placeholder='relative to']").click();
    cy.get(".relative-to-select-dialog").find(".p-tree-node-toggle-button").click();
    cy.get(".relative-to-select-dialog").find(".p-tree-node-selectable").contains("date").click();
    cy.get(".relative-to-select-dialog").parent().parent().find(".p-dialog-footer").find(".p-button").last().contains("Save").click();
    cy.getByTestId("add-property-dialog-save").contains("Save").click();
    cy.getByTestId("save-feature-button").contains("Save").click();
    cy.get(".edit-match-container").contains("date 10 day after the date of Medication");
  });

  it("add a direct property of age to patient with a nested property of address.postcode in one step", () => {
    cy.populateBaseType();
    cy.get(".add-feature-button").contains("Add feature").click();
    cy.get("#Property").click();
    cy.get(".p-dialog-content").find("[data-testid=search-input]").type("nhs number");
    cy.get(".datatable-flex-cell").contains("nhs number", { matchCase: false }).click();
    cy.wait(10000);
    cy.getByTestId("add-feature-ok-button").contains("OK").click();
    cy.get(".property-input-container", { timeout: 60000 }).find("[data-testid=property-value-input]").type("123456789");

    cy.get(".p-dialog-content").find(".add-property-button").click();
    cy.get(".add-property-dialog").find(".p-tree-node-selectable").contains("address").parent().parent().parent().find(".p-tree-node-toggle-button").click();
    cy.get(".add-property-dialog").find(".p-tree-node-content").contains("Address").parent().parent().parent().find(".p-tree-node-toggle-button").click();
    cy.get(".add-property-dialog").find(".p-tree-node-selectable").contains("postcode").click();
    cy.get(".add-property-dialog", { timeout: 60000 }).find("[data-testid=property-value-input]").type("LS123AA");
    cy.getByTestId("add-property-dialog-save").contains("Save").click();

    cy.getByTestId("add-feature-save-button").contains("Save").click();
    cy.get(".edit-match-container").contains("nHS Number");
    cy.get(".edit-match-container").contains("123456789");
    cy.get(".edit-match-container").contains("address");
    cy.get(".edit-match-container").contains("postcode");
    cy.get(".edit-match-container").contains("LS123AA");
  });

  it("add a direct property of age to patient with a nested property of address.postcode in two steps", () => {
    cy.populateBaseType();
    cy.get(".add-feature-button").contains("Add feature").click();
    cy.get("#Property").click();
    cy.get(".p-dialog-content").find("[data-testid=search-input]").type("nhs number");
    cy.get(".datatable-flex-cell").contains("nhs number", { matchCase: false }).click();
    cy.wait(10000);
    cy.getByTestId("add-feature-ok-button").contains("OK").click();
    cy.get(".property-input-container", { timeout: 60000 }).find("[data-testid=property-value-input]").type("123456789");
    cy.getByTestId("add-feature-save-button").contains("Save").click();
    cy.get(".edit-match-container").contains("nHS Number").click();

    cy.get(".p-dialog-content").find(".add-property-button").click();
    cy.get(".add-property-dialog").find(".p-tree-node-selectable").contains("address").parent().parent().parent().find(".p-tree-node-toggle-button").click();
    cy.get(".add-property-dialog").find(".p-tree-node-content").contains("Address").parent().parent().parent().find(".p-tree-node-toggle-button").click();
    cy.get(".add-property-dialog").find(".p-tree-node-selectable").contains("postcode").click();
    cy.get(".add-property-dialog", { timeout: 60000 }).find("[data-testid=property-value-input]").type("LS123AA");
    cy.getByTestId("add-property-dialog-save").contains("Save").click();

    cy.getByTestId("save-feature-button").contains("Save").click();
    cy.get(".edit-match-container").contains("nHS Number");
    cy.get(".edit-match-container").contains("123456789");
    cy.get(".edit-match-container").contains("address");
    cy.get(".edit-match-container").contains("postcode");
    cy.get(".edit-match-container").contains("LS123AA");
  });
});
