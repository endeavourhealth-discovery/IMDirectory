describe("Ecl search", () => {
  beforeEach(() => {
    cy.acceptLicenseAndCookies();
  });

  it("can navigate to ecl search", () => {
    cy.getByTestId("topbar-search-button").find(".p-splitbutton-dropdown").click();
    cy.get(".p-tieredmenu-overlay").contains("ECL").click();
    cy.get("#ecl-search-container").find(".title").contains("Expression constraints language search");
  });

  describe("ecl builder", () => {
    beforeEach(() => {
      cy.getByTestId("topbar-search-button").find(".p-splitbutton-dropdown").click();
      cy.get(".p-tieredmenu-overlay").contains("ECL").click();
      cy.get("#ecl-search-container").find(".title").contains("Expression constraints language search");
    });

    it("can build orGroupMinusOrGroup", () => {
      cy.getByTestId("builder-button").click();
      cy.get("#ecl-builder-dialog").get("button").contains("Add concept").click();
      cy.get("#ecl-builder-dialog").find("#autocomplete-search").type("body temperature");
      cy.get(".p-popover").find(".p-listbox-option").contains("Body temperature").click();
      cy.get("#ecl-builder-dialog").get("button").contains("Add concept").click();
      cy.get("#ecl-builder-dialog").find("#autocomplete-search").last().type("Peripheral oxygen saturation");
      cy.get(".p-popover").find(".p-listbox-option", { timeout: 60000 }).contains("Peripheral oxygen saturation").click();
      cy.get("#ecl-builder-dialog").find('[type="checkbox"]').first().check();
      cy.get("#ecl-builder-dialog").find('[type="checkbox"]').eq(1).check();
      cy.getByTestId("group-button").first().click();
      cy.get("#ecl-builder-dialog").getByTestId("add-concept-button").eq(1).click();
      cy.get("#ecl-builder-dialog").find("#autocomplete-search").last().type("Target body mass index");
      cy.get(".p-popover").find(".p-listbox-option", { timeout: 60000 }).contains("Target body mass index").click();
      cy.get("#ecl-builder-dialog").getByTestId("add-concept-button").eq(1).click();
      cy.get("#ecl-builder-dialog").find("#autocomplete-search").last().type("Target body mass index");
      cy.get(".p-popover").find(".p-listbox-option", { timeout: 60000 }).contains("Target body mass index").click();
      cy.get("#ecl-builder-dialog").find('[type="checkbox"]').eq(3).check();
      cy.get("#ecl-builder-dialog").find('[type="checkbox"]').eq(4).check();
      cy.getByTestId("group-button").first().click();
      cy.getByTestId("bool-not-button").click();
      cy.getByTestId("ecl-validate-button").click();
      cy.get(".swal2-popup").contains("Success");
      cy.get(".swal2-confirm").click();
      cy.getByTestId("ecl-ok-button").click();
      cy.getByTestId("ecl-search-button").click();
      cy.get(".p-datatable-selectable-row").should("have.length.greaterThan", 1);
    });

    it.only("can build allergyToPenicillinsOrCephasporinsWithCausativeLactams", () => {
      cy.getByTestId("builder-button").click();
      cy.get("#ecl-builder-dialog").get("button").contains("Add concept").click();
      cy.get("#ecl-builder-dialog").find("#autocomplete-search").type("Allergy to penicillin");
      cy.get(".p-popover").find(".p-listbox-option").contains("Allergy to penicillin").click();
      cy.get("#ecl-builder-dialog").get("button").contains("Add concept").click();
      cy.get("#ecl-builder-dialog").find("#autocomplete-search").last().type("Allergy to cephalosporin");
      cy.get(".p-popover").find(".p-listbox-option", { timeout: 60000 }).contains("Allergy to cephalosporin").click();
      cy.get("#ecl-builder-dialog").find('[type="checkbox"]').first().check();
      cy.get("#ecl-builder-dialog").find('[type="checkbox"]').eq(1).check();
      cy.getByTestId("group-button").first().click();
      cy.getByTestId("add-refinement-button").click();
      cy.get(".property-container").find("#autocomplete-search").type("causative");
      cy.get(".p-popover").find(".p-listbox-option", { timeout: 60000 }).contains("Causative").click();
      cy.get(".value-container").find("#autocomplete-search").type("lactam");
      cy.get(".p-popover").find(".p-listbox-option", { timeout: 60000 }).contains("Lactam").click();
      cy.getByTestId("ecl-validate-button").click();
      cy.get(".swal2-popup").contains("Success");
      cy.get(".swal2-confirm").click();
      cy.getByTestId("ecl-ok-button").click();
      cy.getByTestId("ecl-search-button").click();
      cy.get(".p-datatable-selectable-row").should("have.length.greaterThan", 1);
    });
  });
});
