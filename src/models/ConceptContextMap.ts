import z from "zod";

import { ContextSchema } from "./Context";

// export interface ConceptContextMap {
//   id?: string;
//   node?: string;
//   value?: string;
//   regex?: string;
//   property?: string;
//   context?: Context[];
// }

export const ConceptContextMapSchema = z.strictObject({
  id: z.string().optional(),
  node: z.string().optional(),
  value: z.string().optional(),
  regex: z.string().optional(),
  property: z.string().optional(),
  context: z.array(ContextSchema).optional()
});

export type ConceptContextMap = z.output<typeof ConceptContextMapSchema>;

export function isConceptContextMap(value: unknown): value is ConceptContextMap {
  return ConceptContextMapSchema.safeParse(value).success;
}
