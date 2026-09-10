import { TTIriRefSchema } from "@endeavour/vue-library/models";

import z from "zod";

// export interface PropertyDisplay {
//   order?: number;
//   group?: TTIriRef;
//   property: TTIriRef[]; // path
//   type?: TTIriRef[]; // class/datatype/node
//   cardinality?: string;
//   reverseCardinality?: string;
//   isOr?: boolean;
//   isType?: boolean;
//   node?: boolean;
// }

export const PropertyDisplaySchema = z.strictObject({
  order: z.number().optional(),
  group: TTIriRefSchema.optional(),
  property: z.array(TTIriRefSchema).prefault([]),
  type: z.array(TTIriRefSchema).optional(),
  cardinality: z.string().optional(),
  reverseCardinality: z.string().optional(),
  isOr: z.boolean().optional(),
  isType: z.boolean().optional(),
  isNode: z.boolean().optional()
});

export type PropertyDisplay = z.output<typeof PropertyDisplaySchema>;

export function isPropertyDisplay(value: unknown): value is PropertyDisplay {
  return PropertyDisplaySchema.safeParse(value).success;
}
