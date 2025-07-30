describe("footer bar", () => {
  beforeEach(() => {
    cy.acceptLicenseAndCookies();
    cy.visit("/");
    cy.get("#topbar", { timeout: 60000 });
    cy.get("#footer-bar");
  });

  it("can show privacy policy", () => {
    cy.get(".footer-link").contains("Privacy policy").click();
    cy.get(".topbar-content > .title > strong").should("have.text", "Privacy policy");
  });

  it("can show cookie policy", () => {
    cy.get(".footer-link").contains("Cookie policy").click();
    cy.get(".topbar-content > .title > strong").should("have.text", "Cookies");
  });

  it("can show snomed agreement", () => {
    cy.get(".footer-link").contains("Snomed agreement").click();
    cy.get(".topbar-content > .title > strong").should("have.text", "SNOMED");
  });

  it("can show uprn agreement", () => {
    cy.get(".footer-link").contains("Uprn agreement").click();
    cy.get(".topbar-content > .title > strong").should("have.text", "UPRN");
  });

  it("can show cookie settings", () => {
    cy.findByTestId("cookie-settings-button").click();
    cy.get(".p-drawer").find("h1").should("have.text", "Our use of cookies");
  });
});
