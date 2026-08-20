import { TTIriRefSchema } from "@endeavour/vue-library/models";

import z from "zod";

import { EntitySchema } from "./Entity";

// export interface ConceptSet extends Entity {
//   definition?: Query;
//   hasMember?: TTIriRef[];
//   usedIn?: TTIriRef[];
//   avoidReplacedBy?: boolean;
// }

export const ConceptSetSchema = z.strictObject({
  ...EntitySchema.shape,
  hasMember: z.array(TTIriRefSchema).optional(),
  usedIn: z.array(TTIriRefSchema).optional(),
  avoidReplacedBy: z.boolean().optional()
});

export type ConceptSet = z.output<typeof ConceptSetSchema>;

export function isConceptSet(value: unknown): value is ConceptSet {
  return ConceptSetSchema.safeParse(value).success;
}
