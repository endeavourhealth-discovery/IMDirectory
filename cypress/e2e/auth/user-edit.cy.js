describe("UserEdit", () => {
  beforeEach(() => {
    cy.acceptLicenseAndLogin();
    cy.getByTestId("account-menu-logged-in", { timeout: 60000 }).click();
    cy.get("#account-menu").contains("Edit account").click();
    cy.get(".user-container", { timeout: 60000 });
  });

  it("starts with data", () => {
    cy.getByTestId("avatar-image").should("have.attr", "src").should("include", "001-man");
    cy.getByTestId("user-edit-username").should("have.value", Cypress.env("CYPRESS_LOGIN_USERNAME"));
    cy.getByTestId("user-edit-firstname").should("have.value", "Cypress");
    cy.getByTestId("user-edit-lastname").should("have.value", "Test");
    cy.getByTestId("user-edit-email1").should("have.value", "test@example.com");
    cy.getByTestId("user-edit-email2").should("have.value", "test@example.com");
  });

  it("update button is disabled when fields are empty", () => {
    cy.getByTestId("user-edit-update-button").should("be.disabled");
  });
  it("can select avatar", () => {
    cy.getByTestId("avatar-image").should("have.attr", "src").should("include", "001-man");
    cy.getByTestId("avatar-op-button").click();
    cy.getByTestId("avatar-button-options").find("img").last().click();
    cy.getByTestId("avatar-image").should("have.attr", "src").should("not.include", "001-man");
  });

  it("checks that the email is valid", () => {
    cy.getByTestId("user-edit-email1").then($input => {
      cy.wrap($input).clear();
      cy.wrap($input).type("cypress@cypress,com");
    });
    cy.get(".email-times");
    cy.getByTestId("user-edit-email1").type("{backspace}{backspace}{backspace}{backspace}.com");
    cy.get(".email-check");
  });
  it("checks confirm email is valid", () => {
    cy.getByTestId("user-edit-email1").then($input => {
      cy.wrap($input).clear();
      cy.wrap($input).type("cypress@cypress.com");
    });
    cy.get(".email-check");
    cy.getByTestId("user-edit-email2").then($input => {
      cy.wrap($input).clear();
      cy.wrap($input).type("cypress@cypres.com");
    });
    cy.getByTestId("user-edit-email1").focus();
    cy.get(".p-message-error").contains("Email addresses do not match");
    cy.getByTestId("user-edit-email2").then($input => {
      cy.wrap($input).clear();
      cy.wrap($input).type("cypress@cypress.com");
    });
    cy.getByTestId("user-edit-email1").focus();
    cy.get(".p-message-error").should("not.exist");
  });
  it("checks that the first name is valid", () => {
    cy.getByTestId("user-edit-firstname").type("%");
    cy.get(".p-message-error").contains("First name contains unexpected characters");
    cy.getByTestId("user-edit-firstname").type("{backspace}");
    cy.get(".p-message-error").should("not.exist");
  });
  it("checks that the last name is valid", () => {
    cy.getByTestId("user-edit-lastname").type("%");
    cy.get(".p-message-error").contains("Last name must");
    cy.getByTestId("user-edit-lastname").type("{backspace}");
    cy.get(".p-message-error").should("not.exist");
  });

  it("can validate password", () => {
    cy.getByTestId("user-edit-password-change-button").click();
    cy.getByTestId("password-old").find("input").type("1234");
    cy.getByTestId("password-new1").find("input").type("5678");
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
    cy.getByTestId("user-edit-password-change-button").click();
    cy.getByTestId("password-old").find("input").type("1234");
    cy.getByTestId("password-new1").type("1234abcdA%");
    cy.getByTestId("password-new2").type("1234dcbaA%");
    cy.getByTestId("password-new1").find("input").focus();
    cy.get(".p-message-error").contains("Passwords do not match");
    cy.getByTestId("password-new2").then($input => {
      cy.wrap($input).clear();
      cy.wrap($input).type("1234abcdA%");
    });
    cy.get(".p-message-error").should("not.exist");
  });
});
