describe("UserEdit", () => {
  beforeEach(() => {
    cy.acceptLicenseAndLogin();
    cy.findByTestId("account-menu-logged-in", { timeout: 60000 }).click();
    cy.get("#account-menu").contains("Edit account").click();
    cy.get(".user-container", { timeout: 60000 });
  });

  it("starts with data", () => {
    cy.findByTestId("avatar-image").should("have.attr", "src").should("include", "001-man");
    cy.findByTestId("user-edit-username").should("have.value", Cypress.env("CYPRESS_LOGIN_USERNAME"));
    cy.findByTestId("user-edit-firstname").should("have.value", "Cypress");
    cy.findByTestId("user-edit-lastname").should("have.value", "Test");
    cy.findByTestId("user-edit-email1").should("have.value", "test@example.com");
    cy.findByTestId("user-edit-email2").should("have.value", "test@example.com");
  });

  it("update button is disabled when fields are empty", () => {
    cy.findByTestId("user-edit-update-button").should("be.disabled");
  });
  it("can select avatar", () => {
    cy.findByTestId("avatar-image").should("have.attr", "src").should("include", "001-man");
    cy.findByTestId("avatar-op-button").click();
    cy.findByTestId("avatar-button-options").find("img").last().click();
    cy.findByTestId("avatar-image").should("have.attr", "src").should("not.include", "001-man");
  });

  it("checks that the email is valid", () => {
    cy.findByTestId("user-edit-email1").clear().type("cypress@cypress,com");
    cy.get(".email-times");
    cy.findByTestId("user-edit-email1").type("{backspace}{backspace}{backspace}{backspace}.com");
    cy.get(".email-check");
  });
  it("checks confirm email is valid", () => {
    cy.findByTestId("user-edit-email1").clear().type("cypress@cypress.com");
    cy.get(".email-check");
    cy.findByTestId("user-edit-email2").clear().type("cypress@cypres.com");
    cy.findByTestId("user-edit-email1").focus();
    cy.get(".p-message-error").contains("Email addresses do not match");
    cy.findByTestId("user-edit-email2").clear().type("cypress@cypress.com");
    cy.findByTestId("user-edit-email1").focus();
    cy.get(".p-message-error").should("not.exist");
  });
  it("checks that the first name is valid", () => {
    cy.findByTestId("user-edit-firstname").type("%");
    cy.get(".p-message-error").contains("First name contains unexpected characters");
    cy.findByTestId("user-edit-firstname").type("{backspace}");
    cy.get(".p-message-error").should("not.exist");
  });
  it("checks that the last name is valid", () => {
    cy.findByTestId("user-edit-lastname").type("%");
    cy.get(".p-message-error").contains("Last name must");
    cy.findByTestId("user-edit-lastname").type("{backspace}");
    cy.get(".p-message-error").should("not.exist");
  });

  it("can validate password", () => {
    cy.findByTestId("user-edit-password-change-button").click();
    cy.findByTestId("password-old").find("input").type("1234");
    cy.findByTestId("password-new1").find("input").type("5678");
    cy.get(".p-password-content").contains("Weak");
    cy.get(".p-message").contains("weak");
    cy.findByTestId("password-new1").find("input").type("5678");
    cy.get(".p-password-content").contains("Weak");
    cy.get(".p-message").contains("weak");
    cy.findByTestId("password-new1").find("input").type("abcd");
    cy.get(".p-message").contains("weak");
    cy.get(".p-password-content").contains("Weak");
    cy.findByTestId("password-new1").find("input").type("A");
    cy.get(".p-password-content").contains("Medium");
    cy.findByTestId("password-new1").find("input").type("%");
    cy.get(".p-password-content").contains("Strong");
  });
  it("can confirm password", () => {
    cy.findByTestId("user-edit-password-change-button").click();
    cy.findByTestId("password-old").find("input").type("1234");
    cy.findByTestId("password-new1").type("1234abcdA%");
    cy.findByTestId("password-new2").type("1234dcbaA%");
    cy.findByTestId("password-new1").find("input").focus();
    cy.get(".p-message-error").contains("Passwords do not match");
    cy.findByTestId("password-new2").clear().type("1234abcdA%");
    cy.get(".p-message-error").should("not.exist");
  });
});
