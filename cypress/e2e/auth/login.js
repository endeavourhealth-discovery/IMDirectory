import { When, Then, Step, Given } from "@badeball/cypress-cucumber-preprocessor";

const loginSnapshotConfig = {
  attributesToClear: ["aria-controls", "class", "style", "data-pc-section", "data-pc-name", "data-pc-section", "data-scrollselectors"],
  stubs: [".p-tabpanels", "svg"],
  regexToRemoveAttributes: new RegExp(/data-.*|p.\d|aria-.*/),
  removeComments: true,
  removeDataTestId: true,
  formatting: {
    attributesPerLine: 10,
    classesPerLine: 10,
    inlineStylesPerLine: 10,
    escapeInnerText: false,
    emptyAttributes: false,
    selfClosingTag: true
  }
};

Given("the server is in private mode", () => {
  cy.setHostingMode(false);
});

Given("the server is in public mode", () => {
  cy.setHostingMode(true);
});

When("I visit the home page", () => {
  cy.visit("/");
});

When("I visit an entity url", () => {
  cy.acceptLicenseAndCookies("http://localhost:8082/#/directory/folder/http:%2F%2Fapiqcodes.org%2Fqcodes%23QPredict_331");
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

Then("I see the entity viewer", () => {
  cy.get("#directory-table-container", { timeout: 60000 }).find(".parent-header-container", { timeout: 60000 }).contains("QRISK3 2024");
});

Then(/^the (.*) matches the snapshot$/, function (testId) {
  cy.getByTestId(testId).toMatchSnapshot(loginSnapshotConfig);
});
