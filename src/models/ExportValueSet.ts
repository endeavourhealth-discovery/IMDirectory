import { type TTIriRef, TTIriRefSchema } from "@endeavour/vue-library/models";

import z from "zod";

import { ValueSetMemberSchema } from "./ValueSetMember";

// export interface ExportValueSet {
//   valueSet: TTIriRef;
//   limited: boolean;
//   members: Array<ValueSetMember>;
// }
export const ExportValueSetSchema = z.strictObject({
  valueSet: TTIriRefSchema,
  limited: z.boolean(),
  members: z.array(ValueSetMemberSchema)
});

export type ExportValueSet = z.output<typeof ExportValueSetSchema>;

export function isExportValueSet(value: unknown): value is ExportValueSet {
  return ExportValueSetSchema.safeParse(value).success;
}
