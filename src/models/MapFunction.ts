import { TTIriRef, TTIriRefSchema } from "@endeavour/vue-library/models";
import { ArgumentSchema } from "@endeavour/vue-library/models";

import z from "zod";

// export interface MapFunction extends TTIriRef {
//   argument?: Argument[];
//   conceptMap?: { [index: string]: string };
//   defaultValue?: TTIriRef;
// }

export const MapFunctionSchema = z.strictObject({
  ...TTIriRefSchema.shape,
  argument: z.array(ArgumentSchema).optional(),
  conceptMap: z.record(z.string(), z.string()).optional(),
  defaultValue: TTIriRefSchema.optional()
});

export type MapFunction = z.output<typeof MapFunctionSchema>;

export function isMapFunction(value: unknown): value is MapFunction {
  return MapFunctionSchema.safeParse(value).success;
}
