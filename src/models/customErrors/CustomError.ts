import { ErrorType } from "../../enums";

export class CustomError extends Error {
  errorType: ErrorType;
  public constructor(message: string, errorType: ErrorType) {
    super(message);
    this.errorType = errorType;
  }
}
