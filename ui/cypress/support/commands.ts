/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
Cypress.Commands.add("acceptLicenseAndCookies", () => {
  cy.visit("/");
  cy.get("#cookies-sidebar").find("h1").should("have.text", "Our use of cookies");
  cy.get("[data-testid='accept-all-cookies']").click();
  cy.get("#cookies-sidebar").should("not.exist");
  cy.get("[data-testid='license-dialog']", { timeout: 60000 }).should("exist");
  cy.get("[data-testid='agree-button']").click();
  cy.get("[data-testid='license-dialog']").should("not.exist");
});

Cypress.Commands.add("openReleaseNotes", () => {
  cy.get(".release-notes-link").click();
  cy.get(".p-dialog-header").should("have.text", "What's new");
});

Cypress.Commands.add("getByTestId", id => {
  cy.get(`[data-testid=${id}]`);
});

Cypress.Commands.add("preventNewTab", () => {
  cy.on("window:before:load", win => {
    cy.stub(win, "open")
      .as("windowOpen")
      .callsFake(url => {
        cy.visit(url);
      });
  });
});
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })

// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })

// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })

// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

declare global {
  namespace Cypress {
    interface Chainable {
      acceptLicenseAndCookies(): Chainable<void>;
      openReleaseNotes(): Chainable<void>;
      getByTestId(id: string): Chainable<void>;
      preventNewTab(): Chainable<void>;
    }
  }
}

export {};
