import { BugReportEnums } from "../enums";
import { Workflow } from "./Workflow";

export interface BugReport extends Workflow {
  product: "IM";
  version: string;
  module: BugReportEnums.Module;
  OS: BugReportEnums.OperatingSystem;
  browser: BugReportEnums.Browser;
  severity: BugReportEnums.Severity;
  status: BugReportEnums.Status;
  error: Error;
  description: string;
  reproduceSteps: string[];
  expectedResult: string;
  actualResult: string;
}
