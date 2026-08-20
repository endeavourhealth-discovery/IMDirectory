import { TaskModule } from "@endeavour/vue-library/enums";
import { OperatingSystem } from "@endeavour/vue-library/enums";
import { Browser } from "@endeavour/vue-library/enums";
import { Severity } from "@endeavour/vue-library/enums";
import { Status } from "@endeavour/vue-library/enums";

import z from "zod";

import { TaskSchema } from "./Task";

// export interface BugReport extends Task {
//   product?: string;
//   version?: string;
//   module?: TaskModule;
//   os?: OperatingSystem;
//   osOther?: string;
//   browser?: Browser;
//   browserOther?: string;
//   severity?: Severity;
//   status?: Status;
//   error?: string;
//   description?: string;
//   reproduceSteps?: string;
//   expectedResult?: string;
//   actualResult?: string;
// }

export const BugReportSchema = z.strictObject({
  ...TaskSchema.shape,
  product: z.string(),
  version: z.string(),
  module: z.enum(TaskModule),
  os: z.enum(OperatingSystem),
  osOther: z.string().optional(),
  browser: z.enum(Browser),
  browserOther: z.string().optional(),
  severity: z.enum(Severity),
  status: z.enum(Status),
  error: z.string(),
  description: z.string(),
  reproduceSteps: z.string(),
  expectedResult: z.string(),
  actualResult: z.string()
});

export type BugReport = z.output<typeof BugReportSchema>;

export function isBugReport(value: unknown): value is BugReport {
  return BugReportSchema.safeParse(value).success;
}
