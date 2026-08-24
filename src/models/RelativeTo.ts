import { TTIriRef, TTIriRefSchema } from "@endeavour/vue-library";

import z from "zod";

// export type RelativeTo = {
//   nodeRef?: string;
//   parameter?: string;
//   qualifier?: TTIriRef;
//   iri?: string;
//   name?: string;
// };

export const RelativeToSchema = z.strictObject({
  nodeRef: z.string().optional(),
  parameter: z.string().optional(),
  qualifier: TTIriRefSchema.optional(),
  iri: z.url().optional(),
  name: z.string().optional()
});

export type RelativeTo = z.output<typeof RelativeToSchema>;

export function isRelativeTo(value: unknown): value is RelativeTo {
  return RelativeToSchema.safeParse(value).success;
}
