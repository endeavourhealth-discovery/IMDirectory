import z from "zod";

import { Task, TaskSchema } from "./Task";

// export interface WorkflowResponse {
//   page?: number;
//   count?: number;
//   tasks?: Task[];
// }

export const WorkflowResponseSchema = z.strictObject({
  page: z.number().optional(),
  count: z.number().optional(),
  tasks: z.array(TaskSchema).optional()
});

export type WorkflowResponse = z.output<typeof WorkflowResponseSchema>;

export function isWorkflowResponse(value: unknown): value is WorkflowResponse {
  return WorkflowResponseSchema.safeParse(value).success;
}
