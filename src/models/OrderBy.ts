import { Order } from "@endeavour/vue-library/enums";
import { TTIriRef, TTIriRefSchema } from "@endeavour/vue-library/models";

import z from "zod";

// export interface OrderBy {
//   field?: string;
//   direction?: Order;
//   iriValue?: TTIriRef[];
//   and?: OrderBy[];
//   textValue?: string[];
//   not?: boolean;
//   startsWithTerm?: boolean;
// }

export const OrderBySchema = z.strictObject({
  field: z.string().optional(),
  direction: z.enum(Order).optional(),
  iriValue: z.array(TTIriRefSchema).optional(),
  get and(): z.ZodOptional<z.ZodArray<typeof OrderBySchema>> {
    return z.array(OrderBySchema).optional();
  },
  textValue: z.array(z.string()).optional(),
  not: z.boolean().optional(),
  startWithTerm: z.boolean().optional()
});

export type OrderBy = z.output<typeof OrderBySchema>;

export function isOrderBy(value: unknown): value is OrderBy {
  return OrderBySchema.safeParse(value).success;
}
