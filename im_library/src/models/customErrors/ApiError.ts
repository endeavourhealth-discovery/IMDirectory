import { dateNow } from "../../helpers/Datetime/DateNow";
import { timeNow } from "../../helpers/Datetime/TimeNow";

export default class ApiError extends Error {
  status: number;
  message: string;
  timestamp: string;
  debugMessage?: string;
  code?: string;
  subErrors?: any[];

  constructor(status: number, message: string, debugMessage?: string, code?: string, subErrors?: any[]) {
    super(message);
    this.status = status;
    this.message = message;
    this.timestamp = this.currentDateTime();
    this.debugMessage = debugMessage;
    this.code = code;
    this.subErrors = subErrors;
  }

  public setStatus(status: number) {
    this.status = status;
  }

  public setMessage(message: string) {
    this.message = message;
  }

  public setDebugMessage(debugMessage: string) {
    this.debugMessage = debugMessage;
  }

  public setCode(code: string) {
    this.code = code;
  }

  public setSubErrors(subErrors: any[]) {
    this.subErrors = subErrors;
  }

  private currentDateTime() {
    return dateNow() + " @ " + timeNow();
  }
}
