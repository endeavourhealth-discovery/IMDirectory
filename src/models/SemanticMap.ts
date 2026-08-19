import { TTIriRefSchema } from "@endeavour/vue-library/models";

import z from "zod";

import { SemanticMapEntrySchema } from "../models/SemanticMapEntry";

export const SemanticMapSchema = z.strictObject({
  iri: z.string().optional(),
  name: z.string().optional(),
  defaultValue: z.number().optional(),
  defaultText: z.string().optional(),
  sourceType: TTIriRefSchema.optional(),
  sourceEntityProperty: TTIriRefSchema.optional(),
  sourceValueProperty: TTIriRefSchema.optional(),
  function: TTIriRefSchema.optional(),
  get entries(): z.ZodOptional<z.ZodArray<typeof SemanticMapEntrySchema>> {
    return z.array(SemanticMapEntrySchema).optional();
  }
});

export type SemanticMap = z.output<typeof SemanticMapSchema>;
export function isSemanticMap(value: unknown): value is Node {
  return SemanticMapSchema.safeParse(value).success;
}
