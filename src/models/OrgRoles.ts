import z from "zod";

import { OrgRoleSchema } from "./OrgRole";

// export interface OrgRoles {
//   Role?: OrgRole[];
// }

export const OrgRolesSchema = z.strictObject({
  role: z.array(OrgRoleSchema).optional()
});

export type OrgRoles = z.output<typeof OrgRoleSchema>;

export function isOrgRoles(value: unknown): value is OrgRoles {
  return OrgRolesSchema.safeParse(value).success;
}
