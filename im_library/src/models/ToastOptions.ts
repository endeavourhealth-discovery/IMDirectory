import { getLogger } from "../logger/LogConfig";
import { Logger } from "typescript-logging-log4ts-style";
import { toTitleCase } from "../helpers/StringManipulators";
import { ToastSeverity } from "../enums/ToastSeverity";

export default class ToastOptions {
  severity: ToastSeverity;
  summary: string;
  detail: string;
  life: number;
  log: Logger = {} as Logger;

  constructor(severity: ToastSeverity, message: string, error?: Error | string | unknown) {
    this.severity = severity;
    this.summary = this.setSummary();
    this.detail = message;
    this.life = 3000;
    if (error) {
      this.log = getLogger("model.ToastOptionsAndLog");
      this.logToConsole();
    }
  }

  logToConsole(): void {
    switch (this.severity) {
      case ToastSeverity.ERROR:
        this.log.error(this.detail);
    }
  }

  setSummary(): string {
    switch (this.severity) {
      case ToastSeverity.ERROR:
        return "Warning";
      default:
        return toTitleCase(this.severity);
    }
  }
}
