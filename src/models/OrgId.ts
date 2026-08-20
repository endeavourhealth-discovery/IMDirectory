import z from "zod";

// export interface OrgId {
//   extension?: string;
// }

export const OrgIdSchema = z.strictObject({
  extension: z.string().optional()
});

export type OrgId = z.output<typeof OrgIdSchema>;

export function isOrgId(value: unknown): value is OrgId {
  return OrgIdSchema.safeParse(value).success;
}
