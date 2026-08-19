import { ExtendedEntityReferenceNodeSchema } from "@endeavour/vue-library/models";

import z from "zod";

// export interface ConceptAggregate {
//   children: ExtendedTTEntity[];
//   concept: ExtendedTTEntity;
//   parents: ExtendedTTEntity[];
// }

export const ConceptAggregateSchema = z.strictObject({
  children: z.array(ExtendedEntityReferenceNodeSchema),
  concept: ExtendedEntityReferenceNodeSchema,
  parents: z.array(ExtendedEntityReferenceNodeSchema)
});

export type ConceptAggregate = z.output<typeof ConceptAggregateSchema>;

export function isConceptAaggregate(value: unknown): value is ConceptAggregate {
  return ConceptAggregateSchema.safeParse(value).success;
}
