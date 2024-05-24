describe("viewer", () => {
  beforeEach(() => {
    cy.acceptLicenseAndCookies();
  });

  describe("Concept", () => {
    beforeEach(() => {
      cy.searchAndSelect("Asthma");
    });

    it("loads", () => {
      cy.get("#directory-table-container", { timeout: 60000 }).find(".parent-header-container", { timeout: 10000 }).contains("Asthma");
    });
    it("can find in tree", () => {
      cy.get(".entity-buttons-container").find(".fa-list-tree").click();
      cy.get("#hierarchy-tree-bar-container").contains("Asthma", { timeout: 60000 });
    });
  });
});
