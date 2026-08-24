import { TTEntitySchema } from "@endeavour/vue-library/models";

import z from "zod";

// export interface TTBundle {
//   entity: ExtendedTTEntity;
//   predicates: { [index: string]: string };
// }

export const TTBundleSchema = z.strictObject({
  entity: TTEntitySchema,
  predicates: z.looseObject({}).catchall(z.string())
});

export type TTBundle = z.output<typeof TTBundleSchema>;

export function isTTBundle(value: unknown): value is TTBundle {
  return TTBundleSchema.safeParse(value).success;
}
