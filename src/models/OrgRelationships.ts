import z from "zod";

import { OrgGeoLocationSchema } from "./OrgGeoLocation";
import { OrgRelationship } from "./OrgRelationship";

// export interface OrgRelationships {
//   Rel?: OrgRelationship[];
// }

export const OrgRelationshipsSchema = z.strictObject({
  rel: z.array(OrgGeoLocationSchema).optional()
});

export type OrgRelationships = z.output<typeof OrgRelationshipsSchema>;

export function isOrgRelationships(value: unknown): value is OrgRelationships {
  return OrgRelationshipsSchema.safeParse(value).success;
}
