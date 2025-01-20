import { When, Then, Step, Given } from "@badeball/cypress-cucumber-preprocessor";

Given("the server is in private mode", () => {
  cy.intercept("GET", "imapi/api/status/public/isPublicMode", req => {
    req.alias = "isPublicMode";
    req.reply({
      statusCode: 200,
      body: false
    });
  });
});

When("I visit the home page", () => {
  cy.visit("/");
});

When("I accept the license and cookies", () => {
  cy.acceptLicenseAndCookies();
});

When("I click on the account menu", () => {
  cy.get("#topbar", { timeout: 60000 });
  cy.getByTestId("account-menu").click();
});

When("I click on the login option", () => {
  cy.get("#account-menu").find("span").contains("Login").click();
});

When("I navigate to a concept page", () => {
  cy.visit("/#/directory/folder/http%3A%2F%2Fsnomed.info%2Fsct%23195967001");
});

When("I navigate to the login page", () => {
  Step(this, "I visit the home page");
  Step(this, "I accept the license and cookies");
  Step(this, "I click on the account menu");
  Step(this, "I click on the login option");
});

When("I login to the application", () => {
  Step(this, "I enter a valid username");
  Step(this, "I enter a valid password");
  Step(this, "I click on the login button");
});

When("I enter a valid username", () => {
  cy.getByTestId("login-username").type(Cypress.env("CYPRESS_LOGIN_USERNAME"));
});

When("I enter a valid password", () => {
  cy.getByTestId("login-password").type(Cypress.env("CYPRESS_LOGIN_PASSWORD"));
});

When("I click on the login button", () => {
  cy.getByTestId("login-submit").click();
});

When("I click reveal password", () => {
  cy.get("#fieldPassword").find("svg").click();
});

When("I refresh the page", () => {
  cy.reload();
});

Then("I see the account menu", () => {
  cy.get("#topbar", { timeout: 60000 });
  cy.getByTestId("account-menu").should("exist");
});

Then("I see login option", () => {
  cy.get("#account-menu").find("span").should("exist");
});

Then("I see the login page", () => {
  cy.get('[data-testid="login-submit"]').should("exist");
});

Then("I see the home page", () => {
  cy.get("#topbar", { timeout: 60000 });
});

Then("I see the login confirmation", () => {
  cy.get(".swal2-popup", { timeout: 60000 }).contains("Login successful");
});

Then("I see the password", () => {
  cy.getByTestId("login-password").should("have.value", Cypress.env("CYPRESS_LOGIN_PASSWORD"));
});

Then("I be able to navigate to register an account", () => {
  cy.get("#register-link").click();
  cy.url().should("include", "/user/register");
});

Then("I be able to navigate to enter a confirmation code", () => {
  cy.get("#code-link").click();
  cy.url().should("include", "/user/confirm-code");
});

Then("I be able to navigate to recover my account", () => {
  cy.get("#recover-link").click();
  cy.url().should("include", "/user/password-recovery");
});

Then("the home and back buttons are not available", () => {
  cy.get('[data-testid="button-bar-home-button"]').should("not.exist");
  cy.get('[data-testid="button-bar-back-button"]').should("not.exist");
});
