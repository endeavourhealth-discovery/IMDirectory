import { TTIriRef, TTIriRefSchema } from "@endeavour/vue-library/models";

import z from "zod";

// export interface Filter {
//   field?: string;
//   iriValue?: TTIriRef[];
//   and?: Filter[];
//   not?: boolean;
//   textValue?: string[];
//   startsWithTerm?: boolean;
// }

export const FilterSchema = z.strictObject({
  field: z.string().optional(),
  iriValue: z.array(TTIriRefSchema).optional(),
  get and() {
    return z.array(FilterSchema);
  },
  not: z.boolean().optional(),
  textValue: z.array(z.string()).optional(),
  startsWithTerm: z.boolean().optional()
});

export type Filter = z.output<typeof FilterSchema>;

export function isFilter(value: unknown): value is Filter {
  return FilterSchema.safeParse(value).success;
}
