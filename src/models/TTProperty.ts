import { GenericObjectSchema } from "@endeavour/vue-library/models";
import { TTIriRefSchema } from "@endeavour/vue-library/models";

import z from "zod";

// export interface TTProperty extends GenericObject {
//   "http://www.w3.org/ns/shacl#order": number;
//   "http://www.w3.org/ns/shacl#path": TTIriRef[];
//   "http://www.w3.org/ns/shacl#group"?: TTIriRef[];
//   "http://www.w3.org/ns/shacl#class"?: TTIriRef[];
//   "http://www.w3.org/ns/shacl#datatype"?: TTIriRef[];
//   "http://www.w3.org/ns/shacl#node"?: TTIriRef[];
//   "http://www.w3.org/ns/shacl#function"?: TTIriRef[];
//   "http://endhealth.info/im#inversePath"?: TTIriRef[];
//   "http://www.w3.org/ns/shacl#maxCount"?: number;
//   "http://www.w3.org/ns/shacl#minCount"?: number;
// }

export const TTPropertySchema = GenericObjectSchema.extend({
  "http://www.w3.org/ns/shacl#order": z.number(),
  "http://www.w3.org/ns/shacl#path": z.array(TTIriRefSchema).prefault([]),

  "http://www.w3.org/ns/shacl#group": z.array(TTIriRefSchema).optional(),
  "http://www.w3.org/ns/shacl#class": z.array(TTIriRefSchema).optional(),
  "http://www.w3.org/ns/shacl#datatype": z.array(TTIriRefSchema).optional(),
  "http://www.w3.org/ns/shacl#node": z.array(TTIriRefSchema).optional(),
  "http://www.w3.org/ns/shacl#function": z.array(TTIriRefSchema).optional(),
  "http://endhealth.info/im#inversePath": z.array(TTIriRefSchema).optional(),
  "http://www.w3.org/ns/shacl#maxCount": z.number().optional(),
  "http://www.w3.org/ns/shacl#minCount": z.number().optional()
});

export type TTProperty = z.output<typeof TTPropertySchema>;

export function isTTProperty(value: unknown): value is TTProperty {
  return TTPropertySchema.safeParse(value).success;
}
