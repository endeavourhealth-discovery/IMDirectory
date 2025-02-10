import { verifyIsEmail, verifyPasswordsMatch, verifyIsFirstName, verifyIsUsername, checkPasswordStrength, verifyIsLastName } from "@/helpers/UserMethods";
import { PasswordStrength } from "@/enums";

describe("verifyIsEmail", () => {
  it("should fail if empty", () => {
    const email = "";
    expect(verifyIsEmail(email)).toBe(false);
  });

  it("should pass if is correct email", () => {
    const email = "johndoe@gmail.com";
    expect(verifyIsEmail(email)).toBe(true);
  });

  it("should accept 2 '.' after the @", () => {
    const email = "johndoe@gmail.co.uk";
    expect(verifyIsEmail(email)).toBe(true);
  });

  it("should fail without an @ before the last .", () => {
    const email = "johndoe.gmail.com";
    expect(verifyIsEmail(email)).toBe(false);
  });

  it("should fail if contains multiple '@'", () => {
    const email = "john@doe@gmail.com";
    expect(verifyIsEmail(email)).toBe(false);
  });

  it("should fail if starts with an @", () => {
    const email = "@gmail.com";
    expect(verifyIsEmail(email)).toBe(false);
  });
});

describe("verifyPasswordsMatch", () => {
  it("should fail if passwords are empty", () => {
    const password1 = "";
    const password2 = "";
    expect(verifyPasswordsMatch(password1, password2)).toBe(false);
  });

  it("should fail if either password is empty __ password1", () => {
    const password1 = "";
    const password2 = "12345678";
    expect(verifyPasswordsMatch(password1, password2)).toBe(false);
  });

  it("should fail if either password is empty __ password2", () => {
    const password1 = "12345678";
    const password2 = "";
    expect(verifyPasswordsMatch(password1, password2)).toBe(false);
  });

  it("should fail if passwords don't match", () => {
    const password1 = "12345678";
    const password2 = "12345679";
    expect(verifyPasswordsMatch(password1, password2)).toBe(false);
  });

  it("should pass if passwords match", () => {
    const password1 = "12345678";
    const password2 = "12345678";
    expect(verifyPasswordsMatch(password1, password2)).toBe(true);
  });

  it("should handle case sensitivity", () => {
    const password1 = "passWORD";
    const password2 = "password";
    expect(verifyPasswordsMatch(password1, password2)).toBe(false);
  });
});

describe("verifyIsFirstName", () => {
  it("should fail if empty", () => {
    const name = "";
    expect(verifyIsFirstName(name)).toBe(false);
  });

  it("should fail if name contains non alphabetic characters", () => {
    const name = "John&Doe";
    expect(verifyIsFirstName(name)).toBe(false);
  });

  it("should fail with numbers", () => {
    const name = "John2";
    expect(verifyIsFirstName(name)).toBe(false);
  });

  it("should pass with international characters", () => {
    const name = "陳大文";
    expect(verifyIsFirstName(name)).toBe(true);
  });

  it("should pass with accent characters", () => {
    const name = "Renée";
    expect(verifyIsFirstName(name)).toBe(true);
  });

  it("should pass with valid name", () => {
    const name = "John";
    expect(verifyIsFirstName(name)).toBe(true);
  });

  it("should pass with one character", () => {
    const name = "X";
    expect(verifyIsFirstName(name)).toBe(true);
  });

  it("should allow hyphens in the middle of names", () => {
    const name = "Mary-Jane";
    expect(verifyIsFirstName(name)).toBe(true);
  });

  it("should not allow hyphens as start characters", () => {
    const name = "-mary";
    expect(verifyIsFirstName(name)).toBe(false);
  });

  it("should not allow hyphens as end characters", () => {
    const name = "mary-";
    expect(verifyIsFirstName(name)).toBe(false);
  });

  it("should allow apostrophies if surrounded by characters", () => {
    const name = "Nyong'o";
    expect(verifyIsFirstName(name)).toBe(true);
  });

  it("should not allow apostrophies without appended character", () => {
    const name = "OKeith'";
    expect(verifyIsFirstName(name)).toBe(false);
  });

  it("should allow apostrophie and hyphen names", () => {
    const name = "O'Brien-Smith";
    expect(verifyIsFirstName(name)).toBe(true);
  });

  it("should not allow spaces", () => {
    const name = "Jean-Luc Picard";
    expect(verifyIsFirstName(name)).toBe(false);
  });

  it("should not allow empty name", () => {
    const name = "";
    expect(verifyIsFirstName(name)).toBe(false);
  });
});

describe("verifyIsLastName", () => {
  it("should fail if less than two characters", () => {
    const name = "M";
    expect(verifyIsLastName(name)).toBe(false);
  });
});

describe("verifyIsUsername", () => {
  it("should fail if empty", () => {
    const username = "";
    expect(verifyIsUsername(username)).toBe(false);
  });

  it("should fail with whitespace", () => {
    const username = "John Doe";
    expect(verifyIsUsername(username)).toBe(false);
  });

  it("should fail with non - _ characters", () => {
    const username = "J()&^$&*";
    expect(verifyIsUsername(username)).toBe(false);
  });

  it("should allow '-' and '_' characters", () => {
    const username = "john_doe";
    const username2 = "john-doe";
    expect(verifyIsUsername(username)).toBe(true);
    expect(verifyIsUsername(username2)).toBe(true);
  });

  it("should pass with alphabet and number combinations", () => {
    const username = "Jo4n2345asdf";
    expect(verifyIsUsername(username)).toBe(true);
  });
});

describe("checkPasswordStrength", () => {
  it("should return fail for a password that is too short", () => {
    const password = "123456";
    expect(checkPasswordStrength(password)).toBe(PasswordStrength.fail);
  });

  it("should return fail for a password of only 1 type (8 chars lower/upper/number/symbol)", () => {
    const password = "12345678";
    expect(checkPasswordStrength(password)).toBe(PasswordStrength.fail);
  });

  it("should return fail for a password of 2 types", () => {
    const password = "1234acbd";
    expect(checkPasswordStrength(password)).toBe(PasswordStrength.fail);
  });

  it("should return medium for a password of 3 types", () => {
    const password = "12ABacbd";
    expect(checkPasswordStrength(password)).toBe(PasswordStrength.medium);
  });

  it("should return strong for a password of 4 types", () => {
    const password = "12ABab*&";
    expect(checkPasswordStrength(password)).toBe(PasswordStrength.strong);
  });

  it("should return fail for a empty password", () => {
    const password = "";
    expect(checkPasswordStrength(password)).toBe(PasswordStrength.fail);
  });
});
