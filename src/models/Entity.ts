import { TTIriRef, TTIriRefSchema } from "@endeavour/vue-library/models";
import { TTEntitySchema } from "@endeavour/vue-library/models";

import z from "zod";

// export interface Entity {
//   iri?: string;
//   type?: TTIriRef[];
//   status?: TTIriRef;
//   scheme?: TTIriRef;
//   isContainedIn?: TTEntity[];
//   name?: string;
//   description?: string;
// }

export const EntitySchema = z.strictObject({
  iri: z.url(),
  type: z.array(TTIriRefSchema).optional(),
  status: TTIriRefSchema,
  scheme: TTIriRefSchema,
  isContainedIn: z.array(TTEntitySchema).optional(),
  name: z.string(),
  description: z.string().optional()
});

export type Entity = z.output<typeof EntitySchema>;

export function isEntity(value: unknown): value is Entity {
  return EntitySchema.safeParse(value).success;
}
