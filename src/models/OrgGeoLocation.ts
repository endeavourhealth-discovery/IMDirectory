import z from "zod";

import { OrgLocationSchema } from "./OrgLocation";

// export interface OrgGeoLocation {
//   Location?: OrgLocation;
// }

export const OrgGeoLocationSchema = z.strictObject({
  location: OrgLocationSchema.optional()
});

export type OrgGeoLocation = z.output<typeof OrgGeoLocationSchema>;

export function isOrgGeoLocation(value: unknown): value is OrgGeoLocation {
  return OrgGeoLocationSchema.safeParse(value).success;
}
