import { verifyIsEmail } from "@im-library/helpers/UserMethods";
import { UprnEmails } from "@im-library/constants/UprnEmails";
import { CustomError } from "@im-library/models";
import { ErrorType } from "@im-library/enums";

export function checkIsValidUprnEmail(email: string) {
  if (verifyIsEmail(email)) {
    const splits = email.split("@");
    const prefix = splits[0];
    const domain = splits[1];
    if (UprnEmails.domains.includes(domain)) return true;
    if (UprnEmails.individuals.includes(email)) return true;
    return false;
  } else throw new CustomError("Not a valid email.", ErrorType.InvalidInput);
}
