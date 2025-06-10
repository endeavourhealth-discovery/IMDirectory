import { dateNowReverse } from "@/helpers/Datetime/DateNowReverse";

const searchTerm = "athsma discorder";
const firstMatch = "Asthma (disorder)";
const parentTerm = "Disorder of respiratory system (disorder)";
const matchSNOMED = "http://snomed.info/sct#195967001";
const firstChild = "Allergic asthma";
const childCount = 21;

describe("viewer", () => {
  beforeEach(() => {
    cy.acceptLicenseAndLogin();
  });

  describe("Concept", () => {
    beforeEach(() => {
      cy.clearFavouritesAndSuggested();
      cy.searchAndSelect(searchTerm, firstMatch);
    });

    it("loads", () => {
      cy.get("#directory-table-container", { timeout: 60000 }).find(".parent-header-container", { timeout: 60000 }).contains(firstMatch);
    });
    describe("action buttons", () => {
      it("can find in tree", () => {
        cy.get(".entity-buttons-container").find(".fa-list-tree").click();
        cy.get("#hierarchy-tree-bar-container").contains(firstMatch, { timeout: 60000 });
      });
      it("can download concept", () => {
        const currentDate = dateNowReverse("_");
        const cypressDownloads = Cypress.config("downloadsFolder");
        cy.findByTestId("download-button").click();
        cy.get(".p-confirmdialog").find(".p-confirmdialog-accept-button").click();
        cy.readFile(cypressDownloads + "/" + firstMatch + "_" + currentDate + ".json");
      });
      it("can favourite", () => {
        cy.clearFavouritesAndSuggested();
        cy.get(".entity-buttons-container").find("[data-testid=favourite-button]").click();
        cy.expandTreeNode("hierarchy-tree-bar-container", "Favourites");
        cy.get("#hierarchy-tree-bar-container").contains(firstMatch);
      });
    });
    describe("breadcrumb", () => {
      it("shows breadcrumb route", () => {
        cy.get(".breadcrumb-container").contains(parentTerm);
        cy.get(".breadcrumb-container").contains("...");
        cy.get(".breadcrumb-container").contains("Health Information Model");
      });
      it("can expand route elipsis", () => {
        cy.get(".breadcrumb-container").contains("...").click();
        cy.get("#path_overlay_menu").find(".p-menu-item").should("have.length.above", 0);
      });
      it("navigates from breadcrumb", () => {
        cy.get(".breadcrumb-container").contains(parentTerm).click();
        cy.get("#directory-table-container", { timeout: 60000 }).find(".parent-header-container", { timeout: 60000 }).contains(parentTerm);
      });
      it("navigates from breadcrumb elipsis menu", () => {
        cy.get(".breadcrumb-container").contains("...").click();
        cy.get("#path_overlay_menu").contains("Ontologies").click();
        cy.get("#directory-table-container", { timeout: 60000 }).find(".parent-header-container", { timeout: 60000 }).contains("Ontologies");
      });
    });
    describe("viewer tabs", () => {
      describe("details", () => {
        it("shows details", () => {
          cy.get(".details-container").find(".p-tree-node").should("have.length.above", 0);
        });
        it("can expand all details nodes", () => {
          cy.get(".details-container")
            .find(".p-tree-node-toggle-button")
            .then(startToggles => {
              cy.findByTestId("expand-details-button").click();
              cy.get(".details-container").find(".p-tree-node-children").should("have.length.at.least", startToggles.length);
            });
        });
        it("can collapse all details nodes", () => {
          cy.wait(1000);
          cy.findByTestId("expand-details-button").click();
          cy.get(".details-container").find(".p-tree-node-children").should("exist");
          cy.findByTestId("collapse-details-button").click();
          cy.get(".details-container").get(".p-tree-node-children").should("not.exist");
        });
      });
      describe("terms tab", () => {
        beforeEach(() => {
          cy.get(".p-tablist-tab-list").find(".p-tab").contains("Terms").click();
        });
        it("has terms", () => {
          cy.get(".term-code-table").find(".p-row-even");
        });
      });
      describe("maps tab", () => {
        beforeEach(() => {
          cy.get(".p-tablist-tab-list").find(".p-tab").contains("Maps").click();
        });
        it("shows some of's in order of priority", () => {
          cy.findByTestId("hasMap").find("tr").should("have.length.above", 0);
          const priorityArray = [];
          cy.get("[data-testid=priority]").each($el => {
            cy.wrap($el)
              .invoke("text")
              .then(parseFloat)
              .then(num => priorityArray.push(num));
          });
          cy.then(() => expect(priorityArray).to.equal(priorityArray.sort()));
        });
        it("shows matched from's", () => {
          cy.findByTestId("matchedFrom").find("tr").should("have.length.above", 0);
        });
      });
      describe("contents tab", () => {
        beforeEach(() => {
          cy.get(".p-tablist-tab-list").find(".p-tab").contains("Contents").click();
        });
        it("shows children", () => {
          cy.get(".concept-data-table").find(".p-datatable-selectable-row").should("have.length.above", 0);
        });
      });
      describe("used in tab", () => {
        beforeEach(() => {
          cy.get(".p-tablist-tab-list").find(".p-tab").contains("Used In").click();
        });
        it("shows children", () => {
          cy.findByTestId("used-in-table").find(".p-datatable-selectable-row").should("have.length.above", 0);
        });
      });
      describe("hierarchy position tab", () => {
        beforeEach(() => {
          cy.get(".p-tablist-tab-list").find(".p-tab").contains("Hierarchy Position").click();
        });
        it("shows current highlighted and expanded", () => {
          cy.get(".p-tree-node-selected").contains(firstMatch);
          cy.get(".p-tree-node-children");
        });
        it("can load more", () => {
          cy.get("#secondary-tree-bar-container").find(".p-tree-node-children").find(".p-tree-node").should("have.length", childCount);
          cy.get("#secondary-tree-bar-container").contains("Load more...").click();
          cy.get("#secondary-tree-bar-container").find(".p-tree-node-children").find(".p-tree-node").should("have.length.above", 20);
        });
        it("can climb hierarchy", () => {
          cy.findByTestId("parent").find(".p-button-label").contains(parentTerm).invoke("text").as("startParent", { type: "static" });
          cy.findByTestId("parent").click();
          cy.get("@startParent").then(startParent => {
            cy.get("#secondary-tree-bar-container")
              .find(".p-tree-root-children")
              .find(".p-tree-node")
              .first()
              .find(".p-tree-node-label")
              .first()
              .invoke("text")
              .should("equal", startParent);
            cy.findByTestId("parent").find(".p-button-label").invoke("text").should("not.equal", startParent);
            cy.findByTestId("alt-parent").find(".p-button-label").invoke("text").should("not.equal", startParent);
          });
        });
        it("routes on click", () => {
          cy.get("#secondary-tree-bar-container").contains(firstChild).click();
          cy.get(".title-container").contains(firstChild);
        });
      });
      describe("entity chart tab", () => {
        beforeEach(() => {
          cy.get(".p-tablist-tab-list").find(".p-tab").contains("Entity Chart").click();
        });
        it("has isa", () => {
          cy.findByTestId("isA").find("tr").should("have.length.above", 0);
        });
        it("has subtypes", () => {
          cy.findByTestId("subtype").find("tr").should("have.length.above", 0);
        });
        it("routes on row click", () => {
          cy.findByTestId("subtype").contains(firstChild).click();
          cy.get(".title-container").contains(firstChild);
        });
      });
      describe("graph tab", () => {
        beforeEach(() => {
          cy.get(".p-tablist-next-button").click();
          cy.get(".p-tablist-tab-list").find(".p-tab").contains("Graph").click({ scrollBehavior: false });
        });
        it("loads d3 graph for entity", () => {
          cy.get("#graph-container").contains(firstMatch);
        });
      });
      describe("json tab", () => {
        beforeEach(() => {
          cy.get(".p-tablist-next-button").click();
          cy.get(".p-tablist-next-button").click();
          cy.get("#viewer-tabs").contains("JSON").click({ scrollBehavior: false });
        });
        it("has json with correct iri", () => {
          cy.get("#json-container", { timeout: 60000 }).should("contain.text", matchSNOMED);
        });
      });
      describe("provenance tab", () => {
        beforeEach(() => {
          cy.get(".p-tablist-next-button").click();
          cy.get(".p-tablist-next-button").click();
          cy.get("#viewer-tabs").contains("Provenance").click({ scrollBehavior: false });
        });
        it("has provenance table", () => {
          cy.findByTestId("provenance-table").find("tr").should("have.length.above", 0);
        });
      });
    });
  });
  describe("Set", () => {
    beforeEach(() => {
      cy.clearFavouritesAndSuggested();
      cy.searchAndSelect("Autism Spectrum Disorders (Data model value set)");
    });

    it("starts with set tab open", () => {
      cy.get("#directory-table-container", { timeout: 60000 })
        .find(".parent-header-container", { timeout: 60000 })
        .contains("Autism Spectrum Disorders (Data model value set)");
      cy.get("#viewer-tabs").find(".p-tab-active").contains("Set");
    });

    it("can download set", () => {
      const currentDate = dateNowReverse("_");
      const cypressDownloads = Cypress.config("downloadsFolder");
      cy.findByTestId("set-download-button").click();
      cy.findByTestId("download-by-query-options-dialog").contains("csv").click();
      cy.findByTestId("download-by-query-options-dialog").contains("Core").click();
      cy.findByTestId("download-by-query-options-dialog").contains("Download").click();
      cy.readFile(cypressDownloads + "/Autism Spectrum Disorders (Data model value set) - " + currentDate + ".csv");
    });
  });
});

describe("Query", () => {
  beforeEach(() => {
    cy.acceptLicenseAndLogin();
    cy.clearFavouritesAndSuggested();
    cy.searchAndSelect("Patients 65-70, or diabetes or prediabetes that need invitations for blood pressure measuring");
  });

  it("starts with query tab open", () => {
    cy.get("#directory-table-container", { timeout: 60000 }).find(".parent-header-container", { timeout: 60000 }).contains("Patients 65-70");
    cy.get("#viewer-tabs").find(".p-tab-active").contains("Query");
    cy.get("#query-container").find(".rec-query-display");
  });
});
