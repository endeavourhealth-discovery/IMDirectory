describe("top bar", () => {
  beforeEach(() => {
    cy.acceptLicenseAndCookies();
  });

  describe("banner bar", () => {
    it("can show latest version banner", () => {
      cy.get("#banner > .banner-text-container > .banner-text").should("include.text", "Release");
    });

    it("shows release notes on banner bar link click", () => {
      cy.get(".release-notes-link").click();
      cy.get(".p-dialog-header").should("have.text", "What's new");
    });
  });

  describe("release notes button", () => {
    it("shows release notes", () => {
      cy.get("[data-testid='releases-button']").click();
      cy.get("#banner > .banner-text-container > .banner-text").should("include.text", "Release");
    });
  });

  describe("release notes", () => {
    beforeEach(() => {
      cy.openReleaseNotes();
    });
    it("starts with latest directory release", () => {
      cy.get(".tgl-directory > .releases-container > .release-container").should("have.length", 1);
    });
    it("can view more", () => {
      cy.get(".tgl-directory").find(".view-more").click();
      cy.get(".tgl-directory > .releases-container > .release-container").should("have.length.above", 1);
    });
    it("can view importData releases", () => {
      cy.get("#expand-button-importData").click();
      cy.get(".tgl-importData > .releases-container > .release-container").should("have.length", 1);
    });
    it("can view more importData", () => {
      cy.get("#expand-button-importData").click();
      cy.get(".tgl-importData").find(".view-more").click();
      cy.get(".tgl-importData > .releases-container > .release-container").should("have.length.above", 1);
    });
    it("has a github url in every release", () => {
      cy.get(".tgl-directory").find(".view-more").click();
      cy.get("#expand-button-importData").click();
      cy.get(".tgl-importData").find(".view-more").click();
      cy.get(".release-container").each(($el, index, $list) => {
        cy.wrap($el).find("a").should("have.attr", "href");
      });
    });
    it("can close", () => {
      cy.getByTestId("close-button").click();
      cy.get(".tgl-directory").should("not.exist");
    });
  });

  describe("themes", () => {
    it("can change theme", () => {
      cy.get("#banner").should("have.css", "background-color", "rgb(33, 150, 243)");
      cy.getByTestId("change-theme-button").click();
      cy.get('[src="http://localhost:8082/src/assets/themes/arya-purple.png"').click();
      cy.get("#banner").should("have.css", "background-color", "rgb(186, 104, 200)");
    });
  });

  describe("font size", () => {
    it("can change font size", () => {
      cy.get(".p-button-label").first().should("have.css", "font-size", "16px");
      cy.getByTestId("font-size-button").click();
      cy.get("#scale-menu").find(".p-menuitem").first().should("have.text", "Small").click();
      cy.get(".p-button-label").first().should("not.have.css", "font-size", "16px");
    });
  });

  describe.only("upload/download", () => {
    it("can open code generator", () => {
      cy.getByTestId("upload-download-button").click();
      cy.get("#admin-menu").find("span").contains("Download Code").click();
      cy.get("#code-download-dialog").find(".p-dialog-title").contains("Set namespace/package");
    });
  });
});
