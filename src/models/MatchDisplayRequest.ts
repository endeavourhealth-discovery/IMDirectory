import { GRAPH } from "@endeavour/vue-library/enums";
import { QuerySchema } from "@endeavour/vue-library/models";

import z from "zod";

// export interface MatchDisplayRequest {
//   match?: Match;
//   graph?: GRAPH;
// }

export const MatchDisplayRequestSchema = z.strictObject({
  match: QuerySchema.optional(),
  graph: z.enum(GRAPH).optional()
});

export type MatchDisplayRequest = z.output<typeof MatchDisplayRequestSchema>;

export function isMatchDisplayRequest(value: unknown): value is MatchDisplayRequest {
  return MatchDisplayRequestSchema.safeParse(value).success;
}
