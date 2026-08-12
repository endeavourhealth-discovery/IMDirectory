import { type TTIriRef, TTIriRefSchema } from "@endeavour/vue-library/models";

import z from "zod";

// export default interface TangledTreeData {
//   id: string;
//   parents?: TangledTreeData[];
//   name: string;
//   type: string;
//   cardinality?: string;
//   isOr?: boolean;
//   range?: TTIriRef[];
// }

export const TangledTreeDataSchema = z.strictObject({
  id: z.uuid(),
  get parents() {
    return z.array(TangledTreeDataSchema).optional();
  },
  name: z.string(),
  type: z.string(),
  cardinality: z.string().optional(),
  isOr: z.boolean().optional(),
  range: z.array(TTIriRefSchema).optional()
});
export type TangledTreeData = z.output<typeof TangledTreeDataSchema>;

export function isTangledTreeData(value: unknown): value is TangledTreeData {
  return TTIriRefSchema.safeParse(value).success;
}
