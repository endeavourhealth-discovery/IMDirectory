describe("login", () => {
  beforeEach(() => {
    cy.acceptLicenseAndCookies();
    cy.get("#topbar", { timeout: 60000 });
    cy.getByTestId("account-menu").click();
    cy.get("#account-menu").find("span").contains("Login").click();
    cy.url().should("include", "/user/login");
  });

  it("can login", () => {
    cy.getByTestId("login-username").type(Cypress.env("CYPRESS_LOGIN_USERNAME"));
    cy.getByTestId("login-password").type(Cypress.env("CYPRESS_LOGIN_PASSWORD"));
  });

  it("can reveal password", () => {
    cy.getByTestId("login-username").type(Cypress.env("CYPRESS_LOGIN_USERNAME"));
    cy.getByTestId("login-password").type(Cypress.env("CYPRESS_LOGIN_PASSWORD"));
    cy.get("#reveal-password-button").click();
    cy.getByTestId("login-password").should("have.value", Cypress.env("CYPRESS_LOGIN_PASSWORD"));
  });

  it("links to register page", () => {
    cy.get("#register-link").click();
    cy.url().should("include", "/user/register");
  });

  it("links to confirm code", () => {
    cy.get("#code-link").click();
    cy.url().should("include", "/user/confirm-code");
  });

  it("links to account recovery", () => {
    cy.get("#recover-link").click();
    cy.url().should("include", "/user/password-recovery");
  });
});
