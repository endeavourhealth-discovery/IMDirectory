describe.skip("Query builder", () => {
  Cypress.Commands.add("populateBaseType", () => {
    cy.get("#im-query-editor-container", { timeout: 60000 }).find("[data-testid=autocomplete-search-button]").click();
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
    cy.findByTestId("add-feature-ok-button").contains("OK").click();
    cy.findByTestId("add-feature-save-button").contains("Save").click();
  });

  const diabetesSet = { searchTerm: "Q code group Type 2 diabetes", name: "Q code group Type 2 diabetes", substring: "Q code group Type 2 diabetes" };
  const diabetesSet2 = {
    searchTerm: "Codes for diabetes (non-type 1) (primary care value set)",
    name: "Codes for diabetes (non-type 1) (primary care value set)",
    subString: "Codes for diabetes (non-type 1)"
  };
  const diabetesFeature = { searchTerm: "diabetes", name: "Active Diabetes" };
  const asthmaConcept = { searchTerm: "asthma", name: "Asthma (disorder) | 195967001" };
  const paracetamolConcept = { searchTerm: "paracetamol", name: "Paracetamol (product) | 777067000 [sct]" };
  const paracetamolReactionConcept = { searchTerm: "adverse reaction paracetamol", name: "Adverse reaction caused by paracetamol" };

  beforeEach(() => {
    cy.preventRouterNewTab();
    cy.acceptLicenseAndLogin();
    cy.visit("/");
    cy.findByTestId("apps-button", { timeout: 60000 }).click();
    cy.get("#apps-menu").find(".shortcut-container").contains("Creator").click();
    cy.visitNewTab("/#/creator/");
    cy.url().should("include", "/creator");
    cy.get(".type-selector", { timeout: 60000 }).find(".custom-button").contains("Cohort Query").click();
  });

  it("starts with empty base type", () => {
    cy.get("#im-query-editor-container").findByTestId("search-input").should("have.value", "");
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
    cy.get(".p-dialog-content").find("[data-testid=search-input]").type(diabetesSet.searchTerm);
    cy.get(".datatable-flex-cell").contains(diabetesSet.name, { timeout: 6000 }).click();
    cy.get(".parent-header-container").find(".p-button-label").contains("Add").click();
    cy.wait(1000);
    cy.findByTestId("add-feature-ok-button").contains("OK").click();
    cy.findByTestId("add-feature-save-button").contains("Save").click();
    cy.get(".edit-match-container").contains("diabetes");
    cy.get(".edit-match-container").contains("Diabetes", { matchCase: false });
  });

  it("add feature by searching for a set (click on Add button)", () => {
    cy.populateBaseType();
    cy.get(".add-feature-button").contains("Add feature").click();
    cy.get(".p-dialog-content").find("[data-testid=search-input]").type(diabetesSet.searchTerm);
    cy.get(".datatable-flex-cell").contains(diabetesSet.name).parent().parent().parent().find(".p-button").contains("Add").click();
    cy.wait(1000);
    cy.findByTestId("add-feature-ok-button").contains("OK").click();
    cy.findByTestId("add-feature-save-button").contains("Save").click();
    cy.get(".edit-match-container").contains("diabetes");
    cy.get(".edit-match-container").contains("Diabetes", { matchCase: false });
  });

  it("add feature by searching for a set - add two sets", () => {
    cy.populateBaseType();
    cy.get(".add-feature-button").contains("Add feature").click();
    cy.get(".p-dialog-content").find("[data-testid=search-input]").type(diabetesSet.searchTerm);
    cy.get(".datatable-flex-cell").contains(diabetesSet.name).click();
    cy.get(".parent-header-container").find(".p-button-label").contains("Add").click();
    cy.get("[data-testid=back-to-search-results]").click();
    cy.get(".p-dialog-content").find("[data-testid=search-input]").clear().type(diabetesSet2.searchTerm);
    cy.get(".datatable-flex-cell").contains(diabetesSet2.name).click();
    cy.get(".parent-header-container").find(".p-button-label").contains("Add").click();
    cy.wait(1000);
    cy.findByTestId("add-feature-ok-button").contains("OK").click();
    cy.findByTestId("add-feature-save-button").contains("Save").click();
    cy.get(".edit-match-container").contains("diabetes");
    cy.get(".edit-match-container").contains("Diabetes", { matchCase: false });
    cy.get(".edit-match-container").contains(",");
  });

  it("add feature by searching for a set - add two sets, then edit and remove one set", () => {
    cy.populateBaseType();
    cy.get(".add-feature-button").contains("Add feature").click();
    cy.get(".p-dialog-content").find("[data-testid=search-input]").type(diabetesSet.searchTerm);
    cy.get(".datatable-flex-cell").contains(diabetesSet.name).click();
    cy.get(".parent-header-container").find(".p-button-label").contains("Add").click();
    cy.get("[data-testid=back-to-search-results]").click();
    cy.get(".p-dialog-content").find("[data-testid=search-input]").clear().type(diabetesSet2.searchTerm);
    cy.get(".datatable-flex-cell").contains(diabetesSet2.name).click();
    cy.get(".title-buttons-container").find(".p-button-label").contains("Add").click();
    cy.wait(1000);
    cy.findByTestId("add-feature-ok-button").contains("OK").click();
    cy.findByTestId("add-feature-save-button").contains("Save").click();
    cy.get(".edit-match-container").contains("diabetes");
    cy.get(".edit-match-container").contains("Diabetes", { matchCase: false });
    cy.get(".edit-match-container").contains(",");

    cy.get(".edit-match-container").contains("diabetes").click();
    cy.get("[data-testid=edit-list-button]").click();
    cy.get(".p-listbox-option", { timeout: 60000 }).contains(diabetesSet2.subString).parent().parent().find("[data-testid=remove-member-button]").click();
    cy.findByTestId("add-feature-save-button").contains("Save").click();
    cy.findByTestId("save-feature-button").contains("Save").click();
    cy.wait(1000);
    cy.get(".edit-match-container").contains("diabetes");
    cy.contains(".edit-match-container", diabetesSet2.subString).should("not.exist");
    cy.contains(".edit-match-container", ",").should("not.exist");
  });

  it("add feature by searching for a set and adding a date property", () => {
    cy.populateBaseType();
    cy.get(".add-feature-button").contains("Add feature").click();
    cy.get(".p-dialog-content").find("[data-testid=search-input]").type(diabetesSet.searchTerm);
    cy.get(".datatable-flex-cell").contains(diabetesSet.name).click();
    cy.get(".parent-header-container").find(".p-button-label").contains("Add").click();
    cy.wait(1000);
    cy.findByTestId("add-feature-ok-button").contains("OK").click();
    cy.get(".p-dialog-content").find(".add-property-button").click();
    cy.get(".p-tree-node-selectable").contains("date").click();
    cy.get(".datatype-select").find(".p-datepicker-input").click({ force: true });
    cy.get(".p-datepicker-day-cell").contains("14").click();
    cy.findByTestId("add-property-dialog-save").contains("Save").click();
    cy.findByTestId("add-feature-save-button").contains("Save").click();
    cy.get(".edit-match-container").contains("diabetes");
    cy.get(".edit-match-container").contains("Diabetes", { matchCase: false });
    cy.get(".edit-match-container").contains("date");
  });

  it("add feature by searching for a set and adding a string property", () => {
    cy.populateBaseType();
    cy.get(".add-feature-button").contains("Add feature").click();
    cy.get(".p-dialog-content").find("[data-testid=search-input]").type(diabetesSet.searchTerm);
    cy.get(".datatable-flex-cell").trigger("mouseenter");
    cy.get(".datatable-flex-cell").contains(diabetesSet.name).click();
    cy.get(".parent-header-container").find(".p-button-label").contains("Add").click();
    cy.wait(1000);
    cy.get(".p-listbox").last().find(".p-listbox-option").contains("patient -> Condition . concept").click();
    cy.findByTestId("add-feature-ok-button").contains("OK").click();
    cy.get(".p-dialog-content").find(".add-property-button").click();
    cy.get(".p-tree-node-selectable").contains("description").click();
    cy.get(".datatype-select").find(".p-select-dropdown").click({ force: true });
    cy.get(".p-select-option").contains("starts with").click();
    cy.get(".datatype-select").find(".p-select-dropdown").parent().siblings().last().type("test desc");
    cy.findByTestId("add-property-dialog-save").contains("Save").click();
    cy.findByTestId("add-feature-save-button").contains("Save").click();
    cy.get(".edit-match-container").contains("diabetes");
    cy.get(".edit-match-container").contains("Diabetes", { matchCase: false });
    cy.get(".edit-match-container").contains("description");
    cy.get(".edit-match-container").contains("test desc");
  });

  it("add feature by searching for a set and adding a numeric property", () => {
    cy.populateBaseType();
    cy.get(".add-feature-button").contains("Add feature").click();
    cy.get(".p-dialog-content").find("[data-testid=search-input]").type("Blood pressure (BP) recording codes QOF code cluster version v49");
    cy.get(".datatable-flex-cell").first().click();
    cy.get(".parent-header-container").find(".p-button-label").contains("Add").click();
    cy.wait(1000);
    cy.get(".p-listbox").last().find(".p-listbox-option").contains("patient -> Observation . concept").click();
    cy.findByTestId("add-feature-ok-button").contains("OK").click();
    cy.get(".p-dialog-content").find(".add-property-button").click();
    cy.get(".p-tree-node-content").contains("numeric value").parent().parent().parent().parent().find(".p-tree-node-selectable").contains("value").click();
    cy.get(".datatype-select").find("[placeholder=value]").type("140");
    cy.findByTestId("add-property-dialog-save").contains("Save").click();
    cy.findByTestId("add-feature-save-button").contains("Save").click();
    cy.get(".edit-match-container").contains("numeric value");
    cy.get(".edit-match-container").contains("value");
    cy.get(".edit-match-container").contains("140");
  });

  it("add feature by searching for a concept", () => {
    cy.populateBaseType();
    cy.get(".add-feature-button").contains("Add feature").click();
    cy.get("#Concept").click();
    cy.get(".p-dialog-content").find("[data-testid=search-input]").type(asthmaConcept.searchTerm);
    cy.get(".datatable-flex-cell").contains(asthmaConcept.name).click();
    cy.get(".parent-header-container").find(".p-button-label").contains("Add").click();
    cy.wait(1000);
    cy.findByTestId("add-feature-ok-button").contains("OK").click();
    cy.findByTestId("add-feature-save-button").contains("Save").click();
    cy.get(".edit-match-container").contains("Asthma");
  });

  it("add feature by searching for a property", () => {
    cy.populateBaseType();
    cy.get(".add-feature-button").contains("Add feature").click();
    cy.get("#Property").click();
    cy.get(".p-dialog-content").find("[data-testid=search-input]").type("nhs number");
    cy.get(".datatable-flex-cell").contains("nhs number", { matchCase: false }).click();
    cy.wait(10000);
    cy.findByTestId("add-feature-ok-button").contains("OK").click();
    cy.get(".property-input-container", { timeout: 60000 }).find("[data-testid=property-value-input]").type("123456789");
    cy.findByTestId("add-feature-save-button").contains("Save").click();
    cy.get(".edit-match-container").contains("nhs number 123456789", { matchCase: false });
  });

  it("add feature by searching for a feature", () => {
    cy.populateBaseType();
    cy.get(".add-feature-button").contains("Add feature").click();
    cy.get("#Feature").click();
    cy.get(".p-dialog-content").find("[data-testid=search-input]").type(diabetesFeature.searchTerm);
    cy.get(".datatable-flex-cell").contains(diabetesFeature.name).click();
    cy.findByTestId("add-feature-save-query-button", { timeout: 60000 }).contains("Save").click();
    cy.get(".edit-match-container").contains("is a");
    cy.get(".edit-match-container").contains(diabetesFeature.name);
  });

  it("add feature by searching for another feature", () => {
    cy.populateBaseType();
    cy.get(".add-feature-button").contains("Add feature").click();
    cy.get("#Cohort").click();
    cy.get(".p-dialog-content").find("[data-testid=search-input]").type("patient");
    cy.get(".datatable-flex-cell").contains("Patients registered for GMS services on the reference date").click();
    cy.findByTestId("add-feature-save-query-button", { timeout: 60000 }).contains("Save").click();
    cy.get(".edit-match-container").contains("is a");
    cy.get(".edit-match-container").contains("Patients registered for GMS services on the reference date");
  });

  it("add feature to find patients who had headache within 3 days after a medication of paracetamol", () => {
    cy.populateBaseType();
    cy.addFeature(paracetamolConcept.searchTerm, paracetamolConcept.name, "#Concept");
    cy.get(".edit-match-container").contains("Paracetamol");
    cy.get(".edit-match-container").contains("Medication").click();
    cy.get("[placeholder='Keep as reference']").type("med");
    cy.get(".edit-match-container").contains("label as med");
    cy.findByTestId("save-feature-button").contains("Save").click();
    cy.addFeature(paracetamolReactionConcept.searchTerm, paracetamolReactionConcept.name, "#Concept");
    cy.get(".edit-match-container").contains(paracetamolReactionConcept.name).click();
    cy.get(".add-property-button").click();
    cy.get(".p-tree-node-selectable").contains("date").click();
    cy.get(".datatype-select").find(".p-select").first().click({ force: true });
    cy.get(".p-select-option").contains("within").click();
    cy.get(".p-togglebutton-label").contains("the next").click();
    cy.get("[inputmode=numeric]").type("10");
    cy.get(".p-select").last().click();
    cy.get(".p-select-option").contains("Days").click();
    cy.get("[placeholder='relative to']").click();
    cy.get(".relative-to-select-dialog").find(".p-tree-node-toggle-button").click();
    cy.get(".relative-to-select-dialog").find(".p-tree-node-selectable").contains("date").click();
    cy.get(".relative-to-select-dialog").parent().parent().find(".p-dialog-footer").find(".p-button").last().contains("Save").click();
    cy.findByTestId("add-property-dialog-save").contains("Save").click();
    cy.findByTestId("save-feature-button").contains("Save").click();
    cy.get(".edit-match-container").contains("date (effective date) on 10 days relative to date (effective date) of med date (effective date)");
  });

  it("add a direct property of nhs number to patient with a nested property of address.postcode in one step", () => {
    cy.populateBaseType();
    cy.get(".add-feature-button").contains("Add feature").click();
    cy.get("#Property").click();
    cy.get(".p-dialog-content").find("[data-testid=search-input]").type("nhs number");
    cy.get(".datatable-flex-cell").contains("nhs number", { matchCase: false }).click();
    cy.wait(10000);
    cy.findByTestId("add-feature-ok-button").contains("OK").click();
    cy.get(".property-input-container", { timeout: 60000 }).find("[data-testid=property-value-input]").type("123456789");

    cy.get(".p-dialog-content").find(".add-property-button").click();

    cy.get(".add-property-dialog").find(".p-tree-node").contains("Addresses").parent().parent().parent().find(".p-tree-node-toggle-button").click();
    cy.get(".add-property-dialog")
      .find(".p-tree-node-selectable")
      .contains("Place of residence at event")
      .parent()
      .parent()
      .parent()
      .find(".p-tree-node-toggle-button")
      .click();

    cy.get(".add-property-dialog").find("li[aria-label='Address']").find(".p-tree-node-toggle-button").click();
    cy.get(".add-property-dialog").find(".p-tree-node-selectable").contains("postcode").click();
    cy.get(".add-property-dialog", { timeout: 60000 }).find("[data-testid=property-value-input]").type("LS123AA");
    cy.findByTestId("add-property-dialog-save").contains("Save").click();

    cy.findByTestId("add-feature-save-button").contains("Save").click();
    cy.get(".edit-match-container").contains("nHS Number");
    cy.get(".edit-match-container").contains("123456789");
    cy.get(".edit-match-container").contains("Place of residence at event");
    cy.get(".edit-match-container").contains("postcode");
    cy.get(".edit-match-container").contains("LS123AA");
  });

  it("add a direct property of nhs number to patient with a nested property of address.postcode in two steps", () => {
    cy.populateBaseType();
    cy.get(".add-feature-button").contains("Add feature").click();
    cy.get("#Property").click();
    cy.get(".p-dialog-content").find("[data-testid=search-input]").type("nhs number");
    cy.get(".datatable-flex-cell").contains("nhs number", { matchCase: false }).click();
    cy.wait(10000);
    cy.findByTestId("add-feature-ok-button").contains("OK").click();
    cy.get(".property-input-container", { timeout: 60000 }).find("[data-testid=property-value-input]").type("123456789");
    cy.findByTestId("add-feature-save-button").contains("Save").click();
    cy.get(".edit-match-container").contains("nHS Number").click();

    cy.get(".p-dialog-content").find(".add-property-button").click();
    cy.get(".add-property-dialog").find(".p-tree-node").contains("Addresses").parent().parent().parent().find(".p-tree-node-toggle-button").click();

    cy.get(".add-property-dialog")
      .find(".p-tree-node-selectable")
      .contains("place of residence", { matchCase: false })
      .parent()
      .parent()
      .parent()
      .find(".p-tree-node-toggle-button")
      .click();
    cy.get(".add-property-dialog").find("li[aria-label='Address']").find(".p-tree-node-toggle-button").click();
    cy.get(".add-property-dialog").find(".p-tree-node-selectable").contains("postcode").click();
    cy.get(".add-property-dialog", { timeout: 60000 }).find("[data-testid=property-value-input]").type("LS123AA");
    cy.findByTestId("add-property-dialog-save").contains("Save").click();

    cy.findByTestId("save-feature-button").contains("Save").click();
    cy.get(".edit-match-container").contains("nHS Number");
    cy.get(".edit-match-container").contains("123456789");
    cy.get(".edit-match-container").contains("Place of residence at event");
    cy.get(".edit-match-container").contains("postcode");
    cy.get(".edit-match-container").contains("LS123AA");
  });

  it("add a direct property of age to patient using navigator - set to 8 months old", () => {
    cy.populateBaseType();
    cy.get(".add-feature-button").contains("Add feature").click();
    cy.get(".p-tab").contains("Navigate").click();

    cy.get(".add-property-dialog-tree")
      .find(".p-tree-node")
      .contains("Personal identifiers")
      .parent()
      .parent()
      .parent()
      .find(".p-tree-node-toggle-button")
      .click();

    cy.get(".p-dialog-content")
      .find(".p-tree-node-selectable")
      .filter((_, el) => el.textContent.trim() === "age")
      .click();
    cy.get(".datatype-select", { timeout: 60000 }).find("[data-testid=property-value-input]").type("8");
    cy.get(".p-select").last().click();
    cy.get(".p-select-option").contains("Months").click();
    cy.findByTestId("add-property-dialog-save").contains("Save").click();

    cy.get(".edit-match-container").contains("age 8 months");
  });

  it("add a direct property of age to patient using navigator - set to range of 6-12 months old", () => {
    cy.populateBaseType();
    cy.get(".add-feature-button").contains("Add feature").click();
    cy.get(".p-tab").contains("Navigate").click();

    cy.get(".add-property-dialog-tree")
      .find(".p-tree-node")
      .contains("Personal identifiers")
      .parent()
      .parent()
      .parent()
      .find(".p-tree-node-toggle-button")
      .click();

    cy.get(".p-dialog-content")
      .find(".p-tree-node-selectable")
      .filter((_, el) => el.textContent.trim() === "age")
      .click();

    cy.get(".property-type-select", { timeout: 60000 }).click();
    cy.get(".p-select-option").contains("between").click();
    cy.findByTestId("property-value-input-from").type("6");
    cy.findByTestId("from-unit-select").click();
    cy.get(".p-select-option").contains("Months").click();

    cy.findByTestId("property-value-input-to").type("12");
    cy.findByTestId("to-unit-select").click();
    cy.get(".p-select-option").contains("Months").click();
    cy.findByTestId("add-property-dialog-save").contains("Save").click();

    cy.get(".edit-match-container").contains("age between 6 months (inc.) and 12 months (inc.)");
  });

  it("add a direct property of date of birth to patient using navigator - set to year 1975", () => {
    cy.populateBaseType();
    cy.get(".add-feature-button").contains("Add feature").click();
    cy.get(".p-tab").contains("Navigate").click();

    cy.get(".add-property-dialog-tree")
      .find(".p-tree-node")
      .contains("Personal identifiers")
      .parent()
      .parent()
      .parent()
      .find(".p-tree-node-toggle-button")
      .click();

    cy.get(".p-dialog-content").find(".p-tree-node-selectable").contains("date of birth").click();
    cy.get(".value-type", { timeout: 60000 }).click();
    cy.get(".p-select-option").contains("partial date").click();
    cy.get(".qualifier-select", { timeout: 60000 }).click();
    cy.get(".p-select-option").contains("year").click();
    cy.get(".p-dialog-content").find("[data-testid=property-value-input]").type("1975");
    cy.findByTestId("add-property-dialog-save").contains("Save").click();

    cy.get(".edit-match-container").contains("date of birth on 1975 year");
  });
});
