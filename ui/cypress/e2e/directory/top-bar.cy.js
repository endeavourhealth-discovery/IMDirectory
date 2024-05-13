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
      cy.get("[data-testid='close-button']").click();
      cy.get(".tgl-directory").should("not.exist");
    });
  });
});
