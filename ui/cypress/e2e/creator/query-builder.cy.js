describe("Query builder", () => {
  beforeEach(() => {
    cy.acceptLicenseAndLogin();
    cy.visit("/");
    cy.getByTestId("apps-button", { timeout: 60000 }).click();
    cy.get("#apps-menu").contains("Creator");
    cy.visit("/#/creator");
    cy.get("div[class=type-selector]").find("button[class=custom-button]").contains("Cohort Query").click();
  });

  it("starts with empty base type", () => {
    cy.get("#im-query-editor-container").find("input[data-testid=search-input]").should("have.value", "");
  });

  //   it("populate base from search input", () => {
  //     cy.get("#im-query-editor-container").find("input[data-testid=search-input]").type("patient");
  //   });

  it("populate base from search dialog", () => {
    cy.get("#im-query-editor-container").find("span[class='p-button-icon pi pi-search']").click();
    cy.get("div[class=p-dialog-content]").find("input[data-testid=search-input]").type("patient");
    cy.get("div[class=datatable-flex-cell]").contains("Patient").click();
    cy.wait(1000);
    cy.get("div[class=p-dialog-footer]").find("button[class='p-button p-component']").contains("Select").click();
    cy.get("#im-query-editor-container").find("input[data-testid=search-input]").should("have.value", "Patient");
  });

  it("add feature by searching for a set", () => {
    cy.populateBaseType();
    cy.get("span[class=p-button-label]").contains("Add feature").click();
    cy.get("div[class=p-dialog-content]").find("input[data-testid=search-input]").type("diabetes");
    cy.get("div[class=datatable-flex-cell]").contains("Diabetes mellitus type 2 or Diabetes mellitus in remission + more...").click();
    cy.get("div[class=parent-header-container]").find("span[class=p-button-label]").contains("Add").click();
    cy.wait(1000);
    cy.get("button[class='p-button p-component']").contains("OK").click();
    cy.get("button[class='p-button p-component']").contains("Save").click();
    cy.get(".edit-match-container").contains("Condition");
    cy.get(".edit-match-container").contains("Diabetes");
  });

  it("add feature by searching for a concept", () => {
    cy.populateBaseType();
    cy.get("span[class=p-button-label]").contains("Add feature").click();
    cy.get("div[class='type-options flex flex-wrap gap-4']").find("input[id=Concept]").click();
    cy.get("div[class=p-dialog-content]").find("input[data-testid=search-input]").type("asthma");
    cy.get("div[class=datatable-flex-cell]").contains("Asthma (disorder)").click();
    cy.get("div[class=parent-header-container]").find("span[class=p-button-label]").contains("Add").click();
    cy.wait(1000);
    cy.get("button[class='p-button p-component']").contains("OK").click();
    cy.get("button[class='p-button p-component']").contains("Save").click();
    cy.get(".edit-match-container").contains("Condition");
    cy.get(".edit-match-container").contains("Asthma (disorder)");
  });

  it("add feature by searching for a property", () => {
    cy.populateBaseType();
    cy.get("span[class=p-button-label]").contains("Add feature").click();
    cy.get("div[class='type-options flex flex-wrap gap-4']").find("input[id=Property]").click();
    cy.get("div[class=p-dialog-content]").find("input[data-testid=search-input]").type("nhs number");
    cy.get("span[class='break-word flex-1']").contains("nhs number", { matchCase: false }).click();
    cy.get("span[class=p-button-label]").contains("OK").click();
    cy.wait(1000);
    cy.get(".property-input-container").find("input[type=text]").type("123456789");
    cy.get("button[class='p-button p-component']").contains("Save").click();
    cy.get(".edit-match-container").contains("Patient personal and demographics");
    cy.get(".edit-match-container").contains("nhs number 123456789", { matchCase: false });
  });

  it("add feature by searching for a feature", () => {
    cy.populateBaseType();
    cy.get("span[class=p-button-label]").contains("Add feature").click();
    cy.get("div[class='type-options flex flex-wrap gap-4']").find("input[id=Feature]").click();
    cy.get("div[class=p-dialog-content]").find("input[data-testid=search-input]").type("diabetes");
    cy.get("span[class='break-word flex-1']").contains("Active Diabetes (Latest entry for diabetes not followed by a resolution)").click();
    cy.wait(1000);
    cy.get("button[class='p-button p-component']").contains("Save").click();
    cy.get(".edit-match-container").contains("in the cohort");
    cy.get(".edit-match-container").contains("Active Diabetes (Latest entry for diabetes not followed by a resolution)");
  });

  it("add feature by searching for a feature", () => {
    cy.populateBaseType();
    cy.get("span[class=p-button-label]").contains("Add feature").click();
    cy.get("div[class='type-options flex flex-wrap gap-4']").find("input[id=Cohort]").click();
    cy.get("div[class=p-dialog-content]").find("input[data-testid=search-input]").type("patient");
    cy.get("span[class='break-word flex-1']").contains("Patients registered for GMS services on the reference date").click();
    cy.wait(1000);
    cy.get("button[class='p-button p-component']").contains("Save").click();
    cy.get(".edit-match-container").contains("in the cohort");
    cy.get(".edit-match-container").contains("Patients registered for GMS services on the reference date");
  });
});
