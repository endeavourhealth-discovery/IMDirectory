import { TTIriRef, TTIriRefSchema } from "@endeavour/vue-library/models";

import z from "zod";

// export interface SearchBinding {
//   path?: TTIriRef;
//   node?: TTIriRef;
// }

export const SearchBindingSchema = z.strictObject({
  path: TTIriRefSchema.optional(),
  node: TTIriRefSchema.optional()
});

export type SearchBinding = z.output<typeof SearchBindingSchema>;

export function isSearchBinding(value: unknown): value is SearchBinding {
  return SearchBindingSchema.safeParse(value).success;
}
