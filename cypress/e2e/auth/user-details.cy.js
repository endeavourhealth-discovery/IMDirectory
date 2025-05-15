describe("User details", () => {
  beforeEach(() => {
    cy.acceptLicenseAndLogin();
    cy.visit("/");
    cy.getByTestId("account-menu-logged-in", { timeout: 60000 }).click();
    cy.get("#account-menu").contains("My account").click();
    cy.get(".user-container", { timeout: 60000 });
  });

  it("starts with user data", () => {
    cy.getByTestId("user-details-avatar").should("have.attr", "src").should("include", "001-man");
    cy.getByTestId("user-details-username").should("have.value", Cypress.env("CYPRESS_LOGIN_USERNAME"));
    cy.getByTestId("user-details-firstname").should("have.value", "Cypress");
    cy.getByTestId("user-details-lastname").should("have.value", "Test");
    cy.getByTestId("user-details-email").should("have.value", "test@example.com");
  });

  it("shows security status", () => {
    cy.get(".menu-container").contains("Security").click();
    cy.get(".two-factor-row").find(".p-tag-label").contains("Inactive");
  });

  it("can route to mfa setup", () => {
    cy.get(".menu-container").contains("Security").click();
    cy.get(".two-factor-row").find("button").click();
    cy.get(".swal2-popup").find(".swal2-confirm").contains("Login").click();
    cy.getByTestId("login-username").type(Cypress.env("CYPRESS_LOGIN_USERNAME"));
    cy.getByTestId("login-password").type(Cypress.env("CYPRESS_LOGIN_PASSWORD"));
    cy.getByTestId("login-submit").click();
    cy.get(".swal2-popup").find(".swal2-confirm").click();
    cy.url({ timeout: 60000 }).should("contain", "/mfa-setup");
  });

  it("an show authorisation roles", () => {
    cy.get(".menu-container").contains("Authorisation roles").click();
    cy.get(".roles-content").find("tr").should("have.length.at.least", 1);
  });

  it("can open editor", () => {
    cy.get(".user-edit").click();
    cy.url({ timeout: 60000 }).should("contain", "my-account/edit");
  });
});
