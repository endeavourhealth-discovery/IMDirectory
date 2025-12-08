describe("Logged in", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.acceptLicenseAndLogin();
    cy.preventRouterNewTab();
    cy.visit("/");
    cy.get("#topbar", { timeout: 60000 });
  });

  it("can route to my account", () => {
    cy.findByTestId("account-menu-logged-in").click();
    cy.get("#account-menu").find("span").contains("My account").click();

    cy.origin(Cypress.env("CASDOOR_LOGIN_URL"), () => {
      cy.url().should("include", "account");
    });
  });

  it("can route to logout", () => {
    cy.findByTestId("account-menu-logged-in").click();
    cy.get("#account-menu").find("span").contains("Logout").click();
    cy.get(".swal2-confirm").click();
    cy.findByTestId("account-menu").click();
    cy.get("#account-menu").find("span").contains("Login");
  });
});
