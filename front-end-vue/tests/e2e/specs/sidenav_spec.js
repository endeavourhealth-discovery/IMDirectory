describe("The Sidenav", () => {
  beforeEach(() => {
    cy.intercept("GET", "/api/report/concept/scheme", {
      statusCode: 200,
      body: [
        { count: 1029846, label: "Snomed-CT code" },
        { count: 12079, label: "Term based code" },
        { count: 1970, label: "Discovery code" },
        { count: 145, label: "ODS code" },
        { count: 1, label: "Vision Read2 code scheme"}
      ]
    });
    cy.intercept("GET", "/api/report/concept/status", {
      statusCode: 200,
      body: [
        { count: 761788, label: "Active" },
        { count: 283694, label: "Inactive" },
        { count: 2050, label: "Draft" },
      ]
    });
    cy.intercept("GET", "/api/report/concept/types", {
      statusCode: 200,
      body: [
        { label: "Class", count: 1044018 },
        { label: "Object Property", count: 1811 },
        { label: "Set", count: 1122 },
        { label: "Record Type", count: 94 },
        { label: "Data Property", count: 68 },
        { label: "Query Set", count: 45 },
        { label: "Functional Property", count: 26 },
        { label: "Annotation Property", count: 23 },
        { label: "Transitive Property", count: 11 },
        { label: "Symmetric Property", count: 11 },
        { label: "Value Set", count: 7 },
        { label: "Folder", count: 7 },
        { label: "Reflexive Property", count: 2 },
        { label: "Query Template", count: 1 },
        { label: "Named Individual", count: 1 },
      ]
    });
    cy.intercept("GET", "/api/report/concept/category", {
      statusCode: 200,
      body: [
        { label: "Value Sets", count: 7 },
        { label: "Data Models", count: 1973 },
        { label: "Ontology", count: 1045267 },
        { label: "Total", count: 1047247 }
      ]
    });
    cy.visit('/');
    cy.get(".p-button-label")
      .contains("Agree")
      .click();
    cy.contains("Ontology overview");
  });

  it("Login button successfully redirects to Login page", () => {
    cy.get("#user-icon").click();
    cy.contains("Login").click();
    cy.url().should("include", "/user/login");
    cy.contains("Login");
    cy.contains("Back").click();
    cy.contains("Ontology overview");
  });

  it("Register button successfully redirects to Register page", () => {
    cy.get("#user-icon").click();
    cy.contains("Register").click();
    cy.url().should("include", "/user/register");
    cy.contains("Register");
    cy.contains("Back").click();
    cy.contains("Ontology overview");
  });
});
