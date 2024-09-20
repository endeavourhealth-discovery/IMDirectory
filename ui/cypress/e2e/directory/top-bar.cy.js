describe("top bar", () => {
  describe("Logged out", () => {
    beforeEach(() => {
      cy.clearLocalStorage();
      cy.preventRouterNewTab();
      cy.acceptLicenseAndCookies();
      cy.get("#topbar", { timeout: 60000 });
    });

    describe("banner bar", () => {
      it("can show latest version banner", () => {
        cy.get("#banner > .banner-text-container > .banner-text").should("include.text", "Release");
      });

      it("shows release notes on banner bar link click", () => {
        cy.get(".release-notes-link").click();
        cy.get(".p-dialog").find(".title-container", { timeout: 60000 }).find("h1").should("have.text", "Releases");
      });
    });

    describe("release notes button", () => {
      it("shows release notes", () => {
        cy.get("[data-testid='releases-button']").click();
        cy.get("#banner > .banner-text-container > .banner-text").should("include.text", "Release");
      });
    });

    describe("release notes", () => {
      beforeEach(() => {
        cy.openReleaseNotes();
      });
      it("starts with latest directory release", () => {
        cy.get(".releases-container > .release-container").should("have.length", 1);
      });
      it("can view more", () => {
        cy.get(".app-releases").find(".view-more").click();
        cy.get(".releases-container > .release-container").should("have.length.above", 1);
      });
      it("has a github url in every release", () => {
        cy.get(".app-releases").find(".view-more").click();
        cy.get(".release-container").each(($el, index, $list) => {
          cy.wrap($el).find("a").should("have.attr", "href");
        });
      });
      it("can close", () => {
        cy.getByTestId("close-button").click();
        cy.get(".app-releases").should("not.exist");
      });
    });

    describe("themes", () => {
      it.only("can change theme", () => {
        cy.get("#banner").should("have.css", "background-color", "rgb(16, 185, 129)");
        cy.getByTestId("change-theme-button").click();
        cy.get(".color-picker").find(".p-button").eq(1).click();
        cy.get("#banner").should("have.css", "background-color", "rgb(34, 197, 94)");
      });
    });

    describe("font size", () => {
      it("can change font size", () => {
        cy.get(".p-button-label").first().should("have.css", "font-size", "14px");
        cy.getByTestId("font-size-button").click();
        cy.get("#scale-menu").find(".p-menuitem").first().should("have.text", "Small").click();
        cy.get(".p-button-label").first().should("not.have.css", "font-size", "16px");
      });
    });

    describe("upload/download", () => {
      it("can open code generator", () => {
        cy.getByTestId("upload-download-button").click();
        cy.get("#admin-menu").find("span").contains("Download Code").click();
        cy.get("#code-download-dialog").find(".p-dialog-title").contains("Set namespace/package");
      });
    });

    describe("apps", () => {
      it("can open the apps menu", () => {
        cy.getByTestId("apps-button").click();
        cy.get("#apps-menu").find(".shortcut").should("have.length.above", 1);
      });

      it("can route to directory", () => {
        cy.visit("/#/directory/search");
        cy.getByTestId("apps-button").click();
        cy.get("#apps-menu").find(".shortcut").contains("Directory").click();
        cy.url().should("equal", "http://localhost:8082/#/directory/landingPage");
      });

      it("can route to creator", () => {
        cy.getByTestId("apps-button").click();
        cy.get("#apps-menu").find(".shortcut").contains("Creator").click();
        cy.url().should("equal", "http://localhost:8082/#/creator/");
      });

      it("can route to uprn", () => {
        cy.getByTestId("apps-button").click();
        cy.get("#apps-menu").find(".shortcut").contains("ASSIGN UPRN").click();
        cy.url().should("equal", "http://localhost:8082/#/uprn/");
      });
    });

    describe("account", () => {
      it("can route to login", () => {
        cy.getByTestId("account-menu").click();
        cy.get("#account-menu").find("span").contains("Login").click();
        cy.url().should("include", "/user/login");
      });

      it("can route to register", () => {
        cy.getByTestId("account-menu").click();
        cy.get("#account-menu").find("span").contains("Register").click();
        cy.url().should("include", "/user/register");
      });
    });
  });

  describe("Logged in", () => {
    beforeEach(() => {
      cy.clearLocalStorage();
      cy.preventRouterNewTab();
      cy.acceptLicenseAndLogin();
      cy.get("#topbar", { timeout: 60000 });
    });

    it("can route to my account", () => {
      cy.getByTestId("account-menu").click();
      cy.get("#account-menu").find("span").contains("My account").click();
      cy.url().should("include", "/user/my-account");
    });

    it("can route to edit my account", () => {
      cy.getByTestId("account-menu").click();
      cy.get("#account-menu").find("span").contains("Edit account").click();
      cy.url().should("include", "/user/my-account/edit");
    });

    it("can route to change password", () => {
      cy.getByTestId("account-menu").click();
      cy.get("#account-menu").find("span").contains("Change password").click();
      cy.url().should("include", "/user/my-account/password-edit");
    });

    it("can route to logout", () => {
      cy.getByTestId("account-menu").click();
      cy.get("#account-menu").find("span").contains("Logout").click();
      cy.url().should("include", "/user/logout");
    });
  });
});
