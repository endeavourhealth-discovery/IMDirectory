describe("Visit search routes directly", () => {
  it("can visit search", () => {
    cy.acceptLicenseAndCookies("/#/directory/search");
    cy.get("#search-results-main-container").contains("Results");
  });

  it("can visit ecl search", () => {
    cy.acceptLicenseAndCookies("/#/directory/eclSearch");
    cy.get("#search-results-main-container").contains("Results");
  });

  it("can visit imq search", () => {
    cy.acceptLicenseAndCookies("/#/directory/IMQuerySearch");
    cy.get("#search-results-main-container").contains("Results");
  });
});
