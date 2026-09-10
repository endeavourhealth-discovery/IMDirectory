import z from "zod";

// export interface TaskHistory {
//   predicate?: string;
//   originalObject?: string;
//   newObject?: string;
//   changeDate?: Date;
//   modifiedBy?: string;
//   dateTime?: Date;
// }

export const TaskHistorySchema = z.strictObject({
  predicate: z.string(),
  originalObject: z.string(),
  newObject: z.string(),
  changeDate: z.date(),
  modifiedBy: z.string(),
  dateTime: z.date()
});

export type TaskHistory = z.output<typeof TaskHistorySchema>;

export function isTaskHistory(value: unknown): value is TaskHistory {
  return TaskHistorySchema.safeParse(value).success;
}
