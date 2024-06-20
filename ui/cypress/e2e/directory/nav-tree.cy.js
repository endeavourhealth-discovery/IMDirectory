describe("nav tree", () => {
  beforeEach(() => {
    cy.acceptLicenseAndCookies();
    cy.get("#hierarchy-tree-bar-container", { timeout: 60000 }).find("li", { timeout: 60000 }).contains("Ontologies");
  });
  it("can expand nodes", () => {
    cy.expandTreeNode("hierarchy-tree-bar-container", "Ontologies");
    cy.get("#hierarchy-tree-bar-container").contains("Discovery Snomed-CT extension concepts");
  });
  it("can load more", () => {
    cy.expandTreeNode("hierarchy-tree-bar-container", "Ontologies");
    cy.expandTreeNode("hierarchy-tree-bar-container", "SNOMED CT Concept (SNOMED RT+CTV3)");
    cy.expandTreeNode("hierarchy-tree-bar-container", "Clinical finding (finding)");
    cy.get("#hierarchy-tree-bar-container")
      .contains("Clinical finding (finding)")
      .parents(".p-treenode")
      .first()
      .find(".p-treenode-children")
      .find(".p-treenode")
      .should("have.length.at.most", 21);
    cy.get("#hierarchy-tree-bar-container").contains("Load more...").click();
    cy.get("#hierarchy-tree-bar-container")
      .contains("Clinical finding (finding)")
      .parents(".p-treenode")
      .first()
      .find(".p-treenode-children")
      .find(".p-treenode")
      .should("have.length.at.least", 22);
  });
  it("can select a node and route", () => {
    cy.get("#hierarchy-tree-bar-container").contains("Ontologies").click();
    cy.get("#directory-table-container", { timeout: 60000 }).find(".parent-header-container", { timeout: 10000 }).contains("Ontologies");
  });
  it("shows overlay on hover", () => {
    cy.get("#hierarchy-tree-bar-container").contains("Ontologies").trigger("mouseover");
    cy.get("#overlay-panel").contains("Ontologies");
  });
});
