import { Query, QuerySchema } from "@endeavour/vue-library/models";

import z from "zod";

import { Entity, EntitySchema } from "./Entity";

// export interface QueryEntity extends Entity {
//   definition?: Query;
// }

export const QueryEntitySchema = EntitySchema.extend({
  definition: QuerySchema.optional()
});

export type QueryEntity = z.output<typeof QueryEntitySchema>;

export function isQueryEntity(value: unknown): value is QueryEntity {
  return QueryEntitySchema.safeParse(value).success;
}
