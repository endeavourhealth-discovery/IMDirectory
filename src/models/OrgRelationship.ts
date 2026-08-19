import z from "zod";

import { OrgRelTargetSchema } from "./OrgRelTarget";

// export interface OrgRelationship {
//   Status?: string;
//   Target?: OrgRelTarget;
//   id?: string;
// }

export const OrgRelationshipSchema = z.strictObject({
  status: z.string().optional(),
  target: OrgRelTargetSchema.optional(),
  id: z.string().optional()
});

export type OrgRelationship = z.output<typeof OrgRelationshipSchema>;

export function isOrgRelationship(value: unknown): value is OrgRelationship {
  return OrgRelationshipSchema.safeParse(value).success;
}
