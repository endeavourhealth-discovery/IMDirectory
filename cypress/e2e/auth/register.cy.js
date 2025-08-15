describe("Register", () => {
  beforeEach(() => {
    cy.preventRouterNewTab();
    cy.acceptLicenseAndCookies();
    cy.visit("/");
    cy.get("#topbar", { timeout: 60000 });
    cy.findByTestId("account-menu").click();
    cy.get("#account-menu").find("span").contains("Register").click();
    cy.url().should("include", "/user/register");
  });
  it("register button is disabled when fields are empty", () => {
    cy.findByTestId("register-submit").should("be.disabled");
  });
  it("can select avatar", () => {
    cy.findByTestId("register-avatar-select").find("img").should("have.attr", "src").should("include", "001-man");
    cy.findByTestId("avatar-op-button").click();
    cy.findByTestId("avatar-button-options").find("img").last().click();
    cy.findByTestId("register-avatar-select").find("img").should("have.attr", "src").should("not.include", "001-man");
  });
  it("checks that the username is valid", () => {
    cy.findByTestId("register-username").type("cypress%");
    cy.get(".p-message-error").contains("Username contains unexpected characters");
    cy.findByTestId("register-username").type("{backspace}");
    cy.get(".p-message-error").should("not.exist");
  });
  it("checks that the email is valid", () => {
    cy.findByTestId("register-email1").type("cypressregister@cypress,com");
    cy.findByTestId("register-email1-unverified");
    cy.findByTestId("register-email1").type("{backspace}{backspace}{backspace}{backspace}.com");
    cy.findByTestId("register-email1-verified");
  });
  it("checks confirm email is valid", () => {
    cy.findByTestId("register-email1").type("cypressregister@cypress.com");
    cy.findByTestId("register-email1-verified");
    cy.findByTestId("register-email2").type("cypressregister@cypres.com");
    cy.findByTestId("register-email1").focus();
    cy.get(".p-message-error").contains("Email addresses do not match");
    cy.findByTestId("register-email2").then($input => {
      cy.wrap($input).clear();
      cy.wrap($input).type("cypressregister@cypress.com");
    });
    cy.findByTestId("register-email1").focus();
    cy.get(".p-message-error").should("not.exist");
  });
  it("checks that the first name is valid", () => {
    cy.findByTestId("register-firstname").type("terry%");
    cy.get(".p-message-error").contains("First name contains unexpected characters");
    cy.findByTestId("register-firstname").type("{backspace}");
    cy.get(".p-message-error").should("not.exist");
  });
  it("checks that the last name is valid", () => {
    cy.findByTestId("register-lastname").type("pratchet%");
    cy.get(".p-message-error").contains("Last name must");
    cy.findByTestId("register-lastname").type("{backspace}");
    cy.get(".p-message-error").should("not.exist");
  });
  it("can validate password", () => {
    cy.findByTestId("password-new1").find("input").type("1234abcA");
    cy.get(".p-password-content").contains("Medium");
    cy.findByTestId("password-new1").find("input").clear();
    cy.findByTestId("password-new1").find("input").type("1234abcA%");
    cy.get(".p-password-content").contains("Strong");
    cy.findByTestId("password-new1").find("input").clear();
    cy.findByTestId("password-new1").find("input").type("1234");
    cy.get(".p-password-content").contains("Weak");
    cy.get(".p-message").contains("weak");
    cy.findByTestId("password-new1").find("input").type("5678");
    cy.get(".p-password-content").contains("Weak");
    cy.get(".p-message").contains("weak");
    cy.findByTestId("password-new1").find("input").type("abcd");
    cy.get(".p-message").contains("weak");
    cy.get(".p-password-content").contains("Weak");
  });
  it("can confirm password", () => {
    cy.findByTestId("password-new1").type("1234abcdA%");
    cy.findByTestId("password-new2").type("1234dcbaA%");
    cy.findByTestId("password-new1").find("input").focus();
    cy.get(".p-message-error").contains("Passwords do not match");
    cy.findByTestId("password-new2").then($input => {
      cy.wrap($input).clear();
      cy.wrap($input).type("1234abcdA%");
    });
    cy.get(".p-message-error").should("not.exist");
  });
  it("can show privacy policy", () => {
    cy.get(".privacy-container").find("a").contains("privacy policy").invoke("removeAttr", "target").click();
    cy.visitNewTab("#/privacy");
    cy.get("#topbar-content", { timeout: 60000 }).contains("Privacy policy");
  });
  it("can reveal passwords", () => {
    cy.findByTestId("password-new1").type("1234abcdA%");
    cy.findByTestId("password-new1").find("input").should("not.have.text", "1234abcdA%");
    cy.findByTestId("password-new2").type("1234abcdA%");
    cy.findByTestId("password-new2").find("input").should("not.have.text", "1234abcdA%");
    cy.findByTestId("password-new1").find("svg").click();
    cy.findByTestId("password-new2").find("svg").click();
    cy.findByTestId("password-new1").find("input").should("have.value", "1234abcdA%");
    cy.findByTestId("password-new2").find("input").should("have.value", "1234abcdA%");
  });
  it("enabled submit button if fields are correctly filled", () => {
    cy.findByTestId("register-username").type("CypressTest");
    cy.findByTestId("register-submit").should("be.disabled");
    cy.findByTestId("register-email1").type("cypressregister@cypress.com");
    cy.findByTestId("register-submit").should("be.disabled");
    cy.findByTestId("register-email2").type("cypressregister@cypress.com");
    cy.findByTestId("register-submit").should("be.disabled");
    cy.findByTestId("register-firstname").type("terry");
    cy.findByTestId("register-submit").should("be.disabled");
    cy.findByTestId("register-lastname").type("pratchet");
    cy.findByTestId("register-submit").should("be.disabled");
    cy.findByTestId("password-new1").type("1234abcdA%");
    cy.findByTestId("register-submit").should("be.disabled");
    cy.findByTestId("password-new2").type("1234abcdA%");
    cy.findByTestId("register-submit").should("be.disabled");
    cy.get(".p-checkbox-input").click();
    cy.findByTestId("register-submit").should("be.enabled");
  });

  it("checks if username is already taken", () => {
    cy.findByTestId("register-username").type(Cypress.env("CYPRESS_LOGIN_USERNAME"));
    cy.findByTestId("register-email1").type("cypressregister@cypress.com");
    cy.findByTestId("register-email2").type("cypressregister@cypress.com");
    cy.findByTestId("register-firstname").type("terry");
    cy.findByTestId("register-lastname").type("pratchet");
    cy.findByTestId("password-new1").type("1234abcdA%");
    cy.findByTestId("password-new2").type("1234abcdA%");
    cy.get(".p-checkbox-input").click();
    cy.findByTestId("register-submit").click();
    cy.get(".swal2-popup", { timeout: 60000 }).contains("Username already taken");
  });

  it("checks if email is already in use", () => {
    cy.findByTestId("register-email1").type("test@example.com");
    cy.findByTestId("register-email1-unverified");
    cy.contains("Email address is already registered");
  });

  it("can link to login", () => {
    cy.get("#login-link").click();
    cy.url().should("contain", "/login");
  });
});
