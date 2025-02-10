import { ErrorType } from "../../enums";

export default class CustomError extends Error {
  errorType: ErrorType;
  public constructor(message: string, errorType: ErrorType) {
    super(message);
    this.errorType = errorType;
  }
}
