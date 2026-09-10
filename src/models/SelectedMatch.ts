import { type Query, QuerySchema } from "@endeavour/vue-library/models";

import z from "zod";

// export interface SelectedMatch {
//   selected: Query;
//   parent?: Query;
//   parentList?: Query[];
//   index: number;
// }

export const SelectedMatchSchema = z.strictObject({
  selected: QuerySchema,
  parent: QuerySchema.optional(),
  parentList: z.array(QuerySchema).optional(),
  index: z.number()
});

export type SelectedMatch = z.output<typeof SelectedMatchSchema>;

export function isSelectedMatch(value: unknown): value is SelectedMatch {
  return SelectedMatchSchema.safeParse(value).success;
}
