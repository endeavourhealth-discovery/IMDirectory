import { TaskType } from "@endeavour/vue-library/enums";
import { TaskState } from "@endeavour/vue-library/enums";
import { TTIriRef, TTIriRefSchema } from "@endeavour/vue-library/models";

import z from "zod";

import { TaskHistorySchema } from "./TaskHistory";

// export interface Task {
//   id?: TTIriRef;
//   createdBy?: string;
//   type?: TaskType;
//   state?: TaskState;
//   assignedTo?: string;
//   dateCreated?: Date;
//   history?: TaskHistory[];
//   hostUrl?: string;
// }

export const TaskSchema = z.strictObject({
  id: TTIriRefSchema,
  createdBy: z.string(),
  type: z.enum(TaskType),
  state: z.enum(TaskState),
  assignedTo: z.string(),
  dateCreated: z.date(),
  history: z.array(TaskHistorySchema).optional(),
  hostUrl: z.url()
});

export type Task = z.output<typeof TaskSchema>;

export function isTask(value: unknown): value is Task {
  return TaskSchema.safeParse(value).success;
}
