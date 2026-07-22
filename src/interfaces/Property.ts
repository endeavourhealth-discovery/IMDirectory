import { type GenericObject, type TTIriRef, TTIriRefSchema } from "@endeavour/vue-library/models";

import z from "zod";

export const PropertySchema = z.looseObject({
  "http://www.w3.org/ns/shacl#path": z.array(TTIriRefSchema).prefault([]),
  "http://www.w3.org/ns/shacl#order": z.number(),
  "http://www.w3.org/ns/shacl#node": z.array(TTIriRefSchema).optional(),
  "http://www.w3.org/ns/shacl#datatype": z.array(TTIriRefSchema).optional(),
  "http://www.w3.org/ns/shacl#class": z.array(TTIriRefSchema).optional(),
  "http://endhealth.info/im#inheritedFrom": z.array(TTIriRefSchema).optional(),
  "http://www.w3.org/ns/shacl#minCount": z.number().optional(),
  "http://www.w3.org/ns/shacl#maxCount": z.number().optional()
});

export type Property = z.output<typeof PropertySchema>;

export function isProperty(value: unknown): value is Property {
  return PropertySchema.safeParse(value).success;
}
