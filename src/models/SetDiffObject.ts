import z from "zod";

import { Concept, ConceptSchema } from "./Concept";

// export interface SetDiffObject {
//   membersA: Concept[];
//   sharedMembers: Concept[];
//   membersB: Concept[];
// }

export const SetDiffObjectSchema = z.strictObject({
  membersA: z.array(ConceptSchema).prefault([]),
  membersB: z.array(ConceptSchema).prefault([]),
  sharedMembers: z.array(ConceptSchema).prefault([])
});

export type SetDiffObject = z.output<typeof SetDiffObjectSchema>;

export function isSetDiffObject(value: unknown): value is SetDiffObject {
  return SetDiffObjectSchema.safeParse(value).success;
}
