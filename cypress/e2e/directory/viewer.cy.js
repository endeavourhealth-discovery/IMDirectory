import { dateNowReverse } from "@/helpers/Datetime/DateNowReverse";
import path from "path";

describe("viewer", () => {
  beforeEach(() => {
    cy.acceptLicenseAndCookies();
  });

  describe("Concept", () => {
    beforeEach(() => {
      cy.searchAndSelect("Asthma");
    });

    it("loads", () => {
      cy.get("#directory-table-container", { timeout: 60000 }).find(".parent-header-container", { timeout: 60000 }).contains("Asthma");
    });
    it("can find in tree", () => {
      cy.get(".entity-buttons-container").find(".fa-list-tree").click();
      cy.get("#hierarchy-tree-bar-container").contains("Asthma", { timeout: 60000 });
    });
    it.only("can download concept", () => {
      const currentDate = dateNowReverse("_");
      const cypressDownloads = Cypress.config("downloadsFolder");
      cy.getByTestId("download-button").click();
      cy.get(".p-confirmdialog").find(".p-confirmdialog-accept-button").click();
      cy.readFile(path.join(cypressDownloads + "/asthma (disorder)_" + currentDate + ".json"));
    });
  });
});
