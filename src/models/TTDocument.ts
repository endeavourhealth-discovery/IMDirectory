import { TTIriRef, TTIriRefSchema } from "@endeavour/vue-library/models";
import { TTEntity, TTEntitySchema } from "@endeavour/vue-library/models";

import z from "zod";

import { TTContext, TTContextSchema } from "./TTContext";
import { TTPrefix, TTPrefixSchema } from "./TTPrefix";

// export interface TTDocument extends TTNode {
//   context?: TTContext;
//   entities?: TTEntity[];
//   crud?: TTIriRef;
//   predicates?: { [index: string]: string };
//   prefixes?: TTPrefix[];
// }

export const TTDocumentSchema = TTEntitySchema.extend({
  context: TTContextSchema.optional(),
  entities: z.array(TTEntitySchema).optional(),
  crud: TTIriRefSchema.optional(),
  predicates: z.record(z.string(), z.string()).prefault({}),
  prefixes: z.array(TTPrefixSchema).optional()
});

export type TTDocument = z.output<typeof TTDocumentSchema>;

export function isTTDocument(value: unknown): value is TTDocument {
  return TTDocumentSchema.safeParse(value).success;
}
