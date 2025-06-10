import { FilterOptions } from "@/interfaces";
import "./auth-provider-commands/cognito";
import { toMatchSnapshot } from "./snapshots";
import "globals";
import "@testing-library/cypress/add-commands";

declare global {
  var vueSnapshots: any;
  namespace Cypress {
    interface Chainable {
      acceptLicenseAndCookies(): Chainable<void>;
      openReleaseNotes(): Chainable<void>;
      preventRouterNewTab(): Chainable<void>;
      visitNewTab(url: string): Chainable<void>;
      login(): Chainable<void>;
      expandTreeNode(treeId: string, contains: string): Chainable<void>;
      searchAndSelect(searchTerm: string): Chainable<void>;
      acceptLicenseAndLogin(): Chainable<void>;
      populateBaseType(): Chainable<void>;
      loginByCognitoApi(username: string, password: string): Chainable<void>;
      setLocalStorage(localStorageMap: Map<string, string>): Chainable<void>;
      requestWithAuth(method: "POST" | "GET", url: string, body: any): Chainable<any>;
      clearFavouritesAndSuggested(): Chainable<void>;
      searchAndSelectWithFilters(searchTerm: string, filters: FilterOptions): Chainable<void>;
      setHostingMode(isPublicMode: boolean): Chainable<void>;
      toMatchSnapshot(options?: any): void;
    }
  }
}

Cypress.Commands.add("acceptLicenseAndCookies", (url?: string) => {
  cy.visit(url ?? "/");
  cy.get("[data-testid='license-dialog']", { timeout: 60000 }).should("exist");
  cy.get("[data-testid='agree-button']").click();
  cy.get("[data-testid='license-dialog']").should("not.exist");
  cy.get("#cookies-sidebar").find("h1").should("have.text", "Our use of cookies");
  cy.get("[data-testid='accept-all-cookies']").click();
  cy.get("#cookies-sidebar").should("not.exist");
});

Cypress.Commands.add("openReleaseNotes", () => {
  cy.get(".release-notes-link").click();
  cy.get(".p-dialog-content").find(".title", { timeout: 60000 }).should("have.text", "Releases");
});

Cypress.Commands.add("preventRouterNewTab", () => {
  cy.on("window:before:load", win => {
    cy.stub(win, "open").as("open");
  });
});

Cypress.Commands.add("visitNewTab", url => {
  cy.get("@open").should("have.been.calledOnceWithExactly", url);
  cy.visit(url);
});

Cypress.Commands.add("requestWithAuth", (method: "POST" | "GET", url: string, body: any) => {
  const cognitoKeyPrefixWithUsername = localStorage.getItem("cognitoKeyPrefixWithUsername");
  let result;
  cy.request({
    method: method,
    url: url,
    body: body,
    headers: { Authorization: "Bearer " + window.localStorage.getItem(`${cognitoKeyPrefixWithUsername}.idToken`) }
  }).then(res => {
    result = res.body;
  });
  return result;
});

Cypress.Commands.add("clearFavouritesAndSuggested", () => {
  cy.requestWithAuth("POST", "http://localhost:8082/imapi/api/user/MRU", []);
  cy.requestWithAuth("POST", "http://localhost:8082/imapi/api/user/favourites", []);
});

Cypress.Commands.add("login", () => {
  cy.get("#topbar", { timeout: 60000 });
  cy.findByTestId("account-menu").click();
  cy.get("#account-menu").find("span").contains("Login").click();
  cy.url().should("include", "/user/login");
  cy.findByTestId("login-username").type(Cypress.env("CYPRESS_LOGIN_USERNAME"));
  cy.get("#login-password").type(Cypress.env("CYPRESS_LOGIN_PASSWORD"));
  cy.findByTestId("login-submit").click();
  cy.get(".swal2-popup", { timeout: 60000 }).contains("Login successful");
  cy.get(".swal2-confirm").click();
  cy.get("#topbar", { timeout: 60000 });
});

Cypress.Commands.add("acceptLicenseAndLogin", () => {
  cy.loginByCognitoApi(Cypress.env("CYPRESS_LOGIN_USERNAME"), Cypress.env("CYPRESS_LOGIN_PASSWORD"));
  cy.acceptLicenseAndCookies();
});

Cypress.Commands.add("expandTreeNode", (treeId: string, contains: string) => {
  cy.get(`#${treeId}`).contains(contains, { timeout: 10000 }).parents(".p-tree-node-selectable").find(".p-tree-node-toggle-button").click();
});

Cypress.Commands.add("searchAndSelect", (searchTerm: string, matchTerm?: string) => {
  cy.get("[data-testid='search-input']", { timeout: 60000 }).type(searchTerm);
  cy.wait(4000);
  cy.get(".p-datatable-selectable-row", { timeout: 60000 }).should("have.length.gte", 1).first().click();
  cy.get("#directory-table-container", { timeout: 60000 })
    .find(".parent-header-container", { timeout: 10000 })
    .contains(matchTerm ?? searchTerm);
  cy.get("#viewer-tabs", { timeout: 10000 });
});

Cypress.Commands.add("searchAndSelectWithFilters", (searchTerm: string, filters: FilterOptions) => {
  cy.findByTestId("topbar-search-button").contains("Search").click();
  if (filters?.status.length) {
    for (const status of filters.status) {
      if (status.name) {
        cy.findByTestId("status-filter").find(".p-multiselect-dropdown").click();
        cy.get(".p-multiselect-overlay").contains(status.name).click();
      }
    }
  }
  if (filters?.schemes.length) {
    for (const schemes of filters.schemes) {
      if (schemes.name) {
        cy.findByTestId("scheme-filter").find(".p-multiselect-dropdown").click();
        cy.get(".p-multiselect-overlay").contains(schemes.name).click();
      }
    }
  }
  if (filters?.types.length) {
    for (const type of filters.types) {
      if (type.name) {
        cy.findByTestId("type-filter").find(".p-multiselect-dropdown").click();
        cy.get(".p-multiselect-overlay").contains(type.name).click();
      }
    }
  }
  cy.searchAndSelect(searchTerm);
});

Cypress.Commands.add("setLocalStorage", (localStorageMap: Map<string, string>) => {
  localStorageMap.forEach((value, key) => {
    window.localStorage.setItem(key, value);
  });
});

Cypress.Commands.add("setHostingMode", (isPublicMode: boolean) => {
  cy.intercept("GET", "imapi/api/status/public/isPublicMode", req => {
    req.alias = "isPublicMode";
    req.reply({
      statusCode: 200,
      body: isPublicMode
    });
  });
});

Cypress.Commands.add("toMatchSnapshot", { prevSubject: ["element"] }, toMatchSnapshot);

export {};
