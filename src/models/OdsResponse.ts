import z from "zod";

import { OrgRoleSchema } from "./OrgRole";
import { OrganisationSchema } from "./Organisation";

// export interface OdsResponse {
//   Organisation?: Organisation;
//   Roles?: OrgRole[];
// }

export const OdsResponseSchema = z.strictObject({
  organisation: OrganisationSchema.optional(),
  roles: z.array(OrgRoleSchema).optional()
});

export type OdsResponse = z.output<typeof OdsResponseSchema>;

export function isOdsResponse(value: unknown): value is OdsResponse {
  return OdsResponseSchema.safeParse(value).success;
}
