import { Node } from "@endeavour/vue-library/models";
import { TTIriRefSchema } from "@endeavour/vue-library/models";

import z from "zod";

export const SemanticMapEntrySchema = z.strictObject({
  iri: z.string().optional(),
  name: z.string().optional(),
  sourceEntity: TTIriRefSchema.optional(),
  targetText: z.string(),
  targetValue: z.number().optional(),
  rangeFrom: z.number().optional(),
  rangeTo: z.number().optional(),
  order: z.number().optional()
});

export type SemanticMapEntry = z.output<typeof SemanticMapEntrySchema>;

export function isSemanticMapEntry(value: unknown): value is Node {
  return SemanticMapEntrySchema.safeParse(value).success;
}
