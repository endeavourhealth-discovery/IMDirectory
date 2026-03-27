import { getLogger } from "../logger/LogConfig";
import { Logger } from "typescript-logging-log4ts-style";
import { toTitleCase } from "vue-library/helpers";
import { ToastSeverity } from "vue-library/enums";

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
    if (this.severity === ToastSeverity.ERROR) this.log.error(this.detail);
  }

  setSummary(): string {
    if (this.severity === ToastSeverity.ERROR) return "warning";
    else return toTitleCase(this.severity);
  }
}
