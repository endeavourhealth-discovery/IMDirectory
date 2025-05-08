import { dateNowReverse } from "@/helpers/Datetime/DateNowReverse";

describe("viewer", () => {
  beforeEach(() => {
    cy.acceptLicenseAndLogin();
  });

  describe("Concept", () => {
    beforeEach(() => {
      cy.clearFavouritesAndSuggested();
      cy.searchAndSelect("Asthma");
    });

    it("loads", () => {
      cy.get("#directory-table-container", { timeout: 60000 }).find(".parent-header-container", { timeout: 60000 }).contains("Asthma");
    });
    describe("action buttons", () => {
      it("can find in tree", () => {
        cy.get(".entity-buttons-container").find(".fa-list-tree").click();
        cy.get("#hierarchy-tree-bar-container").contains("Asthma", { timeout: 60000 });
      });
      it("can download concept", () => {
        const currentDate = dateNowReverse("_");
        const cypressDownloads = Cypress.config("downloadsFolder");
        cy.getByTestId("download-button").click();
        cy.get(".p-confirmdialog").find(".p-confirmdialog-accept-button").click();
        cy.readFile(cypressDownloads + "/Asthma (disorder)_" + currentDate + ".json");
      });
      it("can favourite", () => {
        cy.clearFavouritesAndSuggested();
        cy.get(".entity-buttons-container").find("[data-testid=favourite-button]").click();
        cy.expandTreeNode("hierarchy-tree-bar-container", "Favourites");
        cy.get("#hierarchy-tree-bar-container").contains("Asthma");
      });
    });
    describe("breadcrumb", () => {
      it("shows breadcrumb route", () => {
        cy.get(".breadcrumb-container").contains("Disorder of respiratory system (disorder)");
        cy.get(".breadcrumb-container").contains("...");
        cy.get(".breadcrumb-container").contains("Health Information Model");
      });
      it("can expand route elipsis", () => {
        cy.get(".breadcrumb-container").contains("...").click();
        cy.get("#path_overlay_menu").find(".p-menu-item").should("have.length.above", 0);
      });
      it("navigates from breadcrumb", () => {
        cy.get(".breadcrumb-container").contains("Disorder of respiratory system (disorder)").click();
        cy.get("#directory-table-container", { timeout: 60000 })
          .find(".parent-header-container", { timeout: 60000 })
          .contains("Disorder of respiratory system (disorder)");
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
              cy.getByTestId("expand-details-button").click();
              cy.get(".details-container").find(".p-tree-node-children").should("have.length.at.least", startToggles.length);
            });
        });
        it("can collapse all details nodes", () => {
          cy.wait(1000);
          cy.getByTestId("expand-details-button").click();
          cy.getByTestId("collapse-details-button").click();
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
          cy.getByTestId("hasMap").find("tr").should("have.length.above", 0);
          const priorityArray = [];
          cy.get("[data-testid=priority]")
            .each(($el, index, $list) => {
              cy.wrap($el)
                .invoke("text")
                .then(parseFloat)
                .then(num => priorityArray.push(num));
            })
            .then(() => expect(priorityArray).to.equal(priorityArray.sort()));
        });
        it("shows matched from's", () => {
          cy.getByTestId("matchedFrom").find("tr").should("have.length.above", 0);
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
          cy.getByTestId("used-in-table").find(".p-datatable-selectable-row").should("have.length.above", 0);
        });
      });
      describe("hierarchy position tab", () => {
        beforeEach(() => {
          cy.get(".p-tablist-tab-list").find(".p-tab").contains("Hierarchy Position").click();
        });
        it("shows current highlighted and expanded", () => {
          cy.get(".p-tree-node-selected").contains("Asthma (disorder)");
          cy.get(".p-tree-node-children");
        });
        it("can load more", () => {
          cy.get("#secondary-tree-bar-container").find(".p-tree-node-children").find(".p-tree-node").should("have.length", 21);
          cy.get("#secondary-tree-bar-container").contains("Load more...").click();
          cy.get("#secondary-tree-bar-container").find(".p-tree-node-children").find(".p-tree-node").should("have.length.above", 20);
        });
        it("can climb hierarchy", () => {
          cy.getByTestId("parent")
            .find(".p-button-label")
            .contains("Disorder of respiratory system (disorder)")
            .invoke("text")
            .as("startParent", { type: "static" });
          cy.getByTestId("parent").click();
          cy.get("@startParent").then(startParent => {
            cy.get("#secondary-tree-bar-container")
              .find(".p-tree-root-children")
              .find(".p-tree-node")
              .first()
              .find(".p-tree-node-label")
              .first()
              .invoke("text")
              .should("equal", startParent);
            cy.getByTestId("parent").find(".p-button-label").invoke("text").should("not.equal", startParent);
            cy.getByTestId("alt-parent").find(".p-button-label").invoke("text").should("not.equal", startParent);
          });
        });
        it("routes on click", () => {
          cy.get("#secondary-tree-bar-container").contains("Allergic asthma").click();
          cy.get(".title-container").contains("Allergic asthma");
        });
      });
      describe("entity chart tab", () => {
        beforeEach(() => {
          cy.get(".p-tablist-tab-list").find(".p-tab").contains("Entity Chart").click();
        });
        it("has isa", () => {
          cy.getByTestId("isA").find("tr").should("have.length.above", 0);
        });
        it("has subtypes", () => {
          cy.getByTestId("subtype").find("tr").should("have.length.above", 0);
        });
        it("routes on row click", () => {
          cy.getByTestId("subtype").contains("Allergic asthma").click();
          cy.get(".title-container").contains("Allergic asthma");
        });
      });
      describe("graph tab", () => {
        beforeEach(() => {
          cy.get(".p-tablist-next-button").click();
          cy.get(".p-tablist-tab-list").find(".p-tab").contains("Graph").click({ scrollBehavior: false });
        });
        it("loads d3 graph for entity", () => {
          cy.get("#graph-container").contains("Asthma (disorder)");
        });
      });
      describe("json tab", () => {
        beforeEach(() => {
          cy.get(".p-tablist-next-button").click();
          cy.get(".p-tablist-next-button").click();
          cy.get("#viewer-tabs").contains("JSON").click({ scrollBehavior: false });
        });
        it("has json with correct iri", () => {
          cy.wait(1000);
          cy.get("#json-container", { timeout: 60000 }).contains("http://snomed.info/sct#195967001");
        });
      });
      describe("provenance tab", () => {
        beforeEach(() => {
          cy.get(".p-tablist-next-button").click();
          cy.get(".p-tablist-next-button").click();
          cy.get("#viewer-tabs").contains("Provenance").click({ scrollBehavior: false });
        });
        it("has provenance table", () => {
          cy.getByTestId("provenance-table").find("tr").should("have.length.above", 0);
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
      cy.getByTestId("set-download-button").click();
      cy.getByTestId("download-by-query-options-dialog").contains("csv").click();
      cy.getByTestId("download-by-query-options-dialog").contains("Core").click();
      cy.getByTestId("download-by-query-options-dialog").contains("Download").click();
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
