import { ApprovalType } from "@endeavour/vue-library/enums";
import { TTIriRefSchema } from "@endeavour/vue-library/models";

import z from "zod";

import { TaskSchema } from "./Task";

// export interface EntityApproval extends Task {
//   entityIri?: TTIriRef;
//   approvalType?: ApprovalType;
// }

export const EntityApprovalSchema = z.strictObject({
  ...TaskSchema.shape,
  entityIri: TTIriRefSchema.optional(),
  approvalType: z.enum(ApprovalType).optional()
});

export type EntityApproval = z.output<typeof EntityApprovalSchema>;

export function isEntityApproval(value: unknown): value is EntityApproval {
  return EntityApprovalSchema.safeParse(value).success;
}
