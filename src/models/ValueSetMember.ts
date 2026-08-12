import { type TTIriRef, TTIriRefSchema } from "@endeavour/vue-library/models";

import z from "zod";

// export interface ValueSetMember {
//   entity: TTIriRef;
//   code: string;
//   scheme: TTIriRef;
//   label: string;
//   type: string;
//   directParent: TTIriRef;
// }

export const ValueSetMemberSchema = z.strictObject({
  entity: TTIriRefSchema,
  code: z.string(),
  scheme: TTIriRefSchema,
  label: z.string(),
  type: z.string(),
  directParent: TTIriRefSchema
});

export type ValueSetMember = z.output<typeof ValueSetMemberSchema>;

export function isValueSetMember(value: unknown): value is ValueSetMember {
  return ValueSetMemberSchema.safeParse(value).success;
}
