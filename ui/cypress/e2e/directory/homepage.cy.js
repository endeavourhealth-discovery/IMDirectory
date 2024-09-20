describe("homepage", () => {
  describe("Loggedout", () => {
    beforeEach(() => {
      cy.preventRouterNewTab();
      cy.acceptLicenseAndCookies();
      cy.visit("/");
      cy.get("#landing-content", { timeout: 60000 });
      cy.get(".p-progressspinner").should("not.exist");
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
      it("links to health records", () => {
        cy.get(".shortcut-container").contains("Health records").click();
        cy.url().should("include", "http%3A%2F%2Fendhealth.info%2Fim%23HealthRecords");
      });
      it("links to queries", () => {
        cy.get(".shortcut-container").contains("Queries").click();
        cy.url().should("include", "http%3A%2F%2Fendhealth.info%2Fim%23Q_Queries");
      });
      it("links to creator", () => {
        cy.get(".shortcut-container").contains("Creator").click();
        cy.get(".swal2-popup").contains("Please Login to continue");
        cy.url().should("include", "/creator");
      });
      it("links to code templates", () => {
        cy.get(".shortcut-container").contains("Code templates").click();
        cy.get(".swal2-popup").contains("Please Login to continue");
      });
      it("links to assign uprn", () => {
        cy.get(".shortcut-container").contains("ASSIGN UPRN").click();
        cy.get(".swal2-popup").contains("Please Login to continue");
        cy.url().should("include", "/uprn");
      });
      it("links to wiki", () => {
        cy.get(".shortcut-container").invoke("removeAttr", "target").contains("Wiki");
      });
    });
  });
  describe("Loggedin", () => {
    beforeEach(() => {
      cy.preventRouterNewTab();
      cy.acceptLicenseAndLogin();
      cy.visit("/");
      cy.get("#landing-content", { timeout: 60000 });
      cy.get(".p-progressspinner").should("not.exist");
    });

    it("links to creator", () => {
      cy.get(".shortcut-container").contains("Creator").click();
      cy.url().should("include", "/creator/");
      cy.get("#topbar-content", { timeout: 60000 }).contains("IM Creator");
    });

    it("links to assign uprn", () => {
      cy.get(".shortcut-container").contains("ASSIGN UPRN").click();
      cy.url().should("include", "/uprn");
      cy.get("#topbar-content", { timeout: 60000 }).contains("ASSIGN-UPRN");
    });

    it("links to code templates", () => {
      cy.get(".shortcut-container").contains("Code templates").click();
      cy.url().should("include", "/codeGenerator/");
      cy.get("#topbar-content", { timeout: 60000 }).contains("Code Generator");
    });

    it("shows suggested", () => {
      cy.searchAndSelect("Scoliosis deformity of spine (disorder)");
      cy.getByTestId("view-button").click();
      cy.getByTestId("im-logo").click();
      cy.get(".activity-container").contains("Scoliosis deformity of spine (disorder)");
    });

    it.only("shows favourites", () => {
      cy.searchAndSelect("Scoliosis deformity of spine (disorder)");
      cy.getByTestId("favourite-button").click();
      cy.getByTestId("im-logo").click();
      cy.get(".favourites-container").contains("Scoliosis deformity of spine (disorder)");
    });
  });
});
