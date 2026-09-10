import { TTIriRefSchema } from "@endeavour/vue-library/models";
import { IriLD, IriLDSchema } from "@endeavour/vue-library/models";

import z from "zod";

// export interface Instance extends IriLD {
//   entailment?: TTIriRef;
// }

export const InstanceSchema = z.strictObject({
  ...IriLDSchema.shape,
  entailment: TTIriRefSchema.optional()
});

export type Instance = z.output<typeof InstanceSchema>;

export function isInstance(value: unknown): value is Instance {
  return InstanceSchema.safeParse(value).success;
}
