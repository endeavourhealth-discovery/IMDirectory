import z from "zod";

// export interface OrgRole {
//   id?: string;
//   Status?: string;
//   code?: string;
//   displayName?: string;
// }

export const OrgRoleSchema = z.strictObject({
  id: z.string().optional(),
  status: z.string().optional(),
  code: z.string().optional(),
  displayName: z.string().optional()
});

export type OrgRole = z.output<typeof OrgRoleSchema>;

export function isOrgRole(value: unknown): value is OrgRole {
  return OrgRoleSchema.safeParse(value).success;
}
