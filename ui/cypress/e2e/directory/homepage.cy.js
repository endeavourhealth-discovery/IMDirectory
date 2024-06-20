describe("homepage", () => {
  describe("Loggedout", () => {
    beforeEach(() => {
      cy.preventNewTab();
      cy.acceptLicenseAndCookies();
      cy.get("#landing-content", { timeout: 60000 });
    });
    it("can accept cookies and snomed licence", () => {
      cy.get(".title").contains("Suggested");
      cy.get("h2").contains("Quick links");
      cy.get(".favourites-container").find(".title").contains("Favourites");
    });
    describe("Quicklinks", () => {
      it("links to ontology", () => {
        cy.get(".shortcut-container").contains("Ontology").click();
        cy.url().should("include", "http%3A%2F%2Fendhealth.info%2Fim%23HealthModelOntology");
      });
      it("links to sets", () => {
        cy.get(".shortcut-container").contains("Sets").click();
        cy.url().should("include", "http%3A%2F%2Fendhealth.info%2Fim%23Sets");
      });
      it("links to models", () => {
        cy.get(".shortcut-container").contains("Models").click();
        cy.url().should("include", "http%3A%2F%2Fendhealth.info%2Fim%23DataModels");
      });
      it("links to queries", () => {
        cy.get(".shortcut-container").contains("Queries").click();
        cy.url().should("include", "http%3A%2F%2Fendhealth.info%2Fim%23Q_Queries");
      });
      it("links to creator", () => {
        cy.get(".shortcut-container").contains("Creator").click();
        cy.url().should("include", "/creator");
      });
      it("links to code templates", () => {
        cy.get(".shortcut-container").contains("Code templates").click();
        cy.url().should("include", "/creator");
      });
      it("links to assign uprn", () => {
        cy.get(".shortcut-container").contains("ASSIGN UPRN").click();
        cy.url().should("include", "/uprn");
      });
      it("links to wiki", () => {
        cy.get(".shortcut-container").contains("Wiki").click();
        cy.url().should("include", "https://wiki.endeavourhealth.org/");
      });
    });
  });
});
