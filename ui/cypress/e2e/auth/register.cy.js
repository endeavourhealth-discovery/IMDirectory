describe("Register", () => {
  beforeEach(() => {
    cy.acceptLicenseAndCookies();
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
    cy.getByTestId("avatar-button-options").find("img").filter('[src="http://localhost:8082/src/assets/avatars/colour/010-woman.png"]').click();
    cy.getByTestId("register-avatar-select").find("img").should("have.attr", "src").should("include", "010-woman");
  });
  it("checks that the username is valid", () => {
    cy.getByTestId("register-username").type("cypress%");
    cy.get(".p-inline-message-error").contains("Username contains unexpected characters");
    cy.getByTestId("register-username").type("{backspace}");
    cy.get(".p-inline-message-error").should("not.exist");
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
    cy.getByTestId("register-firstname").focus();
    cy.get(".p-inline-message-error").contains("Email addresses do not match!");
    cy.getByTestId("register-email2").clear().type("cypress@cypress.com");
    cy.getByTestId("register-firstname").focus();
    cy.get(".p-inline-message-error").should("not.exist");
  });
  it("checks that the first name is valid", () => {
    cy.getByTestId("register-firstname").type("terry%");
    cy.get(".p-inline-message-error").contains("First name contains unexpected characters");
    cy.getByTestId("register-firstname").type("{backspace}");
    cy.get(".p-inline-message-error").should("not.exist");
  });
  it("checks that the last name is valid", () => {
    cy.getByTestId("register-lastname").type("pratchet%");
    cy.get(".p-inline-message-error").contains("Last name must");
    cy.getByTestId("register-lastname").type("{backspace}");
    cy.get(".p-inline-message-error").should("not.exist");
  });
  it("can validate password", () => {
    cy.getByTestId("register-password1").type("1234");
    cy.get(".p-inline-message-error").contains("Invalid password");
    cy.getByTestId("register-password1").type("5678");
    cy.get(".p-inline-message-warn").contains("Weak");
    cy.getByTestId("register-password1").type("abcd");
    cy.get(".p-inline-message-success").contains("Medium");
    cy.getByTestId("register-password1").type("A%");
    cy.get(".p-inline-message-success").contains("Strong");
  });
  it("can confirm password", () => {
    cy.getByTestId("register-password1").type("1234abcdA%");
    cy.getByTestId("register-password2").type("1234dcbaA%");
    cy.getByTestId("register-firstname").focus();
    cy.get(".p-inline-message-error").contains("Passwords do not match!");
    cy.getByTestId("register-password2").clear().type("1234abcdA%");
    cy.get(".p-inline-message-error").should("not.exist");
  });
  it("can show privacy policy", () => {
    cy.preventNewTab();
    cy.get(".privacy-container").find("a").contains("privacy policy").invoke("removeAttr", "target").click();
    cy.url().should("include", "/privacy");
  });
  it("can route to login", () => {
    cy.get("#login-link").click();
    cy.url().should("include", "/login");
  });
  it("can reveal passwords", () => {
    cy.getByTestId("register-password1").type("1234abcdA%").should("not.have.text", "1234abcdA%");
    cy.getByTestId("register-password2").type("1234abcdA%").should("not.have.text", "1234abcdA%");
    cy.getByTestId("show-password1-button").click();
    cy.getByTestId("show-password2-button").click();
    cy.getByTestId("register-password1").should("have.value", "1234abcdA%");
    cy.getByTestId("register-password2").should("have.value", "1234abcdA%");
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
    cy.getByTestId("register-password1").type("1234abcdA%");
    cy.getByTestId("register-submit").should("be.disabled");
    cy.getByTestId("register-password2").type("1234abcdA%");
    cy.getByTestId("register-submit").should("be.disabled");
    cy.get(".p-checkbox-input").click();
    cy.getByTestId("register-submit").should("be.enabled");
  });
});
