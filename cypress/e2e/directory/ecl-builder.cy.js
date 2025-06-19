describe("Ecl search", () => {
  beforeEach(() => {
    cy.acceptLicenseAndCookies();
  });

  it("can navigate to ecl search", () => {
    cy.findByTestId("topbar-search-button").find(".p-splitbutton-dropdown").click();
    cy.get(".p-tieredmenu-overlay").contains("ECL").click();
    cy.get("#ecl-search-container").find(".title").contains("Expression constraints language search");
  });

  describe("ecl builder", () => {
    beforeEach(() => {
      cy.findByTestId("topbar-search-button").find(".p-splitbutton-dropdown").click();
      cy.get(".p-tieredmenu-overlay").contains("ECL").click();
      cy.get("#ecl-search-container").find(".title").contains("Expression constraints language search");
    });

    it.only("can build orGroupMinusOrGroup", () => {
      cy.findByTestId("builder-button").click();
      cy.get("#ecl-builder-dialog").get('[data-testid="add-bool-concept-button"]').click();
      cy.get("#ecl-builder-dialog").find("#autocomplete-search").type("body temperature");
      cy.get(".p-popover").find(".p-listbox-option").contains("Body temperature").click();
      cy.get("#ecl-builder-dialog").get('[data-testid="add-concept-button"]').click();
      cy.get("#ecl-builder-dialog").find("#autocomplete-search").last().type("Peripheral oxygen saturation");
      cy.get(".p-popover").find(".p-listbox-option", { timeout: 60000 }).contains("Peripheral oxygen saturation").click();
      cy.get("#ecl-builder-dialog").get('[data-testid="add-bool-concept-button"]').click();
      cy.get("#ecl-builder-dialog").find("#autocomplete-search").last().type("Target body mass index");
      cy.get(".p-popover").find(".p-listbox-option", { timeout: 60000 }).contains("Target body mass index").click();
      cy.get("#ecl-builder-dialog").get('[data-testid="add-bool-concept-button"]').click();
      cy.get("#ecl-builder-dialog").find("#autocomplete-search").last().type("Target body mass index");
      cy.get(".p-popover").find(".p-listbox-option", { timeout: 60000 }).contains("Target body mass index").click();
      cy.get("#ecl-builder-dialog").get('[data-testid="operator-selector"]').eq(3).click();
      cy.get(".p-select-list-container").contains("li", "Minus").click();
      cy.get("#ecl-builder-dialog").get('[data-testid="operator-selector"]').eq(2).click();
      cy.get(".p-select-list-container").contains("li", "Minus").click();
      cy.get("#ecl-builder-dialog").get('[data-testid= "ecl-ok-button"]').click();
      cy.findByTestId("ecl-search-button").click();
      cy.get(".p-datatable-selectable-row").should("have.length.greaterThan", 1);
    });

    it("can build allergyToPenicillinsOrCephasporinsWithCausativeLactams", () => {
      cy.findByTestId("builder-button").click();
      cy.get("#ecl-builder-dialog").get("button").contains("Add concept").click();
      cy.get("#ecl-builder-dialog").find("#autocomplete-search").type("Allergy to penicillin");
      cy.get(".p-popover").find(".p-listbox-option").contains("Allergy to penicillin").click();
      cy.get("#ecl-builder-dialog").get("button").contains("Add concept").click();
      cy.get("#ecl-builder-dialog").find("#autocomplete-search").last().type("Allergy to cephalosporin");
      cy.get(".p-popover").find(".p-listbox-option", { timeout: 60000 }).contains("Allergy to cephalosporin").click();
      cy.findByTestId("add-shared-refinement-button").last().click();
      cy.get(".property-container").find("#autocomplete-search").type("causative");
      cy.get(".p-popover").find(".p-listbox-option", { timeout: 60000 }).contains("Causative").click();
      cy.get(".value-container").find("#autocomplete-search").type("lactam");
      cy.get(".p-popover").find(".p-listbox-option", { timeout: 60000 }).contains("Lactam").click();
      cy.findByTestId("ecl-validate-button").click();
      cy.get(".swal2-popup").contains("Success");
      cy.get(".swal2-confirm").click();
      cy.findByTestId("ecl-ok-button").click();
      cy.findByTestId("ecl-search-button").click();
      cy.get(".p-datatable-selectable-row").should("have.length.greaterThan", 1);
    });

    it("can build andGroupedWithSubsumptionAttributeValue", () => {
      cy.findByTestId("builder-button").click();
      cy.get("#ecl-builder-dialog").get("button").contains("Add concept").click();
      cy.get("#ecl-builder-dialog").find("#autocomplete-search").type("Finding of region of thorax");
      cy.get(".p-popover").find(".p-listbox-option").contains("Finding of region of thorax").click();
      cy.get("#ecl-builder-dialog").get("button").contains("Add concept").click();
      cy.get("#ecl-builder-dialog").find("#autocomplete-search").last().type("Pain of truncal structure");
      cy.get(".p-popover").find(".p-listbox-option", { timeout: 60000 }).contains("Pain of truncal structure").click();
      cy.findByTestId("add-refinement-button").last().click();
      cy.get(".property-container").find("#autocomplete-search").type("Finding site");
      cy.get(".p-popover").find(".p-listbox-option", { timeout: 60000 }).contains("Finding site").click();
      cy.get(".value-container").find("#autocomplete-search").type("Thoracic structure");
      cy.get(".p-popover").find(".p-listbox-option", { timeout: 60000 }).contains("Thoracic structure").click();
      cy.findByTestId("group-checkbox").last().click();
      cy.findByTestId("group-button").first().click();
      cy.findByTestId("attribute-checkbox").click();
      cy.wait(1000);
      cy.findByTestId("ecl-validate-button").click();
      cy.get(".swal2-popup").contains("Success");
      cy.get(".swal2-confirm").click();
      cy.findByTestId("ecl-ok-button").click();
      cy.findByTestId("ecl-search-button").click();
      cy.get(".p-datatable-selectable-row").should("have.length.greaterThan", 1);
    });
  });
});
