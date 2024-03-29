import { PasswordStrength } from "../enums";

export function verifyIsEmail(email: string): boolean {
  return /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(email);
}

export function verifyPasswordsMatch(password1: string, password2: string): boolean {
  return password1 !== "" && password2 !== "" && password1 === password2;
}

export function verifyEmailsMatch(email1: string, email2: string): boolean {
  return email1 !== "" && email2 !== "" && email1.toLowerCase() === email2.toLowerCase();
}

export function verifyIsFirstName(name: string): boolean {
  return name !== "" && /^\p{L}+(?:['-]?\p{L}+)*$/u.test(name);
}

export function verifyIsLastName(name: string): boolean {
  return name !== "" && /^\p{L}+(?:['-]?\p{L}+)*$/u.test(name) && name.length >= 2;
}

export function verifyIsUsername(name: string): boolean {
  return name !== "" && /^[-_a-zA-Z0-9]+$/.test(name);
}

export function checkPasswordStrength(password: string): PasswordStrength {
  const strongCheck = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])(?=.{8,})/;
  const mediumCheckA = /^(((?=.*[a-z])(?=.*[A-Z]))(?=.*\d))(?=.{8,})/;
  const mediumCheckB = /^(((?=.*[a-z])(?=.*\d))(?=.*\d))(?=.{8,})/;
  const mediumCheckC = /^(((?=.*[A-Z])(?=.*\d)))(?=.{8,})/;
  const weakCheck = /^(?=.{8,})/;
  if (strongCheck.test(password)) {
    return PasswordStrength.strong;
  } else if (mediumCheckA.test(password) || mediumCheckB.test(password) || mediumCheckC.test(password)) {
    return PasswordStrength.medium;
  } else if (weakCheck.test(password)) {
    return PasswordStrength.weak;
  }
  return PasswordStrength.fail;
}

export default {
  verifyEmailsMatch,
  verifyIsEmail,
  verifyIsFirstName,
  verifyIsLastName,
  verifyIsUsername,
  verifyPasswordsMatch,
  checkPasswordStrength
};
