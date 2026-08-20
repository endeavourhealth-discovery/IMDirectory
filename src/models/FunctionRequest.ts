import { GRAPH } from "@endeavour/vue-library/enums";
import { Argument, ArgumentSchema } from "@endeavour/vue-library/models";
import { PageSchema } from "@endeavour/vue-library/models";

import z from "zod";

// export interface FunctionRequest {
//   functionIri?: string;
//   arguments?: Argument[];
//   page?: Page;
//   graph?: GRAPH;
// }

export const FunctionRequestSchema = z.strictObject({
  functionIri: z.url(),
  arguments: z.array(ArgumentSchema).optional(),
  page: PageSchema.optional(),
  graph: z.enum(GRAPH).optional()
});

export type FunctionRequest = z.output<typeof FunctionRequestSchema>;

export function isFunctionRequest(value: unknown): value is FunctionRequest {
  return FunctionRequestSchema.safeParse(value).success;
}
