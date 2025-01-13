import { When, Then, Step } from "@badeball/cypress-cucumber-preprocessor";

When("I visit the home page", function () {
  cy.visit("/");
});

When("I accept the license and cookies", function () {
  cy.acceptLicenseAndCookies();
});

When("I click on the account menu", function () {
  cy.get("#topbar", { timeout: 60000 });
  cy.getByTestId("account-menu").click();
});

When("I click on the login option", function () {
  cy.get("#account-menu").find("span").contains("Login").click();
});

When("I navigate to the login page", function () {
  Step(this, "I visit the home page");
  Step(this, "I accept the license and cookies");
  Step(this, "I click on the account menu");
  Step(this, "I click on the login option");
});

When("I Enter a valid username", function () {
  cy.getByTestId("login-username").type(Cypress.env("CYPRESS_LOGIN_USERNAME"));
});

When("I Enter a valid password", function () {
  cy.getByTestId("login-password").type(Cypress.env("CYPRESS_LOGIN_PASSWORD"));
});

When("I click on the login button", function () {
  cy.getByTestId("login-submit").click();
});

When("I click reveal password", function () {
  cy.get("#fieldPassword").find("svg").click();
});

Then("I should see the account menu", () => {
  cy.get("#topbar", { timeout: 60000 });
  cy.getByTestId("account-menu").should("exist");
});

Then("I should see login option", () => {
  cy.get("#account-menu").find("span").should("exist");
});

Then("I should see the login page", () => {
  cy.url().should("include", "/user/login");
});

Then("I should see the login confirmation", () => {
  cy.get(".swal2-popup", { timeout: 60000 }).contains("Login successful");
  cy.get(".swal2-confirm").click();
  cy.get("#topbar", { timeout: 60000 });
});

Then("I should see the password", () => {
  cy.getByTestId("login-password").should("have.value", Cypress.env("CYPRESS_LOGIN_PASSWORD"));
});

Then("I should be able to navigate to register an account", () => {
  cy.get("#register-link").click();
  cy.url().should("include", "/user/register");
});

Then("I should be able to navigate to enter a confirmation code", () => {
  cy.get("#code-link").click();
  cy.url().should("include", "/user/confirm-code");
});

Then("I should be able to navigate to recover my account", () => {
  cy.get("#recover-link").click();
  cy.url().should("include", "/user/password-recovery");
});
