import z from "zod";

// export interface OrgLocation {
//   AddrLn1?: string;
//   AddrLn2?: string;
//   AddrLn3?: string;
//   Town?: string;
//   County?: string;
//   PostCode?: string;
//   Country?: string;
//   UPRN?: string;
// }

export const OrgLocationSchema = z.strictObject({
  addrLn1: z.string().optional(),
  addrLn2: z.string().optional(),
  addrLn3: z.string().optional(),
  town: z.string().optional(),
  county: z.string().optional(),
  postCode: z.string().optional(),
  country: z.string().optional(),
  uprn: z.string().optional()
});

export type OrgLocation = z.output<typeof OrgLocationSchema>;

export function isOrgLocation(value: unknown): value is OrgLocation {
  return OrgLocationSchema.safeParse(value).success;
}
