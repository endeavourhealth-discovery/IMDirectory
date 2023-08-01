import { BugReportEnums } from "@/enums";

export interface BugReport {
  userId: string;
  product: "IM";
  version: string;
  module: BugReportEnums.Module;
  system: BugReportEnums.System;
  severity: BugReportEnums.Severity;
  status: BugReportEnums.Status;
}
