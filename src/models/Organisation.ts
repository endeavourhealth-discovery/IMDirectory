import z from "zod";

import { OrgGeoLocationSchema } from "./OrgGeoLocation";
import { OrgIdSchema } from "./OrgId";
import { OrgRelationshipsSchema } from "./OrgRelationships";
import { OrgRolesSchema } from "./OrgRoles";

// export interface Organisation {
//   Name?: string;
//   OrgId?: OrgId;
//   Status?: string;
//   orgRecordClass?: string;
//   GeoLoc?: OrgGeoLocation;
//   Roles?: OrgRoles;
//   Rels?: OrgRelationships;
// }

export const OrganisationSchema = z.strictObject({
  name: z.string().optional,
  ordId: OrgIdSchema.optional(),
  status: z.string().optional(),
  orgRecordClass: z.string().optional(),
  geoLoc: OrgGeoLocationSchema.optional(),
  roles: OrgRolesSchema.optional(),
  rels: OrgRelationshipsSchema.optional()
});

export type Organisation = z.output<typeof OrganisationSchema>;

export function isOrganisation(value: unknown): value is Organisation {
  return OrganisationSchema.safeParse(value).success;
}
