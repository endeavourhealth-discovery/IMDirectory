import { dateNow } from "../../helpers/Datetime/DateNow";
import { timeNow } from "../../helpers/Datetime/TimeNow";

export default class ApiError extends Error {
  status: number;
  timestamp: string;
  debugMessage?: string;
  code?: string;
  subErrors?: Error[];

  constructor(status: number, message: string, debugMessage?: string, code?: string, subErrors?: Error[]) {
    super(message);
    this.status = status;
    this.timestamp = this.currentDateTime();
    this.debugMessage = debugMessage ? debugMessage : message;
    this.code = code;
    this.subErrors = subErrors;
  }

  public setStatus(status: number) {
    this.status = status;
  }

  public setMessage(message: string) {
    super.message = message;
  }

  public setDebugMessage(debugMessage: string) {
    this.debugMessage = debugMessage;
  }

  public setCode(code: string) {
    this.code = code;
  }

  public setSubErrors(subErrors: Error[]) {
    this.subErrors = subErrors;
  }

  private currentDateTime() {
    return dateNow() + " @ " + timeNow();
  }
}
