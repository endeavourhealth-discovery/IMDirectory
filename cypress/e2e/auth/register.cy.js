describe("Register", () => {
  beforeEach(() => {
    cy.preventRouterNewTab();
    cy.acceptLicenseAndCookies();
    cy.visit("/");
    cy.get("#topbar", { timeout: 60000 });
    cy.getByTestId("account-menu").click();
    cy.get("#account-menu").find("span").contains("Register").click();
    cy.url().should("include", "/user/register");
  });
  it("register button is disabled when fields are empty", () => {
    cy.getByTestId("register-submit").should("be.disabled");
  });
  it("can select avatar", () => {
    cy.getByTestId("register-avatar-select").find("img").should("have.attr", "src").should("include", "001-man");
    cy.getByTestId("avatar-op-button").click();
    cy.getByTestId("avatar-button-options").find("img").last().click();
    cy.getByTestId("register-avatar-select").find("img").should("have.attr", "src").should("not.include", "001-man");
  });
  it("checks that the username is valid", () => {
    cy.getByTestId("register-username").type("cypress%");
    cy.get(".p-message-error").contains("Username contains unexpected characters");
    cy.getByTestId("register-username").type("{backspace}");
    cy.get(".p-message-error").should("not.exist");
  });
  it("checks that the email is valid", () => {
    cy.getByTestId("register-email1").type("cypress@cypress,com");
    cy.getByTestId("register-email1-unverified");
    cy.getByTestId("register-email1").type("{backspace}{backspace}{backspace}{backspace}.com");
    cy.getByTestId("register-email1-verified");
  });
  it("checks confirm email is valid", () => {
    cy.getByTestId("register-email1").type("cypress@cypress.com");
    cy.getByTestId("register-email1-verified");
    cy.getByTestId("register-email2").type("cypress@cypres.com");
    cy.getByTestId("register-email1").focus();
    cy.get(".p-message-error").contains("Email addresses do not match");
    cy.getByTestId("register-email2").clear().type("cypress@cypress.com");
    cy.getByTestId("register-email1").focus();
    cy.get(".p-message-error").should("not.exist");
  });
  it("checks that the first name is valid", () => {
    cy.getByTestId("register-firstname").type("terry%");
    cy.get(".p-message-error").contains("First name contains unexpected characters");
    cy.getByTestId("register-firstname").type("{backspace}");
    cy.get(".p-message-error").should("not.exist");
  });
  it("checks that the last name is valid", () => {
    cy.getByTestId("register-lastname").type("pratchet%");
    cy.get(".p-message-error").contains("Last name must");
    cy.getByTestId("register-lastname").type("{backspace}");
    cy.get(".p-message-error").should("not.exist");
  });
  it("can validate password", () => {
    cy.getByTestId("password-new1").find("input").type("1234");
    cy.get(".p-password-content").contains("Weak");
    cy.get(".p-message").contains("weak");
    cy.getByTestId("password-new1").find("input").type("5678");
    cy.get(".p-password-content").contains("Weak");
    cy.get(".p-message").contains("weak");
    cy.getByTestId("password-new1").find("input").type("abcd");
    cy.get(".p-message").contains("weak");
    cy.get(".p-password-content").contains("Weak");
    cy.getByTestId("password-new1").find("input").type("A");
    cy.get(".p-password-content").contains("Medium");
    cy.getByTestId("password-new1").find("input").type("%");
    cy.get(".p-password-content").contains("Strong");
  });
  it("can confirm password", () => {
    cy.getByTestId("password-new1").type("1234abcdA%");
    cy.getByTestId("password-new2").type("1234dcbaA%");
    cy.getByTestId("password-new1").find("input").focus();
    cy.get(".p-message-error").contains("Passwords do not match");
    cy.getByTestId("password-new2").clear().type("1234abcdA%");
    cy.get(".p-message-error").should("not.exist");
  });
  it("can show privacy policy", () => {
    cy.get(".privacy-container").find("a").contains("privacy policy").invoke("removeAttr", "target").click();
    cy.visitNewTab("#/privacy");
    cy.get("#topbar-content", { timeout: 60000 }).contains("Privacy policy");
  });
  it("can reveal passwords", () => {
    cy.getByTestId("password-new1").type("1234abcdA%").find("input").should("not.have.text", "1234abcdA%");
    cy.getByTestId("password-new2").type("1234abcdA%").find("input").should("not.have.text", "1234abcdA%");
    cy.getByTestId("password-new1").find("svg").click();
    cy.getByTestId("password-new2").find("svg").click();
    cy.getByTestId("password-new1").find("input").should("have.value", "1234abcdA%");
    cy.getByTestId("password-new2").find("input").should("have.value", "1234abcdA%");
  });
  it("enabled submit button if fields are correctly filled", () => {
    cy.getByTestId("register-username").type("CypressTest");
    cy.getByTestId("register-submit").should("be.disabled");
    cy.getByTestId("register-email1").type("cypress@cypress.com");
    cy.getByTestId("register-submit").should("be.disabled");
    cy.getByTestId("register-email2").type("cypress@cypress.com");
    cy.getByTestId("register-submit").should("be.disabled");
    cy.getByTestId("register-firstname").type("terry");
    cy.getByTestId("register-submit").should("be.disabled");
    cy.getByTestId("register-lastname").type("pratchet");
    cy.getByTestId("register-submit").should("be.disabled");
    cy.getByTestId("password-new1").type("1234abcdA%");
    cy.getByTestId("register-submit").should("be.disabled");
    cy.getByTestId("password-new2").type("1234abcdA%");
    cy.getByTestId("register-submit").should("be.disabled");
    cy.get(".p-checkbox-input").click();
    cy.getByTestId("register-submit").should("be.enabled");
  });

  it("checks if username is already taken", () => {
    cy.getByTestId("register-username").type(Cypress.env("CYPRESS_LOGIN_USERNAME"));
    cy.getByTestId("register-email1").type("cypress@cypress.com");
    cy.getByTestId("register-email2").type("cypress@cypress.com");
    cy.getByTestId("register-firstname").type("terry");
    cy.getByTestId("register-lastname").type("pratchet");
    cy.getByTestId("password-new1").type("1234abcdA%");
    cy.getByTestId("password-new2").type("1234abcdA%");
    cy.get(".p-checkbox-input").click();
    cy.getByTestId("register-submit").click();
    cy.get(".swal2-popup", { timeout: 60000 }).contains("Username already taken");
  });

  it("can link to login", () => {
    cy.get("#login-link").click();
    cy.url().should("contain", "/login");
  });
});
