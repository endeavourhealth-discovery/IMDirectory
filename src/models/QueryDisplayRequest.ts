import { DisplayMode } from "@endeavour/vue-library/enums";
import { TTIriRef, TTIriRefSchema } from "@endeavour/vue-library/models";
import { Query, QuerySchema } from "@endeavour/vue-library/models";

import z from "zod";

// export interface QueryDisplayRequest {
//   query?: Query;
//   displayMode?: DisplayMode;
//   graph?: TTIriRef;
// }

export const QueryDisplayRequestSchema = z.strictObject({
  query: QuerySchema.optional(),
  displayMode: z.enum(DisplayMode).optional(),
  graph: TTIriRefSchema.optional()
});

export type QueryDisplayRequest = z.output<typeof QueryDisplayRequestSchema>;

export function isQueryDisplayRequest(value: unknown): value is QueryDisplayRequest {
  return QueryDisplayRequestSchema.safeParse(value).success;
}
