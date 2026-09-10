import { TTIriRef, TTIriRefSchema } from "@endeavour/vue-library/models";

import z from "zod";

// export interface Indicator extends TTIriRef {
//   isSubIndicatorOf?: TTIriRef[];
//   numerator?: TTIriRef;
//   dataset?: TTIriRef;
//   actionIfFalse?: TTIriRef[];
//   actionIfTrue?: TTIriRef[];
//   denominator?: TTIriRef;
// }

export const IndicatorSchema = z.strictObject({
  ...TTIriRefSchema.shape,
  isSubIndicatorOf: z.array(TTIriRefSchema).optional(),
  numerator: TTIriRefSchema.optional(),
  dataset: TTIriRefSchema.optional(),
  actionIfFalse: z.array(TTIriRefSchema).optional(),
  actionIfTrue: z.array(TTIriRefSchema).optional(),
  denominator: TTIriRefSchema.optional()
});

export type Indicator = z.output<typeof IndicatorSchema>;

export function isIndicator(value: unknown): value is Indicator {
  return IndicatorSchema.safeParse(value).success;
}
