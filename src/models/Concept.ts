import { TTIriRef, TTIriRefSchema } from "@endeavour/vue-library/models";

import z from "zod";

import { Entity, EntitySchema } from "./Entity";

// export interface Concept extends Entity {
//   subClassOf?: TTIriRef[];
//   code?: string;
//   im1Id?: string;
//   matchedFrom?: Concept[];
//   usage?: number;
//   codeId?: string;
//   alternativeCode?: string;
//   subsumed?: boolean;
// }

export const ConceptSchema = EntitySchema.extend({
  subClassOf: z.array(TTIriRefSchema).optional(),
  code: z.string().optional(),
  im1Id: z.string().optional(),
  get matchedFrom(): z.ZodOptional<z.ZodArray<typeof ConceptSchema>> {
    return z.array(ConceptSchema).optional();
  },
  usage: z.number().optional(),
  codeId: z.string().optional(),
  alternativeCode: z.string().optional(),
  subsumed: z.boolean().optional()
});

export type Concept = z.output<typeof ConceptSchema>;

export function isConcept(value: unknown): value is Concept {
  return ConceptSchema.safeParse(value).success;
}
