import z from "zod";

// export interface WorkflowRequest {
//   page?: number;
//   size?: number;
//   userId?: string;
// }

export const WorkflowRequestSchema = z.strictObject({
  page: z.number().default(1),
  size: z.number().default(25),
  userId: z.string()
});

export type WorkflowRequest = z.output<typeof WorkflowRequestSchema>;

export function isWorkflowRequest(value: unknown): value is WorkflowRequest {
  return WorkflowRequestSchema.safeParse(value).success;
}
