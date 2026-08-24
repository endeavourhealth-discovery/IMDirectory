import { TTIriRefSchema } from "@endeavour/vue-library/models";

import z from "zod";

// export interface DataModelProperty {
//   property?: TTIriRef;
//   type?: TTIriRef;
//   minInclusive?: string;
//   minExclusive?: string;
//   maxInclusive?: string;
//   maxExclusive?: string;
//   pattern?: string;
//   inheritedFrom?: TTIriRef;
//   order?: number;
// }

export const DataModelPropertySchema = z.strictObject({
  property: TTIriRefSchema.optional(),
  type: TTIriRefSchema.optional(),
  minInclusive: z.string().optional(),
  minExclusive: z.string().optional(),
  maxInclusive: z.string().optional(),
  maxExclusive: z.string().optional(),
  pattern: z.string().optional(),
  inheritedFrom: TTIriRefSchema.optional(),
  order: z.number().optional()
});

export type DataModelProperty = z.output<typeof DataModelPropertySchema>;

export function isDataModelProperty(value: unknown): value is DataModelProperty {
  return DataModelPropertySchema.safeParse(value).success;
}
