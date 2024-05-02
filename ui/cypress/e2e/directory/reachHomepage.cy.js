describe("Can reach homepage on first visit", () => {
  it("can accept cookies and snomed licence", () => {
    cy.acceptLicenseAndCookies();
    cy.get("#landing-content", { timeout: 60000 }).find(".title").contains("Suggested");
  });
});
